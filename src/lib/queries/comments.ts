import { desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { comments, donations, users } from '@/lib/db/schema';

export async function getCommentsByPostId(
  contentPostId: string,
  limit = 50,
) {
  return db
    .select({
      comment: {
        id: comments.id,
        body: comments.body,
        upvotes: comments.upvotes,
        downvotes: comments.downvotes,
        createdAt: comments.createdAt,
        donationId: comments.donationId,
      },
      user: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        avatarUrl: users.avatarUrl,
        image: users.image,
      },
      donation: {
        amountCents: donations.amountCents,
      },
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .leftJoin(donations, eq(comments.donationId, donations.id))
    .where(eq(comments.contentPostId, contentPostId))
    .orderBy(desc(comments.createdAt))
    .limit(limit);
}

export type CommentWithUser = Awaited<
  ReturnType<typeof getCommentsByPostId>
>[number];
