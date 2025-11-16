const NONCE_TTL_MS = 5 * 60 * 1000;

type NonceEntry = {
  nonce: string;
  expiresAt: number;
};

const nonceStore = new Map<string, NonceEntry>();

function pruneNonce(address: string) {
  const existing = nonceStore.get(address);
  if (existing && existing.expiresAt <= Date.now()) {
    nonceStore.delete(address);
  }
}

function randomHex(bytes: number) {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const buffer = new Uint8Array(bytes);
    globalThis.crypto.getRandomValues(buffer);
    return Array.from(buffer, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
  }
  return Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0"),
  ).join("");
}

export function createChallenge(address: string) {
  pruneNonce(address);
  const nonce = randomHex(16);
  const expiresAt = Date.now() + NONCE_TTL_MS;
  nonceStore.set(address, { nonce, expiresAt });

  const message = [
    "VeriVenture requests a signature to confirm wallet ownership.",
    `Address: ${address}`,
    `Nonce: ${nonce}`,
    `Timestamp: ${new Date().toISOString()}`,
  ].join("\n");

  return { nonce, message };
}

export function readNonce(address: string) {
  pruneNonce(address);
  return nonceStore.get(address);
}

export function consumeNonce(address: string) {
  const record = nonceStore.get(address);
  if (!record) {
    return null;
  }
  if (record.expiresAt <= Date.now()) {
    nonceStore.delete(address);
    return null;
  }
  nonceStore.delete(address);
  return record.nonce;
}
