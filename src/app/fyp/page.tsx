import { desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import {
  contentPosts,
  users,
  fundraisers,
  communities,
} from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';

import type { FYPPostItem } from '@/components/fyp/fyp-shell';
import { FYPShell } from '@/components/fyp/fyp-shell';

export const revalidate = 60; // ISR: regenerate every 60 seconds

async function getInitialPosts(): Promise<FYPPostItem[]> {
  const rows = await db
    .select({
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
    })
    .from(contentPosts)
    .leftJoin(users, eq(contentPosts.authorId, users.id))
    .leftJoin(fundraisers, eq(contentPosts.fundraiserId, fundraisers.id))
    .leftJoin(communities, eq(contentPosts.communityId, communities.id))
    .where(eq(contentPosts.status, 'published'))
    .orderBy(desc(contentPosts.createdAt))
    .limit(10);

  return rows.map((row) => ({
    post: row.post,
    author: row.author,
    fundraiser: row.fundraiser,
    community: row.community,
  }));
}

export default async function FYPPage() {
  const [posts, user] = await Promise.all([
    getInitialPosts(),
    getCurrentUser(),
  ]);

  return (
    <FYPShell
      initialPosts={posts}
      user={user ? { name: user.name, image: user.image } : null}
    />
  );
}
