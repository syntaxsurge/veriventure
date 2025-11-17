"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Zap,
  Shield,
  Sparkles,
  CheckCircle2,
  Rocket,
  TrendingUp,
  Lock,
  Database,
  Network,
  FileText,
  Wallet,
  Eye,
  Star,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { FloatingElements } from "@/components/ui/floating-elements";

const outcomes = [
  {
    icon: Zap,
    title: "Get paid now",
    description: "Create an on-chain invoice, share a link, and get paid with a wallet. Receipts are automatic & auditable.",
    cta: "Create an invoice",
    href: "/invoices/new",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: Shield,
    title: "Become instantly verifiable",
    description: "Publish a Supplier Passport with a DKG UAL and Trust Badge—buyers and investors verify in seconds.",
    cta: "Publish a passport",
    href: "/passport",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Sparkles,
    title: "Ship investor-ready materials",
    description: "AI generates pitch decks and business plans. Keep files private; publish a signed summary to DKG.",
    cta: "Generate a deck",
    href: "/ai-assistant/pitch-deck",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: CheckCircle2,
    title: "Prove the truth",
    description: "Compare sources, write a Truth Alignment note, and publish a Knowledge Asset anyone can verify.",
    cta: "Publish a truth note",
    href: "/ai-assistant/truth",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
];

const stats = [
  { value: "100%", label: "Verifiable", icon: CheckCircle2 },
  { value: "< 1min", label: "Setup Time", icon: Zap },
  { value: "On-Chain", label: "Proof", icon: Database },
  { value: "∞", label: "Scalable", icon: TrendingUp },
];

const steps = [
  {
    number: "01",
    title: "Build & record",
    description: "Use AI to create decks & plans. Record milestones and client wins. Everything is private by default.",
    icon: Rocket,
  },
  {
    number: "02",
    title: "Publish proof",
    description: "Where it matters, publish a Knowledge Asset (DKG UAL) and/or an on-chain reference. Now your claim has a clickable proof.",
    icon: Shield,
  },
  {
    number: "03",
    title: "Share & get paid",
    description: "Send an invoice link or verify link. Clients and investors click to confirm—and act.",
    icon: Wallet,
  },
];

const trustFeatures = [
  {
    title: "DKG Knowledge Assets (UAL)",
    description: "Signed, semantic records viewable in the public DKG Explorer.",
    icon: Database,
  },
  {
    title: "On-chain anchoring",
    description: "Link achievements and invoices to chain refs for durable, open validation.",
    icon: Network,
  },
  {
    title: "Privacy by design",
    description: "Your content stays off-chain; only proofs and hashes are public.",
    icon: Lock,
  },
];

const ecosystemBadges = [
  { name: "OriginTrail DKG", verified: true },
  { name: "NeuroWeb", verified: true },
  { name: "Moonbase Alpha", verified: true },
  { name: "Polkadot", verified: true },
  { name: "Web3 Native", verified: true },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="container-app relative min-h-[90vh] flex items-center justify-center py-20 md:py-32">
        <AnimatedGradientBg />
        <FloatingElements />

        <div className="relative z-10 mx-auto max-w-6xl space-y-16 text-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="border border-primary/30 bg-primary/10 px-6 py-2.5 text-sm font-medium backdrop-blur-sm"
              >
                <Network className="mr-2 h-4 w-4" />
                Powered by OriginTrail DKG • Built on Polkadot
              </Badge>
            </motion.div>

            <motion.h1
              className="text-6xl font-bold tracking-tight md:text-7xl lg:text-8xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Get Paid, Get Trusted,
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
                Get Funded
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto max-w-3xl text-xl text-muted-foreground md:text-2xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              VeriVenture is the entrepreneur OS with one-click invoices, AI-built investor materials,
              and a public trust layer powered by{" "}
              <span className="text-primary font-semibold">OriginTrail DKG</span> and{" "}
              <span className="text-primary font-semibold">Polkadot</span>. Turn claims into verifiable links
              partners can click to confirm and pay.
            </motion.p>
          </motion.div>

          <motion.div
            className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Button asChild size="lg" className="gap-2 h-14 px-10 text-lg shadow-lg hover:shadow-xl transition-shadow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold">
              <Link href="/dashboard">
                <Rocket className="h-5 w-5" />
                Start free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-10 text-lg border-2 border-primary/30 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 font-semibold"
            >
              <Link href="/proofs">
                <Eye className="mr-2 h-5 w-5" />
                See a live proof
              </Link>
            </Button>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="relative group"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                >
                  <div className="relative rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-sm p-6 text-center transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/10">
                    <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
                    <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Outcomes Section - Bento Grid */}
      <section className="container-app py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />

        <div className="relative mx-auto max-w-7xl space-y-16">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="px-4 py-2 text-sm font-semibold">
              <Star className="mr-2 h-4 w-4 fill-primary text-primary" />
              Real outcomes, not just features
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              What entrepreneurs get{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                on day one
              </span>
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
            {outcomes.map((outcome, index) => {
              const Icon = outcome.icon;
              return (
                <motion.div
                  key={outcome.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="group relative h-full border-2 transition-all hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-br ${outcome.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <CardHeader className="relative space-y-6 p-8">
                      <div className="flex items-start justify-between">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 transition-all group-hover:scale-110 group-hover:rotate-3">
                          <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      <div className="space-y-3">
                        <CardTitle className="text-2xl font-bold">{outcome.title}</CardTitle>
                        <CardDescription className="text-base leading-relaxed">
                          {outcome.description}
                        </CardDescription>
                      </div>

                      <Button asChild variant="link" className="w-fit p-0 h-auto text-primary font-semibold group/btn">
                        <Link href={outcome.href}>
                          {outcome.cta}
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                        </Link>
                      </Button>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section - Enhanced Timeline */}
      <section className="container-app py-32 relative">
        <div className="absolute inset-0 bg-muted/50" />

        <div className="relative mx-auto max-w-6xl space-y-16">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              How VeriVenture works
              <br />
              <span className="text-primary">3 simple steps</span>
            </h2>
          </motion.div>

          <div className="grid gap-12 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="relative space-y-6"
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-[5rem] top-16 hidden h-1 w-[calc(100%+3rem)] md:block">
                      <div className="h-full w-full bg-gradient-to-r from-primary via-purple-500 to-primary/20 rounded-full" />
                    </div>
                  )}

                  <div className="relative space-y-6">
                    <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-primary/30 bg-gradient-to-br from-primary/20 to-primary/5 text-3xl font-bold text-primary shadow-lg backdrop-blur-sm">
                      <Icon className="h-10 w-10" />
                    </div>

                    <div className="space-y-3">
                      <div className="text-sm font-bold text-primary/60">{step.number}</div>
                      <h3 className="text-2xl font-bold">{step.title}</h3>
                      <p className="text-muted-foreground text-base leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            className="flex flex-wrap gap-4 justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/proofs">
                <FileText className="mr-2 h-5 w-5" />
                See a DKG UAL
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-2">
              <Link href="/proofs">
                <Network className="mr-2 h-5 w-5" />
                See a live tx
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Trust Layer Section - Glassmorphism */}
      <section className="container-app py-32 relative">
        <AnimatedGradientBg />

        <div className="relative mx-auto max-w-6xl space-y-16">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Why partners{" "}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                trust your proofs
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              VeriVenture uses the OriginTrail Decentralized Knowledge Graph and Polkadot parachains
              so your critical claims are tamper-evident and independently verifiable
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3">
            {trustFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-2 border-primary/20 bg-background/50 backdrop-blur-xl transition-all hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2">
                    <CardHeader className="space-y-4 p-8">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl font-bold">{feature.title}</CardTitle>
                      <CardDescription className="text-base leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Ecosystem Badges */}
          <motion.div
            className="flex flex-wrap gap-3 justify-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {ecosystemBadges.map((badge, index) => (
              <motion.div
                key={badge.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
              >
                <Badge
                  variant="outline"
                  className="text-sm px-5 py-2.5 border-2 border-primary/30 bg-background/50 backdrop-blur-sm hover:border-primary/50 transition-colors font-semibold"
                >
                  {badge.name}
                  {badge.verified && <CheckCircle2 className="ml-2 h-4 w-4 text-primary fill-primary/20" />}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Polkadot Ecosystem Section */}
      <section className="container-app py-32 relative bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl space-y-12">
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Badge variant="secondary" className="px-4 py-2 text-sm font-semibold bg-primary/10">
              <Globe className="mr-2 h-4 w-4" />
              Built for the Polkadot Ecosystem
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              Powering verifiable entrepreneurship
              <br />
              <span className="text-primary">on Web3</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8">
              <div className="space-y-4">
                <Database className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-bold">OriginTrail DKG</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Decentralized Knowledge Graph ensures your business data is verifiable, tamper-proof, and accessible through universal asset locators (UALs).
                </p>
              </div>
            </Card>

            <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-500/5 to-transparent p-8">
              <div className="space-y-4">
                <Network className="h-12 w-12 text-primary" />
                <h3 className="text-2xl font-bold">Polkadot Parachains</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Leverage NeuroWeb and Moonbase Alpha for secure, scalable on-chain anchoring of your achievements, invoices, and credentials.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section - Premium Design */}
      <section className="container-app py-32">
        <motion.div
          className="mx-auto max-w-5xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="relative overflow-hidden rounded-3xl border-4 border-primary/30 bg-gradient-to-br from-primary/20 via-purple-500/10 to-primary/20 p-16 text-center shadow-2xl backdrop-blur-xl md:p-20">
            <div className="relative z-10 space-y-10">
              <div className="space-y-6">
                <motion.h2
                  className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  Make trust a link
                  <br />
                  <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
                    — not a promise
                  </span>
                </motion.h2>
                <motion.p
                  className="mx-auto max-w-2xl text-xl text-muted-foreground leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  Join entrepreneurs building verifiable businesses on Web3
                </motion.p>
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <Button asChild size="lg" className="gap-2 h-14 px-10 text-lg shadow-xl hover:shadow-2xl transition-shadow bg-primary/90 hover:bg-primary text-primary-foreground font-semibold">
                  <Link href="/dashboard">
                    <Rocket className="h-5 w-5" />
                    Start free
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-lg border-2 border-primary/30 bg-background/80 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 font-semibold"
                >
                  <Link href="/verify/demo-founder">
                    <Eye className="mr-2 h-5 w-5" />
                    See live proof
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Background decorations */}
            <motion.div
              className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}
