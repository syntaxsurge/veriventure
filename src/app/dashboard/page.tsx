"use client";

import { motion } from "framer-motion";
import { Rocket, Award, Clock, Hash, Sparkles, TrendingUp, Zap } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
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

  const isLoading = achievementsRaw === undefined && address;
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

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

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

        {/* Guide rails and invoicing */}
        <motion.section variants={item}>
          <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            <QuickStartChecklist />
            <InvoiceDashboardWidget />
          </div>
        </motion.section>

        {/* Stats Overview with modern design */}
        <motion.section variants={item} className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-2xl font-bold">
              <TrendingUp className="h-6 w-6 text-primary" />
              Overview
            </div>
            <Badge variant="outline" className="text-xs uppercase tracking-wide">
              Live snapshot
            </Badge>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <div>
              {isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="border-2">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-5 w-5 rounded" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-9 w-20 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <motion.div
                  className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  variants={container}
                >
                  <motion.div variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="border-2 border-blue-200/50 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 transition-all hover:shadow-xl hover:border-blue-300/50 dark:border-blue-900/50 dark:from-blue-500/5 dark:to-cyan-500/5">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                          Total Badges
                        </CardTitle>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shadow-sm">
                          <Award className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                          {achievementsList.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                          Verifiable credentials
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="border-2 border-purple-200/50 bg-gradient-to-br from-purple-500/10 to-pink-500/5 transition-all hover:shadow-xl hover:border-purple-300/50 dark:border-purple-900/50 dark:from-purple-500/5 dark:to-pink-500/5">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                          Status
                        </CardTitle>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center shadow-sm">
                          <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" aria-hidden="true" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {latest ? "Active" : "Pending"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                          {latest ? "Recent activity" : "Awaiting first badge"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={item} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
                    <Card className="border-2 border-green-200/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5 transition-all hover:shadow-xl hover:border-green-300/50 dark:border-green-900/50 dark:from-green-500/5 dark:to-emerald-500/5">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
                          Profile
                        </CardTitle>
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shadow-sm">
                          <Rocket className="h-6 w-6 text-green-600 dark:text-green-400" aria-hidden="true" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          {achievementsList.length > 0 ? "Live" : "Setup"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                          {achievementsList.length > 0 ? "Profile ready" : "Complete setup"}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              )}
            </div>

            <div className="space-y-6">
              <motion.div variants={item} whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }}>
                {isLoading ? (
                  <Card className="border-2">
                    <CardContent className="space-y-3 py-6">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ) : (
                  latest && (
                    <Card className="overflow-hidden border-2 border-primary/30 shadow-xl bg-gradient-to-br from-background to-primary/5">
                      <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-primary animate-gradient" />
                      <CardHeader className="flex flex-row items-start justify-between">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                              <Sparkles className="h-3 w-3" aria-hidden="true" />
                              Latest Achievement
                            </Badge>
                            <Badge variant="outline" className="gap-1.5">
                              <Clock className="h-3 w-3" />
                              Recent
                            </Badge>
                          </div>
                          <CardTitle className="text-3xl font-bold">{latest.title}</CardTitle>
                        </div>
                        <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 p-4 shadow-lg">
                          <Award className="h-10 w-10 text-primary" aria-hidden="true" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-muted-foreground leading-relaxed text-base">
                          {latest.summary}
                        </p>
                        <div className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-muted/50 p-4 backdrop-blur-sm">
                          <div className="rounded-lg bg-primary/10 p-2">
                            <Hash className="h-5 w-5 text-primary" aria-hidden="true" />
                          </div>
                          <code className="text-sm font-mono text-primary flex-1 break-all">
                            {latest.hash.slice(0, 32)}...
                          </code>
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </motion.div>

              <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Proof Snapshot</CardTitle>
                  <CardDescription>Share wallet-ready proofs without leaving this page</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl border bg-muted/40 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Connected wallet</p>
                    <p className="font-mono text-sm">{shortAddress}</p>
                  </div>
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Badges minted</p>
                      {isLoading ? (
                        <Skeleton className="mt-2 h-6 w-12" />
                      ) : (
                        <p className="text-2xl font-bold mt-1">{achievementsList.length}</p>
                      )}
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Latest status</p>
                      {isLoading ? (
                        <Skeleton className="mt-2 h-6 w-20" />
                      ) : (
                        <p className="text-base font-semibold mt-1">
                          {latest ? "Live on-chain" : "Awaiting first badge"}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button asChild className="flex-1">
                      <Link href="/credentials">Mint badge</Link>
                    </Button>
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/verify/${address}`}>Share verify link</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.section>

        {/* Activity Timeline */}
        <motion.section className="space-y-6" variants={item}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-gradient-to-b from-primary to-purple-500 rounded-full" />
            <div>
              <h2 className="text-2xl font-bold">Activity Timeline</h2>
              <p className="text-sm text-muted-foreground">
                Recent badge mints, hash computations, and verification events
              </p>
            </div>
          </div>
          {achievementsList.length > 0 ? (
            <AchievementList achievements={achievementsList} />
          ) : (
            <Card className="border-2 border-dashed border-primary/30">
              <CardHeader>
                <CardTitle>No activity yet</CardTitle>
                <CardDescription>Mint a credential to populate your mission history.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild>
                  <Link href="/credentials">Open Credentials Studio</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </motion.div>
    </AppShellClient>
  );
}
