import type { QueryTimingRow } from '@/lib/queries/analytics';

interface QueryTimingTableProps {
  data: QueryTimingRow[];
}

function durationColor(ms: number): string {
  if (ms >= 2000) return 'text-red-600';
  if (ms >= 1000) return 'text-amber-600';
  return 'text-yellow-600';
}

export function QueryTimingTable({ data }: QueryTimingTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-gfm-dark">Query Timing Summary</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Aggregated performance statistics for slow queries (avg, P50, P95)
      </p>

      {data.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No query timing data available yet.
        </div>
      ) : (
        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="pb-2 pr-4">Query Label</th>
                <th className="pb-2 pr-4 text-right">Count</th>
                <th className="pb-2 pr-4 text-right">Avg (ms)</th>
                <th className="pb-2 pr-4 text-right">P50 (ms)</th>
                <th className="pb-2 text-right">P95 (ms)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.label}
                  className="border-b border-border/50 text-gfm-dark"
                >
                  <td className="py-2 pr-4 font-mono text-xs">
                    {row.label}
                  </td>
                  <td className="py-2 pr-4 text-right text-xs">
                    {row.count}
                  </td>
                  <td className={`py-2 pr-4 text-right font-mono text-xs font-medium ${durationColor(row.avgMs)}`}>
                    {row.avgMs}
                  </td>
                  <td className={`py-2 pr-4 text-right font-mono text-xs font-medium ${durationColor(row.p50Ms)}`}>
                    {row.p50Ms}
                  </td>
                  <td className={`py-2 text-right font-mono text-xs font-medium ${durationColor(row.p95Ms)}`}>
                    {row.p95Ms}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
