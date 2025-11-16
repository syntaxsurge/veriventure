import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createDocumentRecord } from "@/lib/server/document-store";
import { generatePitchDeckSlides } from "@/lib/server/openai";

const requestSchema = z.object({
  idea: z.string().min(8).max(280),
  customer: z.string().min(3).max(200),
  problem: z.string().min(10).max(800),
  solution: z.string().min(10).max(800),
  traction: z.string().max(800).optional(),
});

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

  try {
    const deck = await generatePitchDeckSlides(parsed.data);
    const document = await createDocumentRecord({
      ownerAddress: address,
      type: "pitch_deck",
      title: `${parsed.data.idea} pitch deck`,
      summary: deck.summary,
      data: {
        slides: deck.slides,
        metadata: {
          customer: parsed.data.customer,
          traction: parsed.data.traction ?? "Not provided",
        },
      },
    });

    return NextResponse.json({
      slides: deck.slides,
      document,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate pitch deck.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
