import Link from "next/link";
import { ArrowRight, Check, Zap, Rocket, Shield, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const heroStats = [
  { label: "Verifiable credentials issued", value: "1,240" },
  { label: "Community notes published", value: "487" },
  { label: "AI workspaces launched", value: "312" },
];

const playbooks = [
  {
    title: "Trust Layer",
    icon: Shield,
    description:
      "Soulbound achievements on Moonbase Alpha plus verified OriginTrail notes prove you are who you say you are.",
  },
  {
    title: "Knowledge Layer",
    icon: Database,
    description:
      "A single Convex knowledge base keeps your plans, decks, and social content versioned in one workspace.",
  },
  {
    title: "Agent Layer",
    icon: Sparkles,
    description:
      "OpenAI powered copilots run due diligence, generate assets, and surface Grokipedia vs Wikipedia gaps.",
  },
];

const toolkits = [
  {
    title: "Pitch decks that cite reality",
    bullets: [
      "Answer business model questions once",
      "Autogenerate 14-slide decks with metrics pulled from your badges",
      "Export to PDF and send a verification link",
    ],
  },
  {
    title: "Truth Alignment Lab",
    bullets: [
      "Scrapes Grokipedia + Wikipedia for any topic",
      "Highlights bias, hallucinations, and missing context",
      "Publishes Community Notes to the OriginTrail DKG",
    ],
  },
  {
    title: "Proof-ready documents",
    bullets: [
      "Business plans, resumes, and partner updates are saved with a tamper-proof hash",
      "Investors can independently verify signatures via the public profile",
    ],
  },
];

export default function Home() {
  return (
    <div className="container-app section-spacing py-16">
      {/* Hero Section */}
      <section className="animate-in">
        <Card className="border-2 shadow-lg">
          <CardContent className="px-8 py-12 md:px-16 md:py-16">
            <div className="mx-auto max-w-4xl space-y-8 text-center">
              <Badge variant="secondary" className="gap-2 px-4 py-1.5">
                <Zap className="h-4 w-4" aria-hidden="true" />
                <span>AI trust operating system for founders</span>
              </Badge>

              <h1 className="text-balance">
                Launch faster with wallet-only access, AI copilots, and verifiable truth rails
              </h1>

              <p className="text-lead mx-auto max-w-3xl">
                VeriVenture unifies Moonbase Alpha credentials, OriginTrail Community Notes, and
                Next.js workspaces so entrepreneurs everywhere can prove traction and protect their
                ventures.
              </p>

              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/dashboard">
                    Go to dashboard
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/credentials">Review credentials</Link>
                </Button>
              </div>

              <dl className="grid gap-6 pt-8 text-left sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-xl border bg-muted/30 p-6 shadow-sm">
                    <dt className="text-muted">{stat.label}</dt>
                    <dd className="mt-2 text-3xl font-semibold tracking-tight">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Playbooks Section */}
      <section className="animate-in grid gap-6 md:grid-cols-3">
        {playbooks.map((block) => {
          const Icon = block.icon;
          return (
            <Card key={block.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
                <CardTitle>{block.title}</CardTitle>
                <CardDescription>{block.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>

      {/* Toolkits Section */}
      <section className="animate-in space-y-8">
        <div className="space-y-3">
          <h2>Enterprise-grade tooling without enterprise red tape</h2>
          <p className="text-lead max-w-3xl">
            Everything you need to build, verify, and share your venture&apos;s story with confidence.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {toolkits.map((tool) => (
            <Card key={tool.title} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tool.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3 text-sm">
                      <Check
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="animate-in">
        <Card className="border-2 border-primary bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-xl">
          <CardContent className="grid gap-8 p-8 md:grid-cols-2 md:items-center md:p-12">
            <div className="space-y-4">
              <h3 className="text-3xl font-semibold">Three steps to resilience</h3>
              <p className="text-primary-foreground/90">
                Connect an EVM wallet via RainbowKit, tell the AI assistant what you&apos;re
                building, and let VeriVenture assemble verifiable knowledge assets that back up
                every claim you make.
              </p>
              <Button
                variant="secondary"
                size="lg"
                asChild
                className="gap-2 hover:shadow-md"
              >
                <Link href="/ai-assistant">
                  Explore the agent layer
                  <Rocket className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            <div className="rounded-xl border border-primary-foreground/20 bg-background/10 p-6 backdrop-blur-sm">
              <ol className="space-y-4 text-sm leading-relaxed">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-semibold">
                    1
                  </span>
                  <div>
                    <strong className="block">Prove identity</strong>
                    <span className="text-primary-foreground/80">
                      Sign in with your Moonbase wallet and mint tamper-resistant badges.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-semibold">
                    2
                  </span>
                  <div>
                    <strong className="block">Capture knowledge</strong>
                    <span className="text-primary-foreground/80">
                      Generate decks, plans, and updates that inherit real metrics from your
                      badges.
                    </span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-foreground/20 text-sm font-semibold">
                    3
                  </span>
                  <div>
                    <strong className="block">Publish trust</strong>
                    <span className="text-primary-foreground/80">
                      Release OriginTrail notes that AI agents can query via MCP to stay aligned
                      with reality.
                    </span>
                  </div>
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
