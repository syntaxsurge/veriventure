"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { exportResumeAsPdf } from "@/lib/resume-export";
import type { DocumentRecord } from "@/types/document";
import { buildPreviewResume } from "@/components/ai/resume-builder";

type ResumeViewerProps = {
  document: DocumentRecord;
};

export function ResumeViewer({ document }: ResumeViewerProps) {
  const [exportingPdf, setExportingPdf] = useState(false);
  const resume = document.data.resume;
  const previewResume = useMemo(
    () => buildPreviewResume(resume ?? null),
    [resume],
  );

  if (!resume || !previewResume) {
    return null;
  }

  const fullName =
    document.data.metadata?.fullName ||
    document.title.replace(/ resume draft$/i, "");
  const focus = document.data.metadata?.focus || "";

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      await exportResumeAsPdf({
        fullName,
        headline: previewResume.headline,
        summary: previewResume.summary,
        sections: previewResume.sections,
        skills: previewResume.skills,
        focus,
        photoDataUrl: null,
      });
    } finally {
      setExportingPdf(false);
    }
  }

  function copyResume() {
    const text = [
      fullName,
      previewResume.headline,
      previewResume.summary,
      ...previewResume.sections.map(
        (section) => `${section.heading}\n- ${section.bullets.join("\n- ")}`,
      ),
      previewResume.skills.length
        ? `Skills: ${previewResume.skills.join(", ")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n");
    void navigator.clipboard.writeText(text);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <CardTitle className="text-lg">{document.title}</CardTitle>
            <p className="text-xs text-muted-foreground">
              Created on{" "}
              {new Date(document.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            <p className="max-w-3xl text-sm text-muted-foreground">
              {document.summary}
            </p>
          </div>
          <Badge variant="outline">Resume</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
            <span className="truncate">
              Checksum: {document.checksum}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" size="sm" onClick={copyResume}>
              Copy summary text
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
        </CardContent>
      </Card>

      <div className="flex items-start justify-center">
        <div className="w-full max-w-[720px] rounded-2xl border bg-muted/30 p-4 shadow-sm">
          <div
            className="relative mx-auto w-full overflow-hidden rounded-2xl border bg-background shadow-lg"
            style={{ aspectRatio: "8.5 / 11" }}
          >
            <div className="flex h-full flex-col bg-white px-8 py-8 text-slate-900">
              <header className="flex items-start justify-between gap-6 border-b border-slate-200 pb-3">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                    {previewResume.headline || "Resume"}
                  </p>
                  <h2 className="text-[22px] font-semibold tracking-tight">
                    {fullName || "Full name"}
                  </h2>
                  {focus && (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                      {focus}
                    </p>
                  )}
                </div>
              </header>
              <main className="mt-4 grid flex-1 gap-5 text-[11px] leading-relaxed md:grid-cols-[0.95fr,1.4fr] md:text-xs">
                <section className="space-y-4">
                  <div>
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                      Profile
                    </h3>
                    <p className="mt-1 text-[11px] text-slate-800 md:text-xs">
                      {previewResume.summary}
                    </p>
                  </div>
                  {previewResume.skills.length > 0 && (
                    <div>
                      <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Key skills
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {previewResume.skills.map((skill) => (
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
                  {previewResume.sections.map((section) => (
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
  );
}

