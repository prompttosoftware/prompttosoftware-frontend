// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for the auth cookie
  const authCookie = request.cookies.get('test-access');
  const isAuthenticated = authCookie?.value === 'allowed';
  
  // If not authenticated and not already on coming-soon page
  if (!isAuthenticated && !request.nextUrl.pathname.startsWith('/coming-soon')) {
    // Redirect to coming soon page
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }
  
  // If authenticated and trying to access coming-soon, redirect to home
  if (isAuthenticated && request.nextUrl.pathname.startsWith('/coming-soon')) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except static files and API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
