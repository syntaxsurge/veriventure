"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccount } from "wagmi";

const TOUR_STEPS: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-2">
        <h3 className="font-semibold text-lg">Welcome to VeriVenture!</h3>
        <p>
          Let's take a quick tour to show you how to get paid, get trusted, and get funded with
          verifiable proofs.
        </p>
      </div>
    ),
    placement: "center",
    disableBeacon: true,
  },
  {
    target: '[data-tour="create-invoice"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Create your first invoice</h4>
        <p>
          Click "Invoices" to send a payment link and get a verifiable receipt. Automatic & on-chain.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="claim-handle"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Claim your @handle</h4>
        <p>
          Pick a human-readable handle like @acme so your Public Trust Profile has a clean, shareable
          link instead of a wallet address.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="ai-tools"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Generate investor materials</h4>
        <p>
          Under "AI Tools," build a pitch deck or business plan in minutes. Keep files private;
          publish signed summaries to DKG.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="claim-checker"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Verify sensitive claims</h4>
        <p>
          Use "Claim Checker" to compare your statements against sources and publish a verifiable
          Truth Note to the DKG—so partners can click to confirm.
        </p>
      </div>
    ),
    placement: "bottom",
  },
  {
    target: '[data-tour="proofs"]',
    content: (
      <div className="space-y-2">
        <h4 className="font-semibold">Share your verify link</h4>
        <p>
          Everything you publish appears under "Proofs" and your Public Trust Profile. Buyers and
          investors click "View on DKG" or "View transaction" to verify.
        </p>
      </div>
    ),
    placement: "bottom",
  },
];

export function FirstRunTour() {
  const { address } = useAccount();
  const [run, setRun] = useState(false);

  const userProfile = useQuery(
    api.userProfiles.getUserProfile,
    address ? { ownerAddress: address } : "skip"
  );

  const completeFirstRun = useMutation(api.userProfiles.completeFirstRun);

  useEffect(() => {
    // Only run tour if:
    // 1. User is connected
    // 2. Profile exists or can be created
    // 3. firstRunComplete is false
    if (address && userProfile !== undefined) {
      if (!userProfile || !userProfile.firstRunComplete) {
        // Small delay to let the UI settle
        const timer = setTimeout(() => setRun(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [address, userProfile]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) && address) {
      setRun(false);
      try {
        await completeFirstRun({ ownerAddress: address });
      } catch (error) {
        console.error("Failed to mark tour as complete:", error);
      }
    }
  };

  if (!address || !run) {
    return null;
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: "hsl(var(--popover))",
          backgroundColor: "hsl(var(--popover))",
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--popover-foreground))",
          zIndex: 10000,
        },
        tooltip: {
          backgroundColor: "hsl(var(--popover))",
          borderRadius: "8px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.35)",
          color: "hsl(var(--popover-foreground))",
          padding: "16px",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          borderRadius: "6px",
          padding: "8px 16px",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
          marginRight: "8px",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last: "Finish",
        next: "Next",
        skip: "Skip tour",
      }}
    />
  );
}
