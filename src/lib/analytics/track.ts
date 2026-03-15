import { db } from '@/lib/db';
import { analyticsEvents } from '@/lib/db/schema';

/**
 * Fire-and-forget server-side event tracking.
 * Inserts a row into the `analytics_events` table.
 * Never throws — errors are logged to console.error only.
 */
export async function trackEvent(event: {
  eventType: string;
  eventData?: Record<string, unknown>;
  userId?: string | null;
  pagePath?: string;
  sessionId?: string;
}): Promise<void> {
  try {
    await db.insert(analyticsEvents).values({
      eventType: event.eventType,
      eventData: event.eventData ?? null,
      userId: event.userId ?? null,
      pagePath: event.pagePath ?? null,
      sessionId: event.sessionId ?? null,
    });
  } catch (err) {
    console.error('[trackEvent] Failed to insert analytics event:', err);
  }
}
