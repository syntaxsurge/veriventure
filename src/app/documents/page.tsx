import { FileText, Shield, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DocumentList } from "@/components/documents/document-list";
import { Badge } from "@/components/ui/badge";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

const capabilities = [
  {
    title: "Pitch Decks",
    icon: FileText,
    detail: "AI-generated slides with verified metrics",
  },
  {
    title: "Business Plans",
    icon: Shield,
    detail: "Structured plans with verifiable checksums",
  },
  {
    title: "Evidence Packets",
    icon: Package,
    detail: "Bundle notes and KPIs for proof of claims",
  },
];

export default async function DocumentsPage() {
  const address = await requireAuthenticatedAddress();
  const documents = await listDocuments(address);

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
        <div className="grid gap-6 md:grid-cols-3">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-2 transition-all hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">{item.detail}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Document List */}
        {documents.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Your Documents</h2>
            <DocumentList documents={documents} />
          </section>
        )}

        {documents.length === 0 && (
          <Card className="border-2 border-dashed bg-muted/30">
            <CardHeader className="text-center py-12">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                <FileText className="h-7 w-7 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>No documents yet</CardTitle>
              <CardDescription>
                Use the AI Assistant tools to generate your first document
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
