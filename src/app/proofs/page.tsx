"use client";

import { AppShellClient } from "@/components/layout/app-shell.client";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DKGLink } from "@/components/proof/dkg-link";
import { ChainLink } from "@/components/proof/chain-link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccount } from "wagmi";
import { FileText, Receipt, Award, CheckCircle2, Star, Info } from "lucide-react";
import { toast } from "sonner";

type ProofType = "invoice" | "milestone" | "truth-note" | "credential";

interface ProofItem {
  id: string;
  type: ProofType;
  title: string;
  ual?: string;
  txHash?: string;
  network?: string;
  createdAt: string;
  featured?: boolean;
}

const typeIcons: Record<ProofType, React.ElementType> = {
  invoice: Receipt,
  milestone: Award,
  "truth-note": CheckCircle2,
  credential: FileText,
};

const typeLabels: Record<ProofType, string> = {
  invoice: "Invoice",
  milestone: "Milestone",
  "truth-note": "Truth Note",
  credential: "Credential",
};

export default function ProofsPage() {
  const { address } = useAccount();

  // Fetch user's data
  const invoices = useQuery(
    api.invoices.getByIssuer,
    address ? { issuerAddress: address } : "skip"
  );

  const communityNotes = useQuery(
    api.communityNotes.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  const achievements = useQuery(
    api.achievements.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  const dkgAssets = useQuery(
    api.dkgAssets.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  const userProfile = useQuery(
    api.userProfiles.getUserProfile,
    address ? { ownerAddress: address } : "skip"
  );

  const toggleFeatured = useMutation(api.userProfiles.toggleFeaturedProof);

  // Combine all proofs into a single timeline
  const allProofs: ProofItem[] = [
    ...(invoices?.map((inv) => ({
      id: inv.invoiceId,
      type: "invoice" as const,
      title: `Invoice #${inv.invoiceId.slice(0, 8)} - ${inv.memo || "Payment"}`,
      ual: inv.dkgUAL,
      txHash: inv.txHash,
      network: inv.network,
      createdAt: inv.createdAt,
      featured: userProfile?.featuredProofs.includes(inv.invoiceId),
    })) || []),
    ...(communityNotes?.map((note) => ({
      id: note.communityNoteId,
      type: "truth-note" as const,
      title: `Truth Note: ${note.topic}`,
      ual: note.ual,
      txHash: note.txHash,
      network: "neuroweb",
      createdAt: note.createdAt,
      featured: userProfile?.featuredProofs.includes(note.communityNoteId),
    })) || []),
    ...(achievements?.map((ach) => ({
      id: ach.achievementId,
      type: "credential" as const,
      title: ach.title,
      txHash: ach.txHash,
      network: ach.network,
      createdAt: ach.createdAt,
      featured: userProfile?.featuredProofs.includes(ach.achievementId),
    })) || []),
    ...(dkgAssets?.map((asset) => ({
      id: asset.dkgAssetId,
      type: "milestone" as const,
      title: asset.title,
      ual: asset.ual,
      txHash: asset.txHash,
      network: "neuroweb",
      createdAt: asset.createdAt,
      featured: userProfile?.featuredProofs.includes(asset.dkgAssetId),
    })) || []),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleToggleFeatured = async (proofId: string) => {
    if (!address) return;

    try {
      const result = await toggleFeatured({
        ownerAddress: address,
        proofId,
      });

      toast.success(
        result.featured ? "Added to Public Profile" : "Removed from Public Profile"
      );
    } catch (error) {
      toast.error("Failed to update featured status");
    }
  };

  const filterByType = (type: ProofType) => allProofs.filter((p) => p.type === type);

  const ProofCard = ({ proof }: { proof: ProofItem }) => {
    const Icon = typeIcons[proof.type];

    return (
      <Card className="border-2">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{typeLabels[proof.type]}</Badge>
                {proof.featured && (
                  <Badge variant="outline" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold leading-tight">{proof.title}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(proof.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {proof.ual && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">DKG UAL</p>
              <DKGLink ual={proof.ual} truncate showCopy showExternalLink />
            </div>
          )}

          {proof.txHash && proof.network && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Transaction</p>
              <ChainLink
                txHash={proof.txHash}
                network={proof.network}
                showNetwork
                showCopy
                showExternalLink
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            variant={proof.featured ? "secondary" : "default"}
            size="sm"
            onClick={() => handleToggleFeatured(proof.id)}
          >
            {proof.featured ? "Remove from Public Profile" : "Feature on Public Profile"}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type?: string }) => (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription>
        You have no {type || "proofs"} yet. Create your first invoice or publish a Truth Note to get
        started.
      </AlertDescription>
    </Alert>
  );

  return (
    <AppShellClient sidebar maxWidth="7xl">
      <div className="section-spacing animate-in space-y-8">
        <PageHeader
          title="Proofs & Audit Log"
          description="Everything verifiable in one place. Share this page with reviewers—or pick items to feature on your Public Trust Profile."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Proofs & Audit Log" },
          ]}
        >
          <Badge variant="secondary">Trust Layer</Badge>
        </PageHeader>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All ({allProofs.length})</TabsTrigger>
            <TabsTrigger value="invoices">Invoices ({filterByType("invoice").length})</TabsTrigger>
            <TabsTrigger value="milestones">Milestones ({filterByType("milestone").length})</TabsTrigger>
            <TabsTrigger value="truth-notes">Truth Notes ({filterByType("truth-note").length})</TabsTrigger>
            <TabsTrigger value="credentials">Credentials ({filterByType("credential").length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {allProofs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {allProofs.map((proof) => (
                  <ProofCard key={proof.id} proof={proof} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4 mt-6">
            {filterByType("invoice").length === 0 ? (
              <EmptyState type="invoices" />
            ) : (
              <div className="grid gap-4">
                {filterByType("invoice").map((proof) => (
                  <ProofCard key={proof.id} proof={proof} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-6">
            {filterByType("milestone").length === 0 ? (
              <EmptyState type="milestones" />
            ) : (
              <div className="grid gap-4">
                {filterByType("milestone").map((proof) => (
                  <ProofCard key={proof.id} proof={proof} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="truth-notes" className="space-y-4 mt-6">
            {filterByType("truth-note").length === 0 ? (
              <EmptyState type="truth notes" />
            ) : (
              <div className="grid gap-4">
                {filterByType("truth-note").map((proof) => (
                  <ProofCard key={proof.id} proof={proof} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4 mt-6">
            {filterByType("credential").length === 0 ? (
              <EmptyState type="credentials" />
            ) : (
              <div className="grid gap-4">
                {filterByType("credential").map((proof) => (
                  <ProofCard key={proof.id} proof={proof} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShellClient>
  );
}
