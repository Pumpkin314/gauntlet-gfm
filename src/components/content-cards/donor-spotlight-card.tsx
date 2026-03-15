import { Heart } from 'lucide-react';

import { formatCents } from '@/lib/format';

interface DonorSpotlightData {
  donor_id: string;
  donor_name: string;
  amount_cents: number;
  message: string;
  fundraiser_title: string;
}

interface DonorSpotlightCardProps {
  autoGenData: unknown;
  title: string | null;
  body: string | null;
}

function isDonorSpotlightData(data: unknown): data is DonorSpotlightData {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.donor_name === 'string' && typeof d.amount_cents === 'number'
  );
}

export function DonorSpotlightCard({
  autoGenData,
  title,
  body,
}: DonorSpotlightCardProps) {
  const data = isDonorSpotlightData(autoGenData) ? autoGenData : null;

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

      <div className="mt-3 rounded-lg border border-pink-200 bg-pink-50/50 p-4 dark:border-pink-900/30 dark:bg-pink-950/20">
        {/* Donor & amount */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-900/30">
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <div>
            <p className="font-semibold text-gfm-dark">{data.donor_name}</p>
            <p className="text-sm text-gfm-green font-medium">
              donated {formatCents(data.amount_cents)}
            </p>
          </div>
        </div>

        {/* Message quote */}
        {data.message && (
          <blockquote className="mt-3 border-l-2 border-pink-300 pl-3 text-sm italic text-muted-foreground dark:border-pink-700">
            &ldquo;{data.message}&rdquo;
          </blockquote>
        )}

        {/* Fundraiser link */}
        {data.fundraiser_title && (
          <p className="mt-3 text-xs text-muted-foreground">
            Supporting{' '}
            <span className="font-medium text-gfm-dark">
              {data.fundraiser_title}
            </span>
          </p>
        )}
      </div>

      {body && <p className="mt-3 text-sm text-muted-foreground">{body}</p>}
    </div>
  );
}
