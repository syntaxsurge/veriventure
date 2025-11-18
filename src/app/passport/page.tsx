"use client";

import { useEffect, useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ClaimHandleDialog } from "@/components/profile/claim-handle-dialog";
import { ChangeHandleDialog } from "@/components/profile/change-handle-dialog";
import { ShieldCheck, ExternalLink, Info, Sparkles, CheckCircle2, Pencil, FileText, Shield, Presentation, Star } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function PassportPage() {
  const { address } = useAccount();

  const [claimHandleOpen, setClaimHandleOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [changeHandleOpen, setChangeHandleOpen] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);

  const userHandle = useQuery(
    api.handles.getHandleByAddress,
    address ? { ownerAddress: address } : "skip"
  );

  const updateHandle = useMutation(api.handles.updateHandle);

  useEffect(() => {
    if (!userHandle) {
      return;
    }
    const timeout = window.setTimeout(() => {
      setDisplayName(userHandle.displayName || "");
      setBio(userHandle.bio || "");
      setWebsite(userHandle.website || "");
      if (
        !userHandle.displayName &&
        !userHandle.bio &&
        !userHandle.website
      ) {
        setProfileEditing(true);
      }
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [userHandle]);

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
      setProfileEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update passport");
    }
  };

  const handleClaimSuccess = (handle: string) => {
    toast.success(`Handle @${handle} claimed! Now complete your passport.`);
    setClaimHandleOpen(false);
    setProfileEditing(true);
  };

  const hasProfileDetails = Boolean(
    userHandle?.displayName || userHandle?.bio || userHandle?.website,
  );

  const showProfileForm = Boolean(userHandle && (!hasProfileDetails || profileEditing));

  const publicProfileHref = userHandle ? `/verify/${userHandle.handle}` : null;

  // Check if user handle is loading
  const isLoading = userHandle === undefined && address;

  const resetProfileFields = () => {
    if (!userHandle) {
      return;
    }
    setDisplayName(userHandle.displayName || "");
    setBio(userHandle.bio || "");
    setWebsite(userHandle.website || "");
  };

  const handleCancelEdit = () => {
    resetProfileFields();
    setProfileEditing(false);
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
              &ldquo;View on DKG&rdquo; buttons—so partners trust you instantly.
            </AlertDescription>
          </Alert>

          {/* Handle Status */}
          {isLoading ? (
            <Card className="border-2">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-32" />
              </CardContent>
            </Card>
          ) : !userHandle ? (
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
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    Step 1 complete: Handle claimed
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Your public link: <code className="text-sm">/verify/{userHandle.handle}</code>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="gap-1 capitalize">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Linked
                </Badge>
              </CardHeader>
              <CardFooter className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => setChangeHandleOpen(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit @handle
                </Button>
                {publicProfileHref && (
                  <Button asChild variant="secondary">
                    <Link href={publicProfileHref} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View public profile
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          )}

          {/* Profile Form */}
          {isLoading ? (
            <Card className="border-2">
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ) : userHandle && (
            <Card>
              <CardHeader className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Step 2: Complete Your Profile
                    {hasProfileDetails && !showProfileForm && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Complete
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Add details to help buyers and investors understand who you are
                  </CardDescription>
                </div>
              </CardHeader>
              {showProfileForm ? (
                <>
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
                  <CardFooter className="flex flex-wrap gap-3">
                    <Button onClick={handleSave} size="lg">
                      Save Passport
                    </Button>
                    {hasProfileDetails && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="lg"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </CardFooter>
                </>
              ) : (
                <>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Display name
                      </p>
                      <p className="text-base font-medium">
                        {userHandle.displayName || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Bio / Tagline
                      </p>
                      <p className="text-base">
                        {userHandle.bio || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Website
                      </p>
                      {userHandle.website ? (
                        <Link
                          href={userHandle.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {userHandle.website}
                        </Link>
                      ) : (
                        <p className="text-base">Not provided</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={() => setProfileEditing(true)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit profile details
                    </Button>
                  </CardFooter>
                </>
              )}
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
                    <Link href="/invoices/new">
                      <FileText className="h-4 w-4 mr-2" />
                      Create an invoice
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/ai-assistant/truth">
                      <Shield className="h-4 w-4 mr-2" />
                      Publish a truth note
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/ai-assistant/pitch-deck">
                      <Presentation className="h-4 w-4 mr-2" />
                      Generate a pitch deck
                    </Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/proofs">
                      <Star className="h-4 w-4 mr-2" />
                      Manage featured proofs
                    </Link>
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
      {userHandle && (
        <ChangeHandleDialog
          open={changeHandleOpen}
          onOpenChange={setChangeHandleOpen}
          currentHandle={userHandle.handle}
        />
      )}
    </>
  );
}
