'use client';

import Link from 'next/link';
import { usePathname,useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRelativeDate } from '@/lib/format';

import { FundraiserCard } from '@/components/shared/fundraiser-card';
import { Leaderboard } from './leaderboard';

// ---------- Types ----------

interface Fundraiser {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  heroImageUrl: string | null;
  raisedCents: number | null;
  goalCents: number;
  donationCount: number | null;
  status: 'active' | 'completed' | 'paused' | null;
  createdAt: Date | null;
}

interface Organizer {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  image: string | null;
}

interface Post {
  id: string;
  contentType: string;
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  viewCount: number | null;
  reactionCount: number | null;
  commentCount: number | null;
  createdAt: Date | null;
}

interface Member {
  id: string;
  role: 'admin' | 'member' | null;
  joinedAt: Date | null;
}

interface CommunityTabsProps {
  fundraisers: Array<{ fundraiser: Fundraiser; organizer: Organizer | null }>;
  leaderboard: Array<{
    fundraiser: {
      id: string;
      slug: string;
      title: string;
      raisedCents: number | null;
      goalCents: number;
    };
    organizer: Organizer | null;
  }>;
  posts: Array<{ post: Post; author: Organizer | null }>;
  members: Array<{ member: Member; user: Organizer | null }>;
  communityDescription: string | null;
}

type TabValue = 'activity' | 'fundraisers' | 'about';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// ---------- Content type display ----------

function contentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    video: 'Video',
    image_story: 'Story',
    milestone: 'Milestone',
    community_pulse: 'Pulse',
    donor_spotlight: 'Spotlight',
    challenge: 'Challenge',
    text_update: 'Update',
  };
  return map[type] ?? 'Post';
}

export function CommunityTabs({
  fundraisers,
  leaderboard,
  posts,
  members,
  communityDescription,
}: CommunityTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentTab = (searchParams.get('tab') as TabValue) || 'activity';

  const setTab = useCallback(
    (tab: TabValue) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'activity') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [searchParams, router, pathname],
  );

  const tabs: { value: TabValue; label: string }[] = [
    { value: 'activity', label: 'Activity' },
    { value: 'fundraisers', label: `Fundraisers (${fundraisers.length})` },
    { value: 'about', label: 'About' },
  ];

  return (
    <div>
      {/* Tab triggers */}
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTab(tab.value)}
            className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
              currentTab === tab.value
                ? 'text-gfm-dark'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
            {currentTab === tab.value && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gfm-green" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {currentTab === 'activity' && (
          <ActivityTab posts={posts} leaderboard={leaderboard} />
        )}
        {currentTab === 'fundraisers' && (
          <FundraisersTab
            fundraisers={fundraisers}
            leaderboard={leaderboard}
          />
        )}
        {currentTab === 'about' && (
          <AboutTab
            description={communityDescription}
            members={members}
          />
        )}
      </div>
    </div>
  );
}

// ---------- Activity Tab ----------

function ActivityTab({
  posts,
  leaderboard,
}: {
  posts: Array<{ post: Post; author: Organizer | null }>;
  leaderboard: CommunityTabsProps['leaderboard'];
}) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
      <div>
        {posts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No activity yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map(({ post, author }) => (
              <PostCard key={post.id} post={post} author={author} />
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard sidebar (desktop) */}
      <aside className="hidden lg:block">
        <Leaderboard entries={leaderboard} />
      </aside>
    </div>
  );
}

// ---------- Post Card ----------

function PostCard({
  post,
  author,
}: {
  post: Post;
  author: Organizer | null;
}) {
  const avatarSrc = author?.avatarUrl ?? author?.image;

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      {/* Author + date */}
      <div className="flex items-center gap-2">
        {author && (
          <Link href={`/u/${author.username}`}>
            <Avatar size="sm">
              {avatarSrc && (
                <AvatarImage src={avatarSrc} alt={author.displayName} />
              )}
              <AvatarFallback>
                {getInitials(author.displayName)}
              </AvatarFallback>
            </Avatar>
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {author && (
            <Link
              href={`/u/${author.username}`}
              className="text-xs font-medium text-gfm-dark hover:underline"
            >
              {author.displayName}
            </Link>
          )}
          <div className="flex items-center gap-2">
            {post.createdAt && (
              <span className="text-xs text-muted-foreground">
                {formatRelativeDate(post.createdAt)}
              </span>
            )}
            <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[10px]">
              {contentTypeLabel(post.contentType)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Content */}
      {post.title && (
        <h4 className="mt-3 text-sm font-semibold text-gfm-dark">
          {post.title}
        </h4>
      )}
      {post.body && (
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {post.body}
        </p>
      )}

      {/* Media thumbnail */}
      {(post.thumbnailUrl || post.mediaUrl) && (
        <div className="mt-3 overflow-hidden rounded-lg">
          <img
            src={post.thumbnailUrl || post.mediaUrl || ''}
            alt={post.title ?? 'Post media'}
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      {/* Engagement stats */}
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        {(post.reactionCount ?? 0) > 0 && (
          <span>{post.reactionCount} reactions</span>
        )}
        {(post.commentCount ?? 0) > 0 && (
          <span>{post.commentCount} comments</span>
        )}
        {(post.viewCount ?? 0) > 0 && (
          <span>{post.viewCount} views</span>
        )}
      </div>
    </div>
  );
}

// ---------- Fundraisers Tab ----------

function FundraisersTab({
  fundraisers,
  leaderboard,
}: {
  fundraisers: Array<{ fundraiser: Fundraiser; organizer: Organizer | null }>;
  leaderboard: CommunityTabsProps['leaderboard'];
}) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
      <div>
        {fundraisers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No fundraisers yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {fundraisers.map(({ fundraiser, organizer }) => (
              <FundraiserCard
                key={fundraiser.id}
                fundraiser={fundraiser}
                organizer={organizer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Leaderboard sidebar (desktop) */}
      <aside className="hidden lg:block">
        <Leaderboard entries={leaderboard} />
      </aside>

      {/* Leaderboard below grid (mobile) */}
      <div className="mt-6 lg:hidden">
        <Leaderboard entries={leaderboard} />
      </div>
    </div>
  );
}

// ---------- About Tab ----------

function AboutTab({
  description,
  members,
}: {
  description: string | null;
  members: Array<{ member: Member; user: Organizer | null }>;
}) {
  return (
    <div className="max-w-2xl space-y-8">
      {/* Full description */}
      <section>
        <h3 className="mb-3 text-sm font-bold text-gfm-dark">
          About this community
        </h3>
        {description ? (
          <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            No description available.
          </p>
        )}
      </section>

      {/* Member list */}
      {members.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-bold text-gfm-dark">
            Members ({members.length})
          </h3>
          <div className="space-y-3">
            {members.map(({ member, user }) => {
              if (!user) return null;
              const avatarSrc = user.avatarUrl ?? user.image;
              return (
                <Link
                  key={member.id}
                  href={`/u/${user.username}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar>
                    {avatarSrc && (
                      <AvatarImage
                        src={avatarSrc}
                        alt={user.displayName}
                      />
                    )}
                    <AvatarFallback>
                      {getInitials(user.displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gfm-dark">
                      {user.displayName}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {member.role === 'admin' && (
                        <Badge
                          variant="secondary"
                          className="h-4 px-1.5 py-0 text-[10px]"
                        >
                          Admin
                        </Badge>
                      )}
                      {member.joinedAt && (
                        <span className="text-xs text-muted-foreground">
                          Joined {formatRelativeDate(member.joinedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
