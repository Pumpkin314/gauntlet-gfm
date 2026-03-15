'use client';

import type {
  ContentPostData,
  ContentAuthor,
  ContentFundraiser,
  ContentCommunity,
} from '@/components/content-cards/types';
import { FYPCard } from './fyp-card';
import { FYPNav } from './fyp-nav';

export interface FYPPostItem {
  post: ContentPostData;
  author: ContentAuthor | null;
  fundraiser: ContentFundraiser | null;
  community: ContentCommunity | null;
}

interface FYPShellProps {
  initialPosts: FYPPostItem[];
  user: {
    name?: string | null;
    image?: string | null;
  } | null;
}

/**
 * Main FYP scroll container.
 *
 * Renders as a full-viewport fixed overlay (z-50) that covers the root
 * layout's nav and footer. Uses CSS scroll-snap for TikTok-style vertical
 * snapping. On desktop the content column is capped at 480px width with
 * dark flanking panels.
 */
export function FYPShell({ initialPosts, user }: FYPShellProps) {
  if (initialPosts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111] text-white">
        <p className="text-lg text-zinc-400">
          No posts yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#111]">
      {/* Desktop: dark flanking background is the parent bg */}
      <div className="relative mx-auto h-full w-full md:max-w-[480px]">
        {/* Nav */}
        <FYPNav user={user} />

        {/* Scroll container */}
        <div
          className="h-full w-full snap-y snap-mandatory overflow-y-scroll"
          style={{ scrollSnapType: 'y mandatory' }}
        >
          {initialPosts.map((item) => (
            <FYPCard
              key={item.post.id}
              post={item.post}
              author={item.author}
              fundraiser={item.fundraiser}
              community={item.community}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
