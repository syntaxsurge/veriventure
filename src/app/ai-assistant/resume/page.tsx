import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ResumeBuilder } from "@/components/ai/resume-builder";

export default function ResumePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Talent ops</Badge>
        <h1 className="text-3xl font-semibold">Resume & Bio Builder</h1>
        <p className="text-muted-foreground">
          Convert badge-backed accomplishments into resumes, bios, and thought-leadership snippets tuned for venture
          partners, boards, or grant committees. Each output is stored in the Documents vault and linked to your wallet
          session.
        </p>
      </section>
      <Card>
        <CardContent className="pt-6">
          <ResumeBuilder />
        </CardContent>
      </Card>
    </div>
  );
}
