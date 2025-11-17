"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccount } from "wagmi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  checkComplete: () => boolean;
}

export function OnboardingChecklist() {
  const { address } = useAccount();
  const [dismissed, setDismissed] = useState(false);

  const userProfile = useQuery(
    api.userProfiles.getUserProfile,
    address ? { ownerAddress: address } : "skip"
  );

  const invoices = useQuery(
    api.invoices.getIssuerInvoices,
    address ? { issuerAddress: address } : "skip"
  );

  const handle = useQuery(
    api.handles.getHandleByAddress,
    address ? { ownerAddress: address } : "skip"
  );

  const pitchDecks = useQuery(
    api.pitchDecks.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  const communityNotes = useQuery(
    api.communityNotes.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  const completeChecklistItem = useMutation(api.userProfiles.completeChecklistItem);

  const checklistItems: ChecklistItem[] = [
    {
      id: "create-invoice",
      title: "Create an invoice",
      description: "Send a payment link and get a verifiable receipt",
      cta: "Create invoice",
      href: "/invoices/new",
      checkComplete: () => (invoices?.length ?? 0) > 0,
    },
    {
      id: "claim-handle",
      title: "Claim your @handle",
      description: "Get a human-readable link for your Public Trust Profile",
      cta: "Claim handle",
      href: "#claim-handle",
      checkComplete: () => Boolean(handle),
    },
    {
      id: "generate-deck",
      title: "Generate a pitch deck",
      description: "Create investor-ready materials with AI",
      cta: "Generate deck",
      href: "/ai-assistant/pitch-deck",
      checkComplete: () => (pitchDecks?.length ?? 0) > 0,
    },
    {
      id: "publish-truth-note",
      title: "Publish a Truth Note",
      description: "Verify a sensitive claim and publish to DKG",
      cta: "Check a claim",
      href: "/ai-assistant/truth",
      checkComplete: () => (communityNotes?.length ?? 0) > 0,
    },
    {
      id: "share-verify-link",
      title: "Share your verify link",
      description: "Show partners your clickable proofs",
      cta: "View proofs",
      href: "/proofs",
      checkComplete: () =>
        Boolean(
          ((invoices?.length ?? 0) > 0 || (communityNotes?.length ?? 0) > 0) && handle
        ),
    },
  ];

  const completedItems = checklistItems.filter((item) => item.checkComplete());
  const progress = (completedItems.length / checklistItems.length) * 100;

  // Mark items as complete in backend
  useEffect(() => {
    if (address && userProfile !== undefined) {
      completedItems.forEach((item) => {
        if (!userProfile?.checklistComplete.includes(item.id)) {
          completeChecklistItem({
            ownerAddress: address,
            itemId: item.id,
          }).catch(console.error);
        }
      });
    }
  }, [address, completedItems, userProfile, completeChecklistItem]);

  // Auto-hide after 2 items completed
  useEffect(() => {
    if (completedItems.length >= 2 && !dismissed) {
      const timer = setTimeout(() => setDismissed(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [completedItems.length, dismissed]);

  // Don't show if user has dismissed or completed >= 2 items (after auto-hide delay)
  if (!address || dismissed || (completedItems.length >= 2 && dismissed)) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle>Get Started with VeriVenture</CardTitle>
          <CardDescription>
            Complete these steps to unlock the full power of verifiable proofs
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {completedItems.length} of {checklistItems.length} completed
            </span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          {checklistItems.map((item) => {
            const isComplete = item.checkComplete();

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border-2 p-4 transition-all",
                  isComplete
                    ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="mt-0.5">
                  {isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold leading-none">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                {!isComplete && (
                  <Button asChild size="sm" variant="default">
                    <Link href={item.href}>{item.cta}</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
