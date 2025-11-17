import { NextResponse } from "next/server";
import { getSessionIdentity } from "@/lib/server/session-identity";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionIdentity();
  return NextResponse.json(session);
}
