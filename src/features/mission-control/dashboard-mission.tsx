"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Share2 } from "lucide-react";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type DashboardMissionProps = {
  address?: string | null;
  className?: string;
};

type MissionStep = {
  key: string;
  label: string;
  complete: boolean;
  action: () => void | Promise<void>;
  disabled?: boolean;
};

export function DashboardMission({ address, className }: DashboardMissionProps) {
  const router = useRouter();
  const { progress, mark } = useOnboardingProgress();
  const [shareStatus, setShareStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  const shareUrl = useMemo(() => {
    const handle = address?.trim();
    if (typeof window === "undefined" || !handle) return "";
    const origin = window.location.origin;
    return `${origin}/verify/${encodeURIComponent(handle)}`;
  }, [address]);

  const steps = useMemo<MissionStep[]>(
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
        disabled: !shareUrl,
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
      }
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
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-5 shadow-lg",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.12),transparent_55%)]" />
      <div className="relative space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Mission Control
            </p>
            <p className="text-sm text-muted-foreground">
              Track your wallet-only progress across VeriVenture
            </p>
          </div>
          {shareStatus !== "idle" && (
            <Badge
              variant={shareStatus === "error" ? "destructive" : "secondary"}
              className="shrink-0"
            >
              {shareStatus === "error" ? "Clipboard blocked" : "Link copied"}
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {steps.map((step) => (
            <button
              key={step.key}
              type="button"
              onClick={() => {
                if (!step.disabled) {
                  step.action();
                }
              }}
              disabled={step.disabled}
              className={cn(
                "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                step.complete
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/60 dark:bg-emerald-400/10 dark:text-emerald-200"
                  : "border-border/70 text-muted-foreground hover:border-primary/60 hover:text-primary",
                step.disabled && "cursor-not-allowed opacity-60",
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
      </div>
    </div>
  );
}
