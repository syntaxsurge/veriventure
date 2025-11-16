import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  getSession,
} from "@/lib/server/session-store";

const gatedPrefixes = [
  "/dashboard",
  "/credentials",
  "/ai-assistant",
  "/documents",
  "/notes",
  "/verify",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const requiresAuth = gatedPrefixes.some((prefix) =>
    pathname.startsWith(prefix),
  );
  if (!requiresAuth) {
    return NextResponse.next();
  }
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const session = getSession(sessionCookie.value);
  if (!session?.address) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/credentials/:path*",
    "/ai-assistant/:path*",
    "/documents/:path*",
    "/notes/:path*",
    "/verify/:path*",
  ],
};
