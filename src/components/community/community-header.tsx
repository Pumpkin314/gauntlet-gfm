import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from '@/components/ui/avatar';

import { FollowButton } from './follow-button';

interface CommunityHeaderProps {
  community: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    bannerImageUrl: string | null;
    logoUrl: string | null;
    followerCount: number | null;
  };
  members: Array<{
    user: {
      id: string;
      displayName: string;
      avatarUrl: string | null;
      image: string | null;
    } | null;
  }>;
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

export function CommunityHeader({
  community,
  members,
}: CommunityHeaderProps) {
  return (
    <div>
      {/* Banner */}
      <div className="relative h-[200px] w-full overflow-hidden rounded-xl bg-muted sm:h-[240px] md:h-[280px]">
        {community.bannerImageUrl ? (
          <img
            src={community.bannerImageUrl}
            alt={`${community.name} banner`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gfm-green/20 to-gfm-green/5">
            <span className="text-4xl font-bold text-gfm-green/30">
              {community.name}
            </span>
          </div>
        )}

        {/* Logo overlay at bottom-left of banner */}
        {community.logoUrl && (
          <div className="absolute -bottom-6 left-4 sm:left-6">
            <div className="rounded-xl border-4 border-background bg-background shadow-sm">
              <img
                src={community.logoUrl}
                alt={`${community.name} logo`}
                className="h-16 w-16 rounded-lg object-cover sm:h-20 sm:w-20"
              />
            </div>
          </div>
        )}
      </div>

      {/* Community info */}
      <div className={community.logoUrl ? 'mt-10 sm:mt-12' : 'mt-6'}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gfm-dark sm:text-3xl">
              {community.name}
            </h1>

            {community.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {community.description.length > 200
                  ? `${community.description.slice(0, 200)}...`
                  : community.description}
              </p>
            )}

            {/* Member avatar stack */}
            <div className="mt-3 flex items-center gap-3">
              {members.length > 0 && (
                <AvatarGroup>
                  {members.map(({ user }) => {
                    if (!user) return null;
                    const avatarSrc = user.avatarUrl ?? user.image;
                    return (
                      <Avatar key={user.id} size="sm">
                        {avatarSrc && (
                          <AvatarImage
                            src={avatarSrc}
                            alt={user.displayName}
                          />
                        )}
                        <AvatarFallback>
                          {getInitials(user.displayName)}
                        </AvatarFallback>
                      </Avatar>
                    );
                  })}
                </AvatarGroup>
              )}
            </div>
          </div>

          {/* Follow button */}
          <div className="shrink-0">
            <FollowButton
              communityId={community.id}
              initialFollowerCount={community.followerCount ?? 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
