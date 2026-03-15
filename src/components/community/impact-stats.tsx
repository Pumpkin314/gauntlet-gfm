import { formatCents } from '@/lib/format';

interface ImpactStatsProps {
  totalRaisedCents: number;
  totalDonations: number;
  fundraiserCount: number;
}

export function ImpactStats({
  totalRaisedCents,
  totalDonations,
  fundraiserCount,
}: ImpactStatsProps) {
  const stats = [
    {
      label: 'raised',
      value: formatCents(totalRaisedCents),
    },
    {
      label: 'donations',
      value: totalDonations.toLocaleString('en-US'),
    },
    {
      label: 'fundraisers',
      value: fundraiserCount.toLocaleString('en-US'),
    },
  ];

  return (
    <div className="flex items-center divide-x divide-border">
      {stats.map((stat) => (
        <div key={stat.label} className="flex-1 px-2 py-3 text-center sm:px-4 first:pl-0 last:pr-0">
          <p className="text-base font-bold text-gfm-dark sm:text-xl">
            {stat.value}
          </p>
          <p className="text-[11px] text-muted-foreground sm:text-sm">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
