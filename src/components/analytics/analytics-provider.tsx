'use client';

import { useEffect } from 'react';

import { flushAnalytics } from '@/lib/analytics/beacon';
import { captureNavigationTiming } from '@/lib/analytics/navigation-timing';
import { trackPageView } from '@/lib/analytics/page-view';
import { reportWebVitals } from '@/lib/analytics/web-vitals';

/**
 * Client component that initializes analytics on mount.
 * - Reports Web Vitals metrics
 * - Tracks the initial page view
 * - Flushes any buffered events on page unload
 *
 * Place this in the root layout to enable analytics site-wide.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    reportWebVitals();
    trackPageView();
    captureNavigationTiming();

    const handleBeforeUnload = () => {
      flushAnalytics();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return <>{children}</>;
}
