export const dynamic = "force-dynamic";

import { FileUser } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeBuilder } from "@/components/ai/resume-builder";
import { DocumentList } from "@/components/documents/document-list";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ResumePage() {
  const address = await requireAuthenticatedAddress();
  const documents = await listDocuments(address);
  const resumes = documents.filter((document) => document.type === "resume");

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Resume Builder"
          description="Generate professional resumes from your verified achievements"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Tools" },
            { label: "Resume Builder" },
          ]}
        >
          <Badge variant="secondary">AI-Powered</Badge>
        </PageHeader>

        {/* Previous Resumes - Only show if there are any */}
        {resumes.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Your Resumes</h2>
            <DocumentList documents={resumes} />
          </section>
        )}

        {/* Resume Builder */}
        <Card className="border-2 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileUser className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Generate Resume</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {resumes.length === 0 && (
              <div className="mb-6">
                <EmptyState
                  icon={FileUser}
                  title="No resumes yet"
                  description="Create your first resume below"
                />
              </div>
            )}
            <ResumeBuilder />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
