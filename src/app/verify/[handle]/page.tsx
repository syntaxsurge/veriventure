import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TrustPanel } from "@/features/verify/trust-panel";
import { fetchPublicProfile } from "@/lib/server/profile-store";

type VerifyPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

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
    <div className="space-y-8">
      <section className="space-y-4 rounded-3xl border bg-muted/30 p-6">
        <Badge variant="outline">
          {profile.isDemo ? "Demo Flight" : "Public verification"}
        </Badge>
        <h1 className="break-all text-3xl font-semibold">{profile.display}</h1>
        <p className="text-muted-foreground">
          Wallet address:{" "}
          <span className="font-mono text-sm text-foreground">
            {profile.address || "—"}
          </span>
        </p>
        <p className="text-muted-foreground">
          Share this page with diligence teams to prove milestones. Every badge
          exposes its BLAKE2b hash, on-chain tx metadata, and OriginTrail
          Community Notes so partners can recompute trust instantly.
        </p>
      </section>
      <TrustPanel profile={profile} />
    </div>
  );
}
