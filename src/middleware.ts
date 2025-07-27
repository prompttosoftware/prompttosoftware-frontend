// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for certain paths that might cause issues
  const skipPaths = [
    '/_next',
    '/api',
    '/favicon.ico',
    '/coming-soon'
  ];
  
  if (skipPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  try {
    // Check for the auth cookie
    const authCookie = request.cookies.get('test-access');
    const isAuthenticated = authCookie?.value === 'allowed';
    
    // Only redirect if not authenticated
    if (!isAuthenticated) {
      // Preserve the original URL for redirect after auth
      const comingSoonUrl = new URL('/coming-soon', request.url);
      comingSoonUrl.searchParams.set('returnTo', pathname);
      return NextResponse.redirect(comingSoonUrl);
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  // Simpler matcher that's less likely to cause issues
  matcher: [
    '/((?!_next|api|favicon.ico).*)'
  ],
};
