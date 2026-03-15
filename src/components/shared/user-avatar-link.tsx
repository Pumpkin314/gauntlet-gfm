import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

interface UserAvatarLinkProps {
  username: string;
  displayName: string;
  avatarUrl: string | null;
  image?: string | null;
  size?: 'sm' | 'default' | 'lg';
  showName?: boolean;
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

export function UserAvatarLink({
  username,
  displayName,
  avatarUrl,
  image,
  size = 'default',
  showName = false,
}: UserAvatarLinkProps) {
  const src = avatarUrl ?? image;

  return (
    <Link
      href={`/u/${username}`}
      className="inline-flex items-center gap-2 group"
    >
      <Avatar size={size}>
        {src && <AvatarImage src={src} alt={displayName} />}
        <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
      </Avatar>
      {showName && (
        <span className="text-sm font-medium text-gfm-dark group-hover:underline truncate">
          {displayName}
        </span>
      )}
    </Link>
  );
}
