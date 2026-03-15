'use server';

import { eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { comments, contentPosts } from '@/lib/db/schema';
import { getCommentsByPostId } from '@/lib/queries/comments';

const commentSchema = z.object({
  contentPostId: z.string().min(1, 'Post ID is required.'),
  body: z
    .string()
    .min(1, 'Comment cannot be empty.')
    .max(500, 'Comment must be 500 characters or fewer.'),
});

export type CreateCommentResult =
  | { success: true; commentId: string }
  | { success: false; error: string };

export async function createComment(
  contentPostId: string,
  body: string,
): Promise<CreateCommentResult> {
  // 1. Validate input
  const parsed = commentSchema.safeParse({ contentPostId, body });
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues.map((i) => i.message).join(', '),
    };
  }

  // 2. Check authentication
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'You must be signed in to comment.' };
  }

  // 3. Check that the post exists
  const [post] = await db
    .select({ id: contentPosts.id })
    .from(contentPosts)
    .where(eq(contentPosts.id, contentPostId));

  if (!post) {
    return { success: false, error: 'Post not found.' };
  }

  // 4. Insert comment and increment comment count atomically
  const [inserted] = await db
    .insert(comments)
    .values({
      userId: user.id,
      contentPostId,
      body: parsed.data.body,
    })
    .returning({ id: comments.id });

  await db
    .update(contentPosts)
    .set({
      commentCount: sql`${contentPosts.commentCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(contentPosts.id, contentPostId));

  // 5. Revalidate the page so the new comment appears
  revalidatePath('/');

  return { success: true, commentId: inserted.id };
}

/**
 * Server action to fetch comments for a post.
 * Used by client components that cannot directly call the query.
 */
export async function fetchComments(contentPostId: string, limit?: number) {
  return getCommentsByPostId(contentPostId, limit);
}
