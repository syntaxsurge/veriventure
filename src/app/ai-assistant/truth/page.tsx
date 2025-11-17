import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TruthAlignmentLab } from "@/components/truth/truth-alignment-lab";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export default function TruthAlignmentPage() {
  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Truth Alignment Lab"
          description="Compare Grokipedia vs Wikipedia, quantify divergences with embeddings, and publish Community Notes as JSON-LD assets on the OriginTrail DKG—all without leaving one screen."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Assistant", href: "/ai-assistant" },
            { label: "Truth Alignment Lab" },
          ]}
        >
          <Badge variant="secondary">Trust Layer</Badge>
        </PageHeader>

        <Card className="border-2 shadow-md">
          <CardContent className="p-6 md:p-8">
            <TruthAlignmentLab />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
