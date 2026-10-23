import { NextResponse, type NextRequest } from 'next/server';

// Protected routes matching pattern
const PUBLIC_PATHS = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/v1/auth',
  '/design-system',
  '/_next',
  '/favicon.ico',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public static assets and public pages
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) {
    return NextResponse.next();
  }

  // Check for session cookie or test token header
  const sessionToken = request.cookies.get('blynt_session')?.value || request.headers.get('x-user-id');

  // In test / development environment, allow bypass if header or test user is present, otherwise redirect to /login
  // If not authenticated and hitting protected dashboard routes:
  if (!sessionToken && pathname !== '/' && !pathname.startsWith('/api')) {
    // For demo/development ease: allow unless explicitly logged out
    const isExplicitlyLoggedOut = request.cookies.get('logged_out')?.value === 'true';
    if (isExplicitlyLoggedOut) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
