"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type CoachmarkProps = {
  id: string;
  targetId: string;
  text: string;
  active?: boolean;
  className?: string;
  offset?: number;
};

const KEY_PREFIX = "veriventure:coachmark:";

export function Coachmark({
  id,
  targetId,
  text,
  active = true,
  className,
  offset = 8,
}: CoachmarkProps) {
  const storageKey = useMemo(() => `${KEY_PREFIX}${id}`, [id]);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return Boolean(window.localStorage.getItem(storageKey));
  });
  const [rect, setRect] = useState<DOMRect | null>(null);

  const visible = active && !dismissed;

  useEffect(() => {
    if (!visible || typeof window === "undefined") return;
    const updatePosition = () => {
      const anchor = document.getElementById(targetId);
      if (!anchor) {
        setRect(null);
        return;
      }
      setRect(anchor.getBoundingClientRect());
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [targetId, visible]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(storageKey, "1");
    }
  }, [storageKey]);

  if (!visible || !rect) {
    return null;
  }

  const left = Math.min(
    rect.left,
    typeof window !== "undefined" ? window.innerWidth - 280 : rect.left,
  );
  const top = rect.bottom + offset;

  return createPortal(
    <div
      className={cn(
        "fixed z-50 w-64 rounded-xl border border-border/70 bg-background p-4 shadow-2xl shadow-black/15",
        className,
      )}
      style={{ top, left }}
    >
      <div className="flex items-start gap-2">
        <p className="text-sm text-foreground">{text}</p>
        <button
          type="button"
          className="text-muted-foreground hover:text-foreground"
          onClick={dismiss}
          aria-label="Dismiss coachmark"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>,
    document.body,
  );
}
