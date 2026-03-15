import { Suspense } from 'react';

import { getCurrentUser } from '@/lib/auth';
import {
  getMetricsSummary,
  getActionBreakdown,
  getContentEngagement,
  getWebVitalsDistribution,
  getRecentEvents,
} from '@/lib/queries/analytics';
import { MetricCards } from '@/components/admin/metric-cards';
import { ActionsChart } from '@/components/admin/actions-chart';
import { ContentChart } from '@/components/admin/content-chart';
import { WebVitalsChart } from '@/components/admin/web-vitals-chart';
import { RecentEventsTable } from '@/components/admin/recent-events-table';
import { DashboardRefresh } from '@/components/admin/dashboard-refresh';

export const revalidate = 0; // Always fresh data for admin dashboard

export default async function AdminMetricsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gfm-dark">Sign in required</h1>
          <p className="mt-2 text-muted-foreground">
            You must be signed in to view the metrics dashboard.
          </p>
        </div>
      </div>
    );
  }

  const [summary, actions, content, lcpDistribution, recentEvents] =
    await Promise.all([
      getMetricsSummary(),
      getActionBreakdown(),
      getContentEngagement(),
      getWebVitalsDistribution('LCP'),
      getRecentEvents(50),
    ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gfm-dark">Metrics Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time observability for GoFundMe Reimagined
          </p>
        </div>
        <DashboardRefresh />
      </div>

      {/* Metric Cards Row */}
      <Suspense fallback={<div className="h-32 animate-pulse rounded-lg bg-muted" />}>
        <MetricCards summary={summary} />
      </Suspense>

      {/* Charts Row */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-muted" />}>
          <ActionsChart data={actions} />
        </Suspense>
        <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-muted" />}>
          <ContentChart data={content} />
        </Suspense>
      </div>

      {/* Web Vitals */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-80 animate-pulse rounded-lg bg-muted" />}>
          <WebVitalsChart
            lcpData={lcpDistribution}
            vitals={summary.webVitals}
          />
        </Suspense>
      </div>

      {/* Recent Events */}
      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-lg bg-muted" />}>
          <RecentEventsTable events={recentEvents} />
        </Suspense>
      </div>
    </div>
  );
}
