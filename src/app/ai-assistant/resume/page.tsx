export const dynamic = "force-dynamic";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeBuilder } from "@/components/ai/resume-builder";
import { DocumentList } from "@/components/documents/document-list";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";

export default async function ResumePage() {
  const address = await requireAuthenticatedAddress();
  const documents = await listDocuments(address);
  const resumes = documents.filter((document) => document.type === "resume");

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Badge variant="outline">Talent ops</Badge>
        <h1 className="text-3xl font-semibold">Resume & Bio Builder</h1>
        <p className="text-muted-foreground">
          Convert badge-backed accomplishments into resumes, bios, and thought-leadership snippets tuned for venture
          partners, boards, or grant committees. Each output is stored in the Documents vault and linked to your wallet
          session.
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Your resumes</h2>
          {resumes.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Browse previous drafts below; full metadata and checksums live in Documents.
            </p>
          )}
        </div>
        {resumes.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
            No resumes yet. Generate a resume below and it will appear in this list.
          </div>
        ) : (
          <DocumentList documents={resumes} />
        )}
      </section>

      <Card>
        <CardContent className="pt-6">
          <ResumeBuilder />
        </CardContent>
      </Card>
    </div>
  );
}
