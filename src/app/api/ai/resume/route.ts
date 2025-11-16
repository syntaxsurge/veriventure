import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createDocumentRecord } from "@/lib/server/document-store";
import { generateResumeBlueprint } from "@/lib/server/openai";

const requestSchema = z.object({
  fullName: z.string().min(4).max(120),
  headline: z.string().min(4).max(160),
  achievements: z.string().min(10).max(800),
  experience: z.string().min(10).max(1200),
  focus: z.string().max(400).optional(),
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
    const resume = await generateResumeBlueprint(parsed.data);
    const document = await createDocumentRecord({
      ownerAddress: address,
      type: "resume",
      title: `${parsed.data.fullName} resume draft`,
      summary: resume.summary,
      data: {
        resume,
        metadata: {
          headline: resume.headline,
          focus: parsed.data.focus ?? "",
        },
      },
    });

    return NextResponse.json({ resume, document });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
