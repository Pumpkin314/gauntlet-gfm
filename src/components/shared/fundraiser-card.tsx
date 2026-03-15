import Link from 'next/link';

import { ProgressBar } from '@/components/fundraiser/progress-bar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface FundraiserCardProps {
  fundraiser: {
    slug: string;
    title: string;
    heroImageUrl: string | null;
    raisedCents: number | null;
    goalCents: number;
    donationCount: number | null;
  };
  organizer?: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    image: string | null;
  } | null;
  community?: {
    slug: string;
    name: string;
    logoUrl: string | null;
  } | null;
  /** Fixed width for horizontal scroll layouts */
  fixedWidth?: boolean;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function FundraiserCard({
  fundraiser,
  organizer,
  community,
  fixedWidth = false,
}: FundraiserCardProps) {
  return (
    <Link
      href={`/f/${fundraiser.slug}`}
      className={`group block overflow-hidden rounded-xl border border-border bg-background transition-shadow hover:shadow-md ${
        fixedWidth ? 'min-w-[260px] max-w-[320px] shrink-0' : ''
      }`}
    >
      {/* Hero thumbnail (16:9) */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {fundraiser.heroImageUrl ? (
          <img
            src={fundraiser.heroImageUrl}
            alt={fundraiser.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-2 text-sm font-semibold text-gfm-dark group-hover:underline">
          {fundraiser.title}
        </h3>

        {/* Organizer row */}
        {organizer && (
          <div className="mt-2 flex items-center gap-2">
            <Avatar size="sm">
              {(organizer.avatarUrl ?? organizer.image) && (
                <AvatarImage
                  src={(organizer.avatarUrl ?? organizer.image)!}
                  alt={organizer.displayName}
                />
              )}
              <AvatarFallback>
                {getInitials(organizer.displayName)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs text-muted-foreground">
              by {organizer.displayName}
            </span>
          </div>
        )}

        {/* Community badge */}
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

        {/* Progress bar (compact) */}
        <div className="mt-3">
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
