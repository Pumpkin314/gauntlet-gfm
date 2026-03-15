import { Eye, Heart, MessageCircle, Share2 } from 'lucide-react';

interface ActionBarProps {
  reactionCount: number | null;
  commentCount: number | null;
  viewCount: number | null;
}

export function ActionBar({
  reactionCount,
  commentCount,
  viewCount,
}: ActionBarProps) {
  return (
    <div className="flex items-center gap-4 px-4 pt-1 text-sm text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Heart className="h-4 w-4" />
        <span>{reactionCount ?? 0}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <MessageCircle className="h-4 w-4" />
        <span>{commentCount ?? 0}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Eye className="h-4 w-4" />
        <span>{viewCount ?? 0}</span>
      </div>
      <div className="ml-auto">
        <Share2 className="h-4 w-4" />
      </div>
    </div>
  );
}
