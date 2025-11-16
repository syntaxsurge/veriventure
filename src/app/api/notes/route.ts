import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { createNote, listNotes } from "@/lib/server/note-store";

const createSchema = z.object({
  title: z.string().min(3).max(240),
  body: z.string().min(3).max(5000),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  pinned: z.boolean().optional(),
});

export const runtime = "nodejs";

export async function GET() {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const notes = await listNotes(address);
  return NextResponse.json({ notes });
}

export async function POST(request: NextRequest) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const parsed = createSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const record = await createNote(address, parsed.data);
  return NextResponse.json({ note: record });
}
