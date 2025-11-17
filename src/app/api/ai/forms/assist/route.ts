import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import {
  generateAchievementFieldSuggestion,
  generateBusinessPlanFieldSuggestion,
  generateResumeFieldSuggestion,
} from "@/lib/server/openai";

const BUSINESS_PLAN_FIELDS = [
  "idea",
  "market",
  "goToMarket",
  "differentiation",
  "impact",
] as const;

const RESUME_FIELDS = [
  "fullName",
  "headline",
  "achievements",
  "experience",
  "focus",
] as const;

const ACHIEVEMENT_FIELDS = [
  "title",
  "summary",
  "metrics",
  "evidenceUrl",
  "impactArea",
] as const;

const businessPlanFormSchema = z.object({
  idea: z.string().optional(),
  market: z.string().optional(),
  goToMarket: z.string().optional(),
  differentiation: z.string().optional(),
  impact: z.string().optional(),
});

const resumeFormSchema = z.object({
  fullName: z.string().optional(),
  headline: z.string().optional(),
  achievements: z.string().optional(),
  experience: z.string().optional(),
  focus: z.string().optional(),
});

const achievementFormSchema = z.object({
  title: z.string().optional(),
  summary: z.string().optional(),
  metrics: z.string().optional(),
  evidenceUrl: z.string().optional(),
  impactArea: z.string().optional(),
});

const requestSchema = z.discriminatedUnion("assistant", [
  z.object({
    assistant: z.literal("businessPlan"),
    field: z.enum(BUSINESS_PLAN_FIELDS),
    form: businessPlanFormSchema.partial(),
  }),
  z.object({
    assistant: z.literal("resume"),
    field: z.enum(RESUME_FIELDS),
    form: resumeFormSchema.partial(),
  }),
  z.object({
    assistant: z.literal("achievement"),
    field: z.enum(ACHIEVEMENT_FIELDS),
    form: achievementFormSchema.partial(),
  }),
]);

type AssistRequest = z.infer<typeof requestSchema>;

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = requestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = parsed.data as AssistRequest;
  try {
    let suggestion = "";
    switch (body.assistant) {
      case "businessPlan":
        suggestion = await generateBusinessPlanFieldSuggestion(
          body.field,
          body.form ?? {},
        );
        break;
      case "resume":
        suggestion = await generateResumeFieldSuggestion(
          body.field,
          body.form ?? {},
        );
        break;
      case "achievement":
        suggestion = await generateAchievementFieldSuggestion(
          body.field,
          body.form ?? {},
        );
        break;
      default:
        suggestion = "";
    }

    if (!suggestion) {
      throw new Error("Suggestion was empty.");
    }

    return NextResponse.json({ suggestion });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate the field suggestion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
