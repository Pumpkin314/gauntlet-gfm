'use client';

import { useCallback, useEffect, useReducer } from 'react';

import { CommentItem } from '@/components/comments/comment-item';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchComments } from '@/lib/actions/comments';
import type { CommentWithUser } from '@/lib/queries/comments';

interface CommentListProps {
  contentPostId: string;
  initialLimit?: number;
  refreshKey?: number;
}

type State =
  | { status: 'loading'; comments: CommentWithUser[] }
  | { status: 'loaded'; comments: CommentWithUser[] };

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; comments: CommentWithUser[] };

function reducer(_state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading', comments: [] };
    case 'FETCH_SUCCESS':
      return { status: 'loaded', comments: action.comments };
  }
}

function CommentListSkeleton() {
  return (
    <div className="space-y-4 py-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="size-6 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentList({
  contentPostId,
  initialLimit = 50,
  refreshKey = 0,
}: CommentListProps) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'loading',
    comments: [],
  });

  const loadComments = useCallback(
    async (signal: AbortSignal) => {
      dispatch({ type: 'FETCH_START' });
      const data = await fetchComments(contentPostId, initialLimit);
      if (!signal.aborted) {
        dispatch({ type: 'FETCH_SUCCESS', comments: data });
      }
    },
    [contentPostId, initialLimit],
  );

  useEffect(() => {
    const controller = new AbortController();
    loadComments(controller.signal);
    return () => controller.abort();
  }, [loadComments, refreshKey]);

  if (state.status === 'loading') {
    return <CommentListSkeleton />;
  }

  if (state.comments.length === 0) {
    return (
      <p className="py-4 text-sm text-muted-foreground text-center">
        No comments yet
      </p>
    );
  }

  return (
    <div className="divide-y divide-border">
      {state.comments.map((data) => (
        <CommentItem key={data.comment.id} data={data} />
      ))}
    </div>
  );
}
