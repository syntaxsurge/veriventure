"use client";

import { motion } from "framer-motion";
import {
  Rocket,
  Award,
  Clock,
  Hash,
  Sparkles,
  Zap,
  FileText,
  NotebookPen,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  Target,
  Globe,
  ChevronRight,
  PieChart,
  BarChart3,
  LineChart,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Timer,
  Gem,
  Brain,
  Link2,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementList } from "@/components/credentials/achievement-list";
import { InvoiceDashboardWidget } from "@/components/invoices/invoice-dashboard-widget";
import { AppShellClient } from "@/components/layout/app-shell.client";
import { QuickStartChecklist } from "@/components/dashboard/quick-start-checklist";
import { useAccount } from "wagmi";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import type { AchievementRecord } from "@/types/achievement";
import { cn } from "@/lib/utils";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

// Polkadot ecosystem-inspired stat cards
interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color: string;
}

function StatCard({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-background via-background/95 to-background shadow-xl">
        <div className={cn(
          "absolute inset-0 opacity-[0.03]",
          "bg-[radial-gradient(ellipse_at_top_right,var(--primary),transparent_50%)]"
        )} />
        <CardContent className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "rounded-2xl p-3 shadow-lg",
              "bg-gradient-to-br",
              color
            )}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            {trend && (
              <Badge
                variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                className="gap-1"
              >
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : trend === "down" ? <TrendingUp className="h-3 w-3 rotate-180" /> : <Activity className="h-3 w-3" />}
                {change}
              </Badge>
            )}
          </div>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground mt-1">{title}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Quick action cards with Polkadot styling
interface QuickActionProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
  badge?: string;
}

function QuickAction({ title, description, icon: Icon, href, color, badge }: QuickActionProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        className="relative h-full"
      >
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full group">
          <div className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            "bg-gradient-to-br",
            color
          )} style={{ opacity: 0.05 }} />
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "rounded-xl p-2.5 shadow-md",
                "bg-gradient-to-br",
                color
              )}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              {badge && (
                <Badge variant="secondary" className="text-xs">
                  {badge}
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-base mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
            <div className="flex items-center gap-1 mt-3 text-sm font-medium text-primary">
              <span>Get Started</span>
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}

export default function DashboardPage() {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState("overview");
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
        <div className="min-h-[80vh] flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-background via-background/98 to-primary/5">
              <CardContent className="flex flex-col items-center justify-center py-16 px-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600/20 to-indigo-600/20 blur-2xl" />
                  <div className="relative rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 p-5">
                    <Wallet className="h-12 w-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">Connect Your Wallet</h3>
                <p className="text-muted-foreground text-center mb-6">
                  Connect your Polkadot wallet to access your personalized dashboard and start building your verifiable proof portfolio.
                </p>
                <Badge variant="outline" className="gap-2 py-1.5 px-4">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Network: Moonbeam
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AppShellClient>
    );
  }

  const quickActions: QuickActionProps[] = [
    {
      title: "Mint Achievement",
      description: "Create verifiable on-chain credentials for your milestones",
      href: "/credentials",
      icon: Award,
      color: "from-purple-600 to-purple-700",
      badge: "Web3"
    },
    {
      title: "AI Pitch Deck",
      description: "Generate investor-ready presentations with AI assistance",
      href: "/ai-assistant/pitch-deck",
      icon: Sparkles,
      color: "from-indigo-600 to-indigo-700",
      badge: "AI"
    },
    {
      title: "Business Plan",
      description: "Create comprehensive business plans with market analysis",
      href: "/ai-assistant/business-plan",
      icon: FileText,
      color: "from-blue-600 to-blue-700",
      badge: "AI"
    },
    {
      title: "Smart Invoicing",
      description: "Accept crypto payments with verifiable invoices",
      href: "/invoices",
      icon: DollarSign,
      color: "from-emerald-600 to-emerald-700",
      badge: "DeFi"
    },
    {
      title: "Truth Alignment",
      description: "Verify claims with AI and publish to OriginTrail DKG",
      href: "/ai-assistant/truth",
      icon: ShieldCheck,
      color: "from-amber-600 to-amber-700",
      badge: "DKG"
    },
    {
      title: "Public Profile",
      description: "Showcase your achievements and build trust",
      href: `/verify/${address}`,
      icon: Globe,
      color: "from-pink-600 to-pink-700",
      badge: "Public"
    },
  ];

  const stats = [
    {
      title: "Total Achievements",
      value: achievementsList.length,
      change: "+12%",
      trend: "up" as const,
      icon: Award,
      color: "from-purple-600 to-indigo-600"
    },
    {
      title: "Active Invoices",
      value: "3",
      change: "+2",
      trend: "up" as const,
      icon: DollarSign,
      color: "from-emerald-600 to-teal-600"
    },
    {
      title: "DKG Publications",
      value: "7",
      change: "+25%",
      trend: "up" as const,
      icon: Link2,
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "Trust Score",
      value: "92",
      change: "+5",
      trend: "up" as const,
      icon: ShieldCheck,
      color: "from-amber-600 to-orange-600"
    },
  ];

  return (
    <AppShellClient sidebar maxWidth="7xl">
      <motion.div
        className="space-y-8 pb-8"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Modern Dashboard Header */}
        <motion.div variants={item} className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-indigo-600/10 rounded-3xl blur-3xl" />
          <div className="relative bg-gradient-to-br from-background via-background/98 to-primary/5 rounded-3xl border-0 shadow-xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/30 to-indigo-600/30 blur-xl" />
                  <div className="relative rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 p-4 shadow-2xl">
                    <Rocket className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Mission Control
                  </h1>
                  <p className="text-muted-foreground mt-2 max-w-2xl">
                    Your decentralized command center for building verifiable traction in the Polkadot ecosystem
                  </p>
                  <div className="flex items-center gap-3 mt-4">
                    <Badge variant="outline" className="gap-1.5 bg-green-500/10 border-green-500/30">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                      All Systems Operational
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Globe className="h-3 w-3" />
                      Moonbeam Network
                    </Badge>
                    <Badge variant="outline" className="gap-1.5">
                      <Timer className="h-3 w-3" />
                      Last sync: 2 min ago
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Quick Actions
                </Button>
                <Button size="lg" variant="outline">
                  <Activity className="mr-2 h-5 w-5" />
                  Analytics
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Start Guide - Only show if new user */}
        {achievementsList.length === 0 && (
          <motion.section variants={item}>
            <QuickStartChecklist />
          </motion.section>
        )}

        {/* Stats Grid */}
        <motion.div variants={item}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </motion.div>

        {/* Main Content Area with Tabs */}
        <motion.div variants={item}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/50">
              <TabsTrigger value="overview" className="gap-2">
                <PieChart className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-2">
                <Activity className="h-4 w-4" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <LineChart className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Revenue & Quick Actions Grid */}
              <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
                <InvoiceDashboardWidget />

                {/* Mission Brief Card */}
                <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-primary/5 to-background">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Next Objectives
                    </CardTitle>
                    <CardDescription>
                      Recommended actions to strengthen your proof portfolio
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievementsList.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="rounded-full bg-primary/10 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Rocket className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Start by minting your first achievement badge
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-3">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <span className="text-sm font-medium">Profile Completed</span>
                            </div>
                            <Badge variant="outline" className="text-xs">100%</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <div className="flex items-center gap-3">
                              <AlertCircle className="h-5 w-5 text-amber-600" />
                              <span className="text-sm font-medium">Pending Verifications</span>
                            </div>
                            <Badge variant="outline" className="text-xs">2</Badge>
                          </div>
                        </div>
                        <div className="pt-2">
                          <Progress value={75} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-2">
                            Portfolio strength: 75%
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="outline">
                      View Recommendations
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Quick Actions Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                  <Badge variant="secondary" className="gap-1.5">
                    <Zap className="h-3 w-3" />
                    Instant Access
                  </Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {quickActions.map((action, index) => (
                    <QuickAction key={index} {...action} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              {/* Activity Timeline */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 p-3">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Activity Timeline</h2>
                      <p className="text-muted-foreground">Your recent achievements and milestones</p>
                    </div>
                  </div>
                  {achievementsList.length > 0 && (
                    <Badge variant="secondary" className="gap-2">
                      <Award className="h-4 w-4" />
                      {achievementsList.length} Total
                    </Badge>
                  )}
                </div>

                {achievementsList.length > 0 ? (
                  <AchievementList achievements={achievementsList} />
                ) : (
                  <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/10">
                    <CardContent className="py-16 text-center">
                      <div className="mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-600/10 to-indigo-600/10 p-6 w-fit">
                        <Award className="h-12 w-12 text-primary" />
                      </div>
                      <CardTitle className="text-2xl mb-3">Start Building Your Legacy</CardTitle>
                      <CardDescription className="text-base mb-6 max-w-md mx-auto">
                        Mint your first credential to begin building your verifiable proof portfolio on the blockchain.
                      </CardDescription>
                      <Button size="lg" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Mint First Achievement
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Performance Insights
                  </CardTitle>
                  <CardDescription>
                    Analytics and trends for your verifiable portfolio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Insights will appear once you have more activity
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AppShellClient>
  );
}