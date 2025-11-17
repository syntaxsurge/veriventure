import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessPlanWriter } from "@/components/ai/business-plan-writer";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export default function BusinessPlanPage() {
  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Business Plan Lab"
          description="Answer a few focused prompts and generate a lender-ready narrative that cites your wallet-signed achievements and embeds the right KPIs. Each run is saved to the Documents vault with a checksum so diligence teams can verify provenance."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Assistant", href: "/ai-assistant" },
            { label: "Business Plan Lab" },
          ]}
        >
          <Badge variant="secondary">Documents</Badge>
        </PageHeader>

        <Card className="border-2 shadow-md">
          <CardContent className="p-6 md:p-8">
            <BusinessPlanWriter />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
