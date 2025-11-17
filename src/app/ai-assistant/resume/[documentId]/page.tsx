import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileUser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ResumeViewer } from "@/components/ai/resume-viewer";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";

type RouteParams = {
  params: Promise<{
    documentId: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ResumeDetailPage({ params }: RouteParams) {
  const { documentId } = await params;
  const address = await requireAuthenticatedAddress();
  const documents = await listDocuments(address);
  const document = documents.find(
    (entry) => entry.id === documentId && entry.type === "resume",
  );

  if (!document || !document.data.resume) {
    notFound();
  }

  return (
    <div className="container-app section-spacing animate-in py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="space-y-3">
          <Badge variant="secondary" className="gap-1.5">
            <FileUser className="h-3 w-3" aria-hidden="true" />
            Resume Viewer
          </Badge>
          <h1 className="text-3xl font-bold">{document.title}</h1>
          <p className="text-muted-foreground max-w-2xl">
            Review and export your AI-generated resume
          </p>
        </div>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/ai-assistant/resume">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to Resumes</span>
          </Link>
        </Button>
      </div>

      {/* Viewer */}
      <ResumeViewer document={document} />
    </div>
  );
}
