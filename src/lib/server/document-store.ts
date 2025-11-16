"use server";

import { randomUUID } from "node:crypto";
import { blake2b } from "@noble/hashes/blake2b";
import { bytesToHex } from "@noble/hashes/utils";
import { api, getConvexClient } from "@/lib/server/convex-client";
import type { DocumentRecord, DocumentType } from "@/types/document";

type DocumentDoc = {
  documentId: string;
  ownerAddress: string;
  type: DocumentType;
  title: string;
  summary: string;
  checksum: string;
  dataJson: string;
  createdAt: string;
};

function computeChecksum(payload: unknown) {
  const data = JSON.stringify(payload ?? {});
  const bytes = new TextEncoder().encode(data);
  const digest = blake2b(bytes, { dkLen: 32 });
  return `0x${bytesToHex(digest)}`;
}

function deserialize(doc: DocumentDoc): DocumentRecord {
  let parsed: DocumentRecord["data"] = {};
  try {
    parsed = JSON.parse(doc.dataJson);
  } catch {
    parsed = {};
  }

  return {
    id: doc.documentId,
    ownerAddress: doc.ownerAddress,
    type: doc.type,
    title: doc.title,
    summary: doc.summary,
    checksum: doc.checksum,
    data: parsed,
    createdAt: doc.createdAt,
  };
}

export async function listDocuments(address?: string | null) {
  const convex = getConvexClient();
  const ownerAddress = address?.trim() || undefined;
  const docs = (await convex.query(api.documents.list, {
    ownerAddress,
  })) as DocumentDoc[];
  return docs.map(deserialize);
}

type DocumentInput = {
  ownerAddress: string;
  type: DocumentType;
  title: string;
  summary: string;
  data: DocumentRecord["data"];
};

export async function createDocumentRecord(
  input: DocumentInput,
): Promise<DocumentRecord> {
  const normalizedOwner = input.ownerAddress.trim();
  if (!normalizedOwner) {
    throw new Error("Owner address is required for document creation.");
  }

  const timestamp = new Date().toISOString();
  const checksum = computeChecksum({
    type: input.type,
    title: input.title,
    data: input.data,
    timestamp,
  });

  const record: DocumentRecord = {
    id: randomUUID(),
    ownerAddress: normalizedOwner,
    type: input.type,
    title: input.title,
    summary: input.summary,
    data: input.data,
    checksum,
    createdAt: timestamp,
  };

  const convex = getConvexClient();
  const inserted = (await convex.mutation(api.documents.insert, {
    documentId: record.id,
    ownerAddress: record.ownerAddress,
    type: record.type,
    title: record.title,
    summary: record.summary,
    checksum: record.checksum,
    dataJson: JSON.stringify(record.data ?? {}),
    createdAt: record.createdAt,
  })) as DocumentDoc | null;

  return inserted ? deserialize(inserted) : record;
}
