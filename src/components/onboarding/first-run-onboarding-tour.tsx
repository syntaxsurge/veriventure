"use client";

import { useEffect, useState } from "react";
import Joyride, { CallBackProps, STATUS, Step } from "react-joyride";
import { useQuery, useMutation } from "convex/react";
import { useAccount } from "wagmi";
import { api } from "@convex/_generated/api";

const tourSteps: Step[] = [
  {
    target: '[data-tour="create-invoice"]',
    content: (
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <p className="font-bold text-base">Welcome! Let's explore VeriVenture</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="p-1 rounded-md bg-yellow-500/10 mt-0.5">
              <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-sm">Create Invoices</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Get paid with on-chain invoices and automatic receipt proofs
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pl-1">
            This tour will show you the key features to get started.
          </p>
        </div>
      </div>
    ),
    placement: "right",
    disableBeacon: true,
  },
  {
    target: '[data-tour="proofs"]',
    content: (
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-500/10">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="font-bold text-base">Proofs & Audit Log</p>
        </div>
        <p className="text-sm leading-relaxed">
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
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-green-500/10">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="font-bold text-base">Supplier Passport</p>
        </div>
        <p className="text-sm leading-relaxed">
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
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-purple-500/10">
            <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <p className="font-bold text-base">Claim Checker (Truth Alignment)</p>
        </div>
        <p className="text-sm leading-relaxed">
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
      <div className="space-y-3 p-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-pink-500/10">
            <svg className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="font-bold text-base">AI Tools</p>
        </div>
        <p className="text-sm leading-relaxed">
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
      <div className="space-y-4 p-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-green-500/10">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold">You're all set!</h2>
        </div>
        <p className="text-sm leading-relaxed">
          Complete the quick start checklist on your dashboard to get the most out of
          VeriVenture.
        </p>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs font-medium">
            💡 Tip: Press <kbd className="rounded bg-muted border px-2 py-1 text-xs font-mono">Cmd+K</kbd> or click the
            Help button anytime for quick actions.
          </p>
        </div>
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
          backgroundColor: "hsl(var(--card))",
          arrowColor: "hsl(var(--card))",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.7)",
        },
        spotlight: {
          borderRadius: "0.75rem",
        },
        tooltip: {
          borderRadius: "1rem",
          padding: "0",
          backgroundColor: "hsl(var(--card))",
          border: "3px solid hsl(var(--border))",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          maxWidth: "520px",
          opacity: "1",
        },
        tooltipContainer: {
          textAlign: "left",
          backgroundColor: "hsl(var(--card))",
        },
        tooltipContent: {
          padding: "1.5rem",
          paddingBottom: "1rem",
          backgroundColor: "hsl(var(--card))",
          color: "hsl(var(--card-foreground))",
        },
        tooltipFooter: {
          padding: "1rem 1.5rem",
          marginTop: "0",
          borderTop: "2px solid hsl(var(--border))",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "hsl(var(--card))",
        },
        tooltipFooterSpacer: {
          flex: "1",
        },
        buttonNext: {
          backgroundColor: "hsl(var(--primary))",
          color: "hsl(var(--primary-foreground))",
          borderRadius: "0.5rem",
          padding: "0.625rem 1.25rem",
          fontSize: "0.875rem",
          fontWeight: "600",
          border: "none",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          cursor: "pointer",
        },
        buttonBack: {
          color: "hsl(var(--foreground))",
          marginRight: "0.5rem",
          padding: "0.625rem 1.25rem",
          fontSize: "0.875rem",
          fontWeight: "600",
          borderRadius: "0.5rem",
          border: "2px solid hsl(var(--border))",
          backgroundColor: "hsl(var(--card))",
          cursor: "pointer",
        },
        buttonSkip: {
          color: "hsl(var(--muted-foreground))",
          fontSize: "0.875rem",
          padding: "0.5rem 0.75rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        },
        buttonClose: {
          display: "none",
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
