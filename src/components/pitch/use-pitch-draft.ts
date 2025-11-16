"use client";

import { useCallback, useEffect, useState } from "react";
import type { PitchTeamMember, PitchWizardDraft } from "@/types/pitch";

const STORAGE_KEY = "veriventure:pitch-draft";

const emptyDraft: PitchWizardDraft = {
  startupName: "",
  industry: "",
  features: "",
  problems: "",
  solutions: "",
  competitions: "",
  scope: "",
  moreInfo: "",
  brandColor: "#111827",
  businessModel: "",
  slides: [],
  imageStrategy: "manual",
  team: [
    {
      id: "founder-1",
      name: "",
      role: "",
      expertise: "",
    },
  ],
};

export function usePitchDeckDraft() {
  const [draft, setDraft] = useState<PitchWizardDraft>(() => {
    if (typeof window === "undefined") {
      return emptyDraft;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyDraft;
    try {
      const parsed = JSON.parse(stored) as PitchWizardDraft;
      return { ...emptyDraft, ...parsed };
    } catch {
      return emptyDraft;
    }
  });
  const ready = typeof window !== "undefined";

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

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
          expertise: "",
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
