import { MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { FollowButton } from '@/components/profile/follow-button';

interface ProfileHeaderProps {
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    image: string | null;
    coverImageUrl: string | null;
    location: string | null;
    bio: string | null;
  };
  followCounts: {
    followers: number;
    following: number;
  };
  isOwnProfile: boolean;
  isFollowing: boolean;
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

export function ProfileHeader({
  user,
  followCounts,
  isOwnProfile,
  isFollowing,
}: ProfileHeaderProps) {
  const avatarSrc = user.avatarUrl ?? user.image;

  return (
    <div>
      {/* Cover image */}
      <div className="relative h-40 w-full overflow-hidden rounded-xl bg-muted sm:h-52">
        {user.coverImageUrl ? (
          <Image
            src={user.coverImageUrl}
            alt={`${user.displayName}'s cover`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-gfm-green/20 to-gfm-green/5" />
        )}
      </div>

      {/* Avatar + info */}
      <div className="relative px-4 sm:px-6">
        {/* Avatar overlapping cover */}
        <div className="-mt-12 sm:-mt-14">
          <div className="inline-block rounded-full border-4 border-background">
            {avatarSrc ? (
              <Image
                src={avatarSrc}
                alt={user.displayName}
                width={96}
                height={96}
                className="rounded-full object-cover"
                priority
              />
            ) : (
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(user.displayName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>

        {/* Name, location, follow button */}
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gfm-dark">
              {user.displayName}
            </h1>
            <p className="text-sm text-muted-foreground">@{user.username}</p>

            {user.location && (
              <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>{user.location}</span>
              </div>
            )}

            {user.bio && (
              <p className="mt-2 max-w-xl text-sm text-gfm-dark/80">
                {user.bio}
              </p>
            )}

            {/* Follower/following counts */}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <span>
                <span className="font-semibold text-gfm-dark">
                  {followCounts.followers}
                </span>{' '}
                <span className="text-muted-foreground">
                  {followCounts.followers === 1 ? 'follower' : 'followers'}
                </span>
              </span>
              <span>
                <span className="font-semibold text-gfm-dark">
                  {followCounts.following}
                </span>{' '}
                <span className="text-muted-foreground">following</span>
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/fyp?source=profile&id=${user.id}`}
              className="inline-flex h-9 items-center rounded-full border border-gfm-green px-4 text-sm font-medium text-gfm-green transition-colors hover:bg-gfm-green hover:text-white"
            >
              Fund You Page
            </Link>
            <FollowButton
              targetUserId={user.id}
              isOwnProfile={isOwnProfile}
              initialIsFollowing={isFollowing}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
