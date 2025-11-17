import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { readBadgeHashes } from "@/lib/web3/validity-contract";

const requestSchema = z.object({
  address: z.string().min(4).max(200),
  hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { address, hash } = parsed.data;
  try {
    const onChain = await readBadgeHashes(address);
    const normalizedHash = hash.toLowerCase();
    const onChainMatch = onChain.hashes.some(
      (candidate) => candidate.toLowerCase() === normalizedHash,
    );

    return NextResponse.json({
      onChainMatch,
      onChainCount: onChain.hashes.length,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to verify on-chain hash.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
