import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  deleteSession,
  getSession,
} from "@/lib/server/session-store";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!cookie) {
    return NextResponse.json({ address: null });
  }

  const record = getSession(cookie.value);

  if (!record) {
    cookieStore.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ address: null });
  }

  return NextResponse.json({ address: record.address });
}

export async function DELETE() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (cookie) {
    deleteSession(cookie.value);
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
