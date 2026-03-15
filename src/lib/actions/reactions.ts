'use server';

import { and, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';
import { db } from '@/lib/db';
import { contentPosts, reactions, users } from '@/lib/db/schema';

const REACTION_TYPES = [
  'heart',
  'clap',
  'hug',
  'inspired',
  'pray',
  'micro_donate',
] as const;

const toggleReactionSchema = z.object({
  contentPostId: z.string().min(1),
  reactionType: z.enum(REACTION_TYPES),
  microDonationCents: z.number().int().min(1).optional(),
});

export type ToggleReactionResult =
  | { success: true; reactionType: string | null; reactionCount: number }
  | { success: false; error: string };

export async function toggleReaction(
  contentPostId: string,
  reactionType: string,
  microDonationCents?: number,
): Promise<ToggleReactionResult> {
  // 1. Validate input
  const parsed = toggleReactionSchema.safeParse({
    contentPostId,
    reactionType,
    microDonationCents,
  });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  const data = parsed.data;

  // 2. Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to react.' };
  }

  // 3. Validate micro_donate specifics
  if (data.reactionType === 'micro_donate') {
    if (!data.microDonationCents || data.microDonationCents <= 0) {
      return {
        success: false,
        error: 'Micro-donation amount must be provided and greater than 0.',
      };
    }

    // Check user balance
    const [donor] = await db
      .select({ mockBalanceCents: users.mockBalanceCents })
      .from(users)
      .where(eq(users.id, user.id));

    if (
      !donor ||
      !donor.mockBalanceCents ||
      donor.mockBalanceCents < data.microDonationCents
    ) {
      return { success: false, error: 'Insufficient balance.' };
    }
  }

  // 4. Check for existing reaction
  const [existing] = await db
    .select({
      id: reactions.id,
      reactionType: reactions.reactionType,
    })
    .from(reactions)
    .where(
      and(
        eq(reactions.userId, user.id),
        eq(reactions.contentPostId, data.contentPostId),
      ),
    );

  // 5. Perform the toggle (sequential queries — Neon HTTP driver has no transaction support)
  const result = await (async () => {
    if (existing) {
      if (existing.reactionType === data.reactionType) {
        // Same reaction type: un-react (delete)
        await db.delete(reactions).where(eq(reactions.id, existing.id));

        await db
          .update(contentPosts)
          .set({
            reactionCount: sql`GREATEST(${contentPosts.reactionCount} - 1, 0)`,
            updatedAt: new Date(),
          })
          .where(eq(contentPosts.id, data.contentPostId));

        const [post] = await db
          .select({ reactionCount: contentPosts.reactionCount })
          .from(contentPosts)
          .where(eq(contentPosts.id, data.contentPostId));

        return {
          reactionType: null as string | null,
          reactionCount: post?.reactionCount ?? 0,
        };
      } else {
        // Different reaction type: update
        // For micro_donate, deduct balance
        if (data.reactionType === 'micro_donate') {
          await db
            .update(users)
            .set({
              mockBalanceCents: sql`${users.mockBalanceCents} - ${data.microDonationCents!}`,
            })
            .where(eq(users.id, user.id));
        }

        await db
          .update(reactions)
          .set({
            reactionType: data.reactionType,
            microDonationCents:
              data.reactionType === 'micro_donate'
                ? data.microDonationCents!
                : null,
          })
          .where(eq(reactions.id, existing.id));

        const [post] = await db
          .select({ reactionCount: contentPosts.reactionCount })
          .from(contentPosts)
          .where(eq(contentPosts.id, data.contentPostId));

        return {
          reactionType: data.reactionType as string | null,
          reactionCount: post?.reactionCount ?? 0,
        };
      }
    } else {
      // No existing reaction: insert new one
      // For micro_donate, deduct balance
      if (data.reactionType === 'micro_donate') {
        await db
          .update(users)
          .set({
            mockBalanceCents: sql`${users.mockBalanceCents} - ${data.microDonationCents!}`,
          })
          .where(eq(users.id, user.id));
      }

      await db.insert(reactions).values({
        userId: user.id,
        contentPostId: data.contentPostId,
        reactionType: data.reactionType,
        microDonationCents:
          data.reactionType === 'micro_donate'
            ? data.microDonationCents!
            : null,
      });

      await db
        .update(contentPosts)
        .set({
          reactionCount: sql`${contentPosts.reactionCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(contentPosts.id, data.contentPostId));

      const [post] = await db
        .select({ reactionCount: contentPosts.reactionCount })
        .from(contentPosts)
        .where(eq(contentPosts.id, data.contentPostId));

      return {
        reactionType: data.reactionType as string | null,
        reactionCount: post?.reactionCount ?? 0,
      };
    }
  })();

  // 6. Invalidate cache
  try {
    await invalidateCache(`reactions:${data.contentPostId}:*`);
    await invalidateCache(`post:${data.contentPostId}:*`);
  } catch {
    // Cache invalidation is best-effort
  }

  return {
    success: true,
    reactionType: result.reactionType,
    reactionCount: result.reactionCount,
  };
}
