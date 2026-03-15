import { ThumbsDown, ThumbsUp } from 'lucide-react';

import { UserAvatarLink } from '@/components/shared/user-avatar-link';
import { Badge } from '@/components/ui/badge';
import { formatCents, formatRelativeDate } from '@/lib/format';
import type { CommentWithUser } from '@/lib/queries/comments';

interface CommentItemProps {
  data: CommentWithUser;
}

export function CommentItem({ data }: CommentItemProps) {
  const { comment, user, donation } = data;
  const isDonationComment = donation?.amountCents != null;

  return (
    <div
      className={`flex gap-3 py-3 ${
        isDonationComment ? 'border-l-2 border-gfm-green pl-3' : ''
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        {user ? (
          <UserAvatarLink
            username={user.username}
            displayName={user.displayName}
            avatarUrl={user.avatarUrl}
            image={user.image}
            size="sm"
          />
        ) : (
          <div className="size-6 rounded-full bg-muted" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {user ? (
            <span className="text-sm font-medium text-gfm-dark truncate">
              {user.displayName}
            </span>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              Deleted user
            </span>
          )}

          {isDonationComment && (
            <Badge
              className="bg-gfm-green/10 text-gfm-green border-gfm-green/20"
            >
              Donated {formatCents(donation.amountCents!)}
            </Badge>
          )}

          {comment.createdAt && (
            <span className="text-xs text-muted-foreground">
              {formatRelativeDate(comment.createdAt)}
            </span>
          )}
        </div>

        <p className="text-sm text-gfm-dark mt-1 break-words">
          {comment.body}
        </p>

        {/* Vote counts (display only) */}
        <div className="flex items-center gap-3 mt-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsUp className="size-3" />
            {comment.upvotes ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsDown className="size-3" />
            {comment.downvotes ?? 0}
          </span>
        </div>
      </div>
    </div>
  );
}
