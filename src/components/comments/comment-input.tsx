'use client';

import Link from 'next/link';
import { useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { trackAction } from '@/lib/analytics/actions';
import { createComment } from '@/lib/actions/comments';

interface CommentInputProps {
  contentPostId: string;
  isAuthenticated: boolean;
  onCommentAdded?: () => void;
}

const MAX_LENGTH = 500;

export function CommentInput({
  contentPostId,
  isAuthenticated,
  onCommentAdded,
}: CommentInputProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (!isAuthenticated) {
    return (
      <div className="py-3 text-sm text-muted-foreground text-center">
        <Link
          href="/sign-in"
          className="text-gfm-green hover:underline font-medium"
        >
          Sign in
        </Link>{' '}
        to comment
      </div>
    );
  }

  const charCount = body.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isEmpty = body.trim().length === 0;

  function handleSubmit() {
    if (isEmpty || isOverLimit || isPending) return;

    setError(null);
    startTransition(async () => {
      const result = await createComment(contentPostId, body.trim());
      if (result.success) {
        trackAction('comment', { contentPostId });
        setBody('');
        textareaRef.current?.focus();
        onCommentAdded?.();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="pt-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Add a comment..."
          rows={2}
          className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-gfm-dark placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gfm-green focus:border-transparent disabled:opacity-50"
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span
          className={`text-xs ${
            isOverLimit
              ? 'text-destructive font-medium'
              : 'text-muted-foreground'
          }`}
        >
          {charCount}/{MAX_LENGTH}
        </span>

        <Button
          size="sm"
          disabled={isEmpty || isOverLimit || isPending}
          onClick={handleSubmit}
          className="bg-gfm-green text-white hover:bg-gfm-green/90"
        >
          {isPending ? 'Posting...' : 'Comment'}
        </Button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
