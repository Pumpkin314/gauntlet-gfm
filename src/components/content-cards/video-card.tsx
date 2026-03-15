'use client';

import MuxPlayer from '@mux/mux-player-react';
import Image from 'next/image';

interface VideoCardProps {
  playbackId: string | null;
  title: string | null;
  thumbnailUrl: string | null;
}

export function VideoCard({ playbackId, title, thumbnailUrl }: VideoCardProps) {
  if (!playbackId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title ?? 'Video thumbnail'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 640px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            Video unavailable
          </div>
        )}
      </div>
    );
  }

  const thumbUrl =
    thumbnailUrl ?? `https://image.mux.com/${playbackId}/thumbnail.jpg`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      <MuxPlayer
        playbackId={playbackId}
        metadata={{ video_title: title ?? undefined }}
        streamType="on-demand"
        thumbnailTime={0}
        poster={thumbUrl}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
