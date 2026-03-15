'use server';

import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';
import { db } from '@/lib/db';
import { donations, fundraisers, users } from '@/lib/db/schema';

export const donationSchema = z.object({
  fundraiserId: z.string().min(1),
  amountCents: z.number().int().min(100).max(100000000),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
  source: z
    .enum(['fundraiser_page', 'fyp_quick_donate', 'micro_reaction', 'community_page'])
    .default('fundraiser_page'),
});

export type CreateDonationInput = z.input<typeof donationSchema>;

export type CreateDonationResult =
  | { success: true; donationId: string; fundraiserSlug: string }
  | { success: false; error: string };

export async function createDonation(
  input: CreateDonationInput,
): Promise<CreateDonationResult> {
  // 1. Validate input
  const parsed = donationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const { fundraiserId, amountCents, message, isAnonymous, source } = parsed.data;

  // 2. Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to donate.' };
  }

  // 3. Check fundraiser exists and is active
  const [fundraiser] = await db
    .select({
      id: fundraisers.id,
      slug: fundraisers.slug,
      status: fundraisers.status,
    })
    .from(fundraisers)
    .where(eq(fundraisers.id, fundraiserId));

  if (!fundraiser) {
    return { success: false, error: 'Fundraiser not found.' };
  }

  if (fundraiser.status !== 'active') {
    return {
      success: false,
      error: 'This fundraiser is no longer accepting donations.',
    };
  }

  // 4. Optionally deduct mock balance (best-effort, don't fail if insufficient)
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

  // 5. INSERT donation + UPDATE fundraiser counters
  // Note: Neon HTTP driver doesn't support transactions, so we run sequentially.
  const [result] = await db
    .insert(donations)
    .values({
      donorId: user.id,
      fundraiserId,
      amountCents,
      message: message || null,
      isAnonymous,
      source: source ?? 'fundraiser_page',
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

  // 6. Invalidate Redis cache (best-effort)
  try {
    await invalidateCache('fundraiser:*');
  } catch {
    // Cache invalidation is best-effort; don't fail the donation
  }

  // NOTE: We intentionally do NOT call revalidatePath here.
  // revalidatePath triggers an RSC re-render of the current page after
  // the action completes. On Vercel, this re-render can crash with
  // "An error occurred in the Server Components render" — crashing the
  // entire donate page. The ISR cache (revalidate=60) will pick up the
  // new data within a minute. The client shows success immediately.

  return { success: true, donationId: result.id, fundraiserSlug: fundraiser.slug };
}
