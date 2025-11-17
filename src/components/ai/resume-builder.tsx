"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ResumeSection } from "@/types/document";

export type ResumeResponse = {
  resume?: {
    headline: string;
    summary: string;
    sections: ResumeSection[];
    skills: string[];
  };
  document?: {
    id: string;
  };
  error?: string;
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
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<Partial<Record<ResumeField, boolean>>>({});

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
      router.push(`/ai-assistant/resume/${payload.document.id}`);
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

  return (
    <div className="space-y-6">
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
      </div>
  );
}
