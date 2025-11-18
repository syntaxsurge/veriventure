"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAccount } from "wagmi";
import { api } from "@convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  checkComplete: () => boolean;
};

export function QuickStartChecklist() {
  const { address } = useAccount();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return localStorage.getItem("vv_checklist_dismissed") === "true";
  });

  const userProfile = useQuery(
    api.userProfiles.getUserProfile,
    address ? { ownerAddress: address } : "skip"
  );

  const achievements = useQuery(
    api.achievements.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  const invoices = useQuery(
    api.invoices.getByIssuer,
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
      id: "mint-badge",
      label: "Mint your first badge",
      description: "Create a verifiable credential in Credentials Studio",
      href: "/credentials",
      checkComplete: () => (achievements?.length ?? 0) > 0,
    },
    {
      id: "create-invoice",
      label: "Create your first invoice",
      description: "Get paid with an on-chain invoice",
      href: "/invoices/new",
      checkComplete: () => (invoices?.length ?? 0) > 0,
    },
    {
      id: "claim-handle",
      label: "Claim your @handle",
      description: "Get a human-readable public profile URL",
      href: "/passport",
      checkComplete: () => !!handle,
    },
    {
      id: "generate-deck",
      label: "Generate a pitch deck",
      description: "AI-powered investor materials",
      href: "/ai-assistant/pitch-deck",
      checkComplete: () => (pitchDecks?.length ?? 0) > 0,
    },
    {
      id: "publish-truth-note",
      label: "Publish a truth note",
      description: "Turn claims into verifiable DKG proofs",
      href: "/ai-assistant/truth",
      checkComplete: () => (communityNotes?.length ?? 0) > 0,
    },
    {
      id: "share-verify-link",
      label: "Share your verify link",
      description: "Send your public Supplier Passport to a buyer or investor",
      href: handle ? `/verify/${handle.handle}` : "/passport",
      checkComplete: () =>
        ((invoices?.length ?? 0) > 0 || (communityNotes?.length ?? 0) > 0) && !!handle,
    },
  ];

  const completedItems = checklistItems.filter((item) => item.checkComplete());
  const progress = (completedItems.length / checklistItems.length) * 100;
  const allComplete = completedItems.length === checklistItems.length;

  // Auto-mark items complete in backend
  useEffect(() => {
    if (!address || !userProfile) return;

    completedItems.forEach((item) => {
      if (!userProfile.checklistComplete.includes(item.id)) {
        completeChecklistItem({
          ownerAddress: address,
          itemId: item.id,
        }).catch(console.error);
      }
    });
  }, [address, userProfile, completedItems, completeChecklistItem]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("vv_checklist_dismissed", "true");
  };

  const handleResume = () => {
    setDismissed(false);
    localStorage.removeItem("vv_checklist_dismissed");
  };

  if (!address) return null;

  // If all complete, don't show at all
  if (allComplete) return null;

  // If dismissed, show compact "Resume" button
  if (dismissed) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Quick Start Guide</p>
              <p className="text-xs text-muted-foreground">
                {completedItems.length} of {checklistItems.length} complete
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleResume}>
              Resume checklist
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-background">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">Quick Start Guide</CardTitle>
            <CardDescription>
              Complete these steps to get the most out of VeriVenture
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {completedItems.length} of {checklistItems.length} complete
            </span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {checklistItems.map((item) => {
          const isComplete = item.checkComplete();
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-3 transition-all",
                isComplete
                  ? "border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10"
                  : "border-border hover:border-primary/50"
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
                <p className={cn("text-sm font-medium", isComplete && "line-through")}>
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {!isComplete && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={item.href}>Start</Link>
                </Button>
              )}
              {isComplete && (
                <Badge variant="secondary" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Done
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
