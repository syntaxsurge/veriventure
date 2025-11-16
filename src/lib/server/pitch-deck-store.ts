"use server";

import { randomUUID } from "node:crypto";
import { api, getConvexClient } from "@/lib/server/convex-client";
import type {
  PitchBrandKit,
  PitchDeckRecord,
  PitchSlideRecord,
  PitchTeamMember,
} from "@/types/pitch";

type PitchDeckDoc = {
  deckId: string;
  ownerAddress: string;
  startupName: string;
  missionStatement: string;
  focusRegion: string;
  customerProfile: string;
  tractionSummary: string;
  goToMarket: string;
  teamJson: string;
  fundingPlan: string;
  brandColor: string;
  businessModel: string;
  slideTemplateIds: string[];
  imageStrategy: "manual" | "ai";
  status: "processing" | "completed";
  progress: number;
  summary: string;
  brandKitJson: string;
  slidesJson: string;
  createdAt: string;
  updatedAt: string;
};

function safeParse<T>(payload: string, fallback: T): T {
  try {
    return JSON.parse(payload) as T;
  } catch {
    return fallback;
  }
}

function mapDoc(doc: PitchDeckDoc): PitchDeckRecord {
  return {
    deckId: doc.deckId,
    ownerAddress: doc.ownerAddress,
    startupName: doc.startupName,
    missionStatement: doc.missionStatement,
    focusRegion: doc.focusRegion,
    customerProfile: doc.customerProfile,
    tractionSummary: doc.tractionSummary,
    goToMarket: doc.goToMarket,
    team: safeParse<PitchTeamMember[]>(doc.teamJson, []),
    fundingPlan: doc.fundingPlan,
    brandColor: doc.brandColor,
    businessModel: doc.businessModel,
    selectedSlideIds: doc.slideTemplateIds,
    imageStrategy: doc.imageStrategy,
    status: doc.status,
    progress: doc.progress,
    summary: doc.summary,
    brandKit: safeParse<PitchBrandKit>(doc.brandKitJson, {
      background: "#111827",
      title: "#FFFFFF",
      bullets: "#D1D5DB",
      note: "#9CA3AF",
    }),
    slides: safeParse<PitchSlideRecord[]>(doc.slidesJson, []),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function listPitchDecks(ownerAddress?: string | null) {
  if (!ownerAddress) return [];
  const convex = getConvexClient();
  const docs = (await convex.query(api.pitchDecks.list, {
    ownerAddress,
  })) as PitchDeckDoc[];
  return docs.map(mapDoc);
}

export async function getPitchDeck(deckId: string) {
  const convex = getConvexClient();
  const doc = (await convex.query(api.pitchDecks.getByDeckId, {
    deckId,
  })) as PitchDeckDoc | null;
  return doc ? mapDoc(doc) : null;
}

type CreateDeckInput = {
  startupName: string;
  missionStatement: string;
  focusRegion: string;
  customerProfile: string;
  tractionSummary: string;
  goToMarket: string;
  team: PitchTeamMember[];
  fundingPlan: string;
  brandColor: string;
  businessModel: string;
  slideTemplateIds: string[];
  imageStrategy: "manual" | "ai";
  summary: string;
  brandKit: PitchBrandKit;
  slides: PitchSlideRecord[];
};

export async function createPitchDeckRecord(
  ownerAddress: string,
  input: CreateDeckInput,
) {
  const nowIso = new Date().toISOString();
  const deckId = randomUUID();
  const convex = getConvexClient();
  const doc = (await convex.mutation(api.pitchDecks.insert, {
    deckId,
    ownerAddress,
    startupName: input.startupName,
    missionStatement: input.missionStatement,
    focusRegion: input.focusRegion,
    customerProfile: input.customerProfile,
    tractionSummary: input.tractionSummary,
    goToMarket: input.goToMarket,
    teamJson: JSON.stringify(input.team),
    fundingPlan: input.fundingPlan,
    brandColor: input.brandColor,
    businessModel: input.businessModel,
    slideTemplateIds: input.slideTemplateIds,
    imageStrategy: input.imageStrategy,
    status: "completed",
    progress: 100,
    summary: input.summary,
    brandKitJson: JSON.stringify(input.brandKit),
    slidesJson: JSON.stringify(input.slides),
    createdAt: nowIso,
    updatedAt: nowIso,
  })) as PitchDeckDoc | null;
  return doc ? mapDoc(doc) : null;
}

export async function updatePitchDeckSlides({
  deckId,
  slides,
  brandKit,
  summary,
  progress,
  status,
}: {
  deckId: string;
  slides: PitchSlideRecord[];
  brandKit?: PitchBrandKit;
  summary?: string;
  progress?: number;
  status?: PitchDeckRecord["status"];
}) {
  const convex = getConvexClient();
  const updated = (await convex.mutation(api.pitchDecks.patchDeck, {
    deckId,
    slidesJson: JSON.stringify(slides),
    brandKitJson: brandKit ? JSON.stringify(brandKit) : undefined,
    summary,
    progress,
    status,
    updatedAt: new Date().toISOString(),
  })) as PitchDeckDoc | null;
  return updated ? mapDoc(updated) : null;
}
