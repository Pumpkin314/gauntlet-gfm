import { NextRequest, NextResponse } from 'next/server';

import { cachedQuery } from '@/lib/cache';
import { getServerTimingHeader } from '@/lib/db/instrumented';
import { rankFeed } from '@/lib/feed/rank';
import type { FeedOptions, FeedResponse } from '@/lib/feed/types';

const VALID_SOURCES = new Set(['fundraiser', 'community', 'profile', 'discover']);
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 20;
const CACHE_TTL_SECONDS = 30;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Parse and validate query parameters
  const source = searchParams.get('source') ?? 'discover';
  if (!VALID_SOURCES.has(source)) {
    return NextResponse.json(
      { error: `Invalid source. Must be one of: ${[...VALID_SOURCES].join(', ')}` },
      { status: 400 },
    );
  }

  const id = searchParams.get('id') ?? undefined;
  const cursor = searchParams.get('cursor') ?? undefined;

  // Validate cursor is a valid ISO date string if provided
  if (cursor) {
    const parsed = Date.parse(cursor);
    if (Number.isNaN(parsed)) {
      return NextResponse.json(
        { error: 'Invalid cursor. Must be an ISO 8601 datetime string.' },
        { status: 400 },
      );
    }
  }

  let limit = DEFAULT_LIMIT;
  const limitParam = searchParams.get('limit');
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be a positive integer.' },
        { status: 400 },
      );
    }
    limit = Math.min(parsed, MAX_LIMIT);
  }

  const feedOptions: FeedOptions = {
    source: source as FeedOptions['source'],
    id,
    cursor,
    limit,
  };

  // Only cache the first page (no cursor) of popular seed queries
  const isFirstPage = !cursor;
  const cacheKey = `feed:${source}:${id ?? 'all'}:page1`;

  let result: FeedResponse;

  if (isFirstPage) {
    result = await cachedQuery(cacheKey, CACHE_TTL_SECONDS, () =>
      rankFeed(feedOptions),
    );
  } else {
    result = await rankFeed(feedOptions);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cache-Control': isFirstPage
      ? 'public, s-maxage=30, stale-while-revalidate=60'
      : 'public, s-maxage=10, stale-while-revalidate=30',
  };

  const serverTiming = getServerTimingHeader();
  if (serverTiming) {
    headers['Server-Timing'] = serverTiming;
  }

  return NextResponse.json(result, { headers });
}
