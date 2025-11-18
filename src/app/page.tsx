"use client";

import { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { FloatingElements } from "@/components/ui/floating-elements";
import {
  Sparkles,
  Shield,
  Rocket,
  DollarSign,
  FileText,
  Award,
  TrendingUp,
  Users,
  Globe,
  Zap,
  Check,
  ArrowRight,
  Play,
  Star,
  ChevronRight,
  Building2,
  Brain,
  Lock,
  BarChart3,
  Target,
  Trophy,
  Wallet,
  Code,
  Layers,
  GitBranch,
  Database,
  Cloud,
  Timer,
  CheckCircle2,
  XCircle,
  Eye,
  Network,
  Cpu,
  Activity,
  Briefcase,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Send,
  Heart,
  Coffee,
  Command
} from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";

// Stats data
const stats = [
  { label: "Active Founders", value: 12500, suffix: "+", icon: Users },
  { label: "Verified Achievements", value: 45000, suffix: "+", icon: Award },
  { label: "Invoices Processed", value: 8500000, prefix: "$", suffix: "+", icon: DollarSign },
  { label: "DKG Publications", value: 95000, suffix: "+", icon: Database }
];

// Features data
const features = [
  {
    title: "Achievement Badges",
    description: "Create verifiable, on-chain credentials that prove your milestones",
    icon: Award,
    gradient: "from-purple-600 to-indigo-600",
    bg: "from-purple-500/10 to-indigo-500/10",
    link: "/credentials",
    benefits: ["Soulbound NFTs", "Tamper-proof", "Instant verification"],
    stats: { users: "5K+", satisfaction: "98%" }
  },
  {
    title: "AI Pitch Deck Studio",
    description: "Generate investor-ready pitch decks in minutes with GPT-4",
    icon: FileText,
    gradient: "from-blue-600 to-cyan-600",
    bg: "from-blue-500/10 to-cyan-500/10",
    link: "/ai-assistant/pitch-deck",
    benefits: ["Industry templates", "Export to PPTX/PDF", "AI enhancements"],
    stats: { decks: "10K+", funded: "$2M+" }
  },
  {
    title: "Smart Invoicing",
    description: "Accept crypto payments with automated reconciliation",
    icon: DollarSign,
    gradient: "from-green-600 to-emerald-600",
    bg: "from-green-500/10 to-emerald-500/10",
    link: "/invoices",
    benefits: ["Multi-currency", "Settlement proofs", "Revenue attestations"],
    stats: { processed: "$8.5M", time: "< 1min" }
  },
  {
    title: "Truth Alignment",
    description: "Verify claims with AI and publish to the DKG",
    icon: Shield,
    gradient: "from-amber-600 to-orange-600",
    bg: "from-amber-500/10 to-orange-500/10",
    link: "/ai-assistant/truth",
    benefits: ["AI verification", "DKG publishing", "Permanent records"],
    stats: { verified: "95K+", accuracy: "99.9%" }
  },
  {
    title: "Business Plan AI",
    description: "Generate comprehensive business plans with market analysis",
    icon: TrendingUp,
    gradient: "from-pink-600 to-rose-600",
    bg: "from-pink-500/10 to-rose-500/10",
    link: "/ai-assistant/business-plan",
    benefits: ["Market research", "Financial projections", "Export ready"],
    stats: { plans: "3K+", quality: "A+" }
  },
  {
    title: "Public Verify Pages",
    description: "Share your achievements with a single trusted link",
    icon: Globe,
    gradient: "from-slate-600 to-slate-800",
    bg: "from-slate-500/10 to-slate-700/10",
    link: "/verify",
    benefits: ["Custom handle", "Real-time updates", "Investor ready"],
    stats: { pages: "12K+", views: "500K+" }
  }
];

// Testimonials
const testimonials = [
  {
    name: "Sarah Chen",
    role: "Founder, TechFlow",
    content: "VeriVenture helped us close our seed round 3x faster with verifiable traction proofs.",
    avatar: "SC",
    rating: 5,
    company: "Series A Startup",
    raised: "$2.5M"
  },
  {
    name: "Alex Rodriguez",
    role: "CEO, BlockPay",
    content: "The AI pitch deck generator saved us weeks of work and impressed every investor.",
    avatar: "AR",
    rating: 5,
    company: "Fintech",
    raised: "$1.8M"
  },
  {
    name: "Emily Johnson",
    role: "Founder, GreenTech",
    content: "Smart invoicing made our crypto payments seamless. Revenue attestations are game-changing!",
    avatar: "EJ",
    rating: 5,
    company: "Climate Tech",
    raised: "$3.2M"
  },
  {
    name: "Michael Kim",
    role: "CTO, DataFlow",
    content: "The DKG integration gives us permanent, verifiable records that investors love.",
    avatar: "MK",
    rating: 5,
    company: "Data Analytics",
    raised: "$1.5M"
  }
];

// Technology stack
const techStack = [
  { name: "Polkadot", icon: "🔴", description: "Multi-chain ecosystem", color: "from-pink-500 to-pink-700" },
  { name: "Moonbeam", icon: "🌙", description: "EVM compatibility", color: "from-blue-500 to-indigo-700" },
  { name: "OriginTrail", icon: "🌐", description: "Decentralized Knowledge Graph", color: "from-green-500 to-emerald-700" },
  { name: "OpenAI GPT-4", icon: "🤖", description: "AI-powered features", color: "from-purple-500 to-purple-700" },
  { name: "IPFS", icon: "📦", description: "Decentralized storage", color: "from-orange-500 to-red-700" },
  { name: "Next.js", icon: "⚡", description: "Modern web framework", color: "from-slate-500 to-slate-700" }
];

// Comparison table
type ComparisonEntry = {
  feature: string;
  veriventure: boolean | "partial";
  traditional: boolean | "partial";
};

const comparisonData: ComparisonEntry[] = [
  { feature: "Verifiable Achievements", veriventure: true, traditional: false },
  { feature: "AI-Powered Tools", veriventure: true, traditional: "partial" },
  { feature: "Blockchain Integration", veriventure: true, traditional: false },
  { feature: "Crypto Payments", veriventure: true, traditional: false },
  { feature: "DKG Publishing", veriventure: true, traditional: false },
  { feature: "Real-time Verification", veriventure: true, traditional: false },
  { feature: "Decentralized Storage", veriventure: true, traditional: false },
  { feature: "No Platform Lock-in", veriventure: true, traditional: false },
  { feature: "Privacy by Design", veriventure: true, traditional: "partial" },
  { feature: "Global Accessibility", veriventure: true, traditional: "partial" }
];

// Process steps
const processSteps = [
  {
    number: "01",
    title: "Connect & Create",
    description: "Sign in with your wallet and start building your verifiable profile",
    icon: Wallet,
    details: ["No passwords needed", "Instant setup", "Secure authentication"]
  },
  {
    number: "02",
    title: "Build & Verify",
    description: "Generate AI-powered documents and mint on-chain achievements",
    icon: Award,
    details: ["AI assistance", "Blockchain proof", "Tamper-evident records"]
  },
  {
    number: "03",
    title: "Publish & Share",
    description: "Publish to DKG and share your verify page with stakeholders",
    icon: Globe,
    details: ["Permanent records", "One-click sharing", "Real-time updates"]
  },
  {
    number: "04",
    title: "Grow & Succeed",
    description: "Track engagement, receive payments, and scale your venture",
    icon: Trophy,
    details: ["Analytics dashboard", "Smart invoicing", "Investor connections"]
  }
];

// Use cases
const useCases = [
  {
    title: "Startups",
    description: "Close funding rounds faster with verifiable traction",
    icon: Rocket,
    benefits: ["Investor deck generation", "Traction proofs", "Due diligence docs"]
  },
  {
    title: "Freelancers",
    description: "Build trust and get paid instantly with crypto invoices",
    icon: Briefcase,
    benefits: ["Portfolio verification", "Smart invoicing", "Client testimonials"]
  },
  {
    title: "Agencies",
    description: "Showcase achievements and manage client relationships",
    icon: Building2,
    benefits: ["Case study proofs", "Team credentials", "Revenue attestations"]
  },
  {
    title: "DAOs",
    description: "Transparent governance with verifiable proposals",
    icon: Users,
    benefits: ["Proposal tracking", "Vote verification", "Treasury proofs"]
  }
];

export default function LandingPage() {
  const router = useRouter();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState("features");
  const [isYearly, setIsYearly] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Animated background particles
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1
    }));
    setParticles(newParticles);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <AnimatedGradientBg />
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-background to-blue-900/20" />
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size
            }}
            animate={{
              y: [-20, 20],
              x: [0, Math.sin(particle.id) * 10],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Hero Section - Enhanced */}
      <section className="relative min-h-screen flex items-center justify-center px-4 py-20">
        <FloatingElements />
        <motion.div
          style={{ y, opacity }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-linear-to-b from-purple-600/10 via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Announcement Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Badge
                className="px-4 py-1.5 text-sm border-purple-500/50 bg-purple-500/10 backdrop-blur-sm"
                variant="outline"
              >
                <Sparkles className="mr-2 h-4 w-4 text-purple-400" />
                <span className="font-medium">New: AI-Powered Truth Alignment Now Live</span>
                <ChevronRight className="ml-2 h-4 w-4" />
              </Badge>
            </motion.div>

            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Build Trust.
              </motion.span>
              <motion.span
                className="block bg-linear-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Get Funded.
              </motion.span>
              <motion.span
                className="block"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                Scale Fast.
              </motion.span>
            </h1>

            <motion.p
              className="mx-auto mb-8 max-w-2xl text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              The only platform that combines AI-powered tools, blockchain verification, and
              decentralized knowledge graphs to help entrepreneurs succeed.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    size="lg"
                    className="h-14 px-8 text-lg bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl shadow-purple-500/25 transition-all hover:scale-105"
                    onClick={openConnectModal}
                  >
                    <Wallet className="mr-2 h-5 w-5" />
                    Start Building Trust
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </ConnectButton.Custom>

              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-lg border-2 backdrop-blur-sm hover:bg-background/80 transition-all hover:scale-105"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo (2 min)
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>SOC2 Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-green-500" />
                <span>GDPR Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Audited Smart Contracts</span>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Stats Section - Enhanced with Animation */}
      <section className="relative py-20 px-4 bg-linear-to-b from-transparent via-muted/50 to-transparent">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={idx}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                  >
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500/20 to-indigo-500/20 mb-4">
                      <Icon className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold sm:text-4xl lg:text-5xl">
                      <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        {stat.prefix}
                        <CountUp
                          end={stat.value}
                          duration={2.5}
                          separator=","
                          enableScrollSpy
                          scrollSpyOnce
                        />
                        {stat.suffix}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Enhanced with Stats */}
      <section className="relative py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <Zap className="mr-1 h-3 w-3" />
              Platform Features
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Everything You Need to{" "}
              <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Powerful tools designed for modern entrepreneurs in the Web3 ecosystem
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="group relative h-full overflow-hidden transition-all hover:shadow-2xl hover:scale-105 hover:-translate-y-2">
                  <div className={cn("absolute inset-0 bg-linear-to-br opacity-5 transition-opacity group-hover:opacity-10", feature.bg)} />

                  {/* Stats Badge - Fixed contrast */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 font-semibold">
                      {Object.values(feature.stats)[0]}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className={cn("mb-4 inline-flex rounded-xl p-3 bg-linear-to-br transition-all group-hover:scale-110", feature.bg)}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 shrink-0" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Feature Stats - Fixed contrast */}
                    <div className="flex items-center justify-between text-xs mb-4">
                      {Object.entries(feature.stats).map(([key, value]) => (
                        <span key={key} className="flex items-center gap-1">
                          <Badge variant="secondary" className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800">
                            <span className="font-semibold">{value}</span>
                          </Badge>
                          <span className="text-muted-foreground">{key}</span>
                        </span>
                      ))}
                    </div>

                    <Button
                      asChild
                      variant="ghost"
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                    >
                      <Link href={feature.link}>
                        Learn More
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="relative py-20 px-4 bg-linear-to-b from-background via-muted/50 to-background">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <Activity className="mr-1 h-3 w-3" />
              Live Demo
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl">
              See VeriVenture in <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Action</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                  <TabsTrigger value="features" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Features
                  </TabsTrigger>
                  <TabsTrigger value="process" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                    <Activity className="mr-2 h-4 w-4" />
                    Process
                  </TabsTrigger>
                  <TabsTrigger value="usecases" className="data-[state=active]:bg-linear-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Use Cases
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="features" className="p-6">
                  <div className="aspect-video rounded-lg bg-linear-to-br from-purple-500/10 to-indigo-500/10 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="bg-linear-to-r from-purple-600 to-indigo-600"
                      onClick={() => setIsVideoPlaying(true)}
                    >
                      <Play className="mr-2 h-5 w-5" />
                      Watch Features Demo
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="process" className="p-6">
                  <div className="space-y-6">
                    {processSteps.map((step, idx) => (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        className="flex gap-6 items-start"
                      >
                        <div className="shrink-0">
                          <div className="h-12 w-12 rounded-full bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {step.number}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                          <p className="text-muted-foreground mb-3">{step.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {step.details.map((detail) => (
                              <Badge key={detail} variant="secondary" className="text-xs">
                                {detail}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="usecases" className="p-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {useCases.map((useCase, idx) => (
                      <motion.div
                        key={useCase.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                      >
                        <Card className="h-full hover:shadow-lg transition-all">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-linear-to-br from-purple-500/20 to-indigo-500/20 flex items-center justify-center">
                                <useCase.icon className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{useCase.title}</CardTitle>
                                <CardDescription className="text-sm">{useCase.description}</CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {useCase.benefits.map((benefit) => (
                                <li key={benefit} className="flex items-center gap-2 text-sm">
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table - Enhanced */}
      <section className="relative py-20 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <BarChart3 className="mr-1 h-3 w-3" />
              Platform Comparison
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl">
              Why <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">VeriVenture</span> Wins
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              See how we stack up against traditional platforms
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="overflow-hidden backdrop-blur-sm bg-background/80">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-linear-to-r from-purple-500/5 to-indigo-500/5">
                      <th className="px-6 py-4 text-left font-semibold">Feature</th>
                      <th className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Sparkles className="h-4 w-4 text-purple-600" />
                          <span className="font-semibold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            VeriVenture
                          </span>
                        </div>
                      </th>
                      <th className="px-6 py-4 text-center text-muted-foreground">
                        Traditional Platforms
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((item, idx) => (
                      <motion.tr
                        key={idx}
                        className="border-b transition-colors hover:bg-muted/50"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <td className="px-6 py-4 font-medium">{item.feature}</td>
                        <td className="px-6 py-4 text-center">
                          {item.veriventure === true ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              whileInView={{ scale: 1 }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
                            </motion.div>
                          ) : item.veriventure === "partial" ? (
                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Partial</Badge>
                          ) : (
                            <XCircle className="mx-auto h-5 w-5 text-red-500" />
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {item.traditional === true ? (
                            <CheckCircle2 className="mx-auto h-5 w-5 text-green-500" />
                          ) : item.traditional === "partial" ? (
                            <Badge variant="secondary">Partial</Badge>
                          ) : (
                            <XCircle className="mx-auto h-5 w-5 text-muted-foreground/50" />
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Testimonials - Enhanced with Company Info */}
      <section className="relative py-20 px-4 bg-linear-to-b from-background via-muted/50 to-background">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <Users className="mr-1 h-3 w-3" />
              Testimonials
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl">
              Loved by <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Founders</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Join thousands of entrepreneurs building verifiable businesses
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-xl transition-all hover:-translate-y-2">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="mb-4 flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="mb-4 text-muted-foreground flex-1">"{testimonial.content}"</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-purple-600 to-indigo-600 text-white font-semibold">
                          {testimonial.avatar}
                        </div>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary">{testimonial.company}</Badge>
                        <span className="text-green-600 font-semibold">{testimonial.raised} raised</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack - Enhanced with Gradients */}
      <section className="relative py-20 px-4">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <Layers className="mr-1 h-3 w-3" />
              Technology Stack
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl">
              Built on <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Battle-Tested Tech</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Enterprise-grade infrastructure for your entrepreneurial journey
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-6">
            {techStack.map((tech, idx) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
              >
                <Card className="group h-full text-center transition-all hover:shadow-2xl cursor-pointer overflow-hidden hover:-translate-y-1">
                  <div className={cn("absolute inset-0 bg-linear-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-300", tech.color)} />
                  <CardContent className="relative p-6">
                    <div className="mb-2 text-4xl transform transition-transform group-hover:scale-110">
                      {tech.icon}
                    </div>
                    <h3 className="font-semibold">{tech.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{tech.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section - Polkadot Ecosystem Style */}
      <section id="pricing" className="relative py-20 px-4 bg-linear-to-b from-background via-muted/30 to-background">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-r from-purple-600/5 via-transparent to-indigo-600/5" />
        </div>

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mb-12 text-center"
          >
            <Badge className="mb-4" variant="outline">
              <DollarSign className="mr-1 h-3 w-3" />
              Pricing Plans
            </Badge>
            <h2 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              Choose Your <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Growth Path</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Transparent pricing designed for founders at every stage. Start free, scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <span className={cn("text-sm font-medium", !isYearly && "text-foreground")}>Monthly</span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 data-[state=checked]:bg-linear-to-r data-[state=checked]:from-purple-600 data-[state=checked]:to-indigo-600"
                data-state={isYearly ? "checked" : "unchecked"}
              >
                <span className={cn(
                  "inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform",
                  isYearly ? "translate-x-6" : "translate-x-1"
                )} />
              </button>
              <span className={cn("text-sm font-medium", isYearly && "text-foreground")}>
                Yearly
                <Badge className="ml-2" variant="secondary">Save 20%</Badge>
              </span>
            </div>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {/* Starter Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="relative h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-slate-500/5 to-slate-700/5" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary">Free Forever</Badge>
                    <Sparkles className="h-5 w-5 text-slate-600" />
                  </div>
                  <CardTitle className="text-2xl">Starter</CardTitle>
                  <CardDescription>Perfect for individual founders getting started</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground ml-2">/forever</span>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">5 Achievement badges per month</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">1 Pitch deck generation</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Basic AI assistance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Public verify page</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Invoice creation (5/month)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                      <span className="text-sm">DKG publishing (3/month)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Custom domain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-muted-foreground/50 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">Priority support</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline" size="lg" asChild>
                    <Link href="/dashboard">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <div className="absolute -inset-1 rounded-2xl bg-linear-to-r from-purple-600 to-indigo-600 opacity-75 blur-lg animate-pulse" />
              <Card className="relative h-full overflow-hidden border-0 shadow-2xl">
                <div className="absolute inset-0 bg-linear-to-br from-purple-600/10 to-indigo-600/10" />
                <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-purple-600 to-indigo-600" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Badge className="bg-linear-to-r from-purple-600 to-indigo-600 text-white">Most Popular</Badge>
                    <Trophy className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardTitle className="text-2xl">Pro</CardTitle>
                  <CardDescription>For growing startups that need more power</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${isYearly ? "15" : "19"}</span>
                    {!isYearly && <span className="text-sm line-through text-muted-foreground ml-2">$29</span>}
                    <span className="text-muted-foreground ml-2">/month</span>
                  </div>
                  {isYearly && (
                    <Badge className="mt-2" variant="secondary">
                      <Check className="mr-1 h-3 w-3" />
                      Save $48 yearly
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Unlimited achievement badges</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Unlimited pitch decks</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Advanced AI assistance</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Custom verify domain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Unlimited invoices</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Unlimited DKG publishing</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Priority email support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">Team collaboration (3 users)</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700" size="lg" asChild>
                    <Link href="/dashboard?plan=pro">Start Free Trial</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">14-day free trial • No credit card required</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="relative h-full overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all">
                <div className="absolute inset-0 bg-linear-to-br from-amber-500/5 to-orange-600/5" />
                <CardHeader className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="border-amber-500/50">Full Control</Badge>
                    <Building2 className="h-5 w-5 text-amber-600" />
                  </div>
                  <CardTitle className="text-2xl">Enterprise</CardTitle>
                  <CardDescription>For organizations requiring custom solutions</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Everything in Pro</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Unlimited team members</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">White-label branding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">Custom integrations</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">On-premise deployment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">24/7 phone & email support</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                      <span className="text-sm">SLA guarantees</span>
                    </li>
                  </ul>
                  <Button className="w-full mt-6" variant="outline" size="lg" asChild>
                    <a href="mailto:enterprise@veriventure.xyz">Contact Sales</a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Pricing FAQs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-muted-foreground">
              Questions about pricing? Check our{" "}
              <Link href="/help" className="text-primary hover:underline">
                Help Center
              </Link>
              {" "}or{" "}
              <a href="mailto:support@veriventure.xyz" className="text-primary hover:underline">
                contact support
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Premium Design */}
      <section className="relative py-20 px-4">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="relative overflow-hidden border-2 border-purple-500/20">
              <div className="absolute inset-0 bg-linear-to-br from-purple-600/20 via-indigo-600/20 to-pink-600/20" />

              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute -top-1/2 -left-1/2 w-full h-full bg-linear-to-br from-purple-600/30 to-transparent rounded-full blur-3xl"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <motion.div
                  className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-linear-to-tl from-indigo-600/30 to-transparent rounded-full blur-3xl"
                  animate={{
                    rotate: -360,
                    scale: [1.2, 1, 1.2]
                  }}
                  transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              <CardContent className="relative z-10 p-12 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <Badge className="mb-6 px-4 py-2 text-sm" variant="secondary">
                    <Rocket className="mr-2 h-4 w-4" />
                    Limited Time: 50% Off Pro Plans
                  </Badge>
                </motion.div>

                <motion.h2
                  className="mb-4 text-4xl font-bold sm:text-5xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  Ready to Transform Your{" "}
                  <span className="bg-linear-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
                    Startup Journey?
                  </span>
                </motion.h2>

                <motion.p
                  className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Join thousands of founders who are building trust, getting funded, and scaling faster with VeriVenture.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <ConnectButton.Custom>
                    {({ openConnectModal }) => (
                      <Button
                        size="lg"
                        className="h-14 px-8 text-lg bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-xl transition-all hover:scale-105"
                        onClick={openConnectModal}
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </ConnectButton.Custom>

                  <Link href="/pricing">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-lg border-2 backdrop-blur-sm hover:bg-background/80 transition-all hover:scale-105"
                    >
                      View Pricing
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Free forever tier</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>5 minute setup</span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Final Trust Badges */}
          <motion.div
            className="mt-12 flex flex-wrap items-center justify-center gap-8 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 0.6, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-medium uppercase tracking-wider">Trusted by</span>
            <div className="flex flex-wrap items-center gap-8 text-sm font-semibold">
              <span>Polkadot</span>
              <span>Moonbeam</span>
              <span>OriginTrail</span>
              <span>OpenAI</span>
              <span>IPFS</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-black shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="h-full w-full"
                allowFullScreen
              />
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 backdrop-blur hover:bg-white/20 transition-colors"
              >
                <XCircle className="h-6 w-6 text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
