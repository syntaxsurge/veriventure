import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import {
  buildSlideImageAsset,
  type SlideImageContext,
} from "@/lib/server/openai";
import {
  getPitchDeck,
  updatePitchDeckSlides,
} from "@/lib/server/pitch-deck-store";

const bodySchema = z.object({
  strategy: z.enum(["ai", "scrape"]),
  prompt: z.string().trim().max(240).optional(),
});

type RouteContext = {
  params: Promise<{
    deckId: string;
    slideId: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { deckId, slideId } = await context.params;
  const payload = await request.json();
  const parsed = bodySchema.safeParse(payload);
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

  const deck = await getPitchDeck(deckId);
  if (!deck || deck.ownerAddress !== address) {
    return NextResponse.json({ error: "Deck not found." }, { status: 404 });
  }

  const slide = deck.slides.find((entry) => entry.id === slideId);
  if (!slide) {
    return NextResponse.json({ error: "Slide not found." }, { status: 404 });
  }

  const contextPayload: SlideImageContext = {
    startupName: deck.startupName,
    missionStatement: deck.missionStatement,
    focusRegion: deck.focusRegion,
    customerProfile: deck.customerProfile,
    brandColor: deck.brandKit.background || deck.brandColor,
  };

  const enrichedSlide =
    parsed.data.prompt && parsed.data.prompt.trim().length
      ? { ...slide, notes: `${slide.notes}\n${parsed.data.prompt}`.trim() }
      : slide;

  try {
    const updatedSlide = await buildSlideImageAsset({
      slide: enrichedSlide,
      strategy: parsed.data.strategy,
      context: contextPayload,
    });
    const slides = deck.slides.map((entry) =>
      entry.id === slideId ? updatedSlide : entry,
    );
    await updatePitchDeckSlides({
      deckId,
      slides,
      summary: deck.summary,
    });
    return NextResponse.json({ slide: updatedSlide });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate image.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
