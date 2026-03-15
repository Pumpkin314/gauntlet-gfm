import { eq, sql, desc, count, countDistinct } from 'drizzle-orm';

import { cachedQuery } from '@/lib/cache';
import { db } from '@/lib/db';
import { timedQuery } from '@/lib/db/instrumented';
import {
  communities,
  communityMembers,
  donations,
  follows,
  fundraisers,
  users,
} from '@/lib/db/schema';

/**
 * Fetch a user by username, cached for 60 seconds.
 */
export async function getUserByUsername(username: string) {
  return cachedQuery(`user:${username}`, 60, async () => {
    const [user] = await timedQuery('user.getByUsername', () =>
      db
        .select()
        .from(users)
        .where(eq(users.username, username)),
    );

    return user ?? null;
  });
}

/**
 * Fetch fundraisers organized by this user, with optional community join.
 */
export async function getUserFundraisers(userId: string) {
  const result = await db
    .select({
      fundraiser: fundraisers,
      community: communities,
    })
    .from(fundraisers)
    .leftJoin(communities, eq(fundraisers.communityId, communities.id))
    .where(eq(fundraisers.organizerId, userId))
    .orderBy(desc(fundraisers.createdAt));

  return result;
}

/**
 * Fetch recent donations made by this user, with fundraiser join.
 */
export async function getUserDonations(userId: string, limit = 10) {
  const result = await db
    .select({
      donation: donations,
      fundraiser: fundraisers,
    })
    .from(donations)
    .innerJoin(fundraisers, eq(donations.fundraiserId, fundraisers.id))
    .where(eq(donations.donorId, userId))
    .orderBy(desc(donations.createdAt))
    .limit(limit);

  return result;
}

export interface GivingSummary {
  totalDonatedCents: number;
  causesCount: number;
  topCause: string | null;
  communitiesJoined: number;
  activeSince: Date | null;
}

/**
 * Compute a giving summary for a user:
 * - totalDonatedCents: SUM of all donations
 * - causesCount: COUNT DISTINCT fundraisers donated to
 * - topCause: most frequently donated-to category
 * - communitiesJoined: COUNT of community memberships
 * - activeSince: user's createdAt
 */
export async function getUserGivingSummary(
  userId: string,
  userCreatedAt: Date | null,
): Promise<GivingSummary> {
  // Aggregate donation stats
  const [donationStats] = await db
    .select({
      totalDonatedCents: sql<number>`coalesce(sum(${donations.amountCents}), 0)`,
      causesCount: countDistinct(donations.fundraiserId),
    })
    .from(donations)
    .where(eq(donations.donorId, userId));

  // Top cause: most frequently donated-to category
  const topCauseResult = await db
    .select({
      category: fundraisers.category,
      donationCount: count(),
    })
    .from(donations)
    .innerJoin(fundraisers, eq(donations.fundraiserId, fundraisers.id))
    .where(eq(donations.donorId, userId))
    .groupBy(fundraisers.category)
    .orderBy(desc(count()))
    .limit(1);

  // Communities joined
  const [communityStats] = await db
    .select({
      communitiesJoined: count(),
    })
    .from(communityMembers)
    .where(eq(communityMembers.userId, userId));

  return {
    totalDonatedCents: Number(donationStats?.totalDonatedCents ?? 0),
    causesCount: Number(donationStats?.causesCount ?? 0),
    topCause: topCauseResult[0]?.category ?? null,
    communitiesJoined: Number(communityStats?.communitiesJoined ?? 0),
    activeSince: userCreatedAt,
  };
}

/**
 * Get follower and following counts for a user.
 */
export async function getUserFollowCounts(userId: string) {
  const [followerResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followingId, userId));

  const [followingResult] = await db
    .select({ count: count() })
    .from(follows)
    .where(eq(follows.followerId, userId));

  return {
    followers: Number(followerResult?.count ?? 0),
    following: Number(followingResult?.count ?? 0),
  };
}

/**
 * Check if a user is following another user.
 */
export async function isUserFollowing(
  followerId: string,
  followingId: string,
): Promise<boolean> {
  const [result] = await db
    .select({ id: follows.id })
    .from(follows)
    .where(
      sql`${follows.followerId} = ${followerId} AND ${follows.followingId} = ${followingId}`,
    );

  return !!result;
}

/**
 * Get all usernames for generateStaticParams.
 */
export async function getAllUsernames() {
  const result = await db
    .select({ username: users.username })
    .from(users);

  return result.map((r) => r.username);
}
