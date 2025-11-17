import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAchievement,
  listAchievements,
} from "@/lib/server/achievement-store";
import { getSession } from "@/lib/server/session-cookie";

const optionalEvidenceUrl = z
  .union([z.string().url().max(500), z.literal("")])
  .transform((value) => value ?? "");

const achievementPayloadSchema = z.object({
  title: z.string().min(3).max(160),
  summary: z.string().min(10).max(800),
  metrics: z.string().min(3).max(400),
  evidenceUrl: optionalEvidenceUrl,
  impactArea: z.string().min(3).max(200),
});

const requestSchema = z.object({
  payload: achievementPayloadSchema,
  txHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .nullable()
    .optional(),
  contractAddress: z.string().min(2).max(120).nullable().optional(),
  network: z.string().min(2).max(120).nullable().optional(),
});

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;
  const records = await listAchievements(address);
  const sliced =
    typeof limit === "number" && Number.isFinite(limit)
      ? records.slice(0, Math.max(0, limit))
      : records;
  return NextResponse.json({ achievements: sliced });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: formatValidationError(parsed.error) },
      { status: 400 },
    );
  }
  const { payload, txHash, network, contractAddress } = parsed.data;

  const session = await getSession();
  if (!session?.address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const record = await createAchievement(session.address, {
    payload,
    txHash,
    network,
    contractAddress,
  });
  return NextResponse.json({ achievement: record });
}

function formatValidationError(error: z.ZodError) {
  const flattened = error.flatten();
  for (const [field, messages] of Object.entries(flattened.fieldErrors)) {
    if (messages && messages.length) {
      return `${field}: ${messages[0]}`;
    }
  }
  if (flattened.formErrors && flattened.formErrors.length) {
    return flattened.formErrors[0];
  }
  return "Invalid achievement payload.";
}
