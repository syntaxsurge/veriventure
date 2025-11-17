"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccount } from "wagmi";
import { AppShellClient } from "@/components/layout/app-shell.client";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ClaimHandleDialog } from "@/components/profile/claim-handle-dialog";
import { ShieldCheck, ExternalLink, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PassportPage() {
  const { address } = useAccount();
  const router = useRouter();

  const [claimHandleOpen, setClaimHandleOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");

  const userHandle = useQuery(
    api.handles.getHandleByAddress,
    address ? { ownerAddress: address } : "skip"
  );

  const updateHandle = useMutation(api.handles.updateHandle);

  // Pre-fill form if handle exists
  useState(() => {
    if (userHandle) {
      setDisplayName(userHandle.displayName || "");
      setBio(userHandle.bio || "");
      setWebsite(userHandle.website || "");
    }
  });

  const handleSave = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!userHandle) {
      toast.error("Please claim a handle first");
      setClaimHandleOpen(true);
      return;
    }

    try {
      await updateHandle({
        ownerAddress: address,
        displayName: displayName || undefined,
        bio: bio || undefined,
        website: website || undefined,
      });

      toast.success("Supplier Passport updated successfully!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update passport");
    }
  };

  const handleClaimSuccess = (handle: string) => {
    toast.success(`Handle @${handle} claimed! Now complete your passport.`);
    setClaimHandleOpen(false);
  };

  if (!address) {
    return (
      <AppShellClient sidebar maxWidth="5xl">
        <div className="section-spacing animate-in">
          <PageHeader
            title="Supplier Passport"
            description="Your public trust profile for buyers and investors"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Supplier Passport" },
            ]}
          >
            <Badge variant="secondary">Trust Layer</Badge>
          </PageHeader>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to create your Supplier Passport.
            </AlertDescription>
          </Alert>
        </div>
      </AppShellClient>
    );
  }

  return (
    <>
      <AppShellClient sidebar maxWidth="5xl">
        <div className="section-spacing animate-in space-y-8">
          <PageHeader
            title="Supplier Passport"
            description="Your public trust profile for buyers and investors"
            breadcrumbs={[
              { label: "Home", href: "/" },
              { label: "Supplier Passport" },
            ]}
          >
            <Badge variant="secondary">Trust Layer</Badge>
          </PageHeader>

          {/* Why This Matters */}
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Why a Supplier Passport matters:</strong> Buyers and investors need a single,
              verifiable page to check your claims. This profile shows featured proofs with clickable
              "View on DKG" buttons—so partners trust you instantly.
            </AlertDescription>
          </Alert>

          {/* Handle Status */}
          {!userHandle ? (
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardTitle>Step 1: Claim Your @handle</CardTitle>
                <CardDescription>
                  Pick a human-readable handle like @acme for your Public Trust Profile
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button onClick={() => setClaimHandleOpen(true)} size="lg">
                  Claim handle
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-2 border-green-200 bg-green-50/50 dark:border-green-900/50 dark:bg-green-900/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      Handle Claimed
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Your public link: <code className="text-sm">@{userHandle.handle}</code>
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/verify/${userHandle.handle}`} target="_blank">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View public profile
                    </Link>
                  </Button>
                </div>
              </CardHeader>
            </Card>
          )}

          {/* Profile Form */}
          {userHandle && (
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Complete Your Profile</CardTitle>
                <CardDescription>
                  Add details to help buyers and investors understand who you are
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name (optional)</Label>
                  <Input
                    id="displayName"
                    placeholder="Acme Inc."
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your company or personal name as it should appear publicly
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio / Tagline (optional)</Label>
                  <Textarea
                    id="bio"
                    placeholder="We build sustainable solar solutions for emerging markets"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    A brief description of your business or work
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://acme.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your company website or portfolio
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} size="lg">
                  Save Passport
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Next Steps */}
          {userHandle && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Step 3: Add Verifiable Proofs</CardTitle>
                <CardDescription>
                  Create invoices, publish truth notes, and feature proofs on your profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button asChild variant="outline">
                    <Link href="/invoices/new">Create an invoice</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/ai-assistant/truth">Publish a truth note</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/ai-assistant/pitch-deck">Generate a pitch deck</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/proofs">Manage featured proofs</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppShellClient>

      <ClaimHandleDialog
        open={claimHandleOpen}
        onOpenChange={setClaimHandleOpen}
        onSuccess={handleClaimSuccess}
      />
    </>
  );
}
