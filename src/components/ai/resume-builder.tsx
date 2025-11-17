"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { exportResumeAsPdf } from "@/lib/resume-export";
import type { DocumentRecord, ResumeSection } from "@/types/document";

export type ResumeResponse = {
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

export const PREVIEW_LIMITS = {
  summaryChars: 480,
  skills: 8,
  sections: 2,
  bulletsPerSection: 3,
  bulletChars: 160,
} as const;

const initialForm = {
  fullName: "",
  headline: "",
  achievements: "",
  experience: "",
  focus: "",
};

type ResumeField = keyof typeof initialForm;

export type PreviewResume = {
  headline: string;
  summary: string;
  sections: ResumeSection[];
  skills: string[];
};

function clampText(input: string, maxChars: number) {
  if (input.length <= maxChars) return input;
  const shortened = input.slice(0, maxChars);
  const lastSpace = shortened.lastIndexOf(" ");
  const base = lastSpace > 40 ? shortened.slice(0, lastSpace) : shortened;
  return `${base.trim()}…`;
}

export function buildPreviewResume(
  resume:
    | {
        headline: string;
        summary: string;
        sections: ResumeSection[];
        skills: string[];
      }
    | null,
): PreviewResume | null {
  if (!resume) return null;
  const summary = clampText(resume.summary, PREVIEW_LIMITS.summaryChars);

  const sections: ResumeSection[] = resume.sections
    .slice(0, PREVIEW_LIMITS.sections)
    .map((section) => ({
      heading: section.heading,
      bullets: section.bullets
        .slice(0, PREVIEW_LIMITS.bulletsPerSection)
        .map((bullet) => clampText(bullet, PREVIEW_LIMITS.bulletChars))
        .filter((bullet) => bullet.length > 0),
    }))
    .filter((section) => section.bullets.length > 0);

  const skills = resume.skills.slice(0, PREVIEW_LIMITS.skills);

  return {
    headline: resume.headline,
    summary,
    sections,
    skills,
  };
}

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
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [exportingPdf, setExportingPdf] = useState(false);

  const pdfResume = useMemo(() => buildPreviewResume(resume), [resume]);

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

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setPhotoDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
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
      form.fullName,
      resume.headline,
      resume.summary,
      ...resume.sections.map(
        (section) => `${section.heading}\n- ${section.bullets.join("\n- ")}`,
      ),
      resume.skills.length ? `Skills: ${resume.skills.join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    void navigator.clipboard.writeText(text);
  }

  async function handleExportPdf() {
    if (!pdfResume) return;
    setExportingPdf(true);
    setError(null);
    try {
      await exportResumeAsPdf({
        fullName: form.fullName,
        headline: pdfResume.headline,
        summary: pdfResume.summary,
        sections: pdfResume.sections,
        skills: pdfResume.skills,
        focus: form.focus,
        photoDataUrl,
      });
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to export resume as PDF.";
      setError(message);
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume & Bio Builder</CardTitle>
        <p className="text-sm text-muted-foreground">
          Condense traction, climate impact, and leadership into a VC-ready
          resume. The output lands in your Documents vault with a checksum and a
          print-ready one-page PDF.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="resume-photo">Profile photo (optional)</Label>
            <div className="flex items-center gap-4">
              <div className="flex aspect-square h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border bg-muted">
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoDataUrl}
                    alt={form.fullName ? `${form.fullName} headshot` : "Headshot"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-[10px] text-muted-foreground">
                    1x1 headshot
                    <br />
                    (square photo)
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 text-xs text-muted-foreground">
                <Input
                  id="resume-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
                <p>
                  Upload a square headshot to appear in the resume preview and
                  exported PDF.
                </p>
              </div>
            </div>
          </div>
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
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
            <div className="space-y-4">
              <div className="space-y-2 rounded-2xl border bg-muted/40 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Resume summary
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      {resume.headline}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {resume.summary}
                    </p>
                    {documentRecord && (
                      <p className="mt-2 text-xs text-muted-foreground">
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
                  <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyResume}
                    >
                      Copy text
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleExportPdf}
                      disabled={exportingPdf}
                    >
                      {exportingPdf ? "Exporting…" : "Export PDF"}
                    </Button>
                  </div>
                </div>
                {resume.skills.length > 0 && (
                  <div className="pt-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Key skills
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {resume.skills.map((skill) => (
                        <Badge key={skill} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3 rounded-2xl border bg-muted/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">
                      Publish this resume to the OriginTrail DKG
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Anchor the generated resume to a verifiable Knowledge
                      Asset.
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
            <div className="flex items-start justify-center">
              <div className="w-full max-w-[640px] rounded-2xl border bg-muted/30 p-3 shadow-sm">
                <div
                  className="relative mx-auto w-full overflow-hidden rounded-2xl border bg-background shadow-lg"
                  style={{ aspectRatio: "8.5 / 11" }}
                >
                  <div className="flex h-full flex-col overflow-y-auto bg-white px-8 py-8 text-slate-900">
                    <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-3">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                          {resume.headline || "Resume"}
                        </p>
                        <h2 className="text-[22px] font-semibold tracking-tight">
                          {form.fullName || "Full name"}
                        </h2>
                        {form.focus && (
                          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                            {form.focus}
                          </p>
                        )}
                      </div>
                      {photoDataUrl && (
                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={photoDataUrl}
                            alt={
                              form.fullName
                                ? `${form.fullName} headshot`
                                : "Headshot"
                            }
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                    </header>
                    <main className="mt-4 grid flex-1 gap-5 text-[11px] leading-relaxed md:grid-cols-[0.95fr,1.4fr] md:text-xs">
                      <section className="space-y-4">
                        <div>
                          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                            Profile
                          </h3>
                          <p className="mt-1 text-[11px] text-slate-800 md:text-xs">
                            {resume.summary}
                          </p>
                        </div>
                        {resume.skills.length > 0 && (
                          <div>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                              Key skills
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {resume.skills.map((skill) => (
                                <span
                                  key={skill}
                                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-medium text-slate-800"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </section>
                      <section className="space-y-4">
                        {resume.sections.map((section) => (
                          <div key={section.heading}>
                            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                              {section.heading}
                            </h3>
                            <ul className="mt-1 space-y-1.5">
                              {section.bullets.map((bullet, index) => (
                                <li
                                  key={`${section.heading}-${index.toString()}`}
                                  className="flex gap-2"
                                >
                                  <span className="mt-[6px] h-[5px] w-[5px] flex-shrink-0 rounded-full bg-slate-400" />
                                  <p className="flex-1 text-[11px] text-slate-800 md:text-xs">
                                    {bullet}
                                  </p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
                    </main>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
