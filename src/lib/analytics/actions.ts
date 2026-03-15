import { sendAnalyticsEvent } from '@/lib/analytics/beacon';

type TrackableAction = 'donate' | 'share' | 'follow' | 'react' | 'comment' | 'view_content';

/**
 * Tracks a user action as an analytics event.
 * This is the primary function UI components should call.
 */
export function trackAction(
  action: TrackableAction,
  metadata?: Record<string, unknown>,
): void {
  sendAnalyticsEvent({
    eventType: 'action',
    eventData: {
      action,
      ...metadata,
    },
  });
}
