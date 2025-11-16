"use server";

import { randomUUID } from "node:crypto";
import { getConvexClient } from "@/lib/server/convex-client";
import type { NoteInput, NoteRecord } from "@/types/note";

type ConvexCaller = {
  query: (name: string, args: unknown) => Promise<unknown>;
  mutation: (name: string, args: unknown) => Promise<unknown>;
};

function convexClient(): ConvexCaller {
  return getConvexClient() as unknown as ConvexCaller;
}

type NoteDoc = {
  noteId: string;
  ownerAddress: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

function deserialize(doc: NoteDoc): NoteRecord {
  return {
    id: doc.noteId,
    ownerAddress: doc.ownerAddress,
    title: doc.title,
    body: doc.body,
    tags: doc.tags,
    pinned: doc.pinned,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listNotes(ownerAddress?: string | null) {
  const normalized = ownerAddress?.trim();
  if (!normalized) {
    return [];
  }
  const convex = convexClient();
  const docs = (await convex.query("notes:list", {
    ownerAddress: normalized,
  })) as NoteDoc[];
  return docs.map(deserialize);
}

export async function createNote(ownerAddress: string, input: NoteInput) {
  const normalized = ownerAddress.trim();
  if (!normalized) {
    throw new Error("Owner address is required for note creation.");
  }

  const timestamp = new Date().toISOString();
  const payload = {
    noteId: randomUUID(),
    ownerAddress: normalized,
    title: input.title.trim(),
    body: input.body.trim(),
    tags: Array.isArray(input.tags)
      ? input.tags.map((tag) => tag.trim()).filter(Boolean)
      : [],
    pinned: Boolean(input.pinned),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  const convex = convexClient();
  const inserted = (await convex.mutation(
    "notes:create",
    payload,
  )) as NoteDoc | null;

  const doc = inserted ?? payload;
  return deserialize(doc);
}

export async function updateNote(
  ownerAddress: string,
  noteId: string,
  updates: Partial<NoteInput>,
) {
  const normalized = ownerAddress.trim();
  if (!normalized) {
    throw new Error("Owner address is required for note updates.");
  }
  const convex = convexClient();
  const payload = {
    ownerAddress: normalized,
    noteId,
    title: typeof updates.title === "string" ? updates.title.trim() : undefined,
    body: typeof updates.body === "string" ? updates.body.trim() : undefined,
    tags: Array.isArray(updates.tags)
      ? updates.tags.map((tag) => tag.trim()).filter(Boolean)
      : undefined,
    pinned: typeof updates.pinned === "boolean" ? updates.pinned : undefined,
    updatedAt: new Date().toISOString(),
  };

  const updated = (await convex.mutation(
    "notes:update",
    payload,
  )) as NoteDoc | null;
  if (!updated) {
    throw new Error("Note not found.");
  }
  return deserialize(updated);
}

export async function deleteNote(ownerAddress: string, noteId: string) {
  const normalized = ownerAddress.trim();
  if (!normalized) {
    throw new Error("Owner address is required for note deletion.");
  }
  const convex = convexClient();
  await convex.mutation("notes:remove", {
    ownerAddress: normalized,
    noteId,
  });
  return true;
}
