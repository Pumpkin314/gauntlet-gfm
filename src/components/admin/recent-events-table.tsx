import type { RecentEvent } from '@/lib/queries/analytics';

interface RecentEventsTableProps {
  events: RecentEvent[];
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

function truncateJson(data: unknown, maxLen = 80): string {
  const str = JSON.stringify(data);
  if (!str || str === 'null') return '—';
  return str.length > maxLen ? str.slice(0, maxLen) + '...' : str;
}

export function RecentEventsTable({ events }: RecentEventsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold text-gfm-dark">Recent Events</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Last 50 analytics events (raw data)
      </p>

      {events.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          No events recorded yet.
        </div>
      ) : (
        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground uppercase">
                <th className="pb-2 pr-4">Time</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Page</th>
                <th className="pb-2 pr-4">Data</th>
                <th className="pb-2">Session</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-border/50 text-gfm-dark"
                >
                  <td className="py-2 pr-4 whitespace-nowrap text-xs text-muted-foreground">
                    {formatTimestamp(event.createdAt)}
                  </td>
                  <td className="py-2 pr-4">
                    <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {event.eventType}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-xs text-muted-foreground">
                    {event.pagePath ?? '—'}
                  </td>
                  <td className="py-2 pr-4 font-mono text-xs text-muted-foreground">
                    {truncateJson(event.eventData)}
                  </td>
                  <td className="py-2 font-mono text-xs text-muted-foreground">
                    {event.sessionId ? event.sessionId.slice(0, 8) + '...' : '—'}
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
