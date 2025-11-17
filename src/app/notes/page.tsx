import { NoteWorkspace } from "@/components/notes/note-workspace";
import { Badge } from "@/components/ui/badge";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listNotes } from "@/lib/server/note-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export default async function NotesPage() {
  const address = await requireAuthenticatedAddress();
  const notes = await listNotes(address);

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Notes"
          description="Keep diligence calls, investor commitments, climate research, and any other field notes tied directly to your wallet session. Notes stay off-chain but inherit the same trust posture as your badges."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Notes" },
          ]}
        >
          <Badge variant="secondary">Research Vault</Badge>
        </PageHeader>

        <NoteWorkspace initialNotes={notes} />
      </div>
    </AppShell>
  );
}
