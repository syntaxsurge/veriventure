"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";

export function OnboardingDialog() {
  const router = useRouter();
  const { dialogOpen, setDialogOpen, progress } = useOnboardingProgress();

  if (!progress.walletConnected) {
    return null;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle>Mission briefing</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Your wallet is live. Complete these proof loops to finish setup:</p>
          <ol className="list-decimal space-y-1 pl-5 text-foreground">
            <li>Mint your first achievement badge on-chain.</li>
            <li>Publish a Community Note to the OriginTrail DKG.</li>
            <li>Generate a pitch deck that reuses the same evidence.</li>
          </ol>
        </div>
        <DialogFooter className="gap-2">
          <Button
            onClick={() => {
              setDialogOpen(false);
              router.push("/credentials");
            }}
          >
            Start with achievements
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setDialogOpen(false);
              router.push("/ai-assistant/truth");
            }}
          >
            Jump to Truth Lab
          </Button>
          <Button
            variant="ghost"
            onClick={() => setDialogOpen(false)}
          >
            Explore dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
