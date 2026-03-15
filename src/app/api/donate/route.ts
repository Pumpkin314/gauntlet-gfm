import { eq, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';
import { db } from '@/lib/db';
import { getServerTimingHeader } from '@/lib/db/instrumented';
import { donations, fundraisers, users } from '@/lib/db/schema';

const donateSchema = z.object({
  fundraiserId: z.string().min(1),
  amountCents: z.number().int().min(100).max(100000000),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  source: z
    .enum([
      'fundraiser_page',
      'fyp_quick_donate',
      'micro_reaction',
      'community_page',
    ])
    .default('fundraiser_page'),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be signed in to donate.' },
        { status: 401 },
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request body.' },
        { status: 400 },
      );
    }

    const parsed = donateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 },
      );
    }

    const { fundraiserId, amountCents, message, isAnonymous, source } =
      parsed.data;

    const [fundraiser] = await db
      .select({
        id: fundraisers.id,
        slug: fundraisers.slug,
        status: fundraisers.status,
      })
      .from(fundraisers)
      .where(eq(fundraisers.id, fundraiserId));

    if (!fundraiser) {
      return NextResponse.json(
        { success: false, error: 'Fundraiser not found.' },
        { status: 404 },
      );
    }

    if (fundraiser.status !== 'active') {
      return NextResponse.json(
        {
          success: false,
          error: 'This fundraiser is no longer accepting donations.',
        },
        { status: 400 },
      );
    }

    // Deduct mock balance (best-effort)
    const [donor] = await db
      .select({ mockBalanceCents: users.mockBalanceCents })
      .from(users)
      .where(eq(users.id, user.id));

    if (donor?.mockBalanceCents && donor.mockBalanceCents >= amountCents) {
      await db
        .update(users)
        .set({
          mockBalanceCents: sql`${users.mockBalanceCents} - ${amountCents}`,
        })
        .where(eq(users.id, user.id));
    }

    // Insert donation + update fundraiser counters
    // Note: Neon HTTP driver doesn't support transactions, so we run sequentially.
    // The fundraiser counter update is idempotent (uses atomic SQL increment).
    const [result] = await db
      .insert(donations)
      .values({
        donorId: user.id,
        fundraiserId,
        amountCents,
        message: message || null,
        isAnonymous,
        source,
      })
      .returning({ id: donations.id });

    await db
      .update(fundraisers)
      .set({
        raisedCents: sql`${fundraisers.raisedCents} + ${amountCents}`,
        donationCount: sql`${fundraisers.donationCount} + 1`,
        updatedAt: new Date(),
      })
      .where(eq(fundraisers.id, fundraiserId));

    // Invalidate Redis cache (best-effort)
    try {
      await invalidateCache('fundraiser:*');
    } catch {
      // best-effort
    }

    const responseHeaders: Record<string, string> = {};
    const serverTiming = getServerTimingHeader();
    if (serverTiming) {
      responseHeaders['Server-Timing'] = serverTiming;
    }

    return NextResponse.json(
      {
        success: true,
        donationId: result!.id,
        fundraiserSlug: fundraiser.slug,
      },
      { headers: responseHeaders },
    );
  } catch (err) {
    console.error('[POST /api/donate] Unhandled error:', err);
    console.error('[POST /api/donate]', err);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred. Please try again.',
      },
      { status: 500 },
    );
  }
}
