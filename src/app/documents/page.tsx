import { FileText, Shield, Package, Presentation } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DocumentList } from "@/components/documents/document-list";
import { Badge } from "@/components/ui/badge";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";
import { listPitchDecks } from "@/lib/server/pitch-deck-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

const capabilities = [
  {
    title: "Pitch Decks",
    icon: Presentation,
    detail: "AI-generated slides with verified metrics",
  },
  {
    title: "Business Plans",
    icon: Shield,
    detail: "Structured plans with verifiable checksums",
  },
  {
    title: "Resumes",
    icon: FileText,
    detail: "Professional resumes with verifiable achievements",
  },
  {
    title: "Evidence Packets",
    icon: Package,
    detail: "Bundle notes and KPIs for proof of claims",
  },
];

export default async function DocumentsPage() {
  const address = await requireAuthenticatedAddress();
  const [documents, pitchDecks] = await Promise.all([
    listDocuments(address),
    listPitchDecks(address),
  ]);

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Documents"
          description="AI-generated assets with verifiable checksums"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Documents" },
          ]}
        >
          <Badge variant="secondary">Knowledge Layer</Badge>
        </PageHeader>

        {/* Capabilities */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="group border-2 transition-all hover:shadow-xl hover:border-primary/50">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                    <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">{item.detail}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Document List */}
        {(documents.length > 0 || pitchDecks.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Documents</h2>
              <Badge variant="outline" className="text-sm">
                {documents.length + pitchDecks.length} total
              </Badge>
            </div>
            <DocumentList documents={documents} pitchDecks={pitchDecks} />
          </section>
        )}

        {documents.length === 0 && pitchDecks.length === 0 && (
          <Card className="border-2 border-dashed bg-muted/30">
            <CardHeader className="text-center py-16">
              <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5">
                <FileText className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-xl">No documents yet</CardTitle>
              <CardDescription className="text-base mt-2">
                Use the AI Assistant tools to generate your first document
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
