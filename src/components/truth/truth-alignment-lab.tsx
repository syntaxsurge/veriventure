"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Search,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Copy,
  FlaskConical
} from "lucide-react";
import type { AlignmentReport } from "@/types/alignment";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";
import { Coachmark } from "@/components/onboarding/coachmark";
import { toast } from "sonner";

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
  low: "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100 border-green-200 dark:border-green-900/50",
  medium: "bg-amber-100 text-amber-900 dark:bg-amber-900/30 dark:text-amber-100 border-amber-200 dark:border-amber-900/50",
  high: "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100 border-red-200 dark:border-red-900/50",
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
      toast.success("Analysis complete!", {
        description: "Review the insights below and publish your note.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected analysis error.";
      setError(message);
      toast.error("Analysis failed", {
        description: message,
      });
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
      toast.success("Published to DKG!", {
        description: "Your Community Note is now verifiable on-chain.",
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to reach the DKG node.";
      setNoteError(message);
      toast.error("Publishing failed", {
        description: message,
      });
    } finally {
      setPublishing(false);
    }
  }

  const copyUAL = () => {
    if (ual) {
      navigator.clipboard.writeText(ual);
      toast.success("UAL copied to clipboard!");
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="border-2 bg-gradient-to-br from-purple-500/5 via-background to-background shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex-shrink-0">
              <FlaskConical className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">Truth Alignment Analysis</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Compare information from multiple sources, measure divergence with AI embeddings,
                and publish verifiable Community Notes to the OriginTrail DKG.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Analysis Form */}
      <Card className="border-2 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Analyze Topic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alignment-topic" className="text-base font-semibold">
                Topic to Analyze
              </Label>
              <Input
                id="alignment-topic"
                value={topic}
                onChange={(event) => setTopic(event.target.value)}
                placeholder="Enter a topic (e.g., Climate change, Bitcoin, AI Ethics)"
                required
                className="text-base"
              />
              <p className="text-xs text-muted-foreground">
                We'll fetch data from Wikipedia and Grokipedia to compare sources
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full gap-2" size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing Sources...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Analyze Topic
                </>
              )}
            </Button>
          </form>

          {error && (
            <Card className="mt-4 border-2 border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {!analysis && !loading && (
        <Card className="border-2 border-dashed bg-muted/30">
          <CardContent className="p-8 text-center">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Enter a topic above to fetch and compare encyclopedia entries. We'll surface
              divergences, missing sections, and generate a ready-to-publish note draft.
            </p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-8">
          {/* Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Similarity Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">{cosinePercent}</div>
                <p className="text-xs text-muted-foreground">
                  Vector comparison (OpenAI embeddings)
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Missing Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-1">
                  {analysis.similarity.missingTopics.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Wikipedia keywords absent in Grokipedia
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={`${riskColors[analysis.similarity.riskLevel] ?? ""} border text-base px-3 py-1`}
                >
                  {analysis.similarity.riskLevel.toUpperCase()}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on similarity + unique claims
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Source Comparison */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2">
              <CardHeader className="bg-gradient-to-br from-blue-500/5 to-background">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Wikipedia</CardTitle>
                  <Badge variant="outline">Human Curated</Badge>
                </div>
                {analysis.wikipedia.url && (
                  <a
                    href={analysis.wikipedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    {analysis.wikipedia.url.length > 40
                      ? `${analysis.wikipedia.url.slice(0, 40)}...`
                      : analysis.wikipedia.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.wikipedia.summary}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Words: {analysis.wikipedia.wordCount}</span>
                  {analysis.wikipedia.lastModified && (
                    <>
                      <span>•</span>
                      <span>
                        Updated: {new Date(analysis.wikipedia.lastModified).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader className="bg-gradient-to-br from-green-500/5 to-background">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Grokipedia</CardTitle>
                  <Badge variant="outline">
                    {analysis.grokipedia.source === "grok-fallback" ? "AI Fallback" : "Live Scrape"}
                  </Badge>
                </div>
                {analysis.grokipedia.url && (
                  <a
                    href={analysis.grokipedia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    {analysis.grokipedia.url.length > 40
                      ? `${analysis.grokipedia.url.slice(0, 40)}...`
                      : analysis.grokipedia.url}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {analysis.grokipedia.summary}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Words: {analysis.grokipedia.wordCount}</span>
                  {analysis.grokipedia.lastModified && (
                    <>
                      <span>•</span>
                      <span>
                        Updated: {new Date(analysis.grokipedia.lastModified).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Divergences Analysis */}
          <Card className="border-2">
            <CardHeader className="bg-gradient-to-br from-amber-500/5 to-background">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Divergences & Insights
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                {analysis.similarity.summary}
              </p>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Unique Claims */}
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                  Unique Claims from Grokipedia
                </h4>
                {analysis.similarity.uniqueClaims.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed bg-muted/20 p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No exclusive sentences detected.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analysis.similarity.uniqueClaims.map((claim, index) => (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <p className="font-medium mb-2 leading-relaxed">{claim.sentence}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {claim.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{claim.rationale}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Missing Topics */}
              <div>
                <h4 className="text-sm font-semibold mb-3 uppercase tracking-wide text-muted-foreground">
                  Wikipedia Focus Areas Missing from Grokipedia
                </h4>
                {analysis.similarity.missingTopics.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed bg-muted/20 p-4 text-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Grokipedia covered the same high-level sections.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analysis.similarity.missingTopics.map((topicKey) => (
                      <Badge key={topicKey} variant="secondary" className="text-sm px-3 py-1">
                        {topicKey}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Publish Community Note */}
          <Card className="border-2 bg-gradient-to-br from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Publish Community Note
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Review and customize your note before publishing to the OriginTrail DKG
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePublish} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note-draft" className="text-base font-semibold">
                    Community Note Draft
                  </Label>
                  <Textarea
                    id="note-draft"
                    rows={6}
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    required
                    className="resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      References: {analysis.references.length > 0
                        ? analysis.references.join(" | ")
                        : "Wikipedia + Grokipedia"}
                    </span>
                    <span>{noteDraft.length} characters</span>
                  </div>
                </div>

                <Button
                  id="publish-community-note-button"
                  type="submit"
                  disabled={!noteDraft || publishing}
                  className="w-full gap-2"
                  size="lg"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Publishing to DKG...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Publish Community Note
                    </>
                  )}
                </Button>

                {ual && (
                  <Card className="border-2 border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">Published Successfully!</span>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                          Universal Asset Locator (UAL)
                        </Label>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-muted/50 px-3 py-2 text-xs font-mono break-all">
                            {ual}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={copyUAL}
                            className="flex-shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {ualLinks?.explorer && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-1"
                          >
                            <a
                              href={ualLinks.explorer}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View on DKG Explorer
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                        {ualLinks?.subscan && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            asChild
                            className="gap-1"
                          >
                            <a
                              href={ualLinks.subscan}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View TX on Subscan
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
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
                  <Card className="border-2 border-destructive/50 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-destructive font-medium">{noteError}</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
