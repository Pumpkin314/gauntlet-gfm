import { getSessionId } from '@/lib/analytics/session';

interface AnalyticsEvent {
  eventType: string;
  eventData?: Record<string, unknown>;
  pagePath?: string;
  sessionId?: string;
}

const BATCH_INTERVAL_MS = 1000;
const ANALYTICS_ENDPOINT = '/api/analytics';

let eventBuffer: AnalyticsEvent[] = [];
let batchTimer: ReturnType<typeof setTimeout> | null = null;

function sendBatch(events: AnalyticsEvent[]): void {
  if (events.length === 0) return;

  const payload = JSON.stringify({ events });

  // Prefer sendBeacon for reliable delivery (especially during page unload)
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([payload], { type: 'application/json' });
    const sent = navigator.sendBeacon(ANALYTICS_ENDPOINT, blob);
    if (sent) return;
  }

  // Fall back to fetch (fire-and-forget)
  if (typeof fetch === 'function') {
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silently ignore — analytics should never break the app
    });
  }
}

function scheduleBatch(): void {
  if (batchTimer !== null) return;
  batchTimer = setTimeout(() => {
    batchTimer = null;
    const events = eventBuffer;
    eventBuffer = [];
    sendBatch(events);
  }, BATCH_INTERVAL_MS);
}

/**
 * Queues an analytics event for batched delivery.
 * Events are collected for 1 second, then sent as a batch.
 * Automatically includes sessionId and pagePath.
 */
export function sendAnalyticsEvent(event: {
  eventType: string;
  eventData?: Record<string, unknown>;
  pagePath?: string;
}): void {
  if (typeof window === 'undefined') return;

  const enrichedEvent: AnalyticsEvent = {
    eventType: event.eventType,
    eventData: event.eventData,
    pagePath: event.pagePath || window.location.pathname,
    sessionId: getSessionId(),
  };

  eventBuffer.push(enrichedEvent);
  scheduleBatch();
}

/**
 * Immediately sends all buffered events.
 * Intended for use in `beforeunload` to ensure nothing is lost.
 */
export function flushAnalytics(): void {
  if (typeof window === 'undefined') return;

  if (batchTimer !== null) {
    clearTimeout(batchTimer);
    batchTimer = null;
  }

  const events = eventBuffer;
  eventBuffer = [];
  sendBatch(events);
}
