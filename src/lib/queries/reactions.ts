import { and, eq, sql } from 'drizzle-orm';

import { db } from '@/lib/db';
import { reactions } from '@/lib/db/schema';

/**
 * Get the current user's reaction on a specific post.
 * Returns the reaction row or null if the user hasn't reacted.
 */
export async function getUserReactionForPost(
  userId: string,
  contentPostId: string,
) {
  const [reaction] = await db
    .select({
      id: reactions.id,
      reactionType: reactions.reactionType,
      microDonationCents: reactions.microDonationCents,
      createdAt: reactions.createdAt,
    })
    .from(reactions)
    .where(
      and(
        eq(reactions.userId, userId),
        eq(reactions.contentPostId, contentPostId),
      ),
    );

  return reaction ?? null;
}

/**
 * Get grouped reaction counts by type for a specific post.
 * Returns an object like { heart: 12, clap: 5, hug: 3 }
 */
export async function getReactionCountsForPost(
  contentPostId: string,
): Promise<Record<string, number>> {
  const rows = await db
    .select({
      reactionType: reactions.reactionType,
      count: sql<number>`count(*)::int`,
    })
    .from(reactions)
    .where(eq(reactions.contentPostId, contentPostId))
    .groupBy(reactions.reactionType);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.reactionType] = row.count;
  }
  return counts;
}
