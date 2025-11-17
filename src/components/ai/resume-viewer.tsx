"use client";

import { useMemo, useState } from "react";
import { Download, Copy, Upload, Check, ExternalLink, Image as ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main Resume Preview */}
      <div className="space-y-6">
        {/* Resume Paper */}
        <Card className="border-2 shadow-xl">
          <CardContent className="p-8">
            <div
              className="relative mx-auto w-full overflow-hidden rounded-lg border-2 bg-white shadow-2xl"
              style={{ aspectRatio: "8.5 / 11" }}
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white px-8 py-8 text-slate-900">
                {/* Header */}
                <header className="flex items-start justify-between gap-6 border-b-2 border-slate-200 pb-4">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                      {fullName || "Full Name"}
                    </h2>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      {resolvedResume.headline || "Professional Title"}
                    </p>
                    {focus && (
                      <p className="text-xs uppercase tracking-wider text-slate-400">
                        {focus}
                      </p>
                    )}
                  </div>
                  {photoDataUrl && (
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-xl border-2 border-slate-200 bg-slate-50 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoDataUrl}
                        alt={fullName ? `${fullName} headshot` : "Headshot"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </header>

                {/* Content */}
                <main className="mt-6 grid flex-1 gap-6 text-xs leading-relaxed md:grid-cols-[1fr,1.5fr]">
                  {/* Left Column */}
                  <section className="space-y-5">
                    {/* Profile */}
                    <div>
                      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                        Profile
                      </h3>
                      <p className="text-xs text-slate-700">
                        {resolvedResume.summary}
                      </p>
                    </div>

                    {/* Skills */}
                    {resolvedResume.skills.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                          Key Skills
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resolvedResume.skills.map((skill) => (
                            <span
                              key={skill}
                              className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* Right Column */}
                  <section className="space-y-5">
                    {resolvedResume.sections.map((section) => (
                      <div key={section.heading}>
                        <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                          {section.heading}
                        </h3>
                        <ul className="space-y-2">
                          {section.bullets.map((bullet, index) => (
                            <li
                              key={`${section.heading}-${index.toString()}`}
                              className="flex gap-2"
                            >
                              <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-slate-400" />
                              <p className="flex-1 text-xs text-slate-700">
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
          </CardContent>
        </Card>
      </div>

      {/* Sidebar Actions */}
      <div className="space-y-6">
        {/* Photo Upload */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resume-photo" className="flex items-center gap-2 text-sm font-semibold">
                <ImageIcon className="h-4 w-4" />
                Profile Photo
              </Label>
              <p className="text-xs text-muted-foreground">
                Upload a square headshot for the PDF
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex aspect-square h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-muted">
                {photoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photoDataUrl}
                    alt={fullName ? `${fullName} headshot` : "Headshot"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Input
                  id="resume-photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="text-xs"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card className="border-2">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-semibold">Actions</h3>

            <Button
              type="button"
              className="w-full gap-2"
              onClick={handleExportPdf}
              disabled={exportingPdf}
            >
              <Download className="h-4 w-4" />
              {exportingPdf ? "Exporting..." : "Export PDF"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={copyResume}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy Text
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={handlePublishToDkg}
              disabled={publishing}
            >
              <Upload className="h-4 w-4" />
              {publishing ? "Publishing..." : "Publish to DKG"}
            </Button>

            {publishError && (
              <p className="text-xs text-destructive" role="alert">
                {publishError}
              </p>
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
