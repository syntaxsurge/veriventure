const NONCE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type NonceEntry = {
  nonce: string;
  expiresAt: number;
};

type SessionEntry = {
  address: string;
  createdAt: number;
};

const nonceStore = new Map<string, NonceEntry>();
const sessionStore = new Map<string, SessionEntry>();

export const SESSION_COOKIE_NAME = "veriventure_session";

function pruneNonce(address: string) {
  const existing = nonceStore.get(address);
  if (existing && existing.expiresAt <= Date.now()) {
    nonceStore.delete(address);
  }
}

function pruneSessions() {
  const threshold = Date.now() - SESSION_TTL_MS;
  for (const [sessionId, entry] of sessionStore.entries()) {
    if (entry.createdAt < threshold) {
      sessionStore.delete(sessionId);
    }
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

export function createSession(address: string) {
  pruneSessions();
  const sessionId = randomHex(24);
  sessionStore.set(sessionId, { address, createdAt: Date.now() });
  return sessionId;
}

export function getSession(sessionId: string) {
  pruneSessions();
  return sessionStore.get(sessionId) ?? null;
}

export function deleteSession(sessionId: string) {
  sessionStore.delete(sessionId);
}
