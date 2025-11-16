import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createDocumentRecord } from "@/lib/server/document-store";
import { generateSocialPosts } from "@/lib/server/openai";

const requestSchema = z.object({
  campaign: z.string().min(4).max(160),
  product: z.string().min(4).max(160),
  tone: z.string().min(3).max(100),
  callToAction: z.string().min(3).max(200),
  channels: z.array(z.string().min(3).max(40)).min(1).max(5),
  metrics: z.string().max(600).optional(),
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
    const campaign = await generateSocialPosts(parsed.data);
    const document = await createDocumentRecord({
      ownerAddress: address,
      type: "social_post",
      title: `${parsed.data.campaign} social campaign`,
      summary: campaign.summary,
      data: {
        socialPosts: campaign.posts,
        metadata: {
          product: parsed.data.product,
          tone: parsed.data.tone,
          channels: parsed.data.channels.join(", "),
        },
      },
    });

    return NextResponse.json({ campaign, document });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to generate social campaign.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
