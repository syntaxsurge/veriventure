import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { generatePitchFieldSuggestion } from "@/lib/server/openai";
import type { PitchWizardDraft } from "@/types/pitch";

const bodySchema = z.object({
  field: z.string().min(2),
  draft: z.object({
    startupName: z.string().optional(),
    missionStatement: z.string().optional(),
    industry: z.string().optional(),
    customerProfile: z.string().optional(),
    features: z.string().optional(),
    problems: z.string().optional(),
    solutions: z.string().optional(),
    competitions: z.string().optional(),
    tractionSummary: z.string().optional(),
    scope: z.string().optional(),
    fundingPlan: z.string().optional(),
  }),
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
    field: string;
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
