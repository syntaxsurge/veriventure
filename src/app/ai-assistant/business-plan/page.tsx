import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessPlanWriter } from "@/components/ai/business-plan-writer";

export default function BusinessPlanPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Documents</Badge>
        <h1 className="text-3xl font-semibold">Business Plan Lab</h1>
        <p className="text-muted-foreground">
          Answer a few focused prompts and generate a lender-ready narrative that cites your wallet-signed achievements
          and embeds the right KPIs. Each run is saved to the Documents vault with a checksum so diligence teams can
          verify provenance.
        </p>
      </section>
      <Card>
        <CardContent className="pt-6">
          <BusinessPlanWriter />
        </CardContent>
      </Card>
    </div>
  );
}
