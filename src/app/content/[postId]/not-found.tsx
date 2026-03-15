import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ContentNotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gfm-dark">404</h1>
      <p className="mt-2 text-lg text-muted-foreground">Post not found</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The content you&apos;re looking for doesn&apos;t exist or has been
        removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-gfm-green transition-colors hover:text-gfm-green/80"
      >
        <ArrowLeft className="size-4" />
        Back to home
      </Link>
    </main>
  );
}
