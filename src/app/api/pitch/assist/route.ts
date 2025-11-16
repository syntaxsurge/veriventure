import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { generatePitchFieldSuggestion } from "@/lib/server/openai";
import type { PitchWizardDraft } from "@/types/pitch";

const ASSIST_FIELDS = [
  "missionStatement",
  "focusRegion",
  "customerProfile",
  "tractionSummary",
  "goToMarket",
  "businessModel",
  "fundingPlan",
] as const;

type AssistField = (typeof ASSIST_FIELDS)[number];

const draftSchema = z.object({
  startupName: z.string().optional(),
  missionStatement: z.string().optional(),
  focusRegion: z.string().optional(),
  customerProfile: z.string().optional(),
  tractionSummary: z.string().optional(),
  goToMarket: z.string().optional(),
  businessModel: z.string().optional(),
  fundingPlan: z.string().optional(),
});

const bodySchema = z.object({
  field: z.enum(ASSIST_FIELDS),
  draft: draftSchema.partial(),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { field, draft } = parsed.data as {
    field: AssistField;
    draft: Partial<PitchWizardDraft>;
  };

  try {
    const suggestion = await generatePitchFieldSuggestion(field, draft);
    return new NextResponse(suggestion, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate suggestion.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
