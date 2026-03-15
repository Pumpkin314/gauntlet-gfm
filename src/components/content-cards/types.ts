export interface ContentPostData {
  id: string;
  contentType:
    | 'video'
    | 'image_story'
    | 'milestone'
    | 'community_pulse'
    | 'donor_spotlight'
    | 'challenge'
    | 'text_update';
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
}

export interface ContentAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  image: string | null;
}

export interface ContentFundraiser {
  id: string;
  slug: string;
  title: string;
}

export interface ContentCommunity {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
}

export interface ContentCardProps {
  post: ContentPostData;
  author: ContentAuthor | null;
  fundraiser: ContentFundraiser | null;
  community: ContentCommunity | null;
}
