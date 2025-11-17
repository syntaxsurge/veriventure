import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
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

export async function middleware(request: NextRequest) {
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

  let payload;
  try {
    payload = await verifySession(sessionCookie.value);
  } catch {
    const res = NextResponse.redirect(new URL("/", request.url));
    res.cookies.delete(SESSION_COOKIE_NAME);
    return res;
  }

  const res = NextResponse.next();

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

  return res;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/credentials/:path*",
    "/invoices/:path*",
    "/ai-assistant/:path*",
    "/documents/:path*",
    "/notes/:path*",
  ],
};
