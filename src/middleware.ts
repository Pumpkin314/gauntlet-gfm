import { auth } from '@/lib/auth';

export default auth((req) => {
  const isProtected =
    req.nextUrl.pathname.startsWith('/studio') ||
    req.nextUrl.pathname.startsWith('/admin');

  if (isProtected && !req.auth) {
    const signInUrl = new URL('/sign-in', req.nextUrl.origin);
    signInUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
    return Response.redirect(signInUrl);
  }
});

export const config = {
  matcher: ['/studio/:path*', '/admin/:path*'],
};
