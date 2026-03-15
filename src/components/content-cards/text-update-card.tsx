import Image from 'next/image';

interface TextUpdateCardProps {
  title: string | null;
  body: string | null;
  mediaUrl: string | null;
}

export function TextUpdateCard({
  title,
  body,
  mediaUrl,
}: TextUpdateCardProps) {
  return (
    <div className="px-4">
      {title && (
        <h3 className="text-lg font-semibold text-gfm-dark">{title}</h3>
      )}

      {body && (
        <p className="mt-1 text-sm text-muted-foreground line-clamp-4">
          {body}
        </p>
      )}

      {mediaUrl && (
        <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={mediaUrl}
            alt={title ?? 'Update image'}
            fill
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}
