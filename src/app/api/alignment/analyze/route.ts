import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { analyzeTopic } from "@/lib/server/topic-comparison";

const requestSchema = z.object({
  topic: z.string().min(3).max(160),
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

  try {
    const report = await analyzeTopic(parsed.data.topic);
    return NextResponse.json({ report });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to analyze topic.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
