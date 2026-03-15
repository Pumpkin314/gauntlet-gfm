'use client';

import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface FYPNavProps {
  user: {
    name?: string | null;
    image?: string | null;
  } | null;
}

export function FYPNav({ user }: FYPNavProps) {
  const router = useRouter();

  return (
    <nav className="pointer-events-auto absolute inset-x-0 top-0 z-50 flex h-14 items-center justify-between px-4">
      {/* Semi-transparent gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />

      {/* Back button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative z-10 text-white hover:bg-white/20"
        onClick={() => router.back()}
        aria-label="Go back"
      >
        <ArrowLeft className="size-5" />
      </Button>

      {/* Title */}
      <h1 className="relative z-10 text-base font-semibold text-white">
        Fund You Page
      </h1>

      {/* User avatar or sign-in link */}
      <div className="relative z-10">
        {user ? (
          <Link href="/u/me" aria-label="Your profile">
            <Avatar size="sm">
              {user.image && (
                <AvatarImage src={user.image} alt={user.name ?? 'You'} />
              )}
              <AvatarFallback>
                {user.name
                  ? user.name
                      .split(' ')
                      .map((p) => p[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)
                  : 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="flex size-8 items-center justify-center rounded-full bg-white/20 text-white"
            aria-label="Sign in"
          >
            <User className="size-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
