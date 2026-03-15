'use client';

import MuxPlayer from '@mux/mux-player-react';
import Image from 'next/image';
import Link from 'next/link';

import type {
  ContentPostData,
  ContentAuthor,
  ContentFundraiser,
  ContentCommunity,
} from '@/components/content-cards/types';
import { FYPActionButtons } from './fyp-action-buttons';

interface FYPCardProps {
  post: ContentPostData;
  author: ContentAuthor | null;
  fundraiser: ContentFundraiser | null;
  community: ContentCommunity | null;
}

/**
 * Renders the media content based on content type, filling the full viewport.
 */
function FYPMedia({ post }: { post: ContentPostData }) {
  switch (post.contentType) {
    case 'video': {
      if (!post.muxPlaybackId) {
        return (
          <FYPImageFallback
            src={post.thumbnailUrl}
            alt={post.title ?? 'Video thumbnail'}
          />
        );
      }

      const posterUrl =
        post.thumbnailUrl ??
        `https://image.mux.com/${post.muxPlaybackId}/thumbnail.jpg`;

      return (
        <div className="absolute inset-0">
          <MuxPlayer
            playbackId={post.muxPlaybackId}
            metadata={{ video_title: post.title ?? undefined }}
            streamType="on-demand"
            thumbnailTime={0}
            poster={posterUrl}
            muted
            style={
              {
                width: '100%',
                height: '100%',
                '--media-object-fit': 'cover',
              } as Record<string, string>
            }
          />
        </div>
      );
    }

    case 'image_story': {
      const src = post.mediaUrl ?? post.thumbnailUrl;
      return (
        <FYPImageFallback src={src} alt={post.title ?? 'Story image'} />
      );
    }

    default: {
      // Text-based content types: milestone, community_pulse, donor_spotlight,
      // challenge, text_update
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-800 px-8">
          {post.title && (
            <h2 className="mb-4 text-center text-2xl font-bold text-white">
              {post.title}
            </h2>
          )}
          {post.body && (
            <p className="max-w-md text-center text-base leading-relaxed text-zinc-300 line-clamp-8">
              {post.body}
            </p>
          )}
        </div>
      );
    }
  }
}

function FYPImageFallback({
  src,
  alt,
}: {
  src: string | null;
  alt: string;
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-zinc-500">
        No media available
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(min-width: 768px) 480px, 100vw"
        priority
      />
      {/* Dim overlay for readability of overlaid text */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}

/**
 * Bottom overlay with author info, post description, and fundraiser/community badges.
 */
function FYPBottomOverlay({
  post,
  author,
  fundraiser,
  community,
}: FYPCardProps) {
  return (
    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-8 pt-20 sm:pb-6" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }}>
      {/* Author line */}
      {author && (
        <Link
          href={`/u/${author.username}`}
          className="mb-1 flex items-center gap-2"
        >
          {(author.avatarUrl ?? author.image) && (
            <Image
              src={(author.avatarUrl ?? author.image)!}
              alt={author.displayName}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          )}
          <span className="text-sm font-semibold text-white">
            {author.displayName}
          </span>
        </Link>
      )}

      {/* Post description */}
      {post.body && (
        <p className="mb-2 text-sm leading-snug text-white/90 line-clamp-2">
          {post.body}
        </p>
      )}

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-2 pr-14 sm:pr-16">
        {fundraiser && (
          <Link
            href={`/f/${fundraiser.slug}`}
            className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
          >
            {fundraiser.title}
          </Link>
        )}
        {community && (
          <Link
            href={`/communities/${community.slug}`}
            className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
          >
            {community.logoUrl && (
              <Image
                src={community.logoUrl}
                alt={community.name}
                width={14}
                height={14}
                className="rounded-full"
              />
            )}
            {community.name}
          </Link>
        )}
      </div>
    </div>
  );
}

/**
 * Full-viewport FYP card. Each card occupies 100dvh and snaps into place.
 */
export function FYPCard({ post, author, fundraiser, community }: FYPCardProps) {
  return (
    <div
      className="relative h-[100dvh] w-full snap-start"
      style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}
    >
      {/* Background media */}
      <FYPMedia post={post} />

      {/* Right-rail action buttons */}
      <div className="absolute bottom-32 right-2 z-20 sm:bottom-28 sm:right-3">
        <FYPActionButtons
          postId={post.id}
          fundraiserId={fundraiser?.id ?? null}
          fundraiserSlug={fundraiser?.slug ?? null}
          fundraiserTitle={fundraiser?.title ?? null}
          reactionCount={post.reactionCount ?? 0}
          commentCount={post.commentCount ?? 0}
        />
      </div>

      {/* Bottom overlay */}
      <FYPBottomOverlay
        post={post}
        author={author}
        fundraiser={fundraiser}
        community={community}
      />
    </div>
  );
}
