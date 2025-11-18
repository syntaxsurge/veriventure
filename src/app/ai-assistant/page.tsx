import Link from "next/link";
import { ArrowRight, Layers, ShieldCheck, Workflow, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AppShell } from "@/components/layout/app-shell";

const assistantPages = [
  {
    title: "Pitch Deck Studio",
    href: "/ai-assistant/pitch-deck",
    blurb: "AI-powered slide decks with verified metrics",
    badge: "Slides",
  },
  {
    title: "Business Plan Lab",
    href: "/ai-assistant/business-plan",
    blurb: "Generate comprehensive business plans with KPIs",
    badge: "Planning",
  },
  {
    title: "Resume Builder",
    href: "/ai-assistant/resume",
    blurb: "Professional resumes from verified credentials",
    badge: "Talent",
  },
  {
    title: "Truth Alignment Lab",
    href: "/ai-assistant/truth",
    blurb: "Compare sources and publish verified notes",
    badge: "Verification",
  },
  {
    title: "DKG Activity",
    href: "/ai-assistant/dkg-test",
    blurb: "View all published knowledge assets",
    badge: "Explorer",
  },
];

const principles = [
  {
    title: "Context-Aware",
    icon: Layers,
    detail: "Agents access your credentials and verified data",
  },
  {
    title: "Truth-Aligned",
    icon: Workflow,
    detail: "All outputs grounded in verifiable sources",
  },
  {
    title: "Verifiable",
    icon: ShieldCheck,
    detail: "Every document includes proof of authenticity",
  },
];

export default function AIAssistantPage() {
  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-linear-to-br from-primary/5 via-background to-background p-12 text-center shadow-lg md:p-16">
          <div className="relative z-10 mx-auto max-w-3xl space-y-8">
            <Badge
              variant="secondary"
              className="border border-primary/20 bg-primary/5 gap-2"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI Assistant Hub
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Build with AI,
              <br />
              <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Verify with Truth
              </span>
            </h1>

            <p className="text-xl text-muted-foreground">
              AI copilots powered by your verifiable credentials
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" className="gap-2">
                <Link href="/ai-assistant/pitch-deck">
                  Pitch Deck Studio
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/ai-assistant/truth">Truth Alignment</Link>
              </Button>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        </div>

        {/* Core Principles */}
        <div className="grid gap-6 md:grid-cols-3">
          {principles.map((principle) => {
            const Icon = principle.icon;
            return (
              <Card key={principle.title} className="border-2 transition-all hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{principle.title}</CardTitle>
                  <CardDescription className="text-base">{principle.detail}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Copilot Directory */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold">Available Tools</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assistantPages.map((assistant) => (
              <Card
                key={assistant.title}
                className="group flex flex-col justify-between border-2 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <CardHeader className="space-y-3">
                  <Badge variant="secondary" className="w-fit">{assistant.badge}</Badge>
                  <CardTitle className="text-xl">{assistant.title}</CardTitle>
                  <CardDescription className="text-base">{assistant.blurb}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="ghost" className="group w-full justify-start gap-2" asChild>
                    <Link href={assistant.href}>
                      <span>Open tool</span>
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
