/**
 * Next.js Edge Middleware
 * Handles rate limiting, authentication, and request preprocessing
 */

import { NextRequest, NextResponse } from 'next/server';
import { rateLimitMiddleware } from '@/lib/rate-limit/middleware';

// Paths that should skip rate limiting
const RATE_LIMIT_EXCLUDED_PATHS = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.json',
];

// API paths that require authentication
const PROTECTED_API_PATHS = [
  '/api/user',
  '/api/achievements/mint',
  '/api/invoices/create',
  '/api/ai/generate',
  '/api/dkg/publish',
];

// CORS configuration
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static assets and Next.js internals
  if (RATE_LIMIT_EXCLUDED_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
  }

  // Apply rate limiting to API routes
  if (pathname.startsWith('/api')) {
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      // Add CORS headers to rate limit response
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        rateLimitResponse.headers.set(key, value);
      });
      return rateLimitResponse;
    }

    // Check authentication for protected routes
    if (PROTECTED_API_PATHS.some(path => pathname.startsWith(path))) {
      const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                   request.cookies.get('token')?.value;

      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          {
            status: 401,
            headers: CORS_HEADERS,
          }
        );
      }

      // TODO: Verify JWT token
      // try {
      //   const decoded = jwt.verify(token, process.env.JWT_SECRET!);
      //   // Add user info to request headers for downstream use
      //   request.headers.set('x-user-id', decoded.userId);
      //   request.headers.set('x-user-tier', decoded.tier);
      // } catch (error) {
      //   return NextResponse.json(
      //     { error: 'Invalid token' },
      //     {
      //       status: 401,
      //       headers: CORS_HEADERS,
      //     }
      //   );
      // }
    }
  }

  // Security headers
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Add CORS headers to all API responses
  if (pathname.startsWith('/api')) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  // Add rate limit headers if they were set
  const rateLimitHeaders = (request as any).rateLimitHeaders;
  if (rateLimitHeaders) {
    rateLimitHeaders.forEach((value: string, key: string) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};