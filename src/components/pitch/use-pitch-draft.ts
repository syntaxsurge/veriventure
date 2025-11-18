"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  ImageStrategy,
  PitchTeamMember,
  PitchWizardDraft,
} from "@/types/pitch";

const STORAGE_KEY = "veriventure:pitch-draft";

const emptyDraft: PitchWizardDraft = {
  startupName: "",
  missionStatement: "",
  focusRegion: "",
  customerProfile: "",
  tractionSummary: "",
  goToMarket: "",
  fundingPlan: "",
  brandColor: "#111827",
  businessModel: "",
  slides: [],
  imageStrategy: "manual" as ImageStrategy,
  team: [
    {
      id: "founder-1",
      name: "",
      role: "",
    },
  ],
};

export function usePitchDeckDraft() {
  const [draft, setDraft] = useState<PitchWizardDraft>(emptyDraft);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const loadDraft = async () => {
      if (cancelled) return;
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as PitchWizardDraft;
          if (!cancelled) {
            setDraft({ ...emptyDraft, ...parsed });
          }
        }
      } catch {
        if (!cancelled) {
          setDraft(emptyDraft);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    };
    void loadDraft();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft, ready]);

  const updateDraft = useCallback(
    (updates: Partial<PitchWizardDraft>) => {
      setDraft((previous) => ({ ...previous, ...updates }));
    },
    [setDraft],
  );

  const updateTeamMember = useCallback(
    (index: number, updates: Partial<PitchTeamMember>) => {
      setDraft((previous) => {
        const nextTeam = [...previous.team];
        nextTeam[index] = { ...nextTeam[index], ...updates };
        return { ...previous, team: nextTeam };
      });
    },
    [],
  );

  const addTeamMember = useCallback(() => {
    setDraft((previous) => ({
      ...previous,
      team: [
        ...previous.team,
        {
          id: `team-${previous.team.length + 1}`,
          name: "",
          role: "",
        },
      ],
    }));
  }, []);

  const removeTeamMember = useCallback((index: number) => {
    setDraft((previous) => {
      if (previous.team.length === 1) return previous;
      const nextTeam = previous.team.filter((_, idx) => idx !== index);
      return { ...previous, team: nextTeam };
    });
  }, []);

  const resetDraft = useCallback(() => {
    setDraft(emptyDraft);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    ready,
    draft,
    updateDraft,
    updateTeamMember,
    addTeamMember,
    removeTeamMember,
    resetDraft,
  };
}
