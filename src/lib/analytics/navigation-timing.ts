import { sendAnalyticsEvent } from '@/lib/analytics/beacon';

let captured = false;

/**
 * Captures Navigation Timing API metrics and sends them as a
 * `nav_timing` analytics event. Only runs once per page load.
 *
 * Metrics captured:
 *  - domInteractive
 *  - domContentLoadedEventEnd
 *  - loadEventEnd
 *  - redirectCount
 *  - transferSize
 */
export function captureNavigationTiming(): void {
  if (typeof window === 'undefined') return;
  if (captured) return;
  captured = true;

  // Wait for the load event to ensure all timing data is available
  const capture = () => {
    try {
      const entries = performance.getEntriesByType('navigation');
      if (!entries || entries.length === 0) return;

      const nav = entries[0] as PerformanceNavigationTiming;

      sendAnalyticsEvent({
        eventType: 'nav_timing',
        eventData: {
          domInteractive: Math.round(nav.domInteractive),
          domContentLoadedEventEnd: Math.round(nav.domContentLoadedEventEnd),
          loadEventEnd: Math.round(nav.loadEventEnd),
          redirectCount: nav.redirectCount,
          transferSize: nav.transferSize,
        },
      });
    } catch {
      // Silently ignore — navigation timing should never break the app
    }
  };

  // If the page has already loaded, capture immediately with a small delay
  // to ensure loadEventEnd is populated. Otherwise, wait for the load event.
  if (document.readyState === 'complete') {
    setTimeout(capture, 0);
  } else {
    window.addEventListener('load', () => {
      // Small delay to ensure loadEventEnd is finalized
      setTimeout(capture, 0);
    });
  }
}
