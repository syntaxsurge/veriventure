import { NextResponse } from "next/server";
import { clearSession } from "@/lib/server/session-cookie";
import { SESSION_COOKIE_NAME } from "@/lib/constants/auth";
import { getSessionIdentity } from "@/lib/server/session-identity";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionIdentity();
  return NextResponse.json({
    address: session.address,
    handle: session.handle,
  });
}

export async function DELETE() {
  await clearSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
