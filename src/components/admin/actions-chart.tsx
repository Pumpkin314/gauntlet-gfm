'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ActionBreakdown } from '@/lib/queries/analytics';

interface ActionsChartProps {
  data: ActionBreakdown[];
}

const ACTION_COLORS: Record<string, string> = {
  donate: '#00b964',
  share: '#3b82f6',
  follow: '#8b5cf6',
  react: '#f59e0b',
  comment: '#ef4444',
  view_content: '#6b7280',
};

export function ActionsChart({ data }: ActionsChartProps) {
  const chartData = data.map((d) => ({
    name: d.action,
    count: d.count,
    fill: ACTION_COLORS[d.action] ?? '#6b7280',
  }));

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-gfm-dark">Actions Breakdown</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        User actions tracked across all pages
      </p>
      {chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No action data yet. Navigate around the app to generate events.
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <rect key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
