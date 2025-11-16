"use client";

import { useCallback, useEffect, useState } from "react";
import type { AchievementRecord } from "@/types/achievement";

type ApiResponse = {
  achievements: AchievementRecord[];
};

export function useAchievements(ownerAddress?: string | null) {
  const [data, setData] = useState<AchievementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async (address?: string | null) => {
    if (!address) {
      setData([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams({ address });
      const response = await fetch(`/api/achievements?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Unable to fetch achievements");
      }
      const payload = (await response.json()) as ApiResponse;
      setData(payload.achievements);
    } catch (err) {
      const fallback = err instanceof Error ? err.message : "Unknown error";
      setError(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRecords(ownerAddress);
  }, [fetchRecords, ownerAddress]);

  return { achievements: data, loading, error, refresh: fetchRecords };
}
