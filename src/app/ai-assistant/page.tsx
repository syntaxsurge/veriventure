import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DkgNoteTester } from "@/components/dkg/dkg-note-tester";
import { TruthAlignmentLab } from "@/components/truth/truth-alignment-lab";
import { PitchDeckGenerator } from "@/components/ai/pitch-deck-generator";
import { BusinessPlanWriter } from "@/components/ai/business-plan-writer";
import { ResumeBuilder } from "@/components/ai/resume-builder";
import { SocialPostStudio } from "@/components/ai/social-poster";

const assistants = [
  {
    title: "Pitch Deck Studio",
    summary:
      "Transforms your answers into a 14-slide investor story and injects verified KPIs straight from your badges.",
    output:
      "Exports to PDF and keeps a hash in Convex so the Verify page can detect tampering.",
  },
  {
    title: "Truth Alignment Lab",
    summary:
      "Fetches Grokipedia + Wikipedia topics, runs semantic similarity, and walks you through publishing a Community Note.",
    output:
      "Returns a DKG UAL you can share with policy makers or AI agents through MCP.",
  },
  {
    title: "Operator Desk",
    summary:
      "Writes hiring briefs, talent bios, and multi-channel social posts with context from your documents.",
    output:
      "Schedules copy to CSV or webhooks and cites the verification link in every asset.",
  },
  {
    title: "Resume + Bio Builder",
    summary:
      "Transforms raw achievements into bulletproof bios for accelerators, boards, and policy grants.",
    output:
      "Outputs multi-section resumes with skill tags, stored alongside other documents.",
  },
  {
    title: "Notes Vault",
    summary:
      "Capture diligence, climate impact research, and investor commitments directly in the workspace.",
    output:
      "Pinned notes stay tied to your wallet and can link back to badges or Community Notes.",
  },
];

export default function AIAssistantPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-6 rounded-3xl border bg-card/70 px-8 py-10 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <Badge variant="outline">Agent Layer</Badge>
          <h1 className="text-3xl font-semibold">
            AI copilots with verifiable context.
          </h1>
          <p className="text-muted-foreground">
            Each agent call runs through the Model Context Protocol, taps the
            DKG, and respects your wallet session. That means fewer hallucinated
            answers and more defensible work products.
          </p>
          <Button asChild>
            <Link href="/dashboard">Run a workflow</Link>
          </Button>
        </div>
        <div className="rounded-2xl border border-dashed p-6">
          <p className="text-sm text-muted-foreground">Workflow example</p>
          <ol className="mt-3 space-y-3 text-sm">
            <li>1. Agent fetches last verified badge and extracts KPIs.</li>
            <li>2. Agent runs Grokipedia comparison for the same topic.</li>
            <li>
              3. Agent drafts an update and embeds the DKG note plus wallet
              signature metadata.
            </li>
          </ol>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {assistants.map((assistant) => (
          <Card key={assistant.title}>
            <CardHeader>
              <CardTitle>{assistant.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{assistant.summary}</p>
              <p className="text-foreground">{assistant.output}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PitchDeckGenerator />
        <BusinessPlanWriter />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <ResumeBuilder />
        <SocialPostStudio />
      </section>

      <TruthAlignmentLab />

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">
            OriginTrail DKG connection test
          </h2>
          <p className="text-sm text-muted-foreground">
            Publish a lightweight Community Note to verify that your Edge Node
            credentials and blockchain keys are configured correctly.
          </p>
        </div>
        <DkgNoteTester />
      </section>
    </div>
  );
}
