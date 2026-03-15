import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle } from 'lucide-react';

import { getCurrentUser } from '@/lib/auth';
import {
  getAllContentPostIds,
  getContentPostById,
  getFundraiserForCard,
} from '@/lib/queries/content';
import {
  getReactionCountsForPost,
  getUserReactionForPost,
} from '@/lib/queries/reactions';

import { ContentCard } from '@/components/content-cards';
import { ReactionButton } from '@/components/reactions/reaction-button';
import { ReactionCounts } from '@/components/reactions/reaction-counts';
import { CommentList } from '@/components/comments/comment-list';
import { CommentInput } from '@/components/comments/comment-input';
import { FundraiserCard } from '@/components/shared/fundraiser-card';

export const revalidate = 60;

interface PageProps {
  params: Promise<{ postId: string }>;
}

export async function generateStaticParams() {
  return getAllContentPostIds();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { postId } = await params;
  const data = await getContentPostById(postId);

  if (!data) {
    return { title: 'Post Not Found' };
  }

  const { post, author } = data;

  const title = post.title ?? `Post by ${author?.displayName ?? 'Anonymous'}`;
  const description = post.body
    ? post.body.length > 160
      ? post.body.slice(0, 157) + '...'
      : post.body
    : `Content on GoFundMe by ${author?.displayName ?? 'Anonymous'}`;

  // Choose OG image: thumbnail > media > Mux thumbnail
  const ogImage =
    post.thumbnailUrl ??
    post.mediaUrl ??
    (post.muxPlaybackId
      ? `https://image.mux.com/${post.muxPlaybackId}/thumbnail.jpg`
      : undefined);

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };

  // For video posts: add og:video for inline social playback
  if (post.contentType === 'video' && post.muxPlaybackId) {
    metadata.openGraph = {
      ...metadata.openGraph,
      videos: [
        {
          url: `https://stream.mux.com/${post.muxPlaybackId}.m3u8`,
          type: 'application/x-mpegURL',
        },
      ],
    };
  }

  return metadata;
}

export default async function ContentPermalinkPage({ params }: PageProps) {
  const { postId } = await params;
  const data = await getContentPostById(postId);

  if (!data) {
    notFound();
  }

  const { post, author, fundraiser, community } = data;

  // Fetch auth, reactions, and fundraiser card data in parallel
  const currentUser = await getCurrentUser();
  const isAuthenticated = !!currentUser;

  const [reactionCounts, userReaction, fundraiserCardData] = await Promise.all([
    getReactionCountsForPost(postId),
    currentUser
      ? getUserReactionForPost(currentUser.id, postId)
      : Promise.resolve(null),
    fundraiser
      ? getFundraiserForCard(fundraiser.id)
      : Promise.resolve(null),
  ]);

  const totalReactions = Object.values(reactionCounts).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back
      </Link>

      {/* Content Card */}
      <div className="mt-4">
        <ContentCard
          post={post}
          author={author}
          fundraiser={fundraiser}
          community={community}
        />
      </div>

      {/* Reactions Section */}
      <div className="mt-6 flex items-center gap-4">
        <ReactionButton
          contentPostId={postId}
          currentReaction={userReaction?.reactionType ?? null}
          reactionCount={post.reactionCount ?? 0}
          isAuthenticated={isAuthenticated}
        />
        <ReactionCounts counts={reactionCounts} total={totalReactions} />
      </div>

      {/* Comments Section (expanded by default) */}
      <div className="mt-8">
        <div className="flex items-center gap-2 text-sm font-medium text-gfm-dark">
          <MessageCircle className="size-4" />
          <span>
            Comments{' '}
            {(post.commentCount ?? 0) > 0 && `(${post.commentCount})`}
          </span>
        </div>
        <div className="mt-3">
          <CommentList contentPostId={postId} />
          <CommentInput
            contentPostId={postId}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {/* Related Fundraiser */}
      {fundraiserCardData && (
        <div className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-gfm-dark">
            Related Fundraiser
          </h2>
          <FundraiserCard
            fundraiser={fundraiserCardData.fundraiser}
            organizer={fundraiserCardData.organizer}
            community={fundraiserCardData.community}
          />
        </div>
      )}
    </main>
  );
}
