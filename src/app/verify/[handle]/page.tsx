import { notFound, redirect } from "next/navigation";
import { ShieldCheck, Globe, AtSign, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrustPanel } from "@/features/verify/trust-panel";
import { fetchPublicProfile } from "@/lib/server/profile-store";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { fetchQuery } from "convex/nextjs";
import { api } from "@convex/_generated/api";
import { getAddress, isAddress } from "viem";

type VerifyPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function VerifyHandlePage({ params }: VerifyPageProps) {
  const { handle } = await params;
  if (!handle) {
    notFound();
  }

  const normalizedHandle = handle.trim();
  const slug = normalizedHandle.toLowerCase();

  try {
    const candidateAddresses = new Set<string>();
    candidateAddresses.add(normalizedHandle);
    if (isAddress(normalizedHandle)) {
      const checksummed = getAddress(normalizedHandle);
      candidateAddresses.add(checksummed);
    }

    const handleRecord = await fetchQuery(api.handles.getHandleByHandle, {
      handle: slug,
    });

    if (!handleRecord) {
      let ownerHandle = null;
      for (const ownerAddress of candidateAddresses) {
        ownerHandle = await fetchQuery(api.handles.getHandleByAddress, {
          ownerAddress,
        });
        if (ownerHandle) {
          break;
        }
      }

      if (ownerHandle && ownerHandle.handle !== slug) {
        redirect(`/verify/${ownerHandle.handle}`);
      }
    }
  } catch (error) {
    console.error("Failed to resolve handle redirect", error);
  }

  const profile = await fetchPublicProfile(normalizedHandle);
  if (!profile.handle && !profile.isDemo && !profile.address) {
    notFound();
  }

  const resolvedHandle = profile.handle || normalizedHandle;

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/30 to-background">
      <div className="container-app section-spacing animate-in py-12">
        {/* Header Banner */}
        <div className="mb-8 text-center space-y-3">
          <Badge variant="secondary" className="gap-1.5 mb-2">
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Public Trust Profile
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            {profile.display}
          </h1>
          {resolvedHandle && (
            <p className="text-lg text-muted-foreground flex items-center justify-center gap-2">
              <AtSign className="h-4 w-4" />
              {resolvedHandle}
            </p>
          )}
        </div>

        {/* About Card */}
        <Card className="overflow-hidden border-2 shadow-lg mb-6">
          <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
          <CardHeader>
            <CardTitle>Supplier Passport</CardTitle>
            <CardDescription>
              Independent verification links for buyers and investors
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {profile.bio && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">About</p>
                <p className="leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {profile.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {profile.website}
                </a>
              </div>
            )}

            <Separator />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Privacy:</strong> underlying files remain private; only proofs are public.
                All verifiable data is anchored on the OriginTrail DKG and Polkadot parachains.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Trust Panel - contains all proofs */}
        <TrustPanel profile={profile} />

        {/* Footer Note */}
        <Card className="mt-8 border-dashed">
          <CardContent className="pt-6 text-center text-sm text-muted-foreground">
            <p>
              This page is not a social profile—it&rsquo;s a procurement-friendly dossier with clickable
              proofs. Buyers and investors can verify claims by clicking &ldquo;View on DKG&rdquo; or &ldquo;View
              transaction&rdquo; buttons above.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
