import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/server/session-cookie";
import { SESSION_COOKIE_NAME } from "@/lib/constants/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.address) {
    return NextResponse.json({ address: null });
  }
  return NextResponse.json({ address: session.address });
}

export async function DELETE() {
  await clearSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
