import Image from 'next/image';
import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface OrganizerCardProps {
  organizer: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
    image: string | null;
    location: string | null;
  } | null;
  community: {
    slug: string;
    name: string;
    logoUrl: string | null;
  } | null;
  /** "inline" renders a compact row; "card" renders the sidebar version */
  variant?: 'inline' | 'card';
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

export function OrganizerCard({
  organizer,
  community,
  variant = 'inline',
}: OrganizerCardProps) {
  if (!organizer) return null;

  const avatarSrc = organizer.avatarUrl ?? organizer.image;

  if (variant === 'card') {
    return (
      <div className="rounded-xl border border-border p-4">
        <Link
          href={`/u/${organizer.username}`}
          className="flex items-center gap-3 group"
        >
          <Avatar size="lg">
            {avatarSrc && <AvatarImage src={avatarSrc} alt={organizer.displayName} />}
            <AvatarFallback>{getInitials(organizer.displayName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gfm-dark group-hover:underline truncate">
              {organizer.displayName}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                Organizer
              </Badge>
              {organizer.location && (
                <span className="text-xs text-muted-foreground truncate">
                  {organizer.location}
                </span>
              )}
            </div>
          </div>
        </Link>

        {community && (
          <Link
            href={`/communities/${community.slug}`}
            className="mt-3 flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2 group"
          >
            {community.logoUrl && (
              <Image
                src={community.logoUrl}
                alt={community.name}
                width={20}
                height={20}
                className="h-5 w-5 rounded-full object-cover"
              />
            )}
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground truncate">
              {community.name}
            </span>
          </Link>
        )}
      </div>
    );
  }

  // Inline variant for main content area
  return (
    <div className="flex items-center gap-3">
      <Link href={`/u/${organizer.username}`}>
        <Avatar size="lg">
          {avatarSrc && <AvatarImage src={avatarSrc} alt={organizer.displayName} />}
          <AvatarFallback>{getInitials(organizer.displayName)}</AvatarFallback>
        </Avatar>
      </Link>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/u/${organizer.username}`}
            className="text-sm font-semibold text-gfm-dark hover:underline truncate"
          >
            {organizer.displayName}
          </Link>
          <span className="text-sm text-muted-foreground">is organizing this fundraiser</span>
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          {organizer.location && (
            <span className="text-xs text-muted-foreground">{organizer.location}</span>
          )}
          {organizer.location && community && (
            <span className="text-xs text-muted-foreground">{'  '}|{'  '}</span>
          )}
          {community && (
            <Link
              href={`/communities/${community.slug}`}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {community.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
