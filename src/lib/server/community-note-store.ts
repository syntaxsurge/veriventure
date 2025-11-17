"use server";

import { randomUUID } from "node:crypto";
import { api, getConvexClient } from "@/lib/server/convex-client";
import type { CommunityNoteRecord } from "@/types/community-note";

type CommunityNoteDoc = {
  communityNoteId: string;
  ownerAddress: string;
  topic: string;
  summary: string;
  references: string[];
  ual: string;
  txHash?: string | null;
  dkgResponseJson?: string;
  createdAt: string;
};

function deserialize(doc: CommunityNoteDoc): CommunityNoteRecord {
  let parsed: unknown;
  if (doc.dkgResponseJson) {
    try {
      parsed = JSON.parse(doc.dkgResponseJson);
    } catch {
      parsed = undefined;
    }
  }

  return {
    id: doc.communityNoteId,
    ownerAddress: doc.ownerAddress,
    topic: doc.topic,
    summary: doc.summary,
    references: doc.references,
    ual: doc.ual,
    txHash: doc.txHash,
    createdAt: doc.createdAt,
    dkgResponse: parsed,
  };
}

export async function listCommunityNotes(ownerAddress?: string | null) {
  const convex = getConvexClient();
  const docs = (await convex.query(api.communityNotes.list, {
    ownerAddress: ownerAddress?.trim() || undefined,
  })) as CommunityNoteDoc[];
  return docs.map(deserialize);
}

type CreateInput = {
  topic: string;
  summary: string;
  references: string[];
  ual: string;
  txHash?: string | null;
  dkgResponse?: unknown;
};

export async function createCommunityNote(
  ownerAddress: string,
  input: CreateInput,
) {
  const normalized = ownerAddress.trim();
  if (!normalized) {
    throw new Error("Owner address is required for Community Notes.");
  }

  const record: CommunityNoteRecord = {
    id: randomUUID(),
    ownerAddress: normalized,
    topic: input.topic.trim(),
    summary: input.summary.trim(),
    references: input.references.map((ref) => ref.trim()).filter(Boolean),
    ual: input.ual.trim(),
    txHash: input.txHash,
    createdAt: new Date().toISOString(),
    dkgResponse: input.dkgResponse,
  };

  const convex = getConvexClient();
  const inserted = (await convex.mutation(api.communityNotes.insert, {
    communityNoteId: record.id,
    ownerAddress: record.ownerAddress,
    topic: record.topic,
    summary: record.summary,
    references: record.references,
    ual: record.ual,
    txHash: record.txHash ?? undefined,
    createdAt: record.createdAt,
    dkgResponseJson:
      typeof record.dkgResponse !== "undefined"
        ? JSON.stringify(record.dkgResponse)
        : undefined,
  })) as CommunityNoteDoc | null;

  return inserted ? deserialize(inserted) : record;
}
