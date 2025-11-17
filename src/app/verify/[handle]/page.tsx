import { notFound } from "next/navigation";
import { ShieldCheck, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TrustPanel } from "@/features/verify/trust-panel";
import { fetchPublicProfile } from "@/lib/server/profile-store";
import { Separator } from "@/components/ui/separator";

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

  const profile = await fetchPublicProfile(handle);
  if (!profile.handle && !profile.isDemo && !profile.address) {
    notFound();
  }

  return (
    <div className="container-app section-spacing animate-in py-12">
      {/* Profile Header */}
      <Card className="overflow-hidden border-2 shadow-lg">
        <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
        <CardContent className="space-y-6 p-8 md:p-12">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-4">
              <Badge variant="secondary" className="gap-1.5">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                {profile.isDemo ? "Demo Flight" : "Public Verification"}
              </Badge>
              <h1 className="break-all">{profile.display}</h1>
            </div>
            <div className="rounded-lg bg-primary/10 p-3">
              <Wallet className="h-8 w-8 text-primary" aria-hidden="true" />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Wallet Address:</span>
              <code className="rounded bg-muted px-2 py-1 font-mono text-sm text-foreground">
                {profile.address || "—"}
              </code>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              Share this page with diligence teams to prove milestones. Every badge exposes its
              BLAKE2b hash, on-chain tx metadata, and OriginTrail Community Notes so partners can
              recompute trust instantly.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trust Panel */}
      <TrustPanel profile={profile} />
    </div>
  );
}
