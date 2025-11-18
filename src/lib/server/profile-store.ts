"use server";

import { listAchievements } from "@/lib/server/achievement-store";
import { listCommunityNotes } from "@/lib/server/community-note-store";
import type { AchievementRecord } from "@/types/achievement";
import type { CommunityNoteRecord } from "@/types/community-note";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { isAddress, getAddress } from "viem";

export type PublicProfile = {
  handle: string;
  display: string;
  address: string;
  bio?: string;
  website?: string;
  achievements: AchievementRecord[];
  notes: CommunityNoteRecord[];
};

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
    };
  }

  const slug = normalized.toLowerCase();

  // Try to fetch from Convex handles table first
  try {
    const handleData = await fetchQuery(api.handles.getHandleByHandle, {
      handle: slug,
    });

    if (handleData) {
      // Found a handle in Convex, use the ownerAddress to fetch proofs
      const achievements = await listAchievements(handleData.ownerAddress);
      const notes = await listCommunityNotes(handleData.ownerAddress);

      return {
        handle: handleData.handle,
        display: handleData.displayName || handleData.handle,
        address: handleData.ownerAddress,
        bio: handleData.bio,
        website: handleData.website,
        achievements,
        notes,
      };
    }
  } catch (error) {
    console.error("Error fetching handle from Convex:", error);
  }

  // Check if the input is a wallet address
  if (isAddress(normalized)) {
    try {
      const checksummedAddress = getAddress(normalized);

      // Try to find a handle for this address
      const handleData = await fetchQuery(api.handles.getHandleByAddress, {
        ownerAddress: checksummedAddress,
      });

      if (handleData) {
        const achievements = await listAchievements(handleData.ownerAddress);
        const notes = await listCommunityNotes(handleData.ownerAddress);

        return {
          handle: handleData.handle,
          display: handleData.displayName || handleData.handle,
          address: handleData.ownerAddress,
          bio: handleData.bio,
          website: handleData.website,
          achievements,
          notes,
        };
      }

      // No handle found, but still show achievements for the address
      const achievements = await listAchievements(checksummedAddress);
      const notes = await listCommunityNotes(checksummedAddress);

      return {
        handle: "",
        display: checksummedAddress,
        address: checksummedAddress,
        achievements,
        notes,
      };
    } catch (error) {
      console.error("Error processing address:", error);
    }
  }

  // Not a valid handle or address - return empty profile
  return {
    handle: "",
    display: normalized,
    address: "",
    achievements: [],
    notes: [],
  };
}