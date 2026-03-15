'use client';

import Link from 'next/link';
import { usePathname,useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { ContentCard } from '@/components/content-cards';
import type {
  ContentAuthor,
  ContentCommunity,
  ContentFundraiser,
  ContentPostData,
} from '@/components/content-cards';
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

interface ContentItem {
  post: ContentPostData;
  author: ContentAuthor | null;
  fundraiser: ContentFundraiser | null;
  community: ContentCommunity | null;
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
  contentItems?: ContentItem[];
  communityId: string;
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

export function CommunityTabs({
  fundraisers,
  leaderboard,
  posts,
  members,
  communityDescription,
  contentItems,
  communityId,
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
          <ActivityTab
            posts={posts}
            leaderboard={leaderboard}
            contentItems={contentItems}
            communityId={communityId}
          />
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
  contentItems,
  communityId,
}: {
  posts: Array<{ post: Post; author: Organizer | null }>;
  leaderboard: CommunityTabsProps['leaderboard'];
  contentItems?: ContentItem[];
  communityId: string;
}) {
  // Use rich ContentCard rendering when contentItems are available;
  // fall back to mapping posts to ContentCard shape otherwise.
  const items: ContentItem[] =
    contentItems && contentItems.length > 0
      ? contentItems
      : posts.map(({ post, author }) => ({
          post: {
            id: post.id,
            contentType: post.contentType as ContentPostData['contentType'],
            title: post.title,
            body: post.body,
            mediaUrl: post.mediaUrl,
            muxPlaybackId: null,
            thumbnailUrl: post.thumbnailUrl,
            autoGenData: null,
            viewCount: post.viewCount,
            reactionCount: post.reactionCount,
            commentCount: post.commentCount,
            createdAt: post.createdAt,
          },
          author: author
            ? {
                id: author.id,
                username: author.username,
                displayName: author.displayName,
                avatarUrl: author.avatarUrl,
                image: author.image,
              }
            : null,
          fundraiser: null,
          community: null,
        }));

  return (
    <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-6">
      <div>
        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No activity yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <ContentCard
                  key={item.post.id}
                  post={item.post}
                  author={item.author}
                  fundraiser={item.fundraiser}
                  community={item.community}
                />
              ))}
            </div>
            <Link
              href={`/fyp?source=community&id=${communityId}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gfm-green hover:underline"
            >
              More like this &rarr;
            </Link>
          </>
        )}
      </div>

      {/* Leaderboard sidebar (desktop) */}
      <aside className="hidden lg:block">
        <Leaderboard entries={leaderboard} />
      </aside>
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
