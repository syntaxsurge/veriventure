"use server";

import { randomUUID } from "node:crypto";
import { getConvexClient } from "@/lib/server/convex-client";
import { computeAchievementHash } from "@/lib/achievement-hash";
import type {
  AchievementPayload,
  AchievementRecord,
} from "@/types/achievement";

type AchievementDoc = {
  achievementId: string;
  ownerAddress: string;
  title: string;
  summary: string;
  metrics: string;
  evidenceUrl: string;
  impactArea: string;
  hash: string;
  hashAlgorithm: string;
  createdAt: string;
  txHash?: string | null;
  network?: string | null;
  contractAddress?: string | null;
};

type ConvexCaller = {
  query: (name: string, args: unknown) => Promise<unknown>;
  mutation: (name: string, args: unknown) => Promise<unknown>;
};

function convexClient(): ConvexCaller {
  return getConvexClient() as unknown as ConvexCaller;
}

function mapDocToRecord(doc: AchievementDoc): AchievementRecord {
  return {
    id: doc.achievementId,
    ownerAddress: doc.ownerAddress,
    title: doc.title,
    summary: doc.summary,
    metrics: doc.metrics,
    evidenceUrl: doc.evidenceUrl,
    impactArea: doc.impactArea,
    hash: doc.hash,
    hashAlgorithm: doc.hashAlgorithm as AchievementRecord["hashAlgorithm"],
    createdAt: doc.createdAt,
    txHash: doc.txHash ?? null,
    network: doc.network ?? null,
    contractAddress: doc.contractAddress ?? null,
  };
}

export async function listAchievements(address?: string | null) {
  const convex = convexClient();
  const ownerAddress = address?.trim() || undefined;
  const docs = (await convex.query("achievements:list", {
    ownerAddress,
  })) as AchievementDoc[];
  return docs.map(mapDocToRecord);
}

type CreateAchievementInput = {
  payload: AchievementPayload;
  txHash?: string | null;
  network?: string | null;
  contractAddress?: string | null;
};

export async function createAchievement(
  ownerAddress: string,
  input: CreateAchievementInput,
) {
  const normalizedOwner = ownerAddress.trim();
  if (!normalizedOwner) {
    throw new Error("Owner address is required");
  }

  const { payload, txHash, network, contractAddress } = input;
  const hash = computeAchievementHash(payload);
  const nowIso = new Date().toISOString();
  const record: AchievementRecord = {
    id: randomUUID(),
    ownerAddress: normalizedOwner,
    hash,
    hashAlgorithm: "blake2b256",
    createdAt: nowIso,
    txHash: txHash ?? null,
    network: network ?? null,
    contractAddress: contractAddress ?? null,
    ...payload,
  };

  const convex = convexClient();
  const inserted = (await convex.mutation("achievements:insert", {
    achievementId: record.id,
    ownerAddress: record.ownerAddress,
    title: record.title,
    summary: record.summary,
    metrics: record.metrics,
    evidenceUrl: record.evidenceUrl,
    impactArea: record.impactArea,
    hash: record.hash,
    hashAlgorithm: record.hashAlgorithm,
    createdAt: record.createdAt,
    txHash: record.txHash,
    network: record.network,
    contractAddress: record.contractAddress,
  })) as AchievementDoc | null;

  return inserted ? mapDocToRecord(inserted) : record;
}
