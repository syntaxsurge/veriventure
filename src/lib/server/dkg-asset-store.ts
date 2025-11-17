"use server";

import { randomUUID } from "node:crypto";
import { api, getConvexClient } from "@/lib/server/convex-client";
import type { DkgAssetRecord } from "@/types/dkg-asset";

type DkgAssetDoc = {
  dkgAssetId: string;
  ownerAddress: string;
  type: string;
  title: string;
  summary: string;
  references: string[];
  ual: string;
  txHash?: string | null;
  metadataJson?: string;
  createdAt: string;
};

function deserialize(doc: DkgAssetDoc): DkgAssetRecord {
  let metadata: unknown;
  if (doc.metadataJson) {
    try {
      metadata = JSON.parse(doc.metadataJson);
    } catch {
      metadata = undefined;
    }
  }

  return {
    id: doc.dkgAssetId,
    ownerAddress: doc.ownerAddress,
    type: doc.type,
    title: doc.title,
    summary: doc.summary,
    references: doc.references,
    ual: doc.ual,
    txHash: doc.txHash,
    metadata,
    createdAt: doc.createdAt,
  };
}

export async function listDkgAssets(ownerAddress: string) {
  const convex = getConvexClient();
  const docs = (await convex.query(api.dkgAssets.listByOwner, {
    ownerAddress,
  })) as DkgAssetDoc[];
  return docs.map(deserialize);
}

type CreateInput = {
  type: string;
  title: string;
  summary: string;
  references?: string[];
  ual: string;
  txHash?: string | null;
  metadata?: unknown;
};

export async function createDkgAsset(ownerAddress: string, input: CreateInput) {
  const normalized = ownerAddress.trim();
  if (!normalized) {
    throw new Error("Owner address is required for DKG asset logging.");
  }

  const record: DkgAssetRecord = {
    id: randomUUID(),
    ownerAddress: normalized,
    type: input.type,
    title: input.title.trim(),
    summary: input.summary.trim(),
    references: input.references?.map((ref) => ref.trim()).filter(Boolean) ?? [],
    ual: input.ual.trim(),
    txHash: input.txHash ?? undefined,
    metadata: input.metadata,
    createdAt: new Date().toISOString(),
  };

  const convex = getConvexClient();
  const inserted = (await convex.mutation(api.dkgAssets.insert, {
    dkgAssetId: record.id,
    ownerAddress: record.ownerAddress,
    type: record.type,
    title: record.title,
    summary: record.summary,
    references: record.references,
    ual: record.ual,
    txHash: record.txHash ?? undefined,
    metadataJson:
      typeof record.metadata !== "undefined"
        ? JSON.stringify(record.metadata)
        : undefined,
    createdAt: record.createdAt,
  })) as DkgAssetDoc | null;

  return inserted ? deserialize(inserted) : record;
}
