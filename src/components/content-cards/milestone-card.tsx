import { formatCents } from '@/lib/format';

interface MilestoneData {
  milestone_pct: number;
  raised_cents: number;
  goal_cents: number;
  fundraiser_title: string;
  organizer_name: string;
}

interface MilestoneCardProps {
  autoGenData: unknown;
  title: string | null;
  body: string | null;
}

function isMilestoneData(data: unknown): data is MilestoneData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.milestone_pct === 'number' &&
    typeof d.raised_cents === 'number' &&
    typeof d.goal_cents === 'number'
  );
}

export function MilestoneCard({
  autoGenData,
  title,
  body,
}: MilestoneCardProps) {
  const data = isMilestoneData(autoGenData) ? autoGenData : null;

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

  const percentage = Math.min(data.milestone_pct, 100);

  return (
    <div className="px-4">
      {/* Big percentage display */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-4 border-gfm-green bg-gfm-green/10">
          <span className="text-2xl font-bold text-gfm-green">
            {percentage}%
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gfm-dark">
            {title ?? 'Milestone Reached!'}
          </h3>
          <p className="text-sm text-muted-foreground">
            {data.fundraiser_title}
          </p>
          {data.organizer_name && (
            <p className="text-xs text-muted-foreground">
              by {data.organizer_name}
            </p>
          )}
        </div>
      </div>

      {/* Progress info */}
      <div className="mt-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-gfm-dark">
            {formatCents(data.raised_cents)}
          </span>
          <span className="text-sm text-muted-foreground">
            raised of {formatCents(data.goal_cents)} goal
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gfm-green transition-all duration-700 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {body && <p className="mt-3 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}
