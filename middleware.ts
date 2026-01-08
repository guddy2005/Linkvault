import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Reserved paths that should NOT be treated as short links
const RESERVED_PATHS = [
  '/api',
  '/dashboard',
  '/auth',
  '/login',
  '/signup',
  '/r',
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip reserved paths
  if (RESERVED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Skip the home page
  if (pathname === '/') {
    return NextResponse.next();
  }

  // Extract the slug (everything after the first /)
  const slug = pathname.slice(1);

  // Skip if no slug or if it contains additional path segments
  if (!slug || slug.includes('/')) {
    return NextResponse.next();
  }

  // Redirect to the redirect handler page
  // The actual Firestore lookup and click tracking happens in the page component
  const redirectUrl = new URL(`/r/${slug}`, request.url);
  
  // Pass along referrer and user agent as query params for tracking
  const referrer = request.headers.get('referer') || '';
  const userAgent = request.headers.get('user-agent') || '';
  
  redirectUrl.searchParams.set('ref', referrer);
  redirectUrl.searchParams.set('ua', userAgent);
  
  return NextResponse.rewrite(redirectUrl);
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
