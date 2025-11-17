import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BusinessPlanViewer } from "@/components/ai/business-plan-viewer";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { getDocument } from "@/lib/server/document-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

type RouteParams = {
  params: Promise<{
    planId: string;
  }>;
};

export default async function BusinessPlanDetailPage({ params }: RouteParams) {
  const { planId } = await params;
  const address = await requireAuthenticatedAddress();
  const document = await getDocument(planId);

  if (!document || document.ownerAddress !== address || document.type !== "business_plan") {
    notFound();
  }

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Business Plan
              </Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">{document.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Created {new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild className="gap-2">
              <Link href="/documents">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back to Documents</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link href="/ai-assistant/business-plan">
                <span>Create New</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Business Plan Viewer */}
        <BusinessPlanViewer document={document} />
      </div>
    </AppShell>
  );
}
