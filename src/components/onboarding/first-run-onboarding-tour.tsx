"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useQuery, useMutation } from "convex/react";
import { useAccount } from "wagmi";
import { api } from "@/convex/_generated/api";

const tourSteps: Step[] = [
  {
    target: "body",
    content: (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">Welcome to VeriVenture!</h2>
        <p className="text-sm">
          Your B2B Trust & Revenue OS. Get paid, get trusted, and get funded — with verifiable
          links buyers and investors can click to confirm.
        </p>
        <p className="text-xs text-muted-foreground">
          Let's take a quick tour of the key features.
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
        <p className="font-medium">Create Invoices</p>
        <p className="text-sm">
          Start here to get paid. Create an on-chain invoice, share a link, and receive payment
          with automatic receipt proofs.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="proofs"]',
    content: (
      <div className="space-y-2">
        <p className="font-medium">Proofs & Audit Log</p>
        <p className="text-sm">
          Every verifiable thing lives here—invoices, truth notes, credentials. Each has
          clickable "View in DKG" and "View on chain" buttons.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="passport"]',
    content: (
      <div className="space-y-2">
        <p className="font-medium">Supplier Passport</p>
        <p className="text-sm">
          Curate which proofs appear on your public profile. Get a clean @handle URL like
          /verify/@acme that you can share with buyers and investors.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="claim-checker"]',
    content: (
      <div className="space-y-2">
        <p className="font-medium">Claim Checker (Truth Alignment)</p>
        <p className="text-sm">
          Turn sensitive claims into verifiable DKG Truth Notes. Great for ISO certifications,
          ESG commitments, or "#1 in category" statements.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: '[data-tour="ai-tools"]',
    content: (
      <div className="space-y-2">
        <p className="font-medium">AI Tools</p>
        <p className="text-sm">
          Generate investor-ready pitch decks and business plans. You can attach your proofs to
          back traction claims.
        </p>
      </div>
    ),
    placement: "right",
  },
  {
    target: "body",
    content: (
      <div className="space-y-3">
        <h2 className="text-lg font-bold">You're all set!</h2>
        <p className="text-sm">
          Complete the quick start checklist on your dashboard to get the most out of
          VeriVenture.
        </p>
        <p className="text-xs text-muted-foreground">
          Press <kbd className="rounded border px-1 py-0.5 text-xs">Cmd+K</kbd> or click the
          Help button anytime for quick actions.
        </p>
      </div>
    ),
    placement: "center",
  },
];

export function FirstRunOnboardingTour() {
  const { address } = useAccount();
  const [run, setRun] = useState(false);

  const userProfile = useQuery(
    api.userProfiles.getUserProfile,
    address ? { ownerAddress: address } : "skip"
  );

  const completeFirstRun = useMutation(api.userProfiles.completeFirstRun);

  // Start tour if user hasn't completed it
  useEffect(() => {
    if (!address || !userProfile) return;

    // Check if first run is complete
    if (!userProfile.firstRunComplete) {
      // Delay slightly to ensure DOM is ready
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [address, userProfile]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status) && address) {
      completeFirstRun({ ownerAddress: address }).catch(console.error);
      setRun(false);
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      callback={handleJoyrideCallback}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "hsl(var(--primary))",
          textColor: "hsl(var(--foreground))",
          backgroundColor: "hsl(var(--background))",
          arrowColor: "hsl(var(--background))",
        },
        tooltip: {
          borderRadius: "0.5rem",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "0.375rem",
        },
        buttonBack: {
          color: "hsl(var(--muted-foreground))",
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
