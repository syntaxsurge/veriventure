import { blake2b } from "@noble/hashes/blake2b.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import type { AchievementPayload } from "@/types/achievement";

const ORDERED_KEYS: (keyof AchievementPayload)[] = [
  "title",
  "summary",
  "metrics",
  "evidenceUrl",
  "impactArea",
];

export function serializeAchievementPayload(payload: AchievementPayload) {
  const ordered = ORDERED_KEYS.reduce<Record<string, string>>((acc, key) => {
    acc[key] = (payload[key] ?? "").trim();
    return acc;
  }, {});

  return JSON.stringify(ordered);
}

export function computeAchievementHash(payload: AchievementPayload) {
  const serialized = serializeAchievementPayload(payload);
  const bytes = new TextEncoder().encode(serialized);
  const digest = blake2b(bytes, { dkLen: 32 });
  return `0x${bytesToHex(digest)}`;
}
