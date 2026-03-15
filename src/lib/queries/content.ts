import { desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  communities,
  contentPosts,
  fundraisers,
  users,
} from '@/lib/db/schema';

/**
 * Shared select shape for content feed queries.
 * Returns data matching the ContentCardProps interface from content-cards.
 */
const contentFeedSelect = {
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
 * Fetch content posts for a specific fundraiser, with author + fundraiser + community joins.
 * Ordered by createdAt descending.
 */
export async function getContentByFundraiserId(
  fundraiserId: string,
  limit = 20,
) {
  return db
    .select(contentFeedSelect)
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(fundraisers, eq(contentPosts.fundraiserId, fundraisers.id))
    .leftJoin(communities, eq(contentPosts.communityId, communities.id))
    .where(eq(contentPosts.fundraiserId, fundraiserId))
    .orderBy(desc(contentPosts.createdAt))
    .limit(limit);
}

/**
 * Fetch content posts for a community, with author + fundraiser + community joins.
 * Ordered by createdAt descending.
 */
export async function getContentByCommunityId(
  communityId: string,
  limit = 20,
) {
  return db
    .select(contentFeedSelect)
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(fundraisers, eq(contentPosts.fundraiserId, fundraisers.id))
    .leftJoin(communities, eq(contentPosts.communityId, communities.id))
    .where(eq(contentPosts.communityId, communityId))
    .orderBy(desc(contentPosts.createdAt))
    .limit(limit);
}

/**
 * Fetch content posts by a specific user, with fundraiser + community joins.
 * Ordered by createdAt descending.
 */
export async function getContentByAuthorId(authorId: string, limit = 20) {
  return db
    .select(contentFeedSelect)
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(fundraisers, eq(contentPosts.fundraiserId, fundraisers.id))
    .leftJoin(communities, eq(contentPosts.communityId, communities.id))
    .where(eq(contentPosts.authorId, authorId))
    .orderBy(desc(contentPosts.createdAt))
    .limit(limit);
}

/**
 * Fetch a single content post by ID with full joins: author, fundraiser, community.
 * Returns null if not found.
 */
export async function getContentPostById(postId: string) {
  const [row] = await db
    .select(contentFeedSelect)
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(fundraisers, eq(contentPosts.fundraiserId, fundraisers.id))
    .leftJoin(communities, eq(contentPosts.communityId, communities.id))
    .where(eq(contentPosts.id, postId));

  return row ?? null;
}

/**
 * Fetch a fundraiser with organizer + community joins for the FundraiserCard component.
 * Returns null if not found.
 */
export async function getFundraiserForCard(fundraiserId: string) {
  const [row] = await db
    .select({
      fundraiser: {
        slug: fundraisers.slug,
        title: fundraisers.title,
        heroImageUrl: fundraisers.heroImageUrl,
        raisedCents: fundraisers.raisedCents,
        goalCents: fundraisers.goalCents,
        donationCount: fundraisers.donationCount,
      },
      organizer: {
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        image: users.image,
      },
      community: {
        slug: communities.slug,
        name: communities.name,
        logoUrl: communities.logoUrl,
      },
    })
    .from(fundraisers)
    .leftJoin(users, eq(fundraisers.organizerId, users.id))
    .leftJoin(communities, eq(fundraisers.communityId, communities.id))
    .where(eq(fundraisers.id, fundraiserId));

  return row ?? null;
}

/**
 * Get all published content post IDs — used by generateStaticParams.
 */
export async function getAllContentPostIds(): Promise<{ postId: string }[]> {
  const rows = await db
    .select({ id: contentPosts.id })
    .from(contentPosts)
    .where(eq(contentPosts.status, 'published'));

  return rows.map((row) => ({ postId: row.id }));
}
