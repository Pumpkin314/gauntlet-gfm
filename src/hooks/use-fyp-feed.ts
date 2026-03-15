'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

import type { FeedItem, FeedResponse } from '@/lib/feed/types';

interface UseFYPFeedOptions {
  initialItems: FeedItem[];
  initialCursor: string | null;
  source?: string;
  id?: string;
}

const PREFETCH_THRESHOLD = 3;

export function useFYPFeed({
  initialItems,
  initialCursor,
  source = 'discover',
  id,
}: UseFYPFeedOptions) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialCursor !== null);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isFetchingRef = useRef(false);
  const seenIdsRef = useRef<Set<string>>(
    new Set(initialItems.map((item) => item.post.id)),
  );

  // Reset when initial data changes (e.g. route change)
  useEffect(() => {
    setItems(initialItems);
    setCursor(initialCursor);
    setHasMore(initialCursor !== null);
    setError(null);
    seenIdsRef.current = new Set(initialItems.map((item) => item.post.id));
  }, [initialItems, initialCursor]);

  const fetchMore = useCallback(async () => {
    if (isFetchingRef.current || !cursor) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ source, limit: '10' });
      if (id) params.set('id', id);
      if (cursor) params.set('cursor', cursor);

      const response = await fetch(`/api/feed?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Feed fetch failed: ${response.status}`);
      }

      const data: FeedResponse = await response.json();

      // Deduplicate items
      const newItems = data.items.filter(
        (item) => !seenIdsRef.current.has(item.post.id),
      );

      for (const item of newItems) {
        seenIdsRef.current.add(item.post.id);
      }

      setItems((prev) => [...prev, ...newItems]);
      setCursor(data.nextCursor);
      setHasMore(data.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more posts');
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [cursor, source, id]);

  // IntersectionObserver on sentinel element
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasMore && !isFetchingRef.current) {
          void fetchMore();
        }
      },
      { rootMargin: '200px' },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchMore, hasMore]);

  // Prefetch when within PREFETCH_THRESHOLD of the end
  const checkPrefetch = useCallback(
    (currentIndex: number) => {
      if (
        items.length - currentIndex <= PREFETCH_THRESHOLD &&
        hasMore &&
        !isFetchingRef.current
      ) {
        void fetchMore();
      }
    },
    [items.length, hasMore, fetchMore],
  );

  return {
    items,
    isLoading,
    hasMore,
    error,
    fetchMore,
    sentinelRef,
    checkPrefetch,
  };
}
