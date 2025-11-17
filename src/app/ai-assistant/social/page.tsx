import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { SocialPostStudio } from "@/components/ai/social-poster";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export default function SocialPage() {
  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Social Autopost Studio"
          description="Generate multi-channel social campaigns with AI"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Assistant", href: "/ai-assistant" },
            { label: "Social Autopost" },
          ]}
        >
          <Badge variant="secondary">AI-Powered</Badge>
        </PageHeader>

        <Card className="border-2 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Share2 className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Create Campaign</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <SocialPostStudio />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
