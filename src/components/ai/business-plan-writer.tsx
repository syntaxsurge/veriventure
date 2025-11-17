"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BusinessPlanSection, DocumentRecord } from "@/types/document";

type ApiResponse = {
  sections?: BusinessPlanSection[];
  body?: string;
  document?: DocumentRecord;
  error?: string;
};

type PublishState = {
  ual: string;
  explorer: string | null;
  subscan: string | null;
};

const initialForm = {
  idea: "",
  market: "",
  goToMarket: "",
  differentiation: "",
  impact: "",
};

type BusinessPlanField = keyof typeof initialForm;

export function BusinessPlanWriter() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<Partial<Record<BusinessPlanField, boolean>>>({});
  const [sections, setSections] = useState<BusinessPlanSection[] | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(
    null,
  );
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<PublishState | null>(null);

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSections(null);
    setBody(null);
    setDocumentRecord(null);
    setPublishState(null);
    setPublishError(null);
    try {
      const response = await fetch("/api/ai/business-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiResponse;
      if (
        !response.ok ||
        !payload.sections ||
        !payload.body ||
        !payload.document
      ) {
        throw new Error(
          payload.error ?? "Failed to compile the business plan.",
        );
      }
      setSections(payload.sections);
      setBody(payload.body);
      setDocumentRecord(payload.document);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected business plan error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssist(field: BusinessPlanField) {
    setAiBusy((prev) => ({ ...prev, [field]: true }));
    setAiError(null);
    try {
      const response = await fetch("/api/ai/forms/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant: "businessPlan",
          field,
          form,
        }),
      });
      const payload = (await response.json()) as {
        suggestion?: string;
        error?: string;
      };
      if (!response.ok || !payload.suggestion) {
        throw new Error(payload.error ?? "Unable to suggest copy.");
      }
      updateField(field, payload.suggestion);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to suggest copy.";
      setAiError(message);
    } finally {
      setAiBusy((prev) => ({ ...prev, [field]: false }));
    }
  }

  async function handlePublishToDkg() {
    if (!documentRecord || !sections) return;
    setPublishing(true);
    setPublishError(null);
    setPublishState(null);
    try {
      const response = await fetch("/api/dkg/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "business_plan",
          title: documentRecord.title || "Business Plan",
          summary: documentRecord.summary || sections[0]?.content || "",
          references: [],
          payload: {
            documentId: documentRecord.id,
            checksum: documentRecord.checksum,
            sections,
          },
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        ual?: string;
        explorer?: string | null;
        subscan?: string | null;
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.ual) {
        throw new Error(payload.error ?? "Unable to publish to the DKG.");
      }
      setPublishState({
        ual: payload.ual,
        explorer: payload.explorer ?? null,
        subscan: payload.subscan ?? null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to publish to the DKG.";
      setPublishError(message);
    } finally {
      setPublishing(false);
    }
  }

  function copyBody() {
    if (!body) return;
    void navigator.clipboard.writeText(body);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Business Plan Engine</CardTitle>
        <p className="text-sm text-muted-foreground">
          Turn badge-backed milestones into diligence-ready narratives for
          banks, grant programs, or accelerator applications. Outputs ship to
          the Documents vault automatically.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-idea">Company / idea overview</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("idea")}
                disabled={loading || aiBusy.idea}
              >
                {aiBusy.idea ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="plan-idea"
              rows={3}
              placeholder="Wallet-native proof stack for AI-powered SMEs."
              value={form.idea}
              onChange={(event) => updateField("idea", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-market">Target market</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("market")}
                disabled={loading || aiBusy.market}
              >
                {aiBusy.market ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Input
              id="plan-market"
              placeholder="SMEs in LatAm + SE Asia with compliance burdens"
              value={form.market}
              onChange={(event) => updateField("market", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-go-to-market">Go-to-market motion</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("goToMarket")}
                disabled={loading || aiBusy.goToMarket}
              >
                {aiBusy.goToMarket ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="plan-go-to-market"
              rows={3}
              placeholder="Channel partners, local banks, developer community."
              value={form.goToMarket}
              onChange={(event) =>
                updateField("goToMarket", event.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-differentiation">Differentiation</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("differentiation")}
                disabled={loading || aiBusy.differentiation}
              >
                {aiBusy.differentiation ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="plan-differentiation"
              rows={3}
              placeholder="OriginTrail-backed provenance + Moonbase automation."
              value={form.differentiation}
              onChange={(event) =>
                updateField("differentiation", event.target.value)
              }
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="plan-impact">Impact goals</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("impact")}
                disabled={loading || aiBusy.impact}
              >
                {aiBusy.impact ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="plan-impact"
              rows={3}
              placeholder="Climate resilience, SME credit equity, data integrity."
              value={form.impact}
              onChange={(event) => updateField("impact", event.target.value)}
            />
          </div>
          <Button type="submit" className="md:col-span-2" disabled={loading}>
            {loading ? "Compiling…" : "Generate plan"}
          </Button>
        </form>
        {aiError && (
          <p className="text-sm text-destructive" role="alert">
            {aiError}
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {sections && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">
                  Saved to Documents with checksum {documentRecord?.checksum}
                </p>
                <a
                  href="/documents"
                  className="text-xs text-primary underline-offset-4 hover:underline"
                >
                  Open vault
                </a>
              </div>
              <Button type="button" variant="outline" onClick={copyBody}>
                Copy full plan
              </Button>
            </div>
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-2xl border bg-muted/30 p-4"
                >
                  <p className="text-base font-semibold">{section.heading}</p>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    Publish this plan to the OriginTrail DKG
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Creates a verifiable Knowledge Asset with shareable explorer
                    and Subscan links.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePublishToDkg}
                  disabled={publishing}
                >
                  {publishing ? "Publishing…" : "Publish to DKG"}
                </Button>
              </div>
              {publishState && (
                <div className="space-y-1 text-xs">
                  <p className="font-semibold text-foreground">
                    UAL:{" "}
                    <span className="break-all font-mono text-muted-foreground">
                      {publishState.ual}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-4">
                    {publishState.explorer && (
                      <a
                        href={publishState.explorer}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        View on DKG Explorer
                      </a>
                    )}
                    {publishState.subscan && (
                      <a
                        href={publishState.subscan}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        View tx on Subscan
                      </a>
                    )}
                  </div>
                </div>
              )}
              {publishError && (
                <p className="text-xs text-destructive" role="alert">
                  {publishError}
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
