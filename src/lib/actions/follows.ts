'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';
import { db } from '@/lib/db';
import { communities, follows } from '@/lib/db/schema';

// ---------------------------------------------------------------------------
// Community follows
// ---------------------------------------------------------------------------

const toggleFollowCommunitySchema = z.object({
  communityId: z.string().min(1),
});

export type ToggleFollowCommunityResult =
  | { success: true; followed: boolean }
  | { success: false; error: string };

/**
 * Toggle follow on a community.
 *
 * For MVP, we simply increment/decrement `communities.followerCount`.
 * A proper junction table (community_follows) can be added later to track
 * per-user follow state.
 */
export async function toggleFollowCommunity(
  communityId: string,
): Promise<ToggleFollowCommunityResult> {
  const parsed = toggleFollowCommunitySchema.safeParse({ communityId });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to follow.' };
  }

  // Check community exists
  const [community] = await db
    .select({ id: communities.id, slug: communities.slug })
    .from(communities)
    .where(eq(communities.id, communityId));

  if (!community) {
    return { success: false, error: 'Community not found.' };
  }

  // For MVP: just increment the counter (toggle = always follow for now)
  await db
    .update(communities)
    .set({
      followerCount: sql`${communities.followerCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(communities.id, communityId));

  // Invalidate cache
  try {
    await invalidateCache('community:*');
  } catch {
    // Best-effort
  }

  revalidatePath(`/communities/${community.slug}`);

  return { success: true, followed: true };
}

// ---------------------------------------------------------------------------
// User follows
// ---------------------------------------------------------------------------

/**
 * Toggle following a user. If already following, unfollow; otherwise, follow.
 */
export async function toggleFollowUser(
  targetUserId: string,
): Promise<{ followed: boolean }> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('You must be signed in to follow users.');
  }

  if (currentUser.id === targetUserId) {
    throw new Error('You cannot follow yourself.');
  }

  // Check if already following
  const [existing] = await db
    .select({ id: follows.id })
    .from(follows)
    .where(
      and(
        eq(follows.followerId, currentUser.id),
        eq(follows.followingId, targetUserId),
      ),
    );

  if (existing) {
    // Unfollow
    await db.delete(follows).where(eq(follows.id, existing.id));
    revalidatePath('/u/[username]', 'page');
    return { followed: false };
  }

  // Follow
  await db.insert(follows).values({
    followerId: currentUser.id,
    followingId: targetUserId,
  });

  revalidatePath('/u/[username]', 'page');
  return { followed: true };
}
