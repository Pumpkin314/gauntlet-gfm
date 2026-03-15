import { formatCents } from '@/lib/format';

interface CommunityPulseData {
  period: string;
  new_fundraisers: number;
  raised_cents: number;
  new_members: number;
  total_members: number;
  top_fundraiser_title: string;
  top_fundraiser_raised: number;
}

interface CommunityPulseCardProps {
  autoGenData: unknown;
  title: string | null;
  body: string | null;
}

function isCommunityPulseData(data: unknown): data is CommunityPulseData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.period === 'string' &&
    typeof d.raised_cents === 'number' &&
    typeof d.new_members === 'number'
  );
}

export function CommunityPulseCard({
  autoGenData,
  title,
  body,
}: CommunityPulseCardProps) {
  const data = isCommunityPulseData(autoGenData) ? autoGenData : null;

  if (!data) {
    return (
      <div className="px-4">
        {title && (
          <h3 className="text-lg font-semibold text-gfm-dark">{title}</h3>
        )}
        {body && <p className="mt-1 text-muted-foreground">{body}</p>}
      </div>
    );
  }

  return (
    <div className="px-4">
      {title && (
        <h3 className="text-lg font-semibold text-gfm-dark">{title}</h3>
      )}

      {/* Stats grid */}
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-gfm-dark">
            {data.new_fundraisers}
          </p>
          <p className="text-xs text-muted-foreground">New Fundraisers</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-gfm-green">
            {formatCents(data.raised_cents)}
          </p>
          <p className="text-xs text-muted-foreground">Raised</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <p className="text-2xl font-bold text-gfm-dark">{data.new_members}</p>
          <p className="text-xs text-muted-foreground">New Members</p>
        </div>
      </div>

      {/* Top fundraiser highlight */}
      {data.top_fundraiser_title && (
        <div className="mt-3 rounded-lg border border-gfm-green/20 bg-gfm-green/5 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-gfm-green">
            Top Fundraiser
          </p>
          <p className="mt-1 font-medium text-gfm-dark">
            {data.top_fundraiser_title}
          </p>
          {data.top_fundraiser_raised > 0 && (
            <p className="text-sm text-muted-foreground">
              {formatCents(data.top_fundraiser_raised)} raised
            </p>
          )}
        </div>
      )}

      {/* Period label */}
      <p className="mt-2 text-xs text-muted-foreground capitalize">
        {data.period} report &middot; {data.total_members.toLocaleString()}{' '}
        total members
      </p>

      {body && <p className="mt-2 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}
