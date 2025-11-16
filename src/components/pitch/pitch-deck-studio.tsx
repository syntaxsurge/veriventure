"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Radio,
  StepForward,
} from "lucide-react";
import { pitchIndustries } from "@/data/pitch-industries";
import { usePitchDeckDraft } from "@/components/pitch/use-pitch-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PitchWizardDraft } from "@/types/pitch";
import { cn } from "@/lib/utils";

const steps = [
  { id: "brief", label: "Brief" },
  { id: "insights", label: "Insights" },
  { id: "team", label: "Team & scope" },
  { id: "brand", label: "Branding & slides" },
  { id: "review", label: "Review" },
];

type StepProps = {
  draft: PitchWizardDraft;
  updateDraft: (updates: Partial<PitchWizardDraft>) => void;
  next: () => void;
  back: () => void;
  errors: string[];
  setErrors: (messages: string[]) => void;
  addTeamMember: () => void;
  removeTeamMember: (index: number) => void;
  updateTeamMember: (
    index: number,
    updates: Partial<PitchWizardDraft["team"][number]>,
  ) => void;
};

function validateFields(fields: Array<[string, string]>) {
  const missing = fields.filter(([, value]) => !value.trim());
  return missing.map(([label]) => `${label} is required`);
}

function BriefStep({
  draft,
  updateDraft,
  next,
  errors,
  setErrors,
}: StepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issues = validateFields([
      ["Startup name", draft.startupName],
      ["Industry", draft.industry],
      ["Product overview", draft.features],
    ]);
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    next();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium">Startup name</label>
        <Input
          value={draft.startupName}
          onChange={(event) =>
            updateDraft({ startupName: event.target.value })
          }
          placeholder="VeriVenture Labs"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Industry</label>
        <select
          value={draft.industry}
          onChange={(event) => updateDraft({ industry: event.target.value })}
          className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          required
        >
          <option value="">Select an industry</option>
          {pitchIndustries.map((industry) => (
            <option key={industry.slug} value={industry.slug}>
              {industry.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-medium">Product overview</label>
        <Textarea
          value={draft.features}
          onChange={(event) => updateDraft({ features: event.target.value })}
          rows={4}
          placeholder="Explain what you solve and why it matters."
          required
        />
      </div>
      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors.join(". ")}</p>
      )}
      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}

function InsightStep({
  draft,
  updateDraft,
  next,
  back,
  errors,
  setErrors,
}: StepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issues = validateFields([
      ["Problem", draft.problems],
      ["Solution", draft.solutions],
      ["Competitors", draft.competitions],
    ]);
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    next();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm font-medium">Problem</label>
        <Textarea
          value={draft.problems}
          onChange={(event) => updateDraft({ problems: event.target.value })}
          rows={4}
          placeholder="Describe the pain points with data."
        />
      </div>
      <div>
        <label className="text-sm font-medium">Solution</label>
        <Textarea
          value={draft.solutions}
          onChange={(event) => updateDraft({ solutions: event.target.value })}
          rows={4}
          placeholder="Explain how your product fixes the pain."
        />
      </div>
      <div>
        <label className="text-sm font-medium">Key competitors</label>
        <Input
          value={draft.competitions}
          onChange={(event) =>
            updateDraft({ competitions: event.target.value })
          }
          placeholder="e.g., Paystack, Flutterwave, local banks"
        />
      </div>
      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors.join(". ")}</p>
      )}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit" className="flex items-center gap-2">
          Continue
          <StepForward className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

function TeamStep({
  draft,
  updateDraft,
  next,
  back,
  errors,
  setErrors,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
}: StepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issues = [
      ...validateFields([
        ["Scope", draft.scope],
        ["Go-to-market plan", draft.moreInfo || "placeholder"],
      ]),
      ...draft.team
        .map((member, index) => {
          const missing = validateFields([
            ["Name", member.name],
            ["Role", member.role],
            ["Expertise", member.expertise],
          ]);
          return missing.length
            ? `Complete team member ${index + 1}`
            : null;
        })
        .filter(Boolean) as string[],
    ];
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    next();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-4">
        {draft.team.map((member, index) => (
          <Card key={member.id} className="border-dashed">
            <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
              <Input
                value={member.name}
                onChange={(event) =>
                  updateTeamMember(index, { name: event.target.value })
                }
                placeholder="Full name"
              />
              <Input
                value={member.role}
                onChange={(event) =>
                  updateTeamMember(index, { role: event.target.value })
                }
                placeholder="Role"
              />
              <Input
                value={member.expertise}
                onChange={(event) =>
                  updateTeamMember(index, { expertise: event.target.value })
                }
                placeholder="Expertise"
              />
              {draft.team.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="col-span-full justify-start text-xs text-muted-foreground"
                  onClick={() => removeTeamMember(index)}
                >
                  Remove
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        <Button type="button" variant="outline" onClick={addTeamMember}>
          Add teammate
        </Button>
      </div>
      <div>
        <label className="text-sm font-medium">Scope</label>
        <Input
          value={draft.scope}
          onChange={(event) => updateDraft({ scope: event.target.value })}
          placeholder="e.g., expand to 5 markets over the next 12 months"
        />
      </div>
      <div>
        <label className="text-sm font-medium">More info</label>
        <Textarea
          value={draft.moreInfo}
          onChange={(event) => updateDraft({ moreInfo: event.target.value })}
          rows={3}
          placeholder="Raise target, partnerships, or climate impact proof."
        />
      </div>
      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors.join(". ")}</p>
      )}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit">Continue</Button>
      </div>
    </form>
  );
}

function BrandStep({
  draft,
  updateDraft,
  next,
  back,
  errors,
  setErrors,
}: StepProps) {
  const industry = pitchIndustries.find(
    (entry) => entry.slug === draft.industry,
  );

  function toggleSlide(id: string) {
    if (draft.slides.includes(id)) {
      updateDraft({
        slides: draft.slides.filter((slideId) => slideId !== id),
      });
    } else {
      updateDraft({ slides: [...draft.slides, id] });
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issues = validateFields([
      ["Brand color", draft.brandColor],
      ["Business model", draft.businessModel],
    ]);
    if (!draft.slides.length) {
      issues.push("Select at least one slide template");
    }
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    next();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium">Brand color</label>
          <Input
            value={draft.brandColor}
            onChange={(event) => updateDraft({ brandColor: event.target.value })}
            placeholder="#111827"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Business model</label>
          <Input
            value={draft.businessModel}
            onChange={(event) =>
              updateDraft({ businessModel: event.target.value })
            }
            placeholder="Subscription, usage fees, etc."
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Image strategy</label>
        <div className="mt-2 flex gap-3">
          {["manual", "ai"].map((option) => (
            <label
              key={option}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm",
                draft.imageStrategy === option
                  ? "border-primary bg-primary/5"
                  : "border-dashed",
              )}
            >
              <input
                type="radio"
                className="hidden"
                checked={draft.imageStrategy === option}
                onChange={() =>
                  updateDraft({ imageStrategy: option as "manual" | "ai" })
                }
              />
              <Radio className="h-4 w-4" />
              {option === "manual" ? "Upload my own" : "AI placeholders"}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <label className="text-sm font-medium">Slide templates</label>
        {!industry && (
          <p className="text-sm text-muted-foreground">
            Choose an industry first to see curated slides.
          </p>
        )}
        {industry && (
          <div className="grid gap-3 md:grid-cols-2">
            {industry.slides.map((slide) => {
              const selected = draft.slides.includes(slide.id);
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => toggleSlide(slide.id)}
                  className={cn(
                    "rounded-2xl border p-4 text-left transition",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-muted",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{slide.title}</p>
                    {selected && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {slide.description}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors.join(". ")}</p>
      )}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button type="submit">Review</Button>
      </div>
    </form>
  );
}

type ReviewProps = StepProps & {
  submitting: boolean;
  onSubmit: () => void;
};

function ReviewStep({
  draft,
  back,
  submitting,
  onSubmit,
  errors,
  setErrors,
}: ReviewProps) {
  function validateBeforeSubmit() {
    const issues = validateFields([
      ["Startup name", draft.startupName],
      ["Industry", draft.industry],
      ["Problem", draft.problems],
      ["Solution", draft.solutions],
      ["Scope", draft.scope],
    ]);
    if (!draft.slides.length) {
      issues.push("Select at least one slide template.");
    }
    if (issues.length) {
      setErrors(issues);
      return false;
    }
    setErrors([]);
    return true;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-dashed p-6 text-sm">
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Startup</dt>
            <dd className="font-semibold">{draft.startupName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Industry</dt>
            <dd className="font-semibold">{draft.industry || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Slides selected</dt>
            <dd className="font-semibold">{draft.slides.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Image strategy</dt>
            <dd className="font-semibold">{draft.imageStrategy}</dd>
          </div>
        </dl>
      </div>
      {errors.length > 0 && (
        <p className="text-sm text-destructive">{errors.join(". ")}</p>
      )}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Button
          type="button"
          disabled={submitting}
          onClick={() => {
            if (validateBeforeSubmit()) {
              onSubmit();
            }
          }}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating deck…
            </>
          ) : (
            "Create pitch deck"
          )}
        </Button>
      </div>
    </div>
  );
}

export function PitchDeckStudio() {
  const router = useRouter();
  const {
    ready,
    draft,
    updateDraft,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
    resetDraft,
  } = usePitchDeckDraft();
  const [stepIndex, setStepIndex] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const activeStep = steps[stepIndex];
  const industry = useMemo(
    () => pitchIndustries.find((entry) => entry.slug === draft.industry),
    [draft.industry],
  );

  async function handleSubmit() {
    setSubmitting(true);
    setGlobalError(null);
    try {
      const response = await fetch("/api/pitch/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to create deck.",
        );
      }
      const payload = (await response.json()) as {
        deck?: { deckId: string };
      };
      resetDraft();
      if (payload.deck?.deckId) {
        router.push(`/ai-assistant/pitch-deck/${payload.deck.deckId}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create deck.";
      setGlobalError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const stepProps: StepProps = {
    draft,
    updateDraft,
    next: () => setStepIndex((index) => Math.min(index + 1, steps.length - 1)),
    back: () => setStepIndex((index) => Math.max(index - 1, 0)),
    errors,
    setErrors,
    addTeamMember,
    removeTeamMember,
    updateTeamMember,
  };

  let content: React.ReactNode;
  if (!ready) {
    content = (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading draft…
      </div>
    );
  } else {
    switch (activeStep.id) {
      case "brief":
        content = <BriefStep {...stepProps} />;
        break;
      case "insights":
        content = <InsightStep {...stepProps} />;
        break;
      case "team":
        content = <TeamStep {...stepProps} />;
        break;
      case "brand":
        content = <BrandStep {...stepProps} />;
        break;
      case "review":
        content = (
          <ReviewStep
            {...stepProps}
            submitting={submitting}
            onSubmit={handleSubmit}
          />
        );
        break;
      default:
        content = null;
    }
  }

  return (
    <div className="rounded-3xl border bg-card/70 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <Badge variant="outline">Pitch Deck Studio</Badge>
        <h2 className="mt-2 text-2xl font-semibold">
          {activeStep.label}
        </h2>
        {industry && (
          <p className="text-xs text-muted-foreground">
            {industry.summary}
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "h-2 w-8 rounded-full",
              index <= stepIndex ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>
      </div>
      <div className="mt-8">{content}</div>
      {globalError && (
        <p className="mt-4 text-sm text-destructive">{globalError}</p>
      )}
    </div>
  );
}
