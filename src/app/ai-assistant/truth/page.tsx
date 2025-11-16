import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TruthAlignmentLab } from "@/components/truth/truth-alignment-lab";

export default function TruthAlignmentPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Trust layer</Badge>
        <h1 className="text-3xl font-semibold">Truth Alignment Lab</h1>
        <p className="text-muted-foreground">
          Compare Grokipedia vs Wikipedia, quantify divergences with embeddings, and publish Community Notes as
          JSON-LD assets on the OriginTrail DKG—all without leaving one screen.
        </p>
      </section>
      <Card>
        <CardContent className="pt-6">
          <TruthAlignmentLab />
        </CardContent>
      </Card>
    </div>
  );
}
