import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { getPitchDeck, updatePitchDeckSlides } from "@/lib/server/pitch-deck-store";

const bodySchema = z.object({
  url: z.string().url(),
  caption: z.string().max(200).optional(),
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

  const slideIndex = deck.slides.findIndex((entry) => entry.id === slideId);
  if (slideIndex === -1) {
    return NextResponse.json(
      { error: "Slide not found." },
      { status: 404 },
    );
  }

  const slide = deck.slides[slideIndex];
  const updatedSlide = {
    ...slide,
    images: [
      {
        url: parsed.data.url,
        caption: parsed.data.caption || slide.images[0]?.caption || slide.title,
      },
    ],
  };
  const slides = deck.slides.map((entry) =>
    entry.id === slideId ? updatedSlide : entry,
  );
  await updatePitchDeckSlides({
    deckId,
    slides,
    summary: deck.summary,
  });
  return NextResponse.json({ slide: updatedSlide });
}
