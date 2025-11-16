import Link from "next/link";
import { ArrowRight, Layers3, ShieldCheck, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const assistantPages = [
  {
    title: "Pitch Deck Studio",
    href: "/ai-assistant/pitch-deck",
    blurb:
      "Multi-step wizard, slide selection, AI editing, and export-ready deck workspace backed by Convex + OpenAI.",
    badge: "Slides + editing",
  },
  {
    title: "Business Plan Lab",
    href: "/ai-assistant/business-plan",
    blurb:
      "Generates bank-ready plans with KPI tables, use-of-funds, and summary bullets rooted in your credential hashes.",
    badge: "Narratives",
  },
  {
    title: "Resume & Bio Builder",
    href: "/ai-assistant/resume",
    blurb:
      "Transforms badge data into multi-section resumes, bios, and board-ready blurbs with deterministic checksums.",
    badge: "Talent ops",
  },
  {
    title: "Social Autopost Studio",
    href: "/ai-assistant/social",
    blurb:
      "Drafts multi-channel campaigns, cites DKG notes, and exports CSV schedules for schedulers or VA handoff.",
    badge: "Distribution",
  },
  {
    title: "Truth Alignment Lab",
    href: "/ai-assistant/truth",
    blurb:
      "Compares Grokipedia vs Wikipedia, quantifies divergences, and publishes Community Notes on the OriginTrail DKG.",
    badge: "Trust layer",
  },
  {
    title: "DKG Note Tester",
    href: "/ai-assistant/dkg-test",
    blurb:
      "Smoketest your Edge Node credentials by pushing a lightweight note before running production flows.",
    badge: "Edge node",
  },
];

const flowBlocks = [
  {
    title: "Context-aware prompts",
    icon: Layers3,
    detail:
      "Wallet sessions hydrate every agent with milestone hashes, climate KPIs, and the industries you operate in.",
  },
  {
    title: "Aligned outputs",
    icon: Workflow,
    detail:
      "Prompts call trusted helpers—OpenAI, Wikipedia, Grokipedia, OriginTrail—so each draft is grounded and reproducible.",
  },
  {
    title: "Verifiable delivery",
    icon: ShieldCheck,
    detail:
      "Documents, decks, and notes inherit deterministic checksums, making the Verify page an always-on truth surface.",
  },
];

export default function AIAssistantPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-3xl border bg-card/70 px-8 py-10 md:grid-cols-[1.3fr_0.7fr] md:items-center">
        <div className="space-y-5">
          <Badge variant="outline">Agent layer</Badge>
          <h1 className="text-3xl font-semibold leading-tight">
            Modular AI copilots, each mapped to a trust-preserving workflow.
          </h1>
          <p className="text-muted-foreground">
            Instead of one cluttered screen, every workflow now has a dedicated page with focused prompts, storage,
            and verification hooks. Start with Pitch Deck Studio or drop into any other copilot from the nav menu.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/ai-assistant/pitch-deck">
                Launch Pitch Deck Studio
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/ai-assistant/truth">Open Truth Alignment Lab</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-dashed p-6">
          <p className="text-sm text-muted-foreground">Typical pipeline</p>
          <ol className="mt-3 space-y-3 text-sm">
            <li>1. Pull latest badge + UAL context tied to the wallet session.</li>
            <li>2. Run the requested copilot with deterministic prompts.</li>
            <li>3. Save results to Convex with checksums and share links via `/verify`.</li>
          </ol>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {flowBlocks.map((block) => {
          const Icon = block.icon;
          return (
            <Card key={block.title}>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle>{block.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {block.detail}
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        {assistantPages.map((assistant) => (
          <Card key={assistant.title} className="flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{assistant.badge}</Badge>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Copilot
                </span>
              </div>
              <CardTitle className="text-2xl">{assistant.title}</CardTitle>
              <p className="text-sm text-muted-foreground">{assistant.blurb}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <Button variant="ghost" className="group w-full justify-start" asChild>
                <Link href={assistant.href}>
                  Go to {assistant.title}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
