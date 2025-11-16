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

const initialForm = {
  fullName: "",
  headline: "",
  achievements: "",
  experience: "",
  focus: "",
};

export function ResumeBuilder() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resume, setResume] = useState<ResumeResponse["resume"] | null>(null);
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
    setResume(null);
    setDocumentRecord(null);
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
          <div className="space-y-1">
            <Label htmlFor="resume-name">Full name</Label>
            <Input
              id="resume-name"
              value={form.fullName}
              onChange={(event) => updateField("fullName", event.target.value)}
              placeholder="Aisha Ramirez"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="resume-headline">Target role / headline</Label>
            <Input
              id="resume-headline"
              value={form.headline}
              onChange={(event) => updateField("headline", event.target.value)}
              placeholder="Climate fintech operator"
              required
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="resume-achievements">Recent wins</Label>
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
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="resume-experience">Experience highlights</Label>
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
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="resume-focus">Focus / sectors</Label>
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
