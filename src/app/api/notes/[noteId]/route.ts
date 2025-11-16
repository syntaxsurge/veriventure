import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { deleteNote, updateNote } from "@/lib/server/note-store";

const updateSchema = z.object({
  title: z.string().min(3).max(240).optional(),
  body: z.string().min(3).max(5000).optional(),
  tags: z.array(z.string().min(1).max(40)).max(12).optional(),
  pinned: z.boolean().optional(),
});

type RouteContext = {
  params: Promise<{
    noteId: string;
  }>;
};

export const runtime = "nodejs";

export async function PATCH(request: NextRequest, context: RouteContext) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await context.params;
  if (!noteId) {
    return NextResponse.json({ error: "Note ID missing" }, { status: 400 });
  }

  const payload = await request.json();
  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const record = await updateNote(address, noteId, parsed.data);
    return NextResponse.json({ note: record });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update the note.";
    const status = message === "Note not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const address = await getAuthenticatedAddress();
  if (!address) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { noteId } = await context.params;
  if (!noteId) {
    return NextResponse.json({ error: "Note ID missing" }, { status: 400 });
  }

  try {
    await deleteNote(address, noteId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete the note.";
    const status = message === "Note not found" ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
