'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export function SignInButton() {
  return (
    <Link href="/sign-in" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      Sign in
    </Link>
  );
}
