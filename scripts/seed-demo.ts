#!/usr/bin/env tsx

import { randomUUID } from "node:crypto";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { computeAchievementHash } from "../src/lib/achievement-hash";
import type { AchievementPayload } from "../src/types/achievement";

type DemoAchievement = {
  payload: AchievementPayload;
  txHash: string;
  impactArea: string;
  evidenceUrl: string;
  createdOffsetHours: number;
};

const FALLBACK_ADDRESS = "5FHdemoVeriVenture0000000000000000000000000000";

function resolveConvexUrl(): string {
  const candidates = [
    process.env.CONVEX_URL,
    process.env.CONVEX_DEPLOYMENT_URL,
    process.env.NEXT_PUBLIC_CONVEX_URL,
  ];
  const url = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
  if (!url) {
    throw new Error(
      "Set CONVEX_URL (recommended) or NEXT_PUBLIC_CONVEX_URL before running seed:demo.",
    );
  }
  const normalized = url.trim();
  if (normalized.startsWith("dev:")) {
    return process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:8000";
  }
  if (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://")
  ) {
    return normalized;
  }
  throw new Error(
    `Unsupported Convex URL "${normalized}". Provide https://... or dev: identifier.`,
  );
}

function buildAchievements(): DemoAchievement[] {
  return [
    {
      payload: {
        title: "Unlocked $45K ARR with 8 climate finance pilots",
        summary:
          "Converted GrokGov pilot data into Moonbase proofs so lenders can trust SME carbon data. Anchored Grokipedia divergences to the DKG for reviewers.",
        metrics: "MRR: $3.7K · CAC: $410 · Retention: 93%",
        evidenceUrl: "https://demo.veriventure.xyz/arr-dashboard",
        impactArea: "SME climate finance",
      },
      txHash:
        "0x6d06d286489ad1992691baab1190b483fcd124be274a105c398761366b56b90d",
      createdOffsetHours: 24 * 5,
      impactArea: "SME climate finance",
      evidenceUrl: "https://demo.veriventure.xyz/arr-dashboard",
    },
    {
      payload: {
        title: "OriginTrail Community Note pipeline live in 48h",
        summary:
          "Launched a crawler that diffs Wikipedia vs Grokipedia, then ships notarized climate notes to OriginTrail and the Verify surface automatically.",
        metrics: "Notes published: 14 · Median cosine delta: 0.31",
        evidenceUrl: "https://demo.veriventure.xyz/note-publisher",
        impactArea: "DKG trust automation",
      },
      txHash:
        "0x6bd74a956e166f66988a6f4e449ca382d9033ed3d784e0b7c22fea504c5ba60d",
      createdOffsetHours: 24 * 2,
      impactArea: "DKG trust automation",
      evidenceUrl: "https://demo.veriventure.xyz/note-publisher",
    },
  ];
}

function buildCommunityNotes() {
  return [
    {
      topic: "Climate finance verification claims",
      summary:
        "Similarity 0.62: Grokipedia omits SME credit pilots cited on Wikipedia. Added OriginTrail pointer so partners can recompute the badge hash.",
      references: [
        "https://en.wikipedia.org/wiki/Climate_finance",
        "https://grokipedia.ai/climate-finance",
      ],
      ual: "did:dkg:demo:climate-proof",
      offsetHours: 20,
    },
    {
      topic: "Community Note automation",
      summary:
        "Automated Grokipedia diffs push JSON-LD directly to the DKG so every badge has a provenance twin. Viewers can audit hashes without leaving the page.",
      references: [
        "https://docs.veriventure.xyz/dkg",
        "https://origintrail.io/",
      ],
      ual: "did:dkg:demo:automation",
      offsetHours: 3,
    },
  ];
}

async function seedDemo() {
  const url = resolveConvexUrl();
  const ownerAddress =
    process.env.DEMO_OWNER_ADDRESS?.trim() || FALLBACK_ADDRESS;
  const client = new ConvexHttpClient(url);

  console.log(`Seeding demo data for ${ownerAddress} @ ${url}`);

  const existingAchievements = (await client.query(api.achievements.list, {
    ownerAddress,
  })) as Array<unknown>;
  if (existingAchievements.length > 0) {
    console.log(
      `Found ${existingAchievements.length} existing achievements. Skipping achievement seed.`,
    );
  } else {
    for (const achievement of buildAchievements()) {
      const hash = computeAchievementHash(achievement.payload);
      await client.mutation(api.achievements.insert, {
        achievementId: randomUUID(),
        ownerAddress,
        title: achievement.payload.title,
        summary: achievement.payload.summary,
        metrics: achievement.payload.metrics,
        evidenceUrl: achievement.payload.evidenceUrl,
        impactArea: achievement.payload.impactArea,
        hash,
        hashAlgorithm: "blake2b256",
        createdAt: new Date(
          Date.now() - achievement.createdOffsetHours * 60 * 60 * 1000,
        ).toISOString(),
        txHash: achievement.txHash,
        network: "Westend testnet",
        contractAddress: "5CLBadgeContract111111111111111111111111111",
      });
    }
    console.log("Seeded demo achievements.");
  }

  const existingNotes = (await client.query(api.communityNotes.list, {
    ownerAddress,
  })) as Array<unknown>;
  if (existingNotes.length > 0) {
    console.log(
      `Found ${existingNotes.length} community notes. Skipping note seed.`,
    );
  } else {
    for (const note of buildCommunityNotes()) {
      await client.mutation(api.communityNotes.insert, {
        communityNoteId: randomUUID(),
        ownerAddress,
        topic: note.topic,
        summary: note.summary,
        references: note.references,
        ual: note.ual,
        createdAt: new Date(
          Date.now() - note.offsetHours * 60 * 60 * 1000,
        ).toISOString(),
      });
    }
    console.log("Seeded demo community notes.");
  }

  console.log("Demo dataset ready. Visit /verify/demo to preview.");
}

seedDemo().catch((error) => {
  console.error("Unable to seed demo data:", error);
  process.exitCode = 1;
});
