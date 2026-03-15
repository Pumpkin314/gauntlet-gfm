import { desc, eq, lt, sql, and, not } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  communities,
  contentPosts,
  fundraisers,
  users,
} from '@/lib/db/schema';
import type { FeedItem, FeedOptions, FeedResponse } from './types';

/**
 * Shared select shape for feed queries — mirrors contentFeedSelect in queries/content.ts
 */
const feedSelect = {
  post: {
    id: contentPosts.id,
    contentType: contentPosts.contentType,
    title: contentPosts.title,
    body: contentPosts.body,
    mediaUrl: contentPosts.mediaUrl,
    muxPlaybackId: contentPosts.muxPlaybackId,
    thumbnailUrl: contentPosts.thumbnailUrl,
    autoGenData: contentPosts.autoGenData,
    viewCount: contentPosts.viewCount,
    reactionCount: contentPosts.reactionCount,
    commentCount: contentPosts.commentCount,
    createdAt: contentPosts.createdAt,
  },
  author: {
    id: users.id,
    username: users.username,
    displayName: users.displayName,
    avatarUrl: users.avatarUrl,
    image: users.image,
  },
  fundraiser: {
    id: fundraisers.id,
    slug: fundraisers.slug,
    title: fundraisers.title,
  },
  community: {
    id: communities.id,
    slug: communities.slug,
    name: communities.name,
    logoUrl: communities.logoUrl,
  },
} as const;

/**
 * Base query builder with standard joins.
 */
function baseFeedQuery() {
  return db
    .select(feedSelect)
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(fundraisers, eq(contentPosts.fundraiserId, fundraisers.id))
    .leftJoin(communities, eq(contentPosts.communityId, communities.id));
}

/**
 * Interleave feed items so no two adjacent items share the same contentType (best effort).
 * Auto-generated cards (those with non-null autoGenData) target ~40% of the feed;
 * creator content targets ~60%. The interleave also prevents consecutive same-type items.
 */
function interleaveItems(items: FeedItem[]): FeedItem[] {
  if (items.length <= 1) return items;

  const autoGen = items.filter((i) => i.post.autoGenData != null);
  const creator = items.filter((i) => i.post.autoGenData == null);

  // Merge the two buckets, interleaving by content type
  const result: FeedItem[] = [];
  let ai = 0;
  let ci = 0;

  // Target ratio: ~60% creator, ~40% auto-gen
  // We alternate, biasing toward creator content
  while (ai < autoGen.length || ci < creator.length) {
    // Pick up to 3 creator items, then 2 auto-gen — approximates 60/40
    for (let k = 0; k < 3 && ci < creator.length; k++) {
      result.push(creator[ci++]);
    }
    for (let k = 0; k < 2 && ai < autoGen.length; k++) {
      result.push(autoGen[ai++]);
    }
  }

  // Final pass: swap adjacent items with the same contentType (best effort, single pass)
  for (let i = 1; i < result.length; i++) {
    if (result[i].post.contentType === result[i - 1].post.contentType) {
      // Look ahead for a different type to swap with
      for (let j = i + 1; j < result.length; j++) {
        if (result[j].post.contentType !== result[i - 1].post.contentType) {
          [result[i], result[j]] = [result[j], result[i]];
          break;
        }
      }
    }
  }

  return result;
}

/**
 * Rank and return feed items based on the given options.
 *
 * Ranking tiers (in priority order):
 *   1. Seed context items (e.g. if source=fundraiser, that fundraiser's posts)
 *   2. Same category/community items
 *   3. Trending items (highest reaction_count in last 7 days)
 *   4. Chronological fill
 *
 * After fetching, items are interleaved for content-type diversity.
 */
export async function rankFeed(options: FeedOptions): Promise<FeedResponse> {
  const { source, id, cursor, limit } = options;

  // We'll fetch more than `limit` to allow for interleaving, then trim
  const fetchLimit = limit + 1; // +1 for nextCursor detection

  const cursorCondition = cursor
    ? lt(contentPosts.createdAt, new Date(cursor))
    : undefined;

  const publishedCondition = eq(contentPosts.status, 'published');

  let items: FeedItem[];

  switch (source) {
    case 'fundraiser': {
      items = await fetchFundraiserFeed(id, cursorCondition, publishedCondition, fetchLimit);
      break;
    }
    case 'community': {
      items = await fetchCommunityFeed(id, cursorCondition, publishedCondition, fetchLimit);
      break;
    }
    case 'profile': {
      items = await fetchProfileFeed(id, cursorCondition, publishedCondition, fetchLimit);
      break;
    }
    case 'discover':
    default: {
      items = await fetchDiscoverFeed(cursorCondition, publishedCondition, fetchLimit);
      break;
    }
  }

  // Determine pagination cursor
  let nextCursor: string | null = null;
  if (items.length > limit) {
    items = items.slice(0, limit);
    const lastItem = items[items.length - 1];
    nextCursor = lastItem.post.createdAt
      ? lastItem.post.createdAt.toISOString()
      : null;
  }

  // Interleave for content-type diversity
  items = interleaveItems(items);

  return { items, nextCursor };
}

/**
 * Fundraiser feed: seed fundraiser's posts first, then same community, then trending fill.
 */
async function fetchFundraiserFeed(
  fundraiserId: string | undefined,
  cursorCondition: ReturnType<typeof lt> | undefined,
  publishedCondition: ReturnType<typeof eq>,
  fetchLimit: number,
): Promise<FeedItem[]> {
  if (!fundraiserId) {
    return fetchDiscoverFeed(cursorCondition, publishedCondition, fetchLimit);
  }

  const conditions = [publishedCondition, ...(cursorCondition ? [cursorCondition] : [])];

  // Tier 1: seed fundraiser's posts
  const seedItems = await baseFeedQuery()
    .where(and(...conditions, eq(contentPosts.fundraiserId, fundraiserId)))
    .orderBy(desc(contentPosts.createdAt))
    .limit(fetchLimit);

  if (seedItems.length >= fetchLimit) return seedItems;

  // Get the fundraiser's communityId for tier 2
  const [fr] = await db
    .select({ communityId: fundraisers.communityId })
    .from(fundraisers)
    .where(eq(fundraisers.id, fundraiserId));

  const seedIds = new Set(seedItems.map((i) => i.post.id));
  const remaining = fetchLimit - seedItems.length;

  // Tier 2: same community
  let communityItems: FeedItem[] = [];
  if (fr?.communityId) {
    communityItems = await baseFeedQuery()
      .where(
        and(
          ...conditions,
          eq(contentPosts.communityId, fr.communityId),
          not(eq(contentPosts.fundraiserId, fundraiserId)),
        ),
      )
      .orderBy(desc(contentPosts.reactionCount), desc(contentPosts.createdAt))
      .limit(remaining);

    communityItems = communityItems.filter((i) => !seedIds.has(i.post.id));
  }

  const allSoFar = [...seedItems, ...communityItems];
  if (allSoFar.length >= fetchLimit) return allSoFar.slice(0, fetchLimit);

  // Tier 3 + 4: trending / chronological fill
  const usedIds = new Set(allSoFar.map((i) => i.post.id));
  const fillItems = await fetchTrendingFill(conditions, fetchLimit - allSoFar.length);

  return [...allSoFar, ...fillItems.filter((i) => !usedIds.has(i.post.id))].slice(0, fetchLimit);
}

/**
 * Community feed: seed community's posts first, then trending fill.
 */
async function fetchCommunityFeed(
  communityId: string | undefined,
  cursorCondition: ReturnType<typeof lt> | undefined,
  publishedCondition: ReturnType<typeof eq>,
  fetchLimit: number,
): Promise<FeedItem[]> {
  if (!communityId) {
    return fetchDiscoverFeed(cursorCondition, publishedCondition, fetchLimit);
  }

  const conditions = [publishedCondition, ...(cursorCondition ? [cursorCondition] : [])];

  // Tier 1: community's own posts
  const seedItems = await baseFeedQuery()
    .where(and(...conditions, eq(contentPosts.communityId, communityId)))
    .orderBy(desc(contentPosts.createdAt))
    .limit(fetchLimit);

  if (seedItems.length >= fetchLimit) return seedItems;

  // Tier 3 + 4: fill with trending/chronological
  const usedIds = new Set(seedItems.map((i) => i.post.id));
  const fillItems = await fetchTrendingFill(conditions, fetchLimit - seedItems.length);

  return [...seedItems, ...fillItems.filter((i) => !usedIds.has(i.post.id))].slice(0, fetchLimit);
}

/**
 * Profile feed: user's posts first, then trending fill.
 */
async function fetchProfileFeed(
  userId: string | undefined,
  cursorCondition: ReturnType<typeof lt> | undefined,
  publishedCondition: ReturnType<typeof eq>,
  fetchLimit: number,
): Promise<FeedItem[]> {
  if (!userId) {
    return fetchDiscoverFeed(cursorCondition, publishedCondition, fetchLimit);
  }

  const conditions = [publishedCondition, ...(cursorCondition ? [cursorCondition] : [])];

  // Tier 1: user's own posts
  const seedItems = await baseFeedQuery()
    .where(and(...conditions, eq(contentPosts.authorId, userId)))
    .orderBy(desc(contentPosts.createdAt))
    .limit(fetchLimit);

  if (seedItems.length >= fetchLimit) return seedItems;

  // Fill with trending/chronological
  const usedIds = new Set(seedItems.map((i) => i.post.id));
  const fillItems = await fetchTrendingFill(conditions, fetchLimit - seedItems.length);

  return [...seedItems, ...fillItems.filter((i) => !usedIds.has(i.post.id))].slice(0, fetchLimit);
}

/**
 * Discover feed: no seed context — trending + chronological.
 */
async function fetchDiscoverFeed(
  cursorCondition: ReturnType<typeof lt> | undefined,
  publishedCondition: ReturnType<typeof eq>,
  fetchLimit: number,
): Promise<FeedItem[]> {
  const conditions = [publishedCondition, ...(cursorCondition ? [cursorCondition] : [])];

  // Mix trending (last 7 days) with chronological
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const trendingItems = await baseFeedQuery()
    .where(
      and(
        ...conditions,
        sql`${contentPosts.createdAt} >= ${sevenDaysAgo}`,
      ),
    )
    .orderBy(desc(contentPosts.reactionCount), desc(contentPosts.createdAt))
    .limit(fetchLimit);

  if (trendingItems.length >= fetchLimit) return trendingItems;

  // Fill remaining with chronological
  const usedIds = new Set(trendingItems.map((i) => i.post.id));
  const chronoItems = await baseFeedQuery()
    .where(and(...conditions))
    .orderBy(desc(contentPosts.createdAt))
    .limit(fetchLimit);

  return [
    ...trendingItems,
    ...chronoItems.filter((i) => !usedIds.has(i.post.id)),
  ].slice(0, fetchLimit);
}

/**
 * Fetch trending items from the last 7 days, ordered by reaction count.
 * Used as fill content in seeded feeds.
 */
async function fetchTrendingFill(
  baseConditions: ReturnType<typeof eq>[],
  limit: number,
): Promise<FeedItem[]> {
  if (limit <= 0) return [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return baseFeedQuery()
    .where(
      and(
        ...baseConditions,
        sql`${contentPosts.createdAt} >= ${sevenDaysAgo}`,
      ),
    )
    .orderBy(desc(contentPosts.reactionCount), desc(contentPosts.createdAt))
    .limit(limit);
}
