import { desc, eq } from 'drizzle-orm';

import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { timedQuery } from '@/lib/db/instrumented';
import {
  communities,
  communityMembers,
  contentPosts,
  fundraisers,
  users,
} from '@/lib/db/schema';

/**
 * Fetch a community by slug with Redis caching (60s TTL).
 */
export async function getCommunityBySlug(slug: string) {
  return cachedQuery(`community:${slug}`, 60, async () => {
    const [result] = await timedQuery('community.getBySlug', () =>
      db
        .select()
        .from(communities)
        .where(eq(communities.slug, slug)),
    );

    return result ?? null;
  });
}

/**
 * Fetch all fundraisers for a community, with organizer info joined.
 */
export async function getCommunityFundraisers(communityId: string) {
  return db
    .select({
      fundraiser: fundraisers,
      organizer: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        image: users.image,
      },
    })
    .from(fundraisers)
    .leftJoin(users, eq(fundraisers.organizerId, users.id))
    .where(eq(fundraisers.communityId, communityId))
    .orderBy(desc(fundraisers.createdAt));
}

/**
 * Top fundraisers by raisedCents, for the leaderboard sidebar.
 */
export async function getCommunityLeaderboard(
  communityId: string,
  limit = 10,
) {
  return db
    .select({
      fundraiser: {
        id: fundraisers.id,
        slug: fundraisers.slug,
        title: fundraisers.title,
        raisedCents: fundraisers.raisedCents,
        goalCents: fundraisers.goalCents,
      },
      organizer: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        image: users.image,
      },
    })
    .from(fundraisers)
    .leftJoin(users, eq(fundraisers.organizerId, users.id))
    .where(eq(fundraisers.communityId, communityId))
    .orderBy(desc(fundraisers.raisedCents))
    .limit(limit);
}

/**
 * Fetch community members with user info, for the avatar stack.
 */
export async function getCommunityMembers(communityId: string, limit = 5) {
  return db
    .select({
      member: communityMembers,
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        image: users.image,
      },
    })
    .from(communityMembers)
    .leftJoin(users, eq(communityMembers.userId, users.id))
    .where(eq(communityMembers.communityId, communityId))
    .limit(limit);
}

/**
 * Fetch content posts for a community, with author info.
 */
export async function getCommunityPosts(communityId: string) {
  return db
    .select({
      post: contentPosts,
      author: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        image: users.image,
      },
    })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .where(eq(contentPosts.communityId, communityId))
    .orderBy(desc(contentPosts.createdAt));
}

/**
 * All community slugs, for generateStaticParams.
 */
export async function getAllCommunitySlugs() {
  const result = await db
    .select({ slug: communities.slug })
    .from(communities);

  return result.map((r) => r.slug);
}
