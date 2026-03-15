'use client';

import { useTransition, useState } from 'react';

import { Button } from '@/components/ui/button';
import { trackAction } from '@/lib/analytics/actions';
import { toggleFollowUser } from '@/lib/actions/follows';

interface FollowButtonProps {
  targetUserId: string;
  isOwnProfile: boolean;
  initialIsFollowing: boolean;
}

export function FollowButton({
  targetUserId,
  isOwnProfile,
  initialIsFollowing,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isPending, startTransition] = useTransition();

  if (isOwnProfile) {
    return (
      <Button variant="outline" size="sm" disabled className="cursor-default opacity-60" title="Coming soon">
        Edit profile
      </Button>
    );
  }

  function handleClick() {
    startTransition(async () => {
      // Optimistic update
      const previous = isFollowing;
      setIsFollowing(!previous);

      try {
        const result = await toggleFollowUser(targetUserId);
        setIsFollowing(result.followed);
        if (result.followed) {
          trackAction('follow', { targetUserId, type: 'user' });
        }
      } catch {
        // Revert on error
        setIsFollowing(previous);
      }
    });
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
      className={
        isFollowing
          ? ''
          : 'bg-gfm-green hover:bg-gfm-green/90 text-white'
      }
    >
      {isPending ? '...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
}
