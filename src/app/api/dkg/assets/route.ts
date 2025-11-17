import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { publishKnowledgeAsset } from "@/lib/server/dkg-client";
import { createDkgAsset } from "@/lib/server/dkg-asset-store";
import { buildDkgExplorerUrl, buildDkgTxUrl } from "@/lib/dkg/links";

const assetSchema = z.object({
  type: z.string().min(1),
  title: z.string().min(3).max(240),
  summary: z.string().min(10).max(2000),
  references: z.array(z.string().min(1)).optional(),
  payload: z.unknown().optional(),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const raw = await request.json();
  const parsed = assetSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = parsed.data;
  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  const dataset = {
    public: {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": `urn:veriventure:${data.type}:${slug}`,
      identifier: `urn:veriventure:${data.type}:${slug}`,
      name: data.title,
      description: data.summary,
      keywords: [data.type],
      citation: (data.references ?? []).map((ref) => ({
        "@id": ref,
      })),
      dateCreated: new Date().toISOString(),
    },
    private: data.payload
      ? {
          "@context": "https://schema.org",
          "@type": "DataFeed",
          dataset: JSON.stringify(data.payload, null, 2),
        }
      : undefined,
  };

  try {
    const published = await publishKnowledgeAsset(dataset);
    const record = await createDkgAsset(address, {
      type: data.type,
      title: data.title,
      summary: data.summary,
      references: data.references ?? [],
      ual: published.ual,
      txHash: published.txHash,
      metadata: data.payload,
    });
    return NextResponse.json(
      {
        ok: true,
        ual: published.ual,
        txHash: published.txHash ?? null,
        explorer: buildDkgExplorerUrl(published.ual),
        subscan: buildDkgTxUrl(published.txHash),
        record,
      },
      { status: 201 },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to publish DKG asset.";
    const status = message.includes("DKG_") ? 503 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
