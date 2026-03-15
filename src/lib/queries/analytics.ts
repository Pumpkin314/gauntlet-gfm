import { desc, eq, sql, and, gte } from 'drizzle-orm';

import { db } from '@/lib/db';
import { analyticsEvents, donations, reactions, comments, follows } from '@/lib/db/schema';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MetricsSummary {
  totalPageViews: number;
  totalActions: number;
  totalDonations: number;
  totalReactions: number;
  totalComments: number;
  totalFollows: number;
  webVitals: {
    lcp: { p50: number | null; p95: number | null };
    cls: { p50: number | null; p95: number | null };
    inp: { p50: number | null; p95: number | null };
    ttfb: { p50: number | null; p95: number | null };
    fcp: { p50: number | null; p95: number | null };
  };
}

export interface ActionBreakdown {
  action: string;
  count: number;
}

export interface ContentEngagement {
  contentType: string;
  views: number;
}

export interface RecentEvent {
  id: string;
  eventType: string;
  eventData: unknown;
  pagePath: string | null;
  sessionId: string | null;
  createdAt: Date | null;
}

export interface WebVitalEntry {
  name: string;
  value: number;
  rating: string;
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Get aggregate metrics summary */
export async function getMetricsSummary(): Promise<MetricsSummary> {
  // Count page views
  const [pageViewRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.eventType, 'page_view'));

  // Count actions
  const [actionRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.eventType, 'action'));

  // Count real entities
  const [donationRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(donations);

  const [reactionRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reactions);

  const [commentRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(comments);

  const [followRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(follows);

  // Web Vitals percentiles
  const webVitals = await getWebVitalsPercentiles();

  return {
    totalPageViews: pageViewRow?.count ?? 0,
    totalActions: actionRow?.count ?? 0,
    totalDonations: donationRow?.count ?? 0,
    totalReactions: reactionRow?.count ?? 0,
    totalComments: commentRow?.count ?? 0,
    totalFollows: followRow?.count ?? 0,
    webVitals,
  };
}

/** Get P50 and P95 for each web vital */
async function getWebVitalsPercentiles() {
  const vitals = ['LCP', 'CLS', 'INP', 'TTFB', 'FCP'] as const;
  const result: Record<string, { p50: number | null; p95: number | null }> = {};

  for (const vital of vitals) {
    const [row] = await db
      .select({
        p50: sql<number>`percentile_cont(0.5) within group (order by (${analyticsEvents.eventData}->>'value')::float)`,
        p95: sql<number>`percentile_cont(0.95) within group (order by (${analyticsEvents.eventData}->>'value')::float)`,
      })
      .from(analyticsEvents)
      .where(
        and(
          eq(analyticsEvents.eventType, 'web_vital'),
          sql`${analyticsEvents.eventData}->>'name' = ${vital}`,
        ),
      );

    result[vital.toLowerCase()] = {
      p50: row?.p50 ?? null,
      p95: row?.p95 ?? null,
    };
  }

  return result as MetricsSummary['webVitals'];
}

/** Get action counts grouped by action type */
export async function getActionBreakdown(): Promise<ActionBreakdown[]> {
  const rows = await db
    .select({
      action: sql<string>`${analyticsEvents.eventData}->>'action'`,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(eq(analyticsEvents.eventType, 'action'))
    .groupBy(sql`${analyticsEvents.eventData}->>'action'`)
    .orderBy(sql`count(*) desc`);

  return rows.map((r) => ({ action: r.action ?? 'unknown', count: r.count }));
}

/** Get content views grouped by content type */
export async function getContentEngagement(): Promise<ContentEngagement[]> {
  const rows = await db
    .select({
      contentType: sql<string>`${analyticsEvents.eventData}->>'contentType'`,
      views: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventType, 'action'),
        sql`${analyticsEvents.eventData}->>'action' = 'view_content'`,
      ),
    )
    .groupBy(sql`${analyticsEvents.eventData}->>'contentType'`)
    .orderBy(sql`count(*) desc`);

  return rows.map((r) => ({
    contentType: r.contentType ?? 'unknown',
    views: r.views,
  }));
}

/** Get web vitals as raw entries for histogram */
export async function getWebVitalsDistribution(
  vitalName: string,
  limit = 200,
): Promise<WebVitalEntry[]> {
  const rows = await db
    .select({
      name: sql<string>`${analyticsEvents.eventData}->>'name'`,
      value: sql<number>`(${analyticsEvents.eventData}->>'value')::float`,
      rating: sql<string>`${analyticsEvents.eventData}->>'rating'`,
    })
    .from(analyticsEvents)
    .where(
      and(
        eq(analyticsEvents.eventType, 'web_vital'),
        sql`${analyticsEvents.eventData}->>'name' = ${vitalName}`,
      ),
    )
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    name: r.name ?? vitalName,
    value: r.value ?? 0,
    rating: r.rating ?? 'unknown',
  }));
}

/** Get the most recent analytics events */
export async function getRecentEvents(limit = 50): Promise<RecentEvent[]> {
  return db
    .select({
      id: analyticsEvents.id,
      eventType: analyticsEvents.eventType,
      eventData: analyticsEvents.eventData,
      pagePath: analyticsEvents.pagePath,
      sessionId: analyticsEvents.sessionId,
      createdAt: analyticsEvents.createdAt,
    })
    .from(analyticsEvents)
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(limit);
}

/** Get daily event counts for the last N days (for time series) */
export async function getDailyEventCounts(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const rows = await db
    .select({
      date: sql<string>`date_trunc('day', ${analyticsEvents.createdAt})::date::text`,
      eventType: analyticsEvents.eventType,
      count: sql<number>`count(*)::int`,
    })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, since))
    .groupBy(
      sql`date_trunc('day', ${analyticsEvents.createdAt})`,
      analyticsEvents.eventType,
    )
    .orderBy(sql`date_trunc('day', ${analyticsEvents.createdAt})`);

  return rows;
}
