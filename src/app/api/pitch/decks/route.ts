import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { generateAdvancedPitchDeck } from "@/lib/server/openai";
import { getSlideTemplates } from "@/data/pitch-industries";
import { createPitchDeckRecord } from "@/lib/server/pitch-deck-store";

const teamMemberSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(120),
  role: z.string().min(2).max(120),
  expertise: z.string().min(2).max(160),
});

const createDeckSchema = z.object({
  startupName: z.string().min(2).max(120),
  missionStatement: z.string().min(10).max(400),
  focusRegion: z.string().min(3).max(200),
  customerProfile: z.string().min(10).max(400),
  tractionSummary: z.string().min(3).max(400),
  goToMarket: z.string().min(3).max(400),
  businessModel: z.string().min(3).max(200),
  fundingPlan: z.string().min(3).max(400),
  brandColor: z.string().min(2).max(32),
  imageStrategy: z.enum(["manual", "ai", "scrape"]).default("manual"),
  slides: z.array(z.string().min(1)).min(3),
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

  const templates = getSlideTemplates(parsed.data.slides);
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
