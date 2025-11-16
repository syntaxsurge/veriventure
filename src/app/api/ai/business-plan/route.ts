import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createDocumentRecord } from "@/lib/server/document-store";
import { generateBusinessPlanSections } from "@/lib/server/openai";

const requestSchema = z.object({
  idea: z.string().min(10).max(1000),
  market: z.string().min(4).max(240),
  goToMarket: z.string().min(10).max(800),
  differentiation: z.string().min(10).max(800),
  impact: z.string().max(800).optional(),
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
    const plan = await generateBusinessPlanSections(parsed.data);
    const body = plan.sections
      .map((section) => `## ${section.heading}\n${section.content}`)
      .join("\n\n");

    const document = await createDocumentRecord({
      ownerAddress: address,
      type: "business_plan",
      title: `${parsed.data.market} expansion plan`,
      summary: plan.summary,
      data: {
        body,
        sections: plan.sections,
        metadata: {
          market: parsed.data.market,
          goToMarket: parsed.data.goToMarket.slice(0, 120),
        },
      },
    });

    return NextResponse.json({
      sections: plan.sections,
      body,
      document,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate the business plan.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
