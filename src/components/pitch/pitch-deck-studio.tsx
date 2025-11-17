"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Radio,
  StepForward,
  Sparkles,
} from "lucide-react";
import { pitchSlideLibrary } from "@/data/pitch-industries";
import type { SlideTemplate } from "@/data/pitch-industries";
import { usePitchDeckDraft } from "@/components/pitch/use-pitch-draft";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import type { ImageStrategy, PitchWizardDraft } from "@/types/pitch";
import { cn } from "@/lib/utils";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";

type PitchField = keyof Pick<
  PitchWizardDraft,
  | "missionStatement"
  | "focusRegion"
  | "customerProfile"
  | "tractionSummary"
  | "goToMarket"
  | "businessModel"
  | "fundingPlan"
>;

const steps = [
  { id: "vision", label: "Vision & audience" },
  { id: "market", label: "Market & proof" },
  { id: "execution", label: "Execution & capital" },
  { id: "review", label: "Review" },
];

const imageOptions: { value: ImageStrategy; label: string; helper: string }[] =
  [
    {
      value: "manual",
      label: "Upload assets later",
      helper: "Keep placeholders and drop your own images after generation.",
    },
    {
      value: "ai",
      label: "AI placeholders",
      helper: "Let OpenAI render cinematic hero shots for each slide.",
    },
    {
      value: "scrape",
      label: "Web sourced",
      helper: "Pull editorial photography from the web for each template.",
    },
  ];

const FIELD_LIMITS: Partial<Record<PitchField, number>> = {
  missionStatement: 400,
  focusRegion: 200,
  customerProfile: 400,
  tractionSummary: 400,
  goToMarket: 400,
  businessModel: 200,
  fundingPlan: 400,
};

function extractSuggestion(field: PitchField, payload: string) {
  const trimmed = payload.trim();
  if (!trimmed) return "";

  const fromValue = (value: unknown): string | null => {
    if (typeof value === "string") {
      return value;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = fromValue(entry);
        if (nested) return nested;
      }
      return null;
    }
    if (!value || typeof value !== "object") {
      return null;
    }
    const record = value as Record<string, unknown>;
    if (typeof record[field] === "string") {
      return record[field] as string;
    }
    if (typeof record.suggestion === "string") {
      return record.suggestion as string;
    }
    if (typeof record.value === "string") {
      return record.value as string;
    }
    if (record.draft) {
      const nested = fromValue(record.draft);
      if (nested) return nested;
    }
    if (record.data) {
      const nested = fromValue(record.data);
      if (nested) return nested;
    }
    const firstString = Object.values(record).find(
      (entry) => typeof entry === "string",
    );
    return typeof firstString === "string" ? firstString : null;
  };

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const suggestion = fromValue(parsed);
      if (suggestion) {
        return suggestion.trim();
      }
    } catch {
      // ignore JSON parse errors and fall back to raw text
    }
  }
  return trimmed;
}

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

function CharacterInfo({
  value,
  max,
}: {
  value: string;
  max?: number;
}) {
  if (!max) return null;
  const over = value.length > max;
  return (
    <p
      className={cn(
        "text-xs text-muted-foreground",
        over && "text-destructive",
      )}
    >
      {value.length}/{max} characters
    </p>
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

function validateFields(
  fields: Array<[string, string, number | undefined]>,
) {
  const errors: string[] = [];
  for (const [label, value, max] of fields) {
    if (!value.trim()) {
      errors.push(`${label} is required`);
    }
    if (typeof max === "number" && value.length > max) {
      errors.push(`${label} exceeds ${max} characters`);
    }
  }
  return errors;
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
      ["Startup name", draft.startupName, 120],
      ["Mission headline", draft.missionStatement, FIELD_LIMITS.missionStatement],
      ["Operating focus", draft.focusRegion, FIELD_LIMITS.focusRegion],
      ["Customer profile", draft.customerProfile, FIELD_LIMITS.customerProfile],
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
            })
          }
          rows={3}
          aria-invalid={
            (FIELD_LIMITS.missionStatement ?? Infinity) <
            draft.missionStatement.length
          }
          placeholder="e.g. Give every climate operator a verifiable trust stack in 48 hours."
          required
          className={cn(
            (FIELD_LIMITS.missionStatement ?? Infinity) <
              draft.missionStatement.length && "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.missionStatement}
          max={FIELD_LIMITS.missionStatement}
        />
      </div>
      <div>
        <FieldLabel
          label="Operating focus or region"
          required
          onGenerate={() => generateField("focusRegion")}
          loading={isBusy("focusRegion")}
        />
        <Input
          value={draft.focusRegion}
          onChange={(event) => updateDraft({ focusRegion: event.target.value })}
          placeholder="e.g. AI ESG audits for LatAm logistics"
          aria-invalid={
            (FIELD_LIMITS.focusRegion ?? Infinity) <
            draft.focusRegion.length
          }
          required
          className={cn(
            (FIELD_LIMITS.focusRegion ?? Infinity) <
              draft.focusRegion.length && "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.focusRegion}
          max={FIELD_LIMITS.focusRegion}
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
          aria-invalid={
            (FIELD_LIMITS.customerProfile ?? Infinity) <
            draft.customerProfile.length
          }
          placeholder="Share the segments, contract size, or user archetype. This becomes context for AI slides."
          required
          className={cn(
            (FIELD_LIMITS.customerProfile ?? Infinity) <
              draft.customerProfile.length && "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.customerProfile}
          max={FIELD_LIMITS.customerProfile}
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
      ["Traction snapshot", draft.tractionSummary, FIELD_LIMITS.tractionSummary],
      ["Go-to-market plan", draft.goToMarket, FIELD_LIMITS.goToMarket],
      ["Business model", draft.businessModel, FIELD_LIMITS.businessModel],
      ["Funding plan", draft.fundingPlan, FIELD_LIMITS.fundingPlan],
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
          aria-invalid={
            (FIELD_LIMITS.tractionSummary ?? Infinity) <
            draft.tractionSummary.length
          }
          placeholder="Mention ARR, pilots, waitlists, carbon savings, etc."
          required
          className={cn(
            (FIELD_LIMITS.tractionSummary ?? Infinity) <
              draft.tractionSummary.length && "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.tractionSummary}
          max={FIELD_LIMITS.tractionSummary}
        />
      </div>
      <div>
        <FieldLabel
          label="Go-to-market plan"
          required
          onGenerate={() => generateField("goToMarket")}
          loading={isBusy("goToMarket")}
        />
        <Textarea
          value={draft.goToMarket}
          onChange={(event) =>
            updateDraft({ goToMarket: event.target.value })
          }
          rows={3}
          aria-invalid={
            (FIELD_LIMITS.goToMarket ?? Infinity) < draft.goToMarket.length
          }
          placeholder="Explain launch channels, partnerships, and next milestones."
          required
          className={cn(
            (FIELD_LIMITS.goToMarket ?? Infinity) < draft.goToMarket.length &&
              "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.goToMarket}
          max={FIELD_LIMITS.goToMarket}
        />
      </div>
      <div>
        <FieldLabel
          label="Business model"
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
          aria-invalid={
            (FIELD_LIMITS.businessModel ?? Infinity) <
            draft.businessModel.length
          }
          placeholder="Describe pricing, ACV, monetization levers."
          required
          className={cn(
            (FIELD_LIMITS.businessModel ?? Infinity) <
              draft.businessModel.length && "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.businessModel}
          max={FIELD_LIMITS.businessModel}
        />
      </div>
      <div>
        <FieldLabel
          label="Funding plan"
          required
          onGenerate={() => generateField("fundingPlan")}
          loading={isBusy("fundingPlan")}
        />
        <Textarea
          value={draft.fundingPlan}
          onChange={(event) =>
            updateDraft({ fundingPlan: event.target.value })
          }
          rows={3}
          aria-invalid={
            (FIELD_LIMITS.fundingPlan ?? Infinity) <
            draft.fundingPlan.length
          }
          placeholder="Detail raise target, allocation, and 12-month outcomes."
          required
          className={cn(
            (FIELD_LIMITS.fundingPlan ?? Infinity) <
              draft.fundingPlan.length && "border-destructive",
          )}
        />
        <CharacterInfo
          value={draft.fundingPlan}
          max={FIELD_LIMITS.fundingPlan}
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
}: StepProps) {
  const [slideQuery, setSlideQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

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
    const issues = validateFields([["Brand color", draft.brandColor, 32]]);
    if (!draft.slides.length) {
      issues.push("Select at least one slide template");
    }
    draft.team.forEach((member, index) => {
      const missing = validateFields([
        [`Team member ${index + 1} name`, member.name, 120],
        [`Team member ${index + 1} role`, member.role, 120],
        [`Team member ${index + 1} expertise`, member.expertise, 160],
      ]);
      issues.push(...missing);
    });
    if (issues.length) {
      setErrors(issues);
      return;
    }
    setErrors([]);
    next();
  }

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        pitchSlideLibrary.map((slide) => slide.category ?? "General"),
      ),
    );
  }, []);

  const filteredSlides = useMemo(() => {
    const query = slideQuery.trim().toLowerCase();
    return pitchSlideLibrary.filter((slide) => {
      const category = slide.category ?? "General";
      const matchesCategory =
        !categoryFilter || categoryFilter === category;
      const matchesQuery = query
        ? `${slide.title} ${slide.description}`
            .toLowerCase()
            .includes(query)
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [slideQuery, categoryFilter]);

  const slidesByCategory = useMemo(() => {
    return filteredSlides.reduce<Record<string, SlideTemplate[]>>(
      (acc, slide) => {
        const key = slide.category ?? "General";
        acc[key] = acc[key] || [];
        acc[key].push(slide);
        return acc;
      },
      {},
    );
  }, [filteredSlides]);

  const visibleSlideIds = useMemo(
    () => filteredSlides.map((slide) => slide.id),
    [filteredSlides],
  );

  const anyVisibleSelected = useMemo(
    () => visibleSlideIds.some((id) => draft.slides.includes(id)),
    [visibleSlideIds, draft.slides],
  );

  const handleSelectVisible = () => {
    if (!visibleSlideIds.length) return;
    const merged = Array.from(new Set([...draft.slides, ...visibleSlideIds]));
    updateDraft({ slides: merged });
  };

  const handleClearVisible = () => {
    if (!visibleSlideIds.length) return;
    updateDraft({
      slides: draft.slides.filter((id) => !visibleSlideIds.includes(id)),
    });
  };

  const safeBrandColor = /^#[0-9a-fA-F]{6}$/.test(draft.brandColor.trim())
    ? draft.brandColor.trim()
    : "#111827";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium">Team</p>
          <p className="text-xs text-muted-foreground">
            Share names, roles, and each teammate&apos;s superpower.
          </p>
        </div>
        {draft.team.map((member, index) => (
          <Card key={member.id} className="border-dashed">
            <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
              <Input
                value={member.name}
                onChange={(event) =>
                  updateTeamMember(index, { name: event.target.value })
                }
                placeholder="Full name"
                required
              />
              <Input
                value={member.role}
                onChange={(event) =>
                  updateTeamMember(index, { role: event.target.value })
                }
                placeholder="Role (e.g. COO)"
                required
              />
              <Input
                value={member.expertise}
                onChange={(event) =>
                  updateTeamMember(index, { expertise: event.target.value })
                }
                placeholder="Superpower or expertise"
                required
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
          <FieldLabel label="Brand color" required />
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={draft.brandColor}
              onChange={(event) =>
                updateDraft({ brandColor: event.target.value })
              }
              placeholder="#111827"
              maxLength={32}
              required
              aria-invalid={draft.brandColor.trim().length === 0}
              className={cn(
                draft.brandColor.length > 32 && "border-destructive",
                "md:flex-1",
              )}
            />
            <input
              type="color"
              aria-label="Pick a brand color"
              className="h-11 w-full cursor-pointer rounded-xl border border-input bg-transparent p-1 md:w-20"
              value={safeBrandColor}
              onChange={(event) =>
                updateDraft({ brandColor: event.target.value.toUpperCase() })
              }
            />
          </div>
          <CharacterInfo value={draft.brandColor} max={32} />
        </div>
        <div>
          <FieldLabel label="Image strategy" required />
          <div className="mt-2 flex flex-col gap-3 md:flex-row md:flex-wrap">
            {imageOptions.map((option) => (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer gap-3 rounded-xl border px-3 py-2 text-sm md:w-[calc(50%-0.5rem)]",
                  draft.imageStrategy === option.value
                    ? "border-primary bg-primary/5"
                    : "border-dashed",
                )}
              >
                <input
                  type="radio"
                  className="hidden"
                  checked={draft.imageStrategy === option.value}
                  onChange={() =>
                    updateDraft({ imageStrategy: option.value })
                  }
                />
                <Radio className="h-4 w-4" />
                <span>
                  <span className="block font-medium">{option.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {option.helper}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium">Slide templates</label>
        <p className="text-xs text-muted-foreground">
          Mix and match across categories, search by keyword, or filter by category to tailor the narrative.
        </p>
        <div className="space-y-4">
          <div className="space-y-3 rounded-2xl border p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                placeholder="Search slide titles or keywords"
                value={slideQuery}
                onChange={(event) => setSlideQuery(event.target.value)}
                aria-label="Search slides"
                className="md:flex-1"
              />
              <Badge variant="secondary" className="w-fit">
                {draft.slides.length} slide{draft.slides.length === 1 ? "" : "s"} selected
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={categoryFilter ? "outline" : "default"}
                onClick={() => setCategoryFilter(null)}
              >
                All
              </Button>
              {categories.map((category) => (
                <Button
                  key={category}
                  type="button"
                  size="sm"
                  variant={categoryFilter === category ? "default" : "outline"}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleSelectVisible}
                disabled={!visibleSlideIds.length}
              >
                Select shown templates
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={handleClearVisible}
                disabled={!anyVisibleSelected}
              >
                Clear shown templates
              </Button>
            </div>
          </div>
          {Object.entries(slidesByCategory).map(([category, slides]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase text-muted-foreground">
                <span>{category}</span>
                <span>
                  {slides.length} option{slides.length === 1 ? "" : "s"}
                </span>
              </div>
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
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{slide.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {slide.description}
                          </p>
                        </div>
                        {selected && (
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(slidesByCategory).length === 0 && (
            <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
              No slide templates match your filters. Clear the search or choose a different category.
            </p>
          )}
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
  publishToDKG: boolean;
  setPublishToDKG: (value: boolean) => void;
};

function ReviewStep({
  draft,
  back,
  submitting,
  onSubmit,
  errors,
  setErrors,
  publishToDKG,
  setPublishToDKG,
}: ReviewProps) {
  function validateBeforeSubmit() {
    const issues = validateFields([
      ["Startup name", draft.startupName, 120],
      ["Mission headline", draft.missionStatement, FIELD_LIMITS.missionStatement],
      ["Operating focus", draft.focusRegion, FIELD_LIMITS.focusRegion],
      ["Customer profile", draft.customerProfile, FIELD_LIMITS.customerProfile],
      ["Traction snapshot", draft.tractionSummary, FIELD_LIMITS.tractionSummary],
      ["Go-to-market plan", draft.goToMarket, FIELD_LIMITS.goToMarket],
      ["Business model", draft.businessModel, FIELD_LIMITS.businessModel],
      ["Capital plan", draft.fundingPlan, FIELD_LIMITS.fundingPlan],
      ["Brand color", draft.brandColor, 32],
    ]);
    if (!draft.slides.length) {
      issues.push("Select at least one slide template.");
    }
    draft.team.forEach((member, index) => {
      const missing = validateFields([
        [`Team member ${index + 1} name`, member.name, 120],
        [`Team member ${index + 1} role`, member.role, 120],
        [`Team member ${index + 1} expertise`, member.expertise, 160],
      ]);
      issues.push(...missing);
    });
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
            <dd className="font-semibold">{draft.focusRegion || "—"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Mission headline</dt>
            <dd className="font-semibold">
              {draft.missionStatement || "Add a mission summary"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Customer profile</dt>
            <dd className="font-semibold">
              {draft.customerProfile || "Add audience notes"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Traction snapshot</dt>
            <dd className="font-semibold">
              {draft.tractionSummary || "Add KPIs before submitting"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Go-to-market plan</dt>
            <dd className="font-semibold">
              {draft.goToMarket || "Explain launch priorities"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Business model</dt>
            <dd className="font-semibold">
              {draft.businessModel || "Describe monetization"}
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
            <dt className="text-muted-foreground">Team members</dt>
            <dd className="font-semibold">{draft.team.length}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Image strategy</dt>
            <dd className="font-semibold">{draft.imageStrategy}</dd>
          </div>
        </dl>
      </div>

      <Separator />

      {/* DKG Publishing Toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Label htmlFor="dkg-pitch" className="text-base font-medium">
              Publish Executive Summary to DKG
            </Label>
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Create a verifiable proof of your pitch deck summary on OriginTrail DKG
          </p>
        </div>
        <Switch
          id="dkg-pitch"
          checked={publishToDKG}
          onCheckedChange={setPublishToDKG}
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
        <Button
          id="create-pitch-deck-button"
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
  const { mark } = useOnboardingProgress();
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
  const [publishToDKG, setPublishToDKG] = useState(false);

  const activeStep = steps[stepIndex];

  const handleGenerateField = async (field: PitchField) => {
    setAiError(null);
    setAiBusy((prev) => ({ ...prev, [field]: true }));
    try {
      const response = await fetch("/api/pitch/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          draft,
          limit: FIELD_LIMITS[field],
        }),
      });
      const payload = await response.text();
      if (!response.ok) {
        throw new Error(payload || "Unable to generate suggestion.");
      }
      const suggestion = extractSuggestion(field, payload);
      if (!suggestion) {
        throw new Error("AI suggestion was empty.");
      }
      updateDraft({
        [field]: suggestion,
      } as Partial<PitchWizardDraft>);
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
      // Publish to DKG if enabled
      let dkgUAL = "";
      if (publishToDKG) {
        try {
          const response = await fetch("/api/dkg/notes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              topic: `Pitch Deck: ${draft.startupName}`,
              summary: `Executive Summary for ${draft.startupName}. Mission: ${draft.missionStatement}. Focus: ${draft.focusRegion}. Traction: ${draft.tractionSummary}. Team: ${draft.team.map(m => `${m.name} (${m.role})`).join(", ")}.`,
              references: [],
            }),
          });

          if (response.ok) {
            const dkgData = await response.json();
            dkgUAL = dkgData.ual;
          }
        } catch (dkgError) {
          console.error("DKG publishing error:", dkgError);
          // Continue without DKG proof
        }
      }

      const response = await fetch("/api/pitch/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, dkgUAL }),
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
      mark("firstDeckGenerated");
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
            publishToDKG={publishToDKG}
            setPublishToDKG={setPublishToDKG}
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
