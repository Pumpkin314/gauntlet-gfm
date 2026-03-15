'use client';

import { MessageCircle } from 'lucide-react';
import { useCallback, useState } from 'react';

import { CommentInput } from '@/components/comments/comment-input';
import { CommentList } from '@/components/comments/comment-list';
import { Button } from '@/components/ui/button';

interface CommentSectionProps {
  contentPostId: string;
  commentCount: number;
  isAuthenticated: boolean;
}

export function CommentSection({
  contentPostId,
  commentCount,
  isAuthenticated,
}: CommentSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCommentAdded = useCallback(() => {
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="border-t border-border">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="w-full justify-start gap-2 text-muted-foreground hover:text-gfm-dark"
      >
        <MessageCircle className="size-4" />
        {isExpanded
          ? 'Hide comments'
          : commentCount > 0
            ? `View ${commentCount} comment${commentCount === 1 ? '' : 's'}`
            : 'Add a comment'}
      </Button>

      {isExpanded && (
        <div className="px-1 pb-3">
          <CommentList
            contentPostId={contentPostId}
            refreshKey={refreshKey}
          />
          <CommentInput
            contentPostId={contentPostId}
            isAuthenticated={isAuthenticated}
            onCommentAdded={handleCommentAdded}
          />
        </div>
      )}
    </div>
  );
}
