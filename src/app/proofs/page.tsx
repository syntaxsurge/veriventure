"use client";

import Link from "next/link";
import { AppShellClient } from "@/components/layout/app-shell.client";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { DKGLink } from "@/components/proof/dkg-link";
import { ChainLink } from "@/components/proof/chain-link";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAccount } from "wagmi";
import { FileText, Receipt, Award, CheckCircle2, Star, Info, TrendingUp, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

type ProofCardProps = {
  proof: ProofItem;
  onToggleFeatured: (proofId: string) => Promise<void> | void;
};

function ProofCard({ proof, onToggleFeatured }: ProofCardProps) {
  const Icon = typeIcons[proof.type];

  const gradients = {
    invoice: "from-yellow-500/10 to-orange-500/5",
    milestone: "from-blue-500/10 to-cyan-500/5",
    "truth-note": "from-green-500/10 to-emerald-500/5",
    credential: "from-purple-500/10 to-pink-500/5",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className={`group relative border-2 overflow-hidden transition-all hover:border-primary/50 hover:shadow-xl ${proof.featured ? "ring-2 ring-primary/20" : ""}`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[proof.type]} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

        <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex items-start gap-4 flex-1">
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="font-semibold">{typeLabels[proof.type]}</Badge>
                {proof.featured && (
                  <Badge variant="outline" className="gap-1.5 bg-primary/5 border-primary/30">
                    <Star className="h-3 w-3 fill-primary text-primary" />
                    Featured
                  </Badge>
                )}
              </div>
              <h3 className="font-bold leading-tight text-lg">{proof.title}</h3>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3" />
                {new Date(proof.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {proof.ual && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                DKG UAL
              </p>
              <DKGLink ual={proof.ual} truncate showCopy showExternalLink />
            </div>
          )}

          {proof.txHash && proof.network && (
            <div className="space-y-2 p-3 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3" />
                On-Chain Transaction
              </p>
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

        <CardFooter className="relative flex gap-2 border-t bg-muted/20">
          <Button
            variant={proof.featured ? "secondary" : "default"}
            size="sm"
            onClick={() => onToggleFeatured(proof.id)}
            className="gap-2 font-semibold"
          >
            <Star className={`h-4 w-4 ${proof.featured ? "fill-current" : ""}`} />
            {proof.featured ? "Remove from Profile" : "Feature on Profile"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function EmptyState({ type }: { type?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <div className="p-4 rounded-full bg-primary/10 mb-4">
            <Info className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No {type || "proofs"} yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mb-6">
            Create your first invoice or publish a Truth Note to start building your verifiable track record.
          </p>
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/invoices/new">Create Invoice</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/ai-assistant/truth">Publish Truth Note</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

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
    } catch {
      toast.error("Failed to update featured status");
    }
  };

  const filterByType = (type: ProofType) => allProofs.filter((p) => p.type === type);

  // Check if any query is still loading
  const isLoading = invoices === undefined || communityNotes === undefined || achievements === undefined || dkgAssets === undefined;

  // Loading skeleton for stats cards
  const StatsCardSkeleton = () => (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-12 w-12 rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );

  // Loading skeleton for proof cards
  const ProofCardSkeleton = () => (
    <Card className="border-2">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-start gap-4 flex-1">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 p-3 rounded-lg bg-muted/50">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-4 w-full" />
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20">
        <Skeleton className="h-9 w-40" />
      </CardFooter>
    </Card>
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
          <Badge variant="secondary" className="gap-2 px-4 py-2">
            <Sparkles className="h-4 w-4" />
            Trust Layer
          </Badge>
        </PageHeader>

        {/* Stats Overview */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
        ) : allProofs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-4 md:grid-cols-4"
          >
            <Card className="border-2 bg-gradient-to-br from-yellow-500/10 to-orange-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Invoices</p>
                    <h3 className="text-3xl font-bold mt-1">{filterByType("invoice").length}</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-500/20">
                    <Receipt className="h-6 w-6 text-yellow-700 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-blue-500/10 to-cyan-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Milestones</p>
                    <h3 className="text-3xl font-bold mt-1">{filterByType("milestone").length}</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-500/20">
                    <Award className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Truth Notes</p>
                    <h3 className="text-3xl font-bold mt-1">{filterByType("truth-note").length}</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-green-500/20">
                    <CheckCircle2 className="h-6 w-6 text-green-700 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-gradient-to-br from-purple-500/10 to-pink-500/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Credentials</p>
                    <h3 className="text-3xl font-bold mt-1">{filterByType("credential").length}</h3>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-500/20">
                    <FileText className="h-6 w-6 text-purple-700 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="all" className="gap-2">
              All <Badge variant="secondary" className="ml-1">{allProofs.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-2">
              Invoices <Badge variant="secondary" className="ml-1">{filterByType("invoice").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="gap-2">
              Milestones <Badge variant="secondary" className="ml-1">{filterByType("milestone").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="truth-notes" className="gap-2">
              Truth Notes <Badge variant="secondary" className="ml-1">{filterByType("truth-note").length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="credentials" className="gap-2">
              Credentials <Badge variant="secondary" className="ml-1">{filterByType("credential").length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <ProofCardSkeleton key={i} />
                ))}
              </div>
            ) : allProofs.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {allProofs.map((proof) => (
                  <ProofCard
                    key={proof.id}
                    proof={proof}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <ProofCardSkeleton key={i} />
                ))}
              </div>
            ) : filterByType("invoice").length === 0 ? (
              <EmptyState type="invoices" />
            ) : (
              <div className="grid gap-4">
                {filterByType("invoice").map((proof) => (
                  <ProofCard
                    key={proof.id}
                    proof={proof}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <ProofCardSkeleton key={i} />
                ))}
              </div>
            ) : filterByType("milestone").length === 0 ? (
              <EmptyState type="milestones" />
            ) : (
              <div className="grid gap-4">
                {filterByType("milestone").map((proof) => (
                  <ProofCard
                    key={proof.id}
                    proof={proof}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="truth-notes" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <ProofCardSkeleton key={i} />
                ))}
              </div>
            ) : filterByType("truth-note").length === 0 ? (
              <EmptyState type="truth notes" />
            ) : (
              <div className="grid gap-4">
                {filterByType("truth-note").map((proof) => (
                  <ProofCard
                    key={proof.id}
                    proof={proof}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="credentials" className="space-y-4 mt-6">
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2].map((i) => (
                  <ProofCardSkeleton key={i} />
                ))}
              </div>
            ) : filterByType("credential").length === 0 ? (
              <EmptyState type="credentials" />
            ) : (
              <div className="grid gap-4">
                {filterByType("credential").map((proof) => (
                  <ProofCard
                    key={proof.id}
                    proof={proof}
                    onToggleFeatured={handleToggleFeatured}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShellClient>
  );
}
