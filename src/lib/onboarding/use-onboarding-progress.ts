"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type OnboardingStep =
  | "walletConnected"
  | "firstAchievementMinted"
  | "firstNotePublished"
  | "firstDeckGenerated"
  | "verifyShared";

export type OnboardingProgress = Record<OnboardingStep, boolean>;

const STORAGE_KEY = "veriventure:onboarding:v1";
const DIALOG_KEY = "veriventure:onboarding:intro";
const EVENT_KEY = "veriventure:onboarding:update";

const DEFAULT_PROGRESS: OnboardingProgress = {
  walletConnected: false,
  firstAchievementMinted: false,
  firstNotePublished: false,
  firstDeckGenerated: false,
  verifyShared: false,
};

function readStoredProgress(): OnboardingProgress {
  if (typeof window === "undefined") {
    return DEFAULT_PROGRESS;
  }
  try {
    const payload = window.localStorage.getItem(STORAGE_KEY);
    if (!payload) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(payload) as Partial<OnboardingProgress>;
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

function emitUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT_KEY));
}

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress>(() =>
    readStoredProgress(),
  );
  const [dialogSeen, setDialogSeen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DIALOG_KEY) === "1";
  });
  const hydrated = typeof window !== "undefined";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () => {
      setProgress(readStoredProgress());
      setDialogSeen(window.localStorage.getItem(DIALOG_KEY) === "1");
    };
    const storageHandler = (event: StorageEvent) => {
      if (!event.key) return;
      if (event.key === STORAGE_KEY || event.key === DIALOG_KEY) {
        handle();
      }
    };

    window.addEventListener(EVENT_KEY, handle);
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener(EVENT_KEY, handle);
      window.removeEventListener("storage", storageHandler);
    };
  }, []);

  const persist = useCallback((next: OnboardingProgress) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emitUpdate();
  }, []);

  const mark = useCallback(
    (step: OnboardingStep) => {
      setProgress((prev) => {
        if (prev[step]) return prev;
        const next = { ...prev, [step]: true };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  const dialogOpen = useMemo(
    () => progress.walletConnected && !dialogSeen,
    [progress.walletConnected, dialogSeen],
  );

  const toggleDialog = useCallback((open: boolean) => {
    if (!open && typeof window !== "undefined") {
      window.localStorage.setItem(DIALOG_KEY, "1");
      setDialogSeen(true);
      emitUpdate();
    }
  }, []);

  return {
    progress,
    mark,
    hydrated,
    dialogOpen,
    setDialogOpen: toggleDialog,
  };
}
