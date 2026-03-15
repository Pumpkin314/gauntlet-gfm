import { sendAnalyticsEvent } from '@/lib/analytics/beacon';

/**
 * Sends a `page_view` analytics event for the current page.
 * Includes the referrer in event data.
 * Should be called once on initial page load.
 */
export function trackPageView(): void {
  if (typeof window === 'undefined') return;

  sendAnalyticsEvent({
    eventType: 'page_view',
    pagePath: window.location.pathname,
    eventData: {
      referrer: document.referrer,
    },
  });
}
