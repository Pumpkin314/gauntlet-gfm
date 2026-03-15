export interface FeedItem {
  post: {
    id: string;
    contentType: string;
    title: string | null;
    body: string | null;
    mediaUrl: string | null;
    muxPlaybackId: string | null;
    thumbnailUrl: string | null;
    autoGenData: unknown;
    viewCount: number | null;
    reactionCount: number | null;
    commentCount: number | null;
    createdAt: Date | null;
  };
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
    image: string | null;
  } | null;
  fundraiser: {
    id: string;
    slug: string;
    title: string;
  } | null;
  community: {
    id: string;
    slug: string;
    name: string;
    logoUrl: string | null;
  } | null;
}

export interface FeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

export interface FeedOptions {
  source: 'fundraiser' | 'community' | 'profile' | 'discover';
  id?: string;
  cursor?: string;
  limit: number;
}
