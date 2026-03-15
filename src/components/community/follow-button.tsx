'use client';

import { useState,useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { trackAction } from '@/lib/analytics/actions';
import { toggleFollowCommunity } from '@/lib/actions/follows';

interface FollowButtonProps {
  communityId: string;
  initialFollowerCount: number;
}

export function FollowButton({
  communityId,
  initialFollowerCount,
}: FollowButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  function handleToggle() {
    // Optimistic update
    const nextFollowing = !isFollowing;
    setIsFollowing(nextFollowing);
    setFollowerCount((prev) => prev + (nextFollowing ? 1 : -1));

    startTransition(async () => {
      const result = await toggleFollowCommunity(communityId);
      if (result.success && nextFollowing) {
        trackAction('follow', { communityId, type: 'community' });
      }
      if (!result.success) {
        // Revert on error
        setIsFollowing(!nextFollowing);
        setFollowerCount((prev) => prev + (nextFollowing ? -1 : 1));
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        onClick={handleToggle}
        disabled={isPending}
        variant={isFollowing ? 'outline' : 'default'}
        size="lg"
        className={
          isFollowing
            ? 'border-gfm-green text-gfm-green hover:bg-gfm-green/5'
            : 'bg-gfm-green text-white hover:bg-gfm-green/90'
        }
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
      <span className="text-sm text-muted-foreground">
        {followerCount.toLocaleString('en-US')}{' '}
        {followerCount === 1 ? 'follower' : 'followers'}
      </span>
    </div>
  );
}
