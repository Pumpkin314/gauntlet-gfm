import type { MetricsSummary } from '@/lib/queries/analytics';

interface MetricCardsProps {
  summary: MetricsSummary;
}

function formatVital(value: number | null, unit: string): string {
  if (value === null) return '—';
  if (unit === 'ms') return `${Math.round(value)} ms`;
  if (unit === 'score') return value.toFixed(3);
  return String(value);
}

export function MetricCards({ summary }: MetricCardsProps) {
  const cards = [
    {
      label: 'Page Views',
      value: summary.totalPageViews.toLocaleString(),
      sub: 'tracked events',
    },
    {
      label: 'Donations',
      value: summary.totalDonations.toLocaleString(),
      sub: 'all time',
    },
    {
      label: 'Reactions',
      value: summary.totalReactions.toLocaleString(),
      sub: 'all time',
    },
    {
      label: 'Comments',
      value: summary.totalComments.toLocaleString(),
      sub: 'all time',
    },
    {
      label: 'Follows',
      value: summary.totalFollows.toLocaleString(),
      sub: 'all time',
    },
    {
      label: 'LCP (P50)',
      value: formatVital(summary.webVitals.lcp.p50, 'ms'),
      sub: summary.webVitals.lcp.p95
        ? `P95: ${Math.round(summary.webVitals.lcp.p95)} ms`
        : 'no data',
    },
    {
      label: 'CLS (P50)',
      value: formatVital(summary.webVitals.cls.p50, 'score'),
      sub: summary.webVitals.cls.p95
        ? `P95: ${summary.webVitals.cls.p95.toFixed(3)}`
        : 'no data',
    },
    {
      label: 'INP (P50)',
      value: formatVital(summary.webVitals.inp.p50, 'ms'),
      sub: summary.webVitals.inp.p95
        ? `P95: ${Math.round(summary.webVitals.inp.p95)} ms`
        : 'no data',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-bold text-gfm-dark">{card.value}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
