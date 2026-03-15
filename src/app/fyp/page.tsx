import { getCurrentUser } from '@/lib/auth';
import { rankFeed } from '@/lib/feed/rank';
import type { FeedOptions } from '@/lib/feed/types';

import type { FYPPostItem } from '@/components/fyp/fyp-shell';
import { FYPShell } from '@/components/fyp/fyp-shell';

export const revalidate = 60; // ISR: regenerate every 60 seconds

const VALID_SOURCES = new Set(['fundraiser', 'community', 'profile', 'discover']);

interface FYPPageProps {
  searchParams: Promise<{
    source?: string;
    id?: string;
    startAtPostId?: string;
  }>;
}

export default async function FYPPage({ searchParams }: FYPPageProps) {
  const params = await searchParams;

  const source = VALID_SOURCES.has(params.source ?? '')
    ? (params.source as FeedOptions['source'])
    : 'discover';
  const id = params.id;
  const startAtPostId = params.startAtPostId;

  const feedOptions: FeedOptions = {
    source,
    id,
    limit: 10,
  };

  const [feedResult, user] = await Promise.all([
    rankFeed(feedOptions),
    getCurrentUser(),
  ]);

  const initialPosts: FYPPostItem[] = feedResult.items.map((item) => ({
    post: {
      ...item.post,
      contentType: item.post.contentType as FYPPostItem['post']['contentType'],
    },
    author: item.author,
    fundraiser: item.fundraiser,
    community: item.community,
  }));

  return (
    <FYPShell
      initialPosts={initialPosts}
      initialCursor={feedResult.nextCursor}
      user={user ? { name: user.name, image: user.image } : null}
      source={source}
      id={id}
      startAtPostId={startAtPostId}
    />
  );
}
