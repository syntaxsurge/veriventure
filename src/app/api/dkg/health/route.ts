import { NextResponse } from "next/server";
import { fetchDkgNodeInfo } from "@/lib/server/dkg-client";

export const runtime = "nodejs";

export async function GET() {
  try {
    const info = await fetchDkgNodeInfo();
    return NextResponse.json({ ok: true, info });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to reach the DKG node.";
    return NextResponse.json({ ok: false, error: message }, { status: 503 });
  }
}
