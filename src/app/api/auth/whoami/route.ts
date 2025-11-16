import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session-cookie";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSession();
  if (!session?.address) {
    return NextResponse.json({ address: null });
  }

  return NextResponse.json({
    address: session.address,
    handle: session.address,
  });
}
