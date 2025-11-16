import { NoteWorkspace } from "@/components/notes/note-workspace";
import { Badge } from "@/components/ui/badge";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listNotes } from "@/lib/server/note-store";

export default async function NotesPage() {
  const address = await requireAuthenticatedAddress();
  const notes = await listNotes(address);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Badge variant="outline">Research vault</Badge>
        <h1 className="text-3xl font-semibold">Notes</h1>
        <p className="text-muted-foreground">
          Keep diligence calls, investor commitments, climate research, and any
          other field notes tied directly to your wallet session. Notes stay
          off-chain but inherit the same trust posture as your badges.
        </p>
      </section>

      <NoteWorkspace initialNotes={notes} />
    </div>
  );
}
