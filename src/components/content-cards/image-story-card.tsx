import Image from 'next/image';

interface ImageStoryCardProps {
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  title: string | null;
}

export function ImageStoryCard({
  mediaUrl,
  thumbnailUrl,
  title,
}: ImageStoryCardProps) {
  const src = mediaUrl ?? thumbnailUrl;

  if (!src) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        Image unavailable
      </div>
    );
  }

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={title ?? 'Story image'}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 640px"
      />
      {title && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
    </div>
  );
}
