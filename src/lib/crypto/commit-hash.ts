import { blake2b } from "@noble/hashes/blake2.js";

const encoder = new TextEncoder();

function hexToBytes(hex: string) {
  const normalized = hex.startsWith("0x") ? hex.slice(2) : hex;
  if (normalized.length % 2 !== 0) {
    throw new Error("Salt hex string must have an even length.");
  }
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

export function saltedCommitHash(payload: unknown, saltHex: string) {
  const canonical = JSON.stringify(payload);
  const payloadBytes = encoder.encode(canonical);
  const saltBytes = hexToBytes(saltHex);
  const combined = new Uint8Array(payloadBytes.length + saltBytes.length);
  combined.set(payloadBytes);
  combined.set(saltBytes, payloadBytes.length);

  const digest = blake2b(combined, { dkLen: 32 });
  return `0x${Buffer.from(digest).toString("hex")}`;
}
