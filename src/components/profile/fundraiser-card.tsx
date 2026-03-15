import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/fundraiser/progress-bar';

interface FundraiserCardProps {
  fundraiser: {
    slug: string;
    title: string;
    heroImageUrl: string | null;
    goalCents: number;
    raisedCents: number | null;
    donationCount: number | null;
    status: 'active' | 'completed' | 'paused' | null;
  };
  community: {
    slug: string;
    name: string;
    logoUrl: string | null;
  } | null;
}

export function FundraiserCard({ fundraiser, community }: FundraiserCardProps) {
  return (
    <Link
      href={`/f/${fundraiser.slug}`}
      className="group block min-w-[260px] max-w-[320px] shrink-0 overflow-hidden rounded-xl border border-border transition-shadow hover:shadow-md"
    >
      {/* Hero image */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        {fundraiser.heroImageUrl ? (
          <img
            src={fundraiser.heroImageUrl}
            alt={fundraiser.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-gfm-dark group-hover:underline">
          {fundraiser.title}
        </h3>

        {community && (
          <div className="mt-1.5 flex items-center gap-1.5">
            {community.logoUrl && (
              <img
                src={community.logoUrl}
                alt={community.name}
                className="h-4 w-4 rounded-full object-cover"
              />
            )}
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
              {community.name}
            </Badge>
          </div>
        )}

        <div className="mt-2">
          <ProgressBar
            raisedCents={fundraiser.raisedCents ?? 0}
            goalCents={fundraiser.goalCents}
            donationCount={fundraiser.donationCount ?? 0}
            compact
          />
        </div>
      </div>
    </Link>
  );
}
