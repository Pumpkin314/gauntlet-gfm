'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import type { WebVitalEntry, MetricsSummary } from '@/lib/queries/analytics';

interface WebVitalsChartProps {
  lcpData: WebVitalEntry[];
  vitals: MetricsSummary['webVitals'];
}

// LCP thresholds (ms): good < 2500, needs improvement < 4000, poor >= 4000
function getLCPColor(value: number): string {
  if (value < 2500) return '#00b964';
  if (value < 4000) return '#f59e0b';
  return '#ef4444';
}

export function WebVitalsChart({ lcpData, vitals }: WebVitalsChartProps) {
  // Bucket LCP values into histogram bins
  const bucketSize = 500; // 500ms buckets
  const buckets: Record<number, { good: number; needsImprovement: number; poor: number }> = {};

  for (const entry of lcpData) {
    const bucket = Math.floor(entry.value / bucketSize) * bucketSize;
    if (!buckets[bucket]) {
      buckets[bucket] = { good: 0, needsImprovement: 0, poor: 0 };
    }
    if (entry.value < 2500) buckets[bucket].good++;
    else if (entry.value < 4000) buckets[bucket].needsImprovement++;
    else buckets[bucket].poor++;
  }

  const histogramData = Object.entries(buckets)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([ms, counts]) => ({
      range: `${Number(ms) / 1000}s`,
      ms: Number(ms),
      ...counts,
      total: counts.good + counts.needsImprovement + counts.poor,
    }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-gfm-dark">Web Vitals — LCP Distribution</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Largest Contentful Paint timing histogram
      </p>

      {/* Vitals summary row */}
      <div className="mt-4 flex flex-wrap gap-4">
        {Object.entries(vitals).map(([name, vals]) => (
          <div key={name} className="rounded-md bg-muted/50 px-3 py-2">
            <span className="text-xs font-medium uppercase text-muted-foreground">
              {name}
            </span>
            <div className="text-sm font-semibold text-gfm-dark">
              P50: {vals.p50 !== null ? `${Math.round(vals.p50)}` : '—'}
              {' / '}
              P95: {vals.p95 !== null ? `${Math.round(vals.p95)}` : '—'}
              {name !== 'cls' ? ' ms' : ''}
            </div>
          </div>
        ))}
      </div>

      {lcpData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No LCP data yet. Navigate around to generate Web Vitals.
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histogramData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 11 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                }}
                formatter={(value) => [String(value), 'count']}
              />
              <ReferenceLine
                x={`${2500 / 1000}s`}
                stroke="#f59e0b"
                strokeDasharray="3 3"
                label={{ value: 'Good', fontSize: 10 }}
              />
              <ReferenceLine
                x={`${4000 / 1000}s`}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Poor', fontSize: 10 }}
              />
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {histogramData.map((entry) => (
                  <Cell key={entry.ms} fill={getLCPColor(entry.ms + bucketSize / 2)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-[#00b964]" /> Good (&lt;2.5s)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-[#f59e0b]" /> Needs improvement
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm bg-[#ef4444]" /> Poor (&gt;4s)
        </span>
      </div>
    </div>
  );
}
