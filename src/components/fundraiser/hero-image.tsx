import Image from 'next/image';

/** Tiny transparent blur placeholder for CLS prevention */
const BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88P/BfwAJhAPk4YSMBAAAAABJRU5ErkJggg==';

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
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />
    </div>
  );
}
