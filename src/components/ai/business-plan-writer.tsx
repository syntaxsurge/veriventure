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

const initialForm = {
  idea: "",
  market: "",
  goToMarket: "",
  differentiation: "",
  impact: "",
};

export function BusinessPlanWriter() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sections, setSections] = useState<BusinessPlanSection[] | null>(null);
  const [body, setBody] = useState<string | null>(null);
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(
    null,
  );

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
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="plan-idea">Company / idea overview</Label>
            <Textarea
              id="plan-idea"
              rows={3}
              placeholder="Wallet-native proof stack for AI-powered SMEs."
              value={form.idea}
              onChange={(event) => updateField("idea", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="plan-market">Target market</Label>
            <Input
              id="plan-market"
              placeholder="SMEs in LatAm + SE Asia with compliance burdens"
              value={form.market}
              onChange={(event) => updateField("market", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="plan-go-to-market">Go-to-market motion</Label>
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
          <div className="space-y-1">
            <Label htmlFor="plan-differentiation">Differentiation</Label>
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
          <div className="space-y-1">
            <Label htmlFor="plan-impact">Impact goals</Label>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
