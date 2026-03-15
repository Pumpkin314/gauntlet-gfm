'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';
import { db } from '@/lib/db';
import { communities } from '@/lib/db/schema';

const toggleFollowSchema = z.object({
  communityId: z.string().min(1),
});

export type ToggleFollowResult =
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
): Promise<ToggleFollowResult> {
  const parsed = toggleFollowSchema.safeParse({ communityId });
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
