'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { follows } from '@/lib/db/schema';

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
