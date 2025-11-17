"use client";

import { useMemo, useState } from "react";
import { Download, Copy, Upload, Check, ExternalLink, Image as ImageIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { exportResumeAsPdf } from "@/lib/resume-export";
import type { DocumentRecord } from "@/types/document";
import { buildPreviewResume } from "@/components/ai/resume-builder";

type ResumeViewerProps = {
  document: DocumentRecord;
};

export function ResumeViewer({ document }: ResumeViewerProps) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishState, setPublishState] = useState<{
    ual: string;
    explorer: string | null;
    subscan: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const resume = document.data.resume;
  const pdfResume = useMemo(
    () => buildPreviewResume(resume ?? null),
    [resume],
  );

  if (!resume) {
    return null;
  }

  const resolvedResume = resume as NonNullable<typeof resume>;

  const fullName =
    document.data.metadata?.fullName ||
    document.title.replace(/ resume draft$/i, "");
  const focus = document.data.metadata?.focus || "";

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

  async function handleExportPdf() {
    if (!pdfResume) return;
    setExportingPdf(true);
    try {
      await exportResumeAsPdf({
        fullName,
        headline: pdfResume.headline,
        summary: pdfResume.summary,
        sections: pdfResume.sections,
        skills: pdfResume.skills,
        focus,
        photoDataUrl,
      });
    } finally {
      setExportingPdf(false);
    }
  }

  function copyResume() {
    const text = [
      fullName,
      resolvedResume.headline,
      resolvedResume.summary,
      ...resolvedResume.sections.map(
        (section) => `${section.heading}\n- ${section.bullets.join("\n- ")}`,
      ),
      resolvedResume.skills.length
        ? `Skills: ${resolvedResume.skills.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    void navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handlePublishToDkg() {
    if (!resolvedResume) return;
    setPublishing(true);
    setPublishError(null);
    setPublishState(null);
    try {
      const response = await fetch("/api/dkg/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "resume",
          title: document.title || resolvedResume.headline,
          summary: resolvedResume.summary || document.summary,
          references: [],
          payload: {
            documentId: document.id,
            checksum: document.checksum,
            resume: resolvedResume,
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

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Main Resume Preview */}
      <div className="space-y-6">
        {/* Resume Paper - Modern Design */}
        <Card className="border-2 shadow-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="p-8">
            <div
              className="relative mx-auto w-full overflow-hidden rounded-xl border-4 border-white bg-white shadow-2xl"
              style={{ aspectRatio: "8.5 / 11" }}
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white">
                {/* Modern Header with Gradient */}
                <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-10 py-8 text-white">
                  <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-primary/20 to-transparent" />

                  <div className="relative flex items-start justify-between gap-8">
                    <div className="flex-1 space-y-3">
                      <h2 className="text-3xl font-bold tracking-tight">
                        {fullName || "Full Name"}
                      </h2>
                      <div className="h-1 w-20 bg-primary rounded-full" />
                      <p className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                        {resolvedResume.headline || "Professional Title"}
                      </p>
                      {focus && (
                        <p className="text-xs tracking-wide text-slate-400 italic">
                          {focus}
                        </p>
                      )}
                    </div>

                    {photoDataUrl && (
                      <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl ring-4 ring-primary/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoDataUrl}
                          alt={fullName ? `${fullName} headshot` : "Headshot"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </header>

                {/* Content with Modern Layout */}
                <main className="flex-1 px-10 py-8">
                  <div className="grid gap-8 md:grid-cols-[1.2fr,2fr]">
                    {/* Left Column - Skills & Profile */}
                    <section className="space-y-6">
                      {/* Profile Summary */}
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-primary/30 pb-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          Profile
                        </h3>
                        <p className="text-xs leading-relaxed text-slate-700">
                          {resolvedResume.summary}
                        </p>
                      </div>

                      {/* Skills */}
                      {resolvedResume.skills.length > 0 && (
                        <div>
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-primary/30 pb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            Key Skills
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {resolvedResume.skills.map((skill) => (
                              <span
                                key={skill}
                                className="inline-flex items-center rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 px-3 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </section>

                    {/* Right Column - Experience & Sections */}
                    <section className="space-y-6">
                      {resolvedResume.sections.map((section) => (
                        <div key={section.heading}>
                          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800 border-b-2 border-primary/30 pb-2">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {section.heading}
                          </h3>
                          <ul className="space-y-3">
                            {section.bullets.map((bullet, index) => (
                              <li
                                key={`${section.heading}-${index.toString()}`}
                                className="flex gap-3 group"
                              >
                                <div className="mt-1.5 flex-shrink-0">
                                  <div className="h-2 w-2 rounded-full bg-gradient-to-br from-primary to-primary/60" />
                                </div>
                                <p className="flex-1 text-xs leading-relaxed text-slate-700">
                                  {bullet}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>
                  </div>
                </main>

                {/* Modern Footer Accent */}
                <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-primary" />
              </div>
            </div>

            {/* Resume Quality Indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Professional resume generated with AI</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Actions */}
      <div className="space-y-6">
        {/* Photo Upload */}
        <Card className="border-2 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-photo" className="flex items-center gap-2 text-sm font-bold">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <ImageIcon className="h-4 w-4 text-primary" />
                </div>
                Profile Photo
              </Label>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Upload a professional square headshot for your resume
              </p>
            </div>

            <div className="flex items-start gap-4">
              <div className="relative flex aspect-square h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-muted shadow-sm">
                {photoDataUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoDataUrl}
                      alt={fullName ? `${fullName} headshot` : "Headshot"}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 ring-2 ring-primary/20" />
                  </>
                ) : (
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="resume-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs cursor-pointer"
                />
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Recommended: 400x400px or larger
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-2 bg-gradient-to-br from-slate-50 to-white">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Export & Share
            </h3>

            <Button
              type="button"
              className="w-full gap-2 shadow-md hover:shadow-lg transition-shadow"
              size="lg"
              onClick={handleExportPdf}
              disabled={exportingPdf}
            >
              <Download className="h-4 w-4" />
              {exportingPdf ? "Exporting..." : "Export as PDF"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-2"
              size="lg"
              onClick={copyResume}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy as Text
                </>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 border-2 border-primary/30 hover:bg-primary/5"
              size="lg"
              onClick={handlePublishToDkg}
              disabled={publishing}
            >
              <Upload className="h-4 w-4" />
              {publishing ? "Publishing..." : "Publish to DKG"}
            </Button>

            {publishError && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-xs text-destructive font-medium" role="alert">
                  {publishError}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* DKG Info */}
        {publishState && (
          <Card className="border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-700 dark:text-green-300" />
                <h3 className="text-sm font-semibold text-green-900 dark:text-green-100">
                  Published Successfully
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-mono text-green-800 dark:text-green-200 break-all">
                  {publishState.ual}
                </p>

                <div className="flex flex-col gap-2">
                  {publishState.explorer && (
                    <a
                      href={publishState.explorer}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-green-700 dark:text-green-300 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      DKG Explorer
                    </a>
                  )}
                  {publishState.subscan && (
                    <a
                      href={publishState.subscan}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-green-700 dark:text-green-300 hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Subscan
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card className="border-2 bg-muted/30">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold">Document Info</h3>

            <div className="space-y-2 text-xs">
              <div>
                <p className="text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(document.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Checksum</p>
                <p className="font-mono text-[10px] break-all">
                  {document.checksum.slice(0, 16)}...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
