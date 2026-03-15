import { ContentCard } from '@/components/content-cards';
import type {
  ContentAuthor,
  ContentCommunity,
  ContentFundraiser,
  ContentPostData,
} from '@/components/content-cards';

export interface ContentFeedProps {
  items: Array<{
    post: ContentPostData;
    author: ContentAuthor | null;
    fundraiser: ContentFundraiser | null;
    community: ContentCommunity | null;
  }>;
  emptyMessage?: string;
}

export function ContentFeed({
  items,
  emptyMessage = 'No content yet. Check back soon!',
}: ContentFeedProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border py-12 text-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
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
  );
}
