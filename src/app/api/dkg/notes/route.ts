import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { publishCommunityNote } from "@/lib/server/dkg-client";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createCommunityNote } from "@/lib/server/community-note-store";
import { clientEnv } from "@/env/client";

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
    const record = await createCommunityNote(address, {
      topic: parsed.data.topic,
      summary: parsed.data.summary,
      references: parsed.data.references,
      ual: published.ual,
      txHash: published.txHash,
      dkgResponse: published.result,
    });
    const explorer = buildExplorerUrl(published.ual);
    const subscan = buildSubscanUrl(published.txHash);
    return NextResponse.json({
      ok: true,
      ual: published.ual,
      txHash: published.txHash ?? null,
      explorer,
      subscan,
      record,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to publish community note.";
    const status = message.includes("DKG_") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

function buildExplorerUrl(ual: string) {
  return clientEnv.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE.replace(
    "{ual}",
    encodeURIComponent(ual),
  );
}

function buildSubscanUrl(txHash?: string) {
  if (!txHash) return null;
  return clientEnv.NEXT_PUBLIC_DKG_TX_TEMPLATE.replace("{tx}", txHash);
}
