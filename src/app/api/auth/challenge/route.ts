import { NextRequest, NextResponse } from "next/server";
import { createChallenge } from "@/lib/server/session-store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { address?: string | null };
  const address = body.address?.trim();

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  const challenge = createChallenge(address);

  return NextResponse.json({
    address,
    message: challenge.message,
  });
}
