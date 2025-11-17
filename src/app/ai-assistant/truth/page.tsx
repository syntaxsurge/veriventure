import { Badge } from "@/components/ui/badge";
import { TruthAlignmentLab } from "@/components/truth/truth-alignment-lab";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Ban, TrendingUp, FileCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const whyItMatters = [
  {
    icon: ShieldAlert,
    title: "Brand safety",
    description: "Reduce ad rejections and PR risk with a published, signed note.",
  },
  {
    icon: FileCheck,
    title: "Procurement",
    description: "Help buyers check your certifications and ESG claims quickly.",
  },
  {
    icon: TrendingUp,
    title: "Investor diligence",
    description: 'Back "traction" statements with links they can click.',
  },
  {
    icon: Ban,
    title: "Compliance",
    description: "Turn sensitive claims into verifiable truths that stand up to scrutiny.",
  },
];

export default function TruthAlignmentPage() {
  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in space-y-8">
        <PageHeader
          title="Claim Checker (Truth Alignment)"
          description="Turn sensitive claims into verifiable truths buyers, investors, and platforms trust. Compare sources, attach evidence, and publish a signed DKG Knowledge Asset in minutes."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Assistant", href: "/ai-assistant" },
            { label: "Claim Checker" },
          ]}
        >
          <Badge variant="secondary">Trust Layer</Badge>
        </PageHeader>

        {/* Why This Matters Section */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Why claim checking matters:</strong> Unverified claims can block deals, trigger
            ad bans, or raise investor doubt. Use this tool to compare your statements against
            trusted sources and publish a verifiable note to the DKG—so partners can click to
            confirm instead of guessing.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {whyItMatters.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="border-2">
                <CardHeader className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <TruthAlignmentLab />
      </div>
    </AppShell>
  );
}
