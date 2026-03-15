import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';

const MAX_EVENTS_PER_BATCH = 50;

const eventSchema = z.object({
  eventType: z.string().min(1),
  eventData: z.record(z.string(), z.unknown()).optional(),
  pagePath: z.string().optional(),
  sessionId: z.string().optional(),
});

const batchSchema = z.object({
  events: z.array(eventSchema).min(1).max(MAX_EVENTS_PER_BATCH),
});

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body.' },
        { status: 400 },
      );
    }

    const parsed = batchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(', '),
        },
        { status: 400 },
      );
    }

    const { events } = parsed.data;

    // Bulk insert all events in a single statement.
    await db.insert(analyticsEvents).values(
      events.map((e) => ({
        eventType: e.eventType,
        eventData: e.eventData ?? null,
        pagePath: e.pagePath ?? null,
        sessionId: e.sessionId ?? null,
        userId: null,
      })),
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/analytics] Unhandled error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 },
    );
  }
}
