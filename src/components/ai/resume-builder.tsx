"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentRecord, ResumeSection } from "@/types/document";

type ResumeResponse = {
  resume?: {
    headline: string;
    summary: string;
    sections: ResumeSection[];
    skills: string[];
  };
  document?: DocumentRecord;
  error?: string;
};

type PublishState = {
  ual: string;
  explorer: string | null;
  subscan: string | null;
};

const initialForm = {
  fullName: "",
  headline: "",
  achievements: "",
  experience: "",
  focus: "",
};

type ResumeField = keyof typeof initialForm;

export function ResumeBuilder() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<Partial<Record<ResumeField, boolean>>>({});
  const [resume, setResume] = useState<ResumeResponse["resume"] | null>(null);
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
    setResume(null);
    setDocumentRecord(null);
    setPublishState(null);
    setPublishError(null);
    try {
      const response = await fetch("/api/ai/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ResumeResponse;
      if (!response.ok || !payload.resume || !payload.document) {
        throw new Error(payload.error ?? "Unable to compile resume.");
      }
      setResume(payload.resume);
      setDocumentRecord(payload.document);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unexpected resume generation error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAssist(field: ResumeField) {
    setAiBusy((prev) => ({ ...prev, [field]: true }));
    setAiError(null);
    try {
      const response = await fetch("/api/ai/forms/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant: "resume",
          field,
          form,
        }),
      });
      const payload = (await response.json()) as {
        suggestion?: string;
        error?: string;
      };
      if (!response.ok || !payload.suggestion) {
        throw new Error(payload.error ?? "Unable to suggest field.");
      }
      updateField(field, payload.suggestion);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to suggest field.";
      setAiError(message);
    } finally {
      setAiBusy((prev) => ({ ...prev, [field]: false }));
    }
  }

  async function handlePublishToDkg() {
    if (!documentRecord || !resume) return;
    setPublishing(true);
    setPublishError(null);
    setPublishState(null);
    try {
      const response = await fetch("/api/dkg/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "resume",
          title: documentRecord.title || resume.headline,
          summary: resume.summary || documentRecord.summary,
          references: [],
          payload: {
            documentId: documentRecord.id,
            checksum: documentRecord.checksum,
            resume,
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

  function copyResume() {
    if (!resume) return;
    const text = [
      resume.headline,
      resume.summary,
      ...resume.sections.map(
        (section) => `${section.heading}\n- ${section.bullets.join("\n- ")}`,
      ),
      `Skills: ${resume.skills.join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n\n");
    void navigator.clipboard.writeText(text);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume & Bio Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Condense traction, climate impact, and leadership into a VC-ready
          resume. The output lands in your Documents vault with a checksum.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="resume-name">Full name</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("fullName")}
                disabled={loading || aiBusy.fullName}
              >
                {aiBusy.fullName ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Input
              id="resume-name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Aisha Ramirez"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="resume-headline">Target role / headline</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("headline")}
                disabled={loading || aiBusy.headline}
              >
                {aiBusy.headline ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Input
              id="resume-headline"
              value={form.headline}
              onChange={(event) => updateField("headline", event.target.value)}
              placeholder="Climate fintech operator"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="resume-achievements">Recent wins</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("achievements")}
                disabled={loading || aiBusy.achievements}
              >
                {aiBusy.achievements ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="resume-achievements"
              rows={3}
              value={form.achievements}
              onChange={(event) =>
                updateField("achievements", event.target.value)
              }
              placeholder="Raised $2.1M, deployed verification nodes across 5 markets, doubled carbon inventory throughput."
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="resume-experience">Experience highlights</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("experience")}
                disabled={loading || aiBusy.experience}
              >
                {aiBusy.experience ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="resume-experience"
              rows={4}
              value={form.experience}
              onChange={(event) =>
                updateField("experience", event.target.value)
              }
              placeholder="COO @ TerraFlow — grew SME climate clients from 40 to 220. Prior roles..."
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="resume-focus">Focus / sectors</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleAssist("focus")}
                disabled={loading || aiBusy.focus}
              >
                {aiBusy.focus ? "Generating…" : "Use AI"}
              </Button>
            </div>
            <Textarea
              id="resume-focus"
              rows={2}
              value={form.focus}
              onChange={(event) => updateField("focus", event.target.value)}
              placeholder="Focus on regenerative agriculture, climate fintech, and emerging market SMEs."
            />
          </div>
          <Button type="submit" className="md:col-span-2" disabled={loading}>
            {loading ? "Compiling…" : "Generate resume"}
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
        {resume && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{resume.headline}</p>
                <p className="text-sm text-muted-foreground">
                  {resume.summary}
                </p>
                {documentRecord && (
                  <p className="text-xs text-muted-foreground">
                    Saved as checksum {documentRecord.checksum} ·{" "}
                    <a
                      href="/documents"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Open vault
                    </a>
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={copyResume}>
                Copy resume
              </Button>
            </div>
            {resume.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {resume.sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-2xl border bg-muted/30 p-4"
                >
                  <p className="text-base font-semibold">{section.heading}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">
                    Publish this resume to the OriginTrail DKG
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Anchor the generated resume to a verifiable Knowledge Asset.
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
