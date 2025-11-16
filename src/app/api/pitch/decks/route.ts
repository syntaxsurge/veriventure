import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { generateAdvancedPitchDeck } from "@/lib/server/openai";
import {
  getSlideTemplates,
  pitchIndustries,
} from "@/data/pitch-industries";
import { createPitchDeckRecord } from "@/lib/server/pitch-deck-store";

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  expertise: z.string().min(2).max(160),
});

const createDeckSchema = z.object({
  startupName: z.string().min(2).max(120),
  industry: z.string().min(2),
  features: z.string().min(10).max(600),
  problems: z.string().min(10).max(600),
  solutions: z.string().min(10).max(600),
  competitions: z.string().min(3).max(400),
  scope: z.string().min(3).max(400),
  moreInfo: z.string().max(800).optional().default(""),
  brandColor: z.string().min(2).max(32),
  businessModel: z.string().min(3).max(200),
  imageStrategy: z.enum(["manual", "ai"]).default("manual"),
  slides: z.array(z.string().min(1)).min(4),
  team: z.array(teamMemberSchema).min(1),
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const parsed = createDeckSchema.safeParse(payload);
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

  const industryExists = pitchIndustries.some(
    (industry) => industry.slug === parsed.data.industry,
  );
  if (!industryExists) {
    return NextResponse.json(
      { error: "Unsupported industry." },
      { status: 400 },
    );
  }

  const templates = getSlideTemplates(
    parsed.data.industry,
    parsed.data.slides,
  );
  if (!templates.length) {
    return NextResponse.json(
      { error: "Select at least one slide template." },
      { status: 400 },
    );
  }

  const teamWithIds = parsed.data.team.map((member) => ({
    ...member,
    id: member.id || randomUUID(),
  }));

  try {
    const aiDeck = await generateAdvancedPitchDeck({
      ...parsed.data,
      slides: templates,
      team: teamWithIds,
    });

    const deck = await createPitchDeckRecord(address, {
      ...parsed.data,
      slideTemplateIds: parsed.data.slides,
      summary: aiDeck.summary,
      brandKit: aiDeck.brandKit,
      slides: aiDeck.slides,
      team: teamWithIds,
    });

    return NextResponse.json({ deck });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create deck.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
