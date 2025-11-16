"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, ExternalLink, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";
import { cn } from "@/lib/utils";

type DashboardMissionProps = {
  address?: string | null;
};

export function DashboardMission({ address }: DashboardMissionProps) {
  const router = useRouter();
  const { progress, mark } = useOnboardingProgress();
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    const handle = address?.trim() || "demo";
    return `${origin}/verify/${handle}`;
  }, [address]);

  const steps = useMemo(
    () => [
      {
        key: "walletConnected",
        label: "Connect wallet",
        complete: progress.walletConnected,
        action: () => router.push("/"),
      },
      {
        key: "firstAchievementMinted",
        label: "Mint achievement",
        complete: progress.firstAchievementMinted,
        action: () => router.push("/credentials"),
      },
      {
        key: "firstNotePublished",
        label: "Publish Community Note",
        complete: progress.firstNotePublished,
        action: () => router.push("/ai-assistant/truth"),
      },
      {
        key: "firstDeckGenerated",
        label: "Create pitch deck",
        complete: progress.firstDeckGenerated,
        action: () => router.push("/ai-assistant/pitch-deck"),
      },
      {
        key: "verifyShared",
        label: "Share Verify link",
        complete: progress.verifyShared,
        action: async () => {
          if (!shareUrl || typeof navigator === "undefined") return;
          if (!navigator.clipboard) {
            setShareStatus("error");
            setTimeout(() => setShareStatus("idle"), 2500);
            return;
          }
          try {
            await navigator.clipboard.writeText(shareUrl);
            setShareStatus("copied");
            mark("verifyShared");
            setTimeout(() => setShareStatus("idle"), 2500);
          } catch {
            setShareStatus("error");
            setTimeout(() => setShareStatus("idle"), 2500);
          }
        },
      },
    ],
    [
      progress.walletConnected,
      progress.firstAchievementMinted,
      progress.firstNotePublished,
      progress.firstDeckGenerated,
      progress.verifyShared,
      router,
      shareUrl,
      mark,
    ],
  );

  return (
    <div className="sticky top-4 z-20 mb-8 rounded-2xl border bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Mission Control
          </span>
          {steps.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => step.action()}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium hover:border-primary/50 hover:text-primary",
                step.complete
                  ? "border-emerald-200 text-emerald-700"
                  : "border-border text-muted-foreground",
              )}
            >
              {step.complete ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : step.key === "verifyShared" ? (
                <Share2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              {step.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {shareStatus === "copied" && (
            <span className="text-xs font-semibold text-emerald-600">
              Link copied
            </span>
          )}
          {shareStatus === "error" && (
            <span className="text-xs font-semibold text-destructive">
              Clipboard blocked
            </span>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/verify/demo")}
          >
            Demo Flight
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
