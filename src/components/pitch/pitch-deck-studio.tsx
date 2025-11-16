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
import { pitchSlideLibrary } from "@/data/pitch-industries";
import type { SlideTemplate } from "@/data/pitch-industries";
import { usePitchDeckDraft } from "@/components/pitch/use-pitch-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PitchWizardDraft } from "@/types/pitch";
import { cn } from "@/lib/utils";

type PitchField = keyof PitchWizardDraft;

const steps = [
  { id: "vision", label: "Vision & audience" },
  { id: "market", label: "Market & proof" },
  { id: "execution", label: "Execution & capital" },
  { id: "review", label: "Review" },
];

function FieldLabel({
  label,
  required,
  onGenerate,
  loading,
}: {
  label: string;
  required?: boolean;
  onGenerate?: () => void;
  loading?: boolean;
}) {
  return (
    <div className="mb-1 flex items-center justify-between gap-3">
      <span className="text-sm font-medium">
        {label}{" "}
        <span className="text-xs text-muted-foreground">
          {required ? "(required)" : "(optional)"}
        </span>
      </span>
      {onGenerate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs"
          onClick={onGenerate}
          disabled={loading}
        >
          {loading ? "Generating…" : "Use AI"}
        </Button>
      )}
    </div>
  );
}

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
  generateField: (field: PitchField) => void;
  isBusy: (field: PitchField) => boolean;
};

function validateFields(fields: Array<[string, string]>) {
  const missing = fields.filter(([, value]) => !value.trim());
  return missing.map(([label]) => `${label} is required`);
}

function VisionStep({
  draft,
  updateDraft,
  next,
  errors,
  setErrors,
  generateField,
  isBusy,
}: StepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issues = validateFields([
      ["Startup name", draft.startupName],
      ["Mission headline", draft.missionStatement],
      ["Operating focus", draft.industry],
      ["Customer profile", draft.customerProfile],
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
        <FieldLabel label="Startup name" required />
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
        <FieldLabel
          label="Mission headline"
          required
          onGenerate={() => generateField("missionStatement")}
          loading={isBusy("missionStatement")}
        />
        <Textarea
          value={draft.missionStatement}
          onChange={(event) =>
            updateDraft({
              missionStatement: event.target.value,
              features: event.target.value,
            })
          }
          rows={3}
          placeholder="e.g. Give every climate operator a verifiable trust stack in 48 hours."
          required
        />
        <p className="text-xs text-muted-foreground">
          We&apos;ll reuse this line for the intro slide and to set the tone for
          the rest of the deck.
        </p>
      </div>
      <div>
        <FieldLabel
          label="Operating focus or region"
          required
          onGenerate={() => generateField("industry")}
          loading={isBusy("industry")}
        />
        <Input
          value={draft.industry}
          onChange={(event) => updateDraft({ industry: event.target.value })}
          placeholder="e.g. AI ESG audits for LatAm logistics"
          required
        />
      </div>
      <div>
        <FieldLabel
          label="Who do you serve?"
          required
          onGenerate={() => generateField("customerProfile")}
          loading={isBusy("customerProfile")}
        />
        <Textarea
          value={draft.customerProfile}
          onChange={(event) =>
            updateDraft({ customerProfile: event.target.value })
          }
          rows={4}
          placeholder="Share the segments, contract size, or user archetype. This becomes context for AI slides."
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

function MarketStep({
  draft,
  updateDraft,
  next,
  back,
  errors,
  setErrors,
  generateField,
  isBusy,
}: StepProps) {
  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const issues = validateFields([
      ["Pain points", draft.problems],
      ["Solution angle", draft.solutions],
      ["Traction snapshot", draft.tractionSummary],
      ["Competitive stance", draft.competitions],
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
        <FieldLabel
          label="Pain points"
          required
          onGenerate={() => generateField("problems")}
          loading={isBusy("problems")}
        />
        <Textarea
          value={draft.problems}
          onChange={(event) => updateDraft({ problems: event.target.value })}
          rows={4}
          placeholder="Quantify the top pain points and who feels them."
        />
      </div>
      <div>
        <FieldLabel
          label="Solution angle"
          required
          onGenerate={() => generateField("solutions")}
          loading={isBusy("solutions")}
        />
        <Textarea
          value={draft.solutions}
          onChange={(event) => updateDraft({ solutions: event.target.value })}
          rows={4}
          placeholder="Explain what you build and the differentiator in plain language."
        />
      </div>
      <div>
        <FieldLabel
          label="Traction snapshot"
          required
          onGenerate={() => generateField("tractionSummary")}
          loading={isBusy("tractionSummary")}
        />
        <Textarea
          value={draft.tractionSummary}
          onChange={(event) =>
            updateDraft({ tractionSummary: event.target.value })
          }
          rows={3}
          placeholder="Mention ARR, pilots, waitlists, carbon credits, or verifiable KPIs."
        />
      </div>
      <div>
        <FieldLabel
          label="Competitive stance"
          required
          onGenerate={() => generateField("competitions")}
          loading={isBusy("competitions")}
        />
        <Textarea
          value={draft.competitions}
          onChange={(event) =>
            updateDraft({ competitions: event.target.value })
          }
          rows={3}
          placeholder="List the alternatives and the unfair advantage you have."
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

function ExecutionStep({
  draft,
  updateDraft,
  next,
  back,
  errors,
  setErrors,
  addTeamMember,
  removeTeamMember,
  updateTeamMember,
  generateField,
  isBusy,
}: StepProps) {
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
      ["Go-to-market plan", draft.scope],
      ["Revenue model", draft.businessModel],
      ["Capital plan", draft.fundingPlan],
      ["Brand color", draft.brandColor],
    ]);
    if (!draft.slides.length) {
      issues.push("Select at least one slide template");
    }
    draft.team.forEach((member, index) => {
      const missing = validateFields([
        ["Name", member.name],
        ["Role", member.role],
      ]);
      if (missing.length) {
        issues.push(`Team member ${index + 1} needs a name and role.`);
      }
    });
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    next();
  }

  const slidesByCategory = useMemo(() => {
    return pitchSlideLibrary.reduce<Record<string, SlideTemplate[]>>(
      (acc, slide) => {
        const key = slide.category ?? "General";
        acc[key] = acc[key] || [];
        acc[key].push(slide);
        return acc;
      },
      {},
    );
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <p className="text-sm font-medium">Team</p>
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
                placeholder="Role (e.g. COO)"
              />
              <Input
                value={member.expertise}
                onChange={(event) =>
                  updateTeamMember(index, { expertise: event.target.value })
                }
                placeholder="Superpower or expertise"
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
        <FieldLabel
          label="Go-to-market focus"
          required
          onGenerate={() => generateField("scope")}
          loading={isBusy("scope")}
        />
          <Textarea
            value={draft.scope}
            onChange={(event) => updateDraft({ scope: event.target.value })}
            rows={3}
            placeholder="How you deploy capital, channels, partnerships, milestones."
          />
        </div>
        <div>
        <FieldLabel
          label="Revenue model"
          required
          onGenerate={() => generateField("businessModel")}
          loading={isBusy("businessModel")}
        />
          <Textarea
            value={draft.businessModel}
            onChange={(event) =>
              updateDraft({ businessModel: event.target.value })
            }
            rows={3}
            placeholder="Describe pricing, ACV, monetization levers."
          />
        </div>
      </div>

      <div>
        <FieldLabel
          label="Capital + milestone plan"
          required
          onGenerate={() => generateField("fundingPlan")}
          loading={isBusy("fundingPlan")}
        />
        <Textarea
          value={draft.fundingPlan}
          onChange={(event) =>
            updateDraft({
              fundingPlan: event.target.value,
              moreInfo: event.target.value,
            })
          }
          rows={4}
          placeholder="Describe how much you want to raise, allocation, and what success looks like in 12 months."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <FieldLabel label="Brand color" required />
          <Input
            value={draft.brandColor}
            onChange={(event) => updateDraft({ brandColor: event.target.value })}
            placeholder="#111827 or 'Deep indigo gradient'"
          />
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
                {option === "manual" ? "Upload assets later" : "AI placeholders"}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Slide templates</label>
        <p className="text-xs text-muted-foreground">
          Mix and match across categories to tailor the narrative.
        </p>
        <div className="space-y-4">
          {Object.entries(slidesByCategory).map(([category, slides]) => (
            <div key={category} className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {category}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {slides.map((slide) => {
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
                      <p className="text-xs text-muted-foreground">
                        {slide.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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

type ReviewProps = {
  draft: PitchWizardDraft;
  back: () => void;
  submitting: boolean;
  onSubmit: () => void;
  errors: string[];
  setErrors: (messages: string[]) => void;
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
      ["Operating focus", draft.industry],
      ["Mission headline", draft.missionStatement],
      ["Pain points", draft.problems],
      ["Solution angle", draft.solutions],
      ["Traction snapshot", draft.tractionSummary],
      ["Go-to-market plan", draft.scope],
      ["Capital plan", draft.fundingPlan],
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
            <dt className="text-muted-foreground">Operating focus</dt>
            <dd className="font-semibold">{draft.industry || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Mission headline</dt>
            <dd className="font-semibold">
              {draft.missionStatement || "Add a mission summary"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Traction snapshot</dt>
            <dd className="font-semibold">
              {draft.tractionSummary || "Add KPIs before submitting"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Capital plan</dt>
            <dd className="font-semibold">
              {draft.fundingPlan || "Describe how you will deploy capital"}
            </dd>
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
  const [aiBusy, setAiBusy] = useState<Record<string, boolean>>({});
  const [aiError, setAiError] = useState<string | null>(null);

  const activeStep = steps[stepIndex];

  const handleGenerateField = async (field: PitchField) => {
    setAiError(null);
    setAiBusy((prev) => ({ ...prev, [field]: true }));
    try {
      const response = await fetch("/api/pitch/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ field, draft }),
      });
      const suggestion = await response.text();
      if (!response.ok || !suggestion.trim()) {
        throw new Error(suggestion || "Unable to generate suggestion.");
      }
      const updates: Partial<PitchWizardDraft> = {
        [field]: suggestion.trim(),
      } as Partial<PitchWizardDraft>;
      if (field === "missionStatement") {
        updates.features = suggestion.trim();
      }
      if (field === "fundingPlan") {
        updates.moreInfo = suggestion.trim();
      }
      updateDraft(updates);
    } catch (error) {
      setAiError(
        error instanceof Error
          ? error.message
          : "Unable to generate suggestion.",
      );
    } finally {
      setAiBusy((prev) => ({ ...prev, [field]: false }));
    }
  };

  async function handleSubmit() {
    setSubmitting(true);
    setGlobalError(null);
    try {
      const submission = {
        ...draft,
        features: [draft.missionStatement, draft.customerProfile]
          .filter(Boolean)
          .join("\n\n"),
        moreInfo: draft.fundingPlan || draft.moreInfo,
      };
      const response = await fetch("/api/pitch/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
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
    generateField: handleGenerateField,
    isBusy: (field: PitchField) => Boolean(aiBusy[field]),
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
      case "vision":
        content = <VisionStep {...stepProps} />;
        break;
      case "market":
        content = <MarketStep {...stepProps} />;
        break;
      case "execution":
        content = <ExecutionStep {...stepProps} />;
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
      {aiError && (
        <p className="mt-2 text-sm text-amber-600" role="status">
          {aiError}
        </p>
      )}
    </div>
  );
}
