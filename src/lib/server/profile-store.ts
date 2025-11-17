"use server";

import { listAchievements } from "@/lib/server/achievement-store";
import { listCommunityNotes } from "@/lib/server/community-note-store";
import { computeAchievementHash } from "@/lib/achievement-hash";
import type { AchievementRecord } from "@/types/achievement";
import type { CommunityNoteRecord } from "@/types/community-note";

export type PublicProfile = {
  handle: string;
  display: string;
  address: string;
  achievements: AchievementRecord[];
  notes: CommunityNoteRecord[];
  isDemo: boolean;
};

const DEMO_HANDLE = "demo";
const DEMO_ADDRESS = "5FHdemoVeriVenture0000000000000000000000000000";

function buildDemoAchievements(): AchievementRecord[] {
  const baseContract = "5CLBadgeContract111111111111111111111111111";
  const network = "Westend testnet";
  const entries = [
    {
      id: "demo-achievement-1",
      payload: {
        title: "Unlocked $45K ARR with 8 climate finance pilots",
        summary:
          "Converted GrokGov pilot data into Moonbase proofs so lenders can trust SME carbon data. Anchored Grokipedia divergences to the DKG for reviewers.",
        metrics: "MRR: $3.7K · CAC: $410 · Retention: 93%",
        evidenceUrl: "https://demo.veriventure.xyz/arr-dashboard",
        impactArea: "SME climate finance",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      txHash:
        "0x6d06d286489ad1992691baab1190b483fcd124be274a105c398761366b56b90d",
    },
    {
      id: "demo-achievement-2",
      payload: {
        title: "OriginTrail Community Note pipeline live in 48h",
        summary:
          "Launched a crawler that diffs Wikipedia vs Grokipedia, then ships notarized climate notes to OriginTrail and the Verify surface automatically.",
        metrics: "Notes published: 14 · Median cosine delta: 0.31",
        evidenceUrl: "https://demo.veriventure.xyz/note-publisher",
        impactArea: "DKG trust automation",
      },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      txHash:
        "0x6bd74a956e166f66988a6f4e449ca382d9033ed3d784e0b7c22fea504c5ba60d",
    },
  ] as const;

  return entries.map((entry) => ({
    id: entry.id,
    ownerAddress: DEMO_ADDRESS,
    hash: computeAchievementHash(entry.payload),
    hashAlgorithm: "blake2b256",
    createdAt: entry.createdAt,
    txHash: entry.txHash,
    network,
    contractAddress: baseContract,
    ...entry.payload,
  }));
}

function buildDemoNotes(): CommunityNoteRecord[] {
  return [
    {
      id: "demo-note-1",
      ownerAddress: DEMO_ADDRESS,
      topic: "Climate finance verification claims",
      summary:
        "Similarity 0.62: Grokipedia omits SME credit pilots cited on Wikipedia. Added OriginTrail pointer so partners can recompute the badge hash.",
      references: [
        "https://en.wikipedia.org/wiki/Climate_finance",
        "https://grokipedia.ai/climate-finance",
      ],
      ual: "did:dkg:demo:climate-proof",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: "demo-note-2",
      ownerAddress: DEMO_ADDRESS,
      topic: "Community Note automation",
      summary:
        "Automated Grokipedia diffs push JSON-LD directly to the DKG so every badge has a provenance twin. Viewers can audit hashes without leaving the page.",
      references: [
        "https://docs.veriventure.xyz/dkg",
        "https://origintrail.io/",
      ],
      ual: "did:dkg:demo:automation",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
  ];
}

function buildDemoProfile(): PublicProfile {
  return {
    handle: DEMO_HANDLE,
    display: "Amina (Demo Flight)",
    address: DEMO_ADDRESS,
    achievements: buildDemoAchievements(),
    notes: buildDemoNotes(),
    isDemo: true,
  };
}

export async function fetchPublicProfile(
  handle: string,
): Promise<PublicProfile> {
  const normalized = handle.trim();
  if (!normalized) {
    return {
      handle: "",
      display: "",
      address: "",
      achievements: [],
      notes: [],
      isDemo: false,
    };
  }

  const slug = normalized.toLowerCase();
  if (slug === DEMO_HANDLE || slug === "demo-flight") {
    return buildDemoProfile();
  }

  const achievements = await listAchievements(normalized);
  const ownerAddress = achievements[0]?.ownerAddress ?? normalized;
  const notes = await listCommunityNotes(ownerAddress);

  return {
    handle: normalized,
    display: ownerAddress || normalized,
    address: ownerAddress,
    achievements,
    notes,
    isDemo: false,
  };
}
