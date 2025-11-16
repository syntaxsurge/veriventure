import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { getPitchDeck, updatePitchDeckSlides } from "@/lib/server/pitch-deck-store";
import { revisePitchDeckSlide } from "@/lib/server/openai";

const bodySchema = z.object({
  instruction: z.string().min(6).max(600),
});

type RouteContext = {
  params: Promise<{
    deckId: string;
    slideId: string;
  }>;
};

export const runtime = "nodejs";

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
    return NextResponse.json(
      { error: "Slide not found." },
      { status: 404 },
    );
  }

  try {
    const updatedSlide = await revisePitchDeckSlide({
      instruction: parsed.data.instruction,
      slide,
      brief: {
        startupName: deck.startupName,
        industry: deck.industry,
        problems: deck.problems,
        solutions: deck.solutions,
        competitions: deck.competitions,
        businessModel: deck.businessModel,
      },
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
      error instanceof Error ? error.message : "Unable to correct slide.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
