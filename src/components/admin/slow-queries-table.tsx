import type { SlowQueryEntry } from '@/lib/queries/analytics';

interface SlowQueriesTableProps {
  queries: SlowQueryEntry[];
}

function formatTimestamp(date: Date | null): string {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function durationColor(ms: number): string {
  if (ms >= 2000) return 'text-red-600';
  if (ms >= 1000) return 'text-amber-600';
  return 'text-yellow-600';
}

export function SlowQueriesTable({ queries }: SlowQueriesTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-gfm-dark">Slow Queries</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Database queries exceeding 500ms threshold
      </p>

      {queries.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No slow queries recorded yet. All queries are performing well.
        </div>
      ) : (
        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">Query Label</th>
                <th className="pb-2 pr-4 text-right">Duration</th>
              </tr>
            </thead>
            <tbody>
              {queries.map((q) => (
                <tr
                  key={q.id}
                  className="border-b border-border/50 text-gfm-dark"
                >
                  <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                    {formatTimestamp(q.createdAt)}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs">
                    {q.label}
                  </td>
                  <td className={`py-2 pr-4 text-right font-mono text-xs font-medium ${durationColor(q.durationMs)}`}>
                    {q.durationMs}ms
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
