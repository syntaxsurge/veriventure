import Link from "next/link";
import { ArrowRight, Zap, Shield, Sparkles, TrendingUp, CheckCircle2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const outcomes = [
  {
    icon: Zap,
    title: "Get paid now",
    description: "Create an on-chain invoice, share a link, and get paid with a wallet. Receipts are automatic & auditable.",
    cta: "Create an invoice",
    href: "/invoices/new",
  },
  {
    icon: Shield,
    title: "Become instantly verifiable",
    description: "Publish a Supplier Passport with a DKG UAL and Trust Badge—buyers and investors verify in seconds.",
    cta: "Publish a passport",
    href: "/passport",
  },
  {
    icon: Sparkles,
    title: "Ship investor-ready materials",
    description: "AI generates pitch decks and business plans. Keep files private; publish a signed summary to DKG.",
    cta: "Generate a deck",
    href: "/ai-assistant/pitch-deck",
  },
  {
    icon: CheckCircle2,
    title: "Prove the truth",
    description: "Compare sources, write a Truth Alignment note, and publish a Knowledge Asset anyone can verify.",
    cta: "Publish a truth note",
    href: "/ai-assistant/truth",
  },
];

const steps = [
  {
    number: "01",
    title: "Build & record",
    description: "Use AI to create decks & plans. Record milestones and client wins. Everything is private by default.",
  },
  {
    number: "02",
    title: "Publish proof",
    description: "Where it matters, publish a Knowledge Asset (DKG UAL) and/or an on-chain reference. Now your claim has a clickable proof.",
  },
  {
    number: "03",
    title: "Share & get paid",
    description: "Send an invoice link or verify link. Clients and investors click to confirm—and act.",
  },
];

const trustFeatures = [
  {
    title: "DKG Knowledge Assets (UAL)",
    description: "Signed, semantic records viewable in the public DKG Explorer.",
  },
  {
    title: "On-chain anchoring",
    description: "Link achievements and invoices to chain refs for durable, open validation.",
  },
  {
    title: "Privacy by design",
    description: "Your content stays off-chain; only proofs and hashes are public.",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container-app relative min-h-[85vh] flex items-center justify-center py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl space-y-12 text-center">
          <div className="space-y-6 animate-in">
            <Badge
              variant="secondary"
              className="border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium"
            >
              Powered by OriginTrail DKG • Built on Polkadot
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              Get Paid, Get Trusted,
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Get Funded
              </span>
            </h1>

            <p className="mx-auto max-w-3xl text-xl text-muted-foreground md:text-2xl">
              VeriVenture is the entrepreneur OS with one-click invoices, AI-built investor materials,
              and a public trust layer powered by OriginTrail DKG and Polkadot. Turn claims into verifiable links
              partners can click to confirm and pay.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in">
            <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
              <Link href="/dashboard">
                Start free
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/proofs">See a live proof</Link>
            </Button>
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </section>

      {/* Outcomes Section */}
      <section className="container-app py-24">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4 animate-in">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              What entrepreneurs get on day one
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real outcomes, not just features
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 animate-in">
            {outcomes.map((outcome) => {
              const Icon = outcome.icon;
              return (
                <Card
                  key={outcome.title}
                  className="group relative border-2 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <CardHeader className="space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                    </div>
                    <CardTitle className="text-xl">{outcome.title}</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {outcome.description}
                    </CardDescription>
                    <Button asChild variant="link" className="w-fit p-0 h-auto">
                      <Link href={outcome.href}>{outcome.cta} →</Link>
                    </Button>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container-app py-24 bg-muted/30">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4 animate-in">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How VeriVenture works (3 simple steps)
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3 animate-in">
            {steps.map((step, index) => (
              <div key={step.number} className="relative space-y-4">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[4.5rem] top-12 hidden h-0.5 w-[calc(100%+3rem)] bg-gradient-to-r from-primary/50 to-primary/20 md:block" />
                )}

                <div className="space-y-3">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-background text-2xl font-bold text-primary">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center mt-8">
            <Button asChild variant="outline">
              <Link href="/proofs">See a DKG UAL</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/proofs">See a live tx</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Layer Section */}
      <section className="container-app py-24">
        <div className="mx-auto max-w-6xl space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Why partners trust your proofs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              VeriVenture uses the OriginTrail Decentralized Knowledge Graph and Polkadot parachains
              so your critical claims are tamper-evident and independently verifiable
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {trustFeatures.map((feature) => (
              <Card key={feature.title} className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 justify-center mt-8">
            <Badge variant="outline" className="text-sm px-4 py-2">DKG ✓</Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">NeuroWeb testnet ✓</Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">Moonbase Alpha EVM ✓</Badge>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="container-app py-24">
        <div className="mx-auto max-w-4xl animate-in">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center shadow-xl md:p-16">
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  Make trust a link — not a promise
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                  Join entrepreneurs building verifiable businesses on Web3
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
                  <Link href="/dashboard">
                    Start free
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
                  <Link href="/verify/demo-founder">See live proof</Link>
                </Button>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
