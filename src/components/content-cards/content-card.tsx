import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { UserAvatarLink } from '@/components/shared/user-avatar-link';
import { CommunityBadgeLink } from '@/components/shared/community-badge-link';
import { formatRelativeDate } from '@/lib/format';

import { ActionBar } from './action-bar';
import { ChallengeCard } from './challenge-card';
import { CommunityPulseCard } from './community-pulse-card';
import { DonorSpotlightCard } from './donor-spotlight-card';
import { ImageStoryCard } from './image-story-card';
import { MilestoneCard } from './milestone-card';
import { TextUpdateCard } from './text-update-card';
import { VideoCard } from './video-card';
import type { ContentCardProps } from './types';

const CONTENT_TYPE_LABELS: Record<string, string> = {
  video: 'Video',
  image_story: 'Story',
  milestone: 'Milestone',
  community_pulse: 'Community Pulse',
  donor_spotlight: 'Donor Spotlight',
  challenge: 'Challenge',
  text_update: 'Update',
};

function renderInnerContent(props: ContentCardProps) {
  const { post } = props;

  switch (post.contentType) {
    case 'video':
      return (
        <div className="px-4">
          {post.title && (
            <h3 className="mb-2 text-lg font-semibold text-gfm-dark">
              {post.title}
            </h3>
          )}
          <VideoCard
            playbackId={post.muxPlaybackId}
            title={post.title}
            thumbnailUrl={post.thumbnailUrl}
          />
          {post.body && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {post.body}
            </p>
          )}
        </div>
      );

    case 'image_story':
      return (
        <div className="px-4">
          <ImageStoryCard
            mediaUrl={post.mediaUrl}
            thumbnailUrl={post.thumbnailUrl}
            title={post.title}
          />
          {post.body && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
              {post.body}
            </p>
          )}
        </div>
      );

    case 'milestone':
      return (
        <MilestoneCard
          autoGenData={post.autoGenData}
          title={post.title}
          body={post.body}
        />
      );

    case 'community_pulse':
      return (
        <CommunityPulseCard
          autoGenData={post.autoGenData}
          title={post.title}
          body={post.body}
        />
      );

    case 'donor_spotlight':
      return (
        <DonorSpotlightCard
          autoGenData={post.autoGenData}
          title={post.title}
          body={post.body}
        />
      );

    case 'challenge':
      return <ChallengeCard title={post.title} body={post.body} />;

    case 'text_update':
      return (
        <TextUpdateCard
          title={post.title}
          body={post.body}
          mediaUrl={post.mediaUrl}
        />
      );

    default:
      return (
        <div className="px-4">
          <p className="text-sm text-muted-foreground">
            Unsupported content type
          </p>
        </div>
      );
  }
}

export function ContentCard({
  post,
  author,
  fundraiser,
  community,
}: ContentCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Top row: author info + timestamp + content type badge */}
      <div className="flex items-center gap-3 px-4">
        {/* Author avatar + name */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {author && (
            <UserAvatarLink
              username={author.username}
              displayName={author.displayName}
              avatarUrl={author.avatarUrl}
              image={author.image}
              size="sm"
              showName
            />
          )}

          {/* Fundraiser context */}
          {fundraiser && (
            <span className="truncate text-xs text-muted-foreground">
              &middot;{' '}
              <Link
                href={`/fundraiser/${fundraiser.slug}`}
                className="hover:underline"
              >
                {fundraiser.title}
              </Link>
            </span>
          )}
        </div>

        {/* Right side: community badge, content type badge, timestamp */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {community && (
            <CommunityBadgeLink
              slug={community.slug}
              name={community.name}
              logoUrl={community.logoUrl}
            />
          )}
          <Badge variant="secondary" className="text-[10px]">
            {CONTENT_TYPE_LABELS[post.contentType] ?? post.contentType}
          </Badge>
          {post.createdAt && (
            <span className="whitespace-nowrap text-xs text-muted-foreground">
              {formatRelativeDate(post.createdAt)}
            </span>
          )}
        </div>
      </div>

      {/* Inner content: delegated to type-specific component */}
      {renderInnerContent({ post, author, fundraiser, community })}

      {/* Bottom row: action bar */}
      <ActionBar
        reactionCount={post.reactionCount}
        commentCount={post.commentCount}
        viewCount={post.viewCount}
      />
    </Card>
  );
}
