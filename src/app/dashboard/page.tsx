"use client";

import { motion } from "framer-motion";
import { Rocket, Award, Clock, Hash, Sparkles, Zap, FileText, NotebookPen, ShieldCheck, ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AchievementList } from "@/components/credentials/achievement-list";
import { InvoiceDashboardWidget } from "@/components/invoices/invoice-dashboard-widget";
import { AppShellClient } from "@/components/layout/app-shell.client";
import { QuickStartChecklist } from "@/components/dashboard/quick-start-checklist";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import type { AchievementRecord } from "@/types/achievement";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { address } = useAccount();
  const achievementsRaw = useQuery(
    api.achievements.getByOwner,
    address ? { ownerAddress: address } : "skip"
  );

  // Map Convex documents to match AchievementRecord format
  type ConvexAchievementDoc = AchievementRecord & { _id?: string; achievementId?: string };

  const achievementsList: AchievementRecord[] =
    achievementsRaw?.map((doc: ConvexAchievementDoc) => ({
      ...doc,
      id: doc.achievementId || doc._id,
      txHash: doc.txHash ?? null,
      network: doc.network ?? null,
      contractAddress: doc.contractAddress ?? null,
    })) || [];

  const latest = achievementsList[0];

  if (!address) {
    return (
      <AppShellClient sidebar maxWidth="7xl">
        <div className="section-spacing">
          <Card className="border-2">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Rocket className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Connect your wallet to access your dashboard
              </p>
            </CardContent>
          </Card>
        </div>
      </AppShellClient>
    );
  }

  const actionItems: Array<{
    label: string;
    description: string;
    href: string;
    icon: LucideIcon;
  }> = [
    {
      label: "Mint a new badge",
      description: "Document your latest milestone in Credentials Studio.",
      href: "/credentials",
      icon: Award,
    },
    {
      label: "Generate a business plan",
      description: "Package your KPIs into a lender-ready narrative.",
      href: "/ai-assistant/business-plan",
      icon: FileText,
    },
    {
      label: "Log investor notes",
      description: "Capture research and diligence updates.",
      href: "/notes",
      icon: NotebookPen,
    },
    {
      label: "Publish truth alignment",
      description: "Push research to DKG with verifiable proofs.",
      href: "/ai-assistant/truth",
      icon: ShieldCheck,
    },
  ];

  return (
    <AppShellClient sidebar maxWidth="7xl">
      <motion.div
        className="section-spacing"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Page Header with modern gradient */}
        <motion.div variants={item}>
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-background p-8 mb-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.15),_transparent_70%)]" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
                  <p className="text-muted-foreground mt-1">
                    Your mission control for verifiable proofs and AI-powered tools
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="gap-2">
                <Sparkles className="h-3 w-3" />
                All systems operational
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Quick Start Guide - Full Width */}
        <motion.section variants={item}>
          <QuickStartChecklist />
        </motion.section>

        {/* Revenue & Actions */}
        <motion.section variants={item}>
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            <div className="h-full">
              <InvoiceDashboardWidget />
            </div>
            <Card className="h-full border-2 border-primary/20 bg-gradient-to-br from-background via-primary/5 to-background shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Mission Brief</CardTitle>
                <CardDescription>
                  Keep your proof stack current with focused AI + Web3 actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-2xl border border-primary/20 bg-background/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase font-semibold tracking-[0.2em] text-muted-foreground">
                        Proof runway
                      </p>
                      <p className="text-4xl font-bold mt-2">{achievementsList.length}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {latest ? `Last badge: ${latest.title}` : "Mint a credential to activate your Verify link."}
                      </p>
                    </div>
                    <Badge variant="secondary" className="shrink-0">
                      {achievementsList.length > 0 ? "Active" : "Getting started"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  {actionItems.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="group flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="rounded-2xl bg-primary/10 p-2 text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold">{action.label}</p>
                            <p className="text-sm text-muted-foreground">{action.description}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.section>

        {/* Latest Achievement Highlight - Full Width */}
        {latest && (
          <motion.section variants={item}>
            <motion.div whileHover={{ scale: 1.005 }} transition={{ duration: 0.2 }}>
              <Card className="overflow-hidden border-2 border-primary/30 shadow-xl bg-gradient-to-br from-background to-primary/5">
                <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient" />
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                          <Sparkles className="h-3 w-3" aria-hidden="true" />
                          Latest Achievement
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                          <Clock className="h-3 w-3" />
                          Recent
                        </Badge>
                        <Badge variant="outline" className="gap-1.5">
                          <Hash className="h-3 w-3" />
                          {latest.impactArea}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl font-bold">{latest.title}</CardTitle>
                      <p className="text-muted-foreground leading-relaxed text-base">
                        {latest.summary}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 shadow-lg">
                      <Award className="h-12 w-12 text-primary" aria-hidden="true" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-muted/50 p-4 backdrop-blur-sm">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Hash className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        Verifiable Hash
                      </p>
                      <code className="text-sm font-mono text-primary break-all">
                        {latest.hash}
                      </code>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button asChild size="lg">
                      <Link href="/credentials">
                        <Award className="mr-2 h-4 w-4" />
                        Mint Another Badge
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link href={`/verify/${address}`}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        View Public Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.section>
        )}

        {/* Activity Timeline */}
        <motion.section className="space-y-6" variants={item}>
          <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(139,92,246,0.1),_transparent_60%)]" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 shadow-lg">
                <Clock className="h-7 w-7 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold tracking-tight">Activity Timeline</h2>
                <p className="text-base text-muted-foreground mt-1">
                  Recent badge mints, hash computations, and verification events
                </p>
              </div>
              {achievementsList.length > 0 && (
                <Badge variant="secondary" className="gap-2 px-4 py-2">
                  <Award className="h-4 w-4" />
                  {achievementsList.length} {achievementsList.length === 1 ? "Badge" : "Badges"}
                </Badge>
              )}
            </div>
          </div>

          {achievementsList.length > 0 ? (
            <AchievementList achievements={achievementsList} />
          ) : (
            <Card className="border-2 border-dashed border-primary/30 bg-muted/20">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-3">No activity yet</CardTitle>
                <CardDescription className="text-base mb-6 max-w-md mx-auto">
                  Mint your first credential to populate your mission history and start building your verifiable proof portfolio.
                </CardDescription>
                <Button asChild size="lg">
                  <Link href="/credentials">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Open Credentials Studio
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </motion.div>
    </AppShellClient>
  );
}
