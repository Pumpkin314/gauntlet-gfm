'use client';

import { useCallback, useEffect, useRef } from 'react';

import type {
  ContentPostData,
  ContentAuthor,
  ContentFundraiser,
  ContentCommunity,
} from '@/components/content-cards/types';
import { useFYPFeed } from '@/hooks/use-fyp-feed';
import type { FeedItem } from '@/lib/feed/types';
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
  initialCursor: string | null;
  user: {
    name?: string | null;
    image?: string | null;
  } | null;
  source?: string;
  id?: string;
  startAtPostId?: string;
}

const SCROLL_POSITION_KEY = 'fyp-scroll-position';

/**
 * Main FYP scroll container.
 *
 * Renders as a full-viewport fixed overlay (z-50) that covers the root
 * layout's nav and footer. Uses CSS scroll-snap for TikTok-style vertical
 * snapping. On desktop the content column is capped at 480px width with
 * dark flanking panels.
 */
export function FYPShell({
  initialPosts,
  initialCursor,
  user,
  source = 'discover',
  id,
  startAtPostId,
}: FYPShellProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const hasScrolledToStart = useRef(false);

  // Convert FYPPostItem[] to FeedItem[] for the hook
  const initialFeedItems: FeedItem[] = initialPosts.map((item) => ({
    post: {
      id: item.post.id,
      contentType: item.post.contentType,
      title: item.post.title,
      body: item.post.body,
      mediaUrl: item.post.mediaUrl,
      muxPlaybackId: item.post.muxPlaybackId,
      thumbnailUrl: item.post.thumbnailUrl,
      autoGenData: item.post.autoGenData,
      viewCount: item.post.viewCount,
      reactionCount: item.post.reactionCount,
      commentCount: item.post.commentCount,
      createdAt: item.post.createdAt,
    },
    author: item.author,
    fundraiser: item.fundraiser,
    community: item.community,
  }));

  const {
    items,
    isLoading,
    hasMore,
    error,
    fetchMore,
    sentinelRef,
  } = useFYPFeed({
    initialItems: initialFeedItems,
    initialCursor,
    source,
    id,
  });

  // Scroll to startAtPostId on mount
  useEffect(() => {
    if (!startAtPostId || hasScrolledToStart.current) return;

    const el = document.getElementById(`fyp-card-${startAtPostId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'instant' });
      hasScrolledToStart.current = true;
    }
  }, [startAtPostId, items]);

  // Restore scroll position from sessionStorage
  useEffect(() => {
    if (startAtPostId) return; // Don't restore if we're scrolling to a specific post

    const savedPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedPosition && scrollContainerRef.current) {
      const pos = parseInt(savedPosition, 10);
      if (!Number.isNaN(pos)) {
        scrollContainerRef.current.scrollTop = pos;
      }
    }
  }, [startAtPostId]);

  // Save scroll position on unmount
  useEffect(() => {
    const container = scrollContainerRef.current;
    return () => {
      if (container) {
        sessionStorage.setItem(
          SCROLL_POSITION_KEY,
          String(container.scrollTop),
        );
      }
    };
  }, []);

  // Handle scroll to trigger prefetch
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Estimate current card index based on scroll position
    const cardHeight = container.clientHeight;
    if (cardHeight === 0) return;
    const currentIndex = Math.round(container.scrollTop / cardHeight);

    // Prefetch if within 3 items of the end
    if (items.length - currentIndex <= 3 && hasMore && !isLoading) {
      void fetchMore();
    }
  }, [items.length, hasMore, isLoading, fetchMore]);

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
          ref={scrollContainerRef}
          className="h-full w-full snap-y snap-mandatory overflow-y-scroll"
          style={{ scrollSnapType: 'y mandatory', overscrollBehaviorY: 'contain', scrollSnapStop: 'always' } as React.CSSProperties}
          onScroll={handleScroll}
        >
          {items.map((item) => (
            <div key={item.post.id} id={`fyp-card-${item.post.id}`}>
              <FYPCard
                post={item.post as ContentPostData}
                author={item.author as ContentAuthor | null}
                fundraiser={item.fundraiser as ContentFundraiser | null}
                community={item.community as ContentCommunity | null}
              />
            </div>
          ))}

          {/* Loading skeleton */}
          {isLoading && (
            <div className="flex h-[100dvh] w-full snap-start items-center justify-center bg-zinc-900">
              <div className="flex flex-col items-center gap-3">
                <div className="size-8 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
                <p className="text-sm text-zinc-400">Loading more...</p>
              </div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="flex h-[100dvh] w-full snap-start items-center justify-center bg-zinc-900">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchMore()}
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Sentinel for IntersectionObserver — placed 2-3 cards before end */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="pointer-events-none h-px w-full"
              aria-hidden="true"
              style={{
                // The sentinel is at the very end of the list; the IntersectionObserver
                // rootMargin handles triggering 2-3 cards before the user reaches it
                position: 'relative',
              }}
            />
          )}

          {/* End-of-feed indicator */}
          {!hasMore && items.length > 0 && (
            <div className="flex h-[50dvh] w-full items-center justify-center bg-zinc-900">
              <p className="text-sm text-zinc-500">
                You&apos;ve seen all the posts!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
