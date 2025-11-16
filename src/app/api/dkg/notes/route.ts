import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publishCommunityNote } from "@/lib/server/dkg-client";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createCommunityNote } from "@/lib/server/community-note-store";

const noteSchema = z.object({
  topic: z.string().min(3).max(240),
  summary: z.string().min(10).max(1200),
  references: z.array(z.string().url()).default([]),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = noteSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const published = await publishCommunityNote(parsed.data);
    const rawResult = published as { UAL?: unknown; ual?: unknown };
    const derivedUal =
      (typeof rawResult.UAL === "string" && rawResult.UAL) ||
      (typeof rawResult.ual === "string" && rawResult.ual) ||
      "";
    const record = await createCommunityNote(address, {
      topic: parsed.data.topic,
      summary: parsed.data.summary,
      references: parsed.data.references,
      ual: derivedUal,
      dkgResponse: published,
    });
    return NextResponse.json({ note: published, record });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to publish community note.";
    const status = message.includes("DKG_") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
