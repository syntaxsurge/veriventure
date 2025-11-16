import { NextRequest, NextResponse } from "next/server";
import { stringToU8a } from "@polkadot/util";
import { cryptoWaitReady, signatureVerify } from "@polkadot/util-crypto";
import { consumeNonce, readNonce } from "@/lib/server/session-store";
import { createSession } from "@/lib/server/session-cookie";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    address?: string | null;
    signature?: string | null;
    message?: string | null;
  };

  const address = body.address?.trim();
  const signature = body.signature?.trim();
  const message = body.message;

  if (!address || !signature || !message) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const nonceRecord = readNonce(address);

  if (!nonceRecord) {
    return NextResponse.json(
      { error: "Challenge expired or not found" },
      { status: 400 },
    );
  }

  if (!message.includes(nonceRecord.nonce)) {
    return NextResponse.json({ error: "Nonce mismatch" }, { status: 400 });
  }

  await cryptoWaitReady();
  const { isValid } = signatureVerify(stringToU8a(message), signature, address);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  consumeNonce(address);
  await createSession(address);
  return NextResponse.json({ address });
}
