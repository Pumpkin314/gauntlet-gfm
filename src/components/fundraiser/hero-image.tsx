import Image from 'next/image';

interface HeroImageProps {
  src: string | null;
  alt: string;
}

export function HeroImage({ src, alt }: HeroImageProps) {
  if (!src) {
    return (
      <div className="aspect-video w-full rounded-xl bg-muted flex items-center justify-center">
        <span className="text-muted-foreground text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl">
      <Image
        src={src}
        alt={alt}
        fill
        priority
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
      />
    </div>
  );
}
