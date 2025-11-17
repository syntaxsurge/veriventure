import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { ResumeViewer } from "@/components/ai/resume-viewer";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";

type ResumeDetailPageProps = {
  params: { documentId: string };
};

export const dynamic = "force-dynamic";

export default async function ResumeDetailPage({
  params,
}: ResumeDetailPageProps) {
  const address = await requireAuthenticatedAddress();
  const documents = await listDocuments(address);
  const document = documents.find(
    (entry) => entry.id === params.documentId && entry.type === "resume",
  );

  if (!document || !document.data.resume) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <Badge variant="outline">Talent ops</Badge>
        <h1 className="text-3xl font-semibold">Resume viewer</h1>
        <p className="text-sm text-muted-foreground">
          Review a previously generated resume, copy the distilled summary, or export a
          fresh PDF without regenerating the AI output.
        </p>
      </section>
      <ResumeViewer document={document} />
    </div>
  );
}

