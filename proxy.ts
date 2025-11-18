import { NextResponse } from "next/server";
import type { NextRequest, NextProxy } from "next/server";
import { rateLimitMiddleware } from "@/lib/rate-limit/middleware";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_MS,
} from "@/lib/constants/auth";
import { signSession, verifySession } from "@/lib/auth/session";

const gatedPrefixes = [
  "/dashboard",
  "/credentials",
  "/invoices",
  "/ai-assistant",
  "/documents",
  "/notes",
];

const RATE_LIMIT_EXCLUDED_PATHS = [
  "/_next",
  "/static",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
];

const PROTECTED_API_PATHS = [
  "/api/user",
  "/api/achievements/mint",
  "/api/invoices/create",
  "/api/ai/generate",
  "/api/dkg/publish",
];

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": process.env.NEXT_PUBLIC_APP_URL || "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
  "Access-Control-Max-Age": "86400",
};

export const proxy: NextProxy = async (request: NextRequest, _event) => {
  const { pathname } = request.nextUrl;

  if (RATE_LIMIT_EXCLUDED_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
  }

  if (pathname.startsWith("/api")) {
    const rateLimitResponse = await rateLimitMiddleware(request);
    if (rateLimitResponse) {
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        rateLimitResponse.headers.set(key, value);
      });
      return rateLimitResponse;
    }

    if (PROTECTED_API_PATHS.some((path) => pathname.startsWith(path))) {
      const token =
        request.headers.get("authorization")?.replace("Bearer ", "") ??
        request.cookies.get("token")?.value;

      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          {
            status: 401,
            headers: CORS_HEADERS,
          },
        );
      }

      // TODO: Verify JWT token and attach user info to the request if needed.
    }
  }

  const requiresAuth = gatedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const res = NextResponse.next();

  if (requiresAuth) {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/connect-wallet", request.url));
    }

    let payload;
    try {
      payload = await verifySession(sessionCookie.value);
    } catch {
      const redirect = NextResponse.redirect(
        new URL("/connect-wallet", request.url),
      );
      redirect.cookies.delete(SESSION_COOKIE_NAME);
      return redirect;
    }

    if (request.method === "GET") {
      const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_MS);
      const refreshed = await signSession({
        address: payload.address as string,
        expires: expiresAt.toISOString(),
      });
      res.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: refreshed,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        expires: expiresAt,
      });
    }
  }

  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin",
  );
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  if (pathname.startsWith("/api")) {
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      res.headers.set(key, value);
    });
  }

  const rateLimitHeaders = (request as any).rateLimitHeaders as
    | Headers
    | undefined;
  if (rateLimitHeaders) {
    rateLimitHeaders.forEach((value, key) => {
      res.headers.set(key, value);
    });
  }

  return res;
};

export const config = {
  matcher: [
    // Match all request paths except for:
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    // - public folder assets (common image extensions)
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
