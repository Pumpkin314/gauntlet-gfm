import { formatCents } from '@/lib/format';

interface ProgressBarProps {
  raisedCents: number;
  goalCents: number;
  donationCount?: number;
  /** Compact mode hides the donation count line */
  compact?: boolean;
}

export function ProgressBar({
  raisedCents,
  goalCents,
  donationCount,
  compact = false,
}: ProgressBarProps) {
  const percentage = Math.min(
    Math.round((raisedCents / goalCents) * 100),
    100,
  );

  return (
    <div>
      {/* Amount raised */}
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-bold text-gfm-dark">
          {formatCents(raisedCents)}
        </span>
        <span className="text-sm text-muted-foreground">
          raised of {formatCents(goalCents)} goal
        </span>
      </div>

      {/* Bar */}
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gfm-green transition-all duration-700 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={raisedCents}
          aria-valuemin={0}
          aria-valuemax={goalCents}
          aria-label={`${percentage}% funded`}
        />
      </div>

      {/* Stats line */}
      {!compact && (
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          {donationCount !== undefined && donationCount > 0 && (
            <span>
              {donationCount.toLocaleString('en-US')}{' '}
              {donationCount === 1 ? 'donation' : 'donations'}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
