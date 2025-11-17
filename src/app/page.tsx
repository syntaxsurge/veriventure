import Link from "next/link";
import {
  ArrowRightIcon,
  CheckCircledIcon,
  LightningBoltIcon,
  RocketIcon,
} from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const heroStats = [
  { label: "Verifiable credentials issued", value: "1,240" },
  { label: "Community notes published", value: "487" },
  { label: "AI workspaces launched", value: "312" },
];

const playbooks = [
  {
    title: "Trust Layer",
    description:
      "Soulbound achievements on Moonbase Alpha plus verified OriginTrail notes prove you are who you say you are.",
  },
  {
    title: "Knowledge Layer",
    description:
      "A single Convex knowledge base keeps your plans, decks, and social content versioned in one workspace.",
  },
  {
    title: "Agent Layer",
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
    <div className="space-y-16">
      <section className="grid gap-10 rounded-3xl border bg-card/80 px-8 py-12 text-center shadow-sm md:px-12">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
            <LightningBoltIcon className="h-4 w-4" />
            AI trust operating system for founders
          </span>
          <h1 className="text-4xl font-semibold leading-tight text-balance md:text-5xl">
            Launch faster with wallet-only access, AI copilots, and verifiable
            truth rails.
          </h1>
          <p className="text-lg text-muted-foreground md:text-xl">
            VeriVenture unifies Moonbase Alpha credentials, OriginTrail
            Community Notes, and Next.js workspaces so entrepreneurs everywhere
            can prove traction and protect their ventures.
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                Go to dashboard
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/verify/demo">Explore Verify demo</Link>
            </Button>
          </div>
        </div>
        <dl className="grid gap-6 text-left sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border p-5 text-left shadow-sm"
            >
              <dt className="text-sm text-muted-foreground">{stat.label}</dt>
              <dd className="text-2xl font-semibold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {playbooks.map((block) => (
          <Card key={block.title} className="bg-muted/30">
            <CardHeader>
              <CardTitle>{block.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {block.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-6">
        <h2 className="text-3xl font-semibold text-balance">
          Enterprise-grade tooling without enterprise red tape.
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {toolkits.map((tool) => (
            <Card key={tool.title}>
              <CardHeader>
                <CardTitle className="text-2xl">{tool.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {tool.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <CheckCircledIcon className="mt-1 h-4 w-4 text-primary" />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border bg-primary text-primary-foreground px-8 py-10 shadow-lg md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <h3 className="text-3xl font-semibold">Three steps to resilience</h3>
          <p className="text-primary-foreground/90">
            Connect an EVM wallet via RainbowKit, tell the AI assistant
            what you&apos;re building, and let VeriVenture assemble
            verifiable knowledge assets that back up every claim you make.
          </p>
          <Button variant="secondary" asChild>
            <Link href="/ai-assistant">
              Explore the agent layer
              <RocketIcon className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="rounded-2xl bg-background/10 p-6 text-sm leading-relaxed text-primary-foreground/90">
          <ol className="space-y-4">
            <li>
              <strong>1. Prove identity.</strong> Sign in with your Moonbase
              wallet and mint tamper-resistant badges.
            </li>
            <li>
              <strong>2. Capture knowledge.</strong> Generate decks, plans, and
              updates that inherit real metrics from your badges.
            </li>
            <li>
              <strong>3. Publish trust.</strong> Release OriginTrail notes that
              AI agents can query via MCP to stay aligned with reality.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
