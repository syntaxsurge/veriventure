"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AlignmentReport } from "@/types/alignment";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";
import { Coachmark } from "@/components/onboarding/coachmark";

type ApiResponse = {
  report?: AlignmentReport;
  error?: string;
};

type PublishResponse = {
  ok: boolean;
  ual?: string;
  txHash?: string | null;
  explorer?: string | null;
  subscan?: string | null;
  error?: string;
};

const riskColors: Record<string, string> = {
  low: "bg-emerald-100 text-emerald-900",
  medium: "bg-amber-100 text-amber-900",
  high: "bg-red-100 text-red-900",
};

export function TruthAlignmentLab() {
  const [topic, setTopic] = useState("Climate change");
  const [analysis, setAnalysis] = useState<AlignmentReport | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [ual, setUal] = useState<string | null>(null);
  const [ualLinks, setUalLinks] = useState<{
    explorer: string | null;
    subscan: string | null;
    txHash: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const { mark, progress } = useOnboardingProgress();

  const cosinePercent = useMemo(() => {
    if (!analysis) return null;
    return `${(analysis.similarity.cosineScore * 100).toFixed(1)}%`;
  }, [analysis]);

  async function handleAnalyze(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setUal(null);
    try {
      const response = await fetch("/api/alignment/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.report) {
        throw new Error(payload.error ?? "Topic analysis failed.");
      }
      setAnalysis(payload.report);
      setNoteDraft(payload.report.noteTemplate);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected analysis error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!analysis) return;
    setPublishing(true);
    setNoteError(null);
    setUal(null);
    setUalLinks(null);
    try {
      const references = analysis.references.filter(Boolean);
      const response = await fetch("/api/dkg/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: analysis.topic,
          summary: noteDraft,
          references,
        }),
      });
      const payload = (await response.json()) as PublishResponse;
      if (!response.ok || !payload.ok || !payload.ual) {
        throw new Error(
          payload.error ?? "Unable to publish Community Note.",
        );
      }
      setUal(payload.ual);
      setUalLinks({
        explorer: payload.explorer ?? null,
        subscan: payload.subscan ?? null,
        txHash: payload.txHash ?? null,
      });
      mark("firstNotePublished");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to reach the DKG node.";
      setNoteError(message);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <section className="space-y-6 rounded-3xl border bg-muted/30 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Truth Alignment Lab</h2>
        <p className="text-sm text-muted-foreground">
          Compare Grokipedia vs Wikipedia, quantify divergences, and push a
          structured Community Note directly to the OriginTrail DKG.
        </p>
      </div>

      <form
        className="grid gap-3 md:grid-cols-[2fr_auto]"
        onSubmit={handleAnalyze}
      >
        <div className="space-y-1">
          <Label htmlFor="alignment-topic">Topic</Label>
          <Input
            id="alignment-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="PlayStation 5"
            required
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Analyzing…" : "Analyze topic"}
          </Button>
        </div>
      </form>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {!analysis && !loading && (
        <div className="rounded-2xl border border-dashed bg-background/60 p-6 text-sm text-muted-foreground">
          Enter a topic to fetch both encyclopedia entries. We will surface
          divergences, missing sections, and a ready-to-publish note draft.
        </div>
      )}

      {analysis && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Cosine similarity</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Vector comparison (OpenAI embeddings)
                </p>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {cosinePercent}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Missing topics</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Wikipedia keywords absent in Grokipedia
                </p>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {analysis.similarity.missingTopics.length}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="space-y-1">
                <CardTitle>Risk rating</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Based on similarity + unique claims
                </p>
              </CardHeader>
              <CardContent>
                <Badge
                  className={riskColors[analysis.similarity.riskLevel] ?? ""}
                >
                  {analysis.similarity.riskLevel.toUpperCase()}
                </Badge>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <SourceCard
              title="Wikipedia"
              data={analysis.wikipedia}
              badge="Human curated"
            />
            <SourceCard
              title="Grokipedia"
              data={analysis.grokipedia}
              badge={
                analysis.grokipedia.source === "grok-fallback"
                  ? "AI fallback"
                  : "Live scrape"
              }
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Divergences</CardTitle>
              <p className="text-sm text-muted-foreground">
                {analysis.similarity.summary}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Unique claims from Grokipedia
                </h3>
                {analysis.similarity.uniqueClaims.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No exclusive sentences detected.
                  </p>
                ) : (
                  <ul className="mt-2 space-y-3 text-sm">
                    {analysis.similarity.uniqueClaims.map((claim) => (
                      <li
                        key={claim.sentence}
                        className="rounded-xl border bg-background/80 p-3"
                      >
                        <p className="font-medium">{claim.sentence}</p>
                        <p className="text-xs text-muted-foreground">
                          {claim.category.toUpperCase()} · {claim.rationale}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold uppercase text-muted-foreground">
                  Wikipedia focus areas missing from Grokipedia
                </h3>
                {analysis.similarity.missingTopics.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Grokipedia covered the same high-level sections.
                  </p>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {analysis.similarity.missingTopics.map((topicKey) => (
                      <Badge key={topicKey} variant="secondary">
                        {topicKey}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <form className="space-y-3" onSubmit={handlePublish}>
            <Label htmlFor="note-draft">Community Note draft</Label>
            <Textarea
              id="note-draft"
              rows={5}
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              required
            />
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
              <div>
                References:&nbsp;
                {analysis.references.length > 0
                  ? analysis.references.join(" | ")
                  : "Wikipedia + Grokipedia"}
              </div>
            </div>
            <Button
              id="publish-community-note-button"
              type="submit"
              disabled={!noteDraft || publishing}
              className="w-full md:w-auto"
            >
              {publishing ? "Publishing…" : "Publish Community Note"}
            </Button>
            {ual && (
              <div className="space-y-2 rounded-2xl border bg-background/80 p-3 text-xs text-foreground">
                <p className="font-semibold">Published UAL</p>
                <code className="block break-all font-mono text-[11px] text-muted-foreground">
                  {ual}
                </code>
                <div className="flex flex-wrap gap-3">
                  {ualLinks?.explorer && (
                    <a
                      href={ualLinks.explorer}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      View on DKG Explorer
                    </a>
                  )}
                  {ualLinks?.subscan && (
                    <a
                      href={ualLinks.subscan}
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      View tx on Subscan
                    </a>
                  )}
                </div>
              </div>
            )}
            <Coachmark
              id="community-note"
              targetId="publish-community-note-button"
              text="Publish a Community Note after minting to anchor provenance."
              active={
                progress.firstAchievementMinted &&
                !progress.firstNotePublished
              }
            />
            {noteError && (
              <p className="text-sm text-destructive" role="alert">
                {noteError}
              </p>
            )}
          </form>
        </div>
      )}
    </section>
  );
}

type SourceCardProps = {
  title: string;
  data: AlignmentReport["wikipedia"];
  badge: string;
};

function SourceCard({ title, data, badge }: SourceCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center justify-between gap-2 text-lg">
          <span>{title}</span>
          <Badge variant="outline">{badge}</Badge>
        </CardTitle>
        {data.url && (
          <a
            className="text-xs text-primary underline-offset-4 hover:underline"
            href={data.url}
            target="_blank"
            rel="noreferrer"
          >
            {data.url}
          </a>
        )}
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-muted-foreground">
        <p>{data.summary}</p>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Word count: {data.wordCount}
        </p>
        {data.lastModified && (
          <p className="text-xs">
            Updated:{" "}
            {new Date(data.lastModified).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
