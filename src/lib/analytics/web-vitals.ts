import { sendAnalyticsEvent } from '@/lib/analytics/beacon';

let reported = false;

/**
 * Registers Web Vitals reporting callbacks.
 * Each metric is sent as a `web_vital` analytics event.
 * Only runs once — subsequent calls are no-ops.
 */
export function reportWebVitals(): void {
  if (typeof window === 'undefined') return;
  if (reported) return;
  reported = true;

  import('web-vitals').then(({ onLCP, onINP, onCLS, onTTFB, onFCP }) => {
    const handleMetric = (metric: { name: string; value: number; rating: string }) => {
      sendAnalyticsEvent({
        eventType: 'web_vital',
        eventData: {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
        },
      });
    };

    onLCP(handleMetric);
    onINP(handleMetric);
    onCLS(handleMetric);
    onTTFB(handleMetric);
    onFCP(handleMetric);
  }).catch(() => {
    // Silently ignore — web-vitals should never break the app
  });
}
