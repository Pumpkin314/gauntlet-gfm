import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { formatCents } from '@/lib/format';

interface LeaderboardEntry {
  fundraiser: {
    id: string;
    slug: string;
    title: string;
    raisedCents: number | null;
    goalCents: number;
  };
  organizer: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    image: string | null;
  } | null;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
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

export function Leaderboard({ entries }: LeaderboardProps) {
  if (entries.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <h3 className="mb-3 text-sm font-bold text-gfm-dark">
        Top Fundraisers
      </h3>

      <div className="space-y-3">
        {entries.map((entry, index) => {
          const { fundraiser, organizer } = entry;
          const avatarSrc = organizer?.avatarUrl ?? organizer?.image;

          return (
            <div key={fundraiser.id} className="flex items-start gap-3">
              {/* Rank */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                {index + 1}
              </span>

              {/* Avatar */}
              {organizer && (
                <Link href={`/u/${organizer.username}`} className="shrink-0">
                  <Avatar size="sm">
                    {avatarSrc && (
                      <AvatarImage
                        src={avatarSrc}
                        alt={organizer.displayName}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(organizer.displayName)}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <Link
                  href={`/f/${fundraiser.slug}`}
                  className="line-clamp-1 text-xs font-medium text-gfm-dark hover:underline"
                >
                  {fundraiser.title}
                </Link>
                {organizer && (
                  <Link
                    href={`/u/${organizer.username}`}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {organizer.displayName}
                  </Link>
                )}
              </div>

              {/* Amount */}
              <span className="shrink-0 text-xs font-bold text-gfm-green">
                {formatCents(fundraiser.raisedCents ?? 0)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
