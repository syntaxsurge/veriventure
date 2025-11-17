"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Sparkles, Loader2, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import type { BusinessPlanSection, DocumentRecord } from "@/types/document";

type ApiResponse = {
  sections?: BusinessPlanSection[];
  body?: string;
  document?: DocumentRecord;
  error?: string;
};

type PublishState = {
  ual: string;
  explorer: string | null;
  subscan: string | null;
};

const initialForm = {
  idea: "",
  market: "",
  goToMarket: "",
  differentiation: "",
  impact: "",
};

type BusinessPlanField = keyof typeof initialForm;

const fieldConfig: Record<BusinessPlanField, { label: string; placeholder: string; rows?: number }> = {
  idea: {
    label: "Company / Idea Overview",
    placeholder: "Describe your company and core value proposition...",
    rows: 4,
  },
  market: {
    label: "Target Market",
    placeholder: "Who are your customers? What market segments do you serve?",
  },
  goToMarket: {
    label: "Go-to-Market Strategy",
    placeholder: "How will you acquire and retain customers?",
    rows: 3,
  },
  differentiation: {
    label: "Competitive Advantage",
    placeholder: "What makes you different from competitors?",
    rows: 3,
  },
  impact: {
    label: "Impact & Mission",
    placeholder: "What positive change will your company create?",
    rows: 3,
  },
};

export function BusinessPlanWriter() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<Partial<Record<BusinessPlanField, boolean>>>({});

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
      const response = await fetch("/api/ai/business-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiResponse;
      if (
        !response.ok ||
        !payload.sections ||
        !payload.body ||
        !payload.document
      ) {
        throw new Error(
          payload.error ?? "Failed to compile the business plan.",
        );
      }

      toast.success("Business plan generated successfully!", {
        description: "Redirecting to your business plan...",
      });

      setTimeout(() => {
        router.push(`/ai-assistant/business-plan/${payload.document!.id}`);
      }, 1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected business plan error.";
      setError(message);
      toast.error("Failed to generate business plan", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAssist(field: BusinessPlanField) {
    setAiBusy((prev) => ({ ...prev, [field]: true }));
    setAiError(null);
    try {
      const response = await fetch("/api/ai/forms/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant: "businessPlan",
          field,
          form,
        }),
      });
      const payload = (await response.json()) as {
        suggestion?: string;
        error?: string;
      };
      if (!response.ok || !payload.suggestion) {
        throw new Error(payload.error ?? "Unable to suggest copy.");
      }
      updateField(field, payload.suggestion);
      toast.success("AI suggestion applied!", {
        description: `Generated content for ${fieldConfig[field].label}`,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to suggest copy.";
      setAiError(message);
      toast.error("AI assist failed", {
        description: message,
      });
    } finally {
      setAiBusy((prev) => ({ ...prev, [field]: false }));
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Card */}
      <Card className="border-2 bg-gradient-to-br from-blue-500/5 via-background to-background shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex-shrink-0">
              <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-2">Business Plan Generator</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Transform your vision into a comprehensive business plan. Answer strategic questions
                below, and we'll generate a professional narrative ready for investors, lenders, and
                accelerators.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form */}
      <form onSubmit={handleGenerate} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Company Overview - Full Width */}
          <div className="md:col-span-2 space-y-3">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="plan-idea" className="text-base font-semibold">
                    {fieldConfig.idea.label}
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleAssist("idea")}
                    disabled={loading || aiBusy.idea}
                  >
                    {aiBusy.idea ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Use AI
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  id="plan-idea"
                  rows={fieldConfig.idea.rows}
                  placeholder={fieldConfig.idea.placeholder}
                  value={form.idea}
                  onChange={(event) => updateField("idea", event.target.value)}
                  className="resize-none"
                  required
                />
              </CardContent>
            </Card>
          </div>

          {/* Target Market */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="plan-market" className="text-base font-semibold">
                  {fieldConfig.market.label}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAssist("market")}
                  disabled={loading || aiBusy.market}
                >
                  {aiBusy.market ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Use AI
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="plan-market"
                placeholder={fieldConfig.market.placeholder}
                value={form.market}
                onChange={(event) => updateField("market", event.target.value)}
                required
              />
            </CardContent>
          </Card>

          {/* Go-to-Market */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="plan-go-to-market" className="text-base font-semibold">
                  {fieldConfig.goToMarket.label}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAssist("goToMarket")}
                  disabled={loading || aiBusy.goToMarket}
                >
                  {aiBusy.goToMarket ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Use AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="plan-go-to-market"
                rows={fieldConfig.goToMarket.rows}
                placeholder={fieldConfig.goToMarket.placeholder}
                value={form.goToMarket}
                onChange={(event) => updateField("goToMarket", event.target.value)}
                className="resize-none"
                required
              />
            </CardContent>
          </Card>

          {/* Differentiation */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="plan-differentiation" className="text-base font-semibold">
                  {fieldConfig.differentiation.label}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAssist("differentiation")}
                  disabled={loading || aiBusy.differentiation}
                >
                  {aiBusy.differentiation ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Use AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="plan-differentiation"
                rows={fieldConfig.differentiation.rows}
                placeholder={fieldConfig.differentiation.placeholder}
                value={form.differentiation}
                onChange={(event) => updateField("differentiation", event.target.value)}
                className="resize-none"
                required
              />
            </CardContent>
          </Card>

          {/* Impact */}
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Label htmlFor="plan-impact" className="text-base font-semibold">
                  {fieldConfig.impact.label}
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => handleAssist("impact")}
                  disabled={loading || aiBusy.impact}
                >
                  {aiBusy.impact ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      Use AI
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                id="plan-impact"
                rows={fieldConfig.impact.rows}
                placeholder={fieldConfig.impact.placeholder}
                value={form.impact}
                onChange={(event) => updateField("impact", event.target.value)}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {(aiError || error) && (
          <Card className="border-2 border-destructive/50 bg-destructive/5">
            <CardContent className="p-4">
              <p className="text-sm text-destructive font-medium">
                {aiError || error}
              </p>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="gap-2 px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating Your Business Plan...
              </>
            ) : (
              <>
                Generate Business Plan
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
