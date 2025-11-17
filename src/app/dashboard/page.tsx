import { Target, Rocket, Award, Clock, Hash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AchievementList } from "@/components/credentials/achievement-list";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listAchievements } from "@/lib/server/achievement-store";
import { DashboardMission } from "@/features/mission-control/dashboard-mission";
import { InvoiceDashboardWidget } from "@/components/invoices/invoice-dashboard-widget";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export default async function DashboardPage() {
  const address = await requireAuthenticatedAddress();
  const achievements = await listAchievements(address);
  const latest = achievements[0];

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        {/* Page Header */}
        <PageHeader
          title="Dashboard"
          description="Your mission control for verified credentials"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Dashboard" }]}
        />

        {/* Mission Control */}
        <DashboardMission address={address} />

        {/* Invoicing Widget */}
        <InvoiceDashboardWidget />

        {/* Stats Overview */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Badges
              </CardTitle>
              <Award className="h-5 w-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{achievements.length}</div>
              <p className="text-xs text-muted-foreground">
                Verifiable credentials
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Status
              </CardTitle>
              <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {latest ? "Active" : "Pending"}
              </div>
              <p className="text-xs text-muted-foreground">
                {latest ? "Recent activity" : "Awaiting first badge"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 transition-all hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile
              </CardTitle>
              <Rocket className="h-5 w-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {achievements.length > 0 ? "Live" : "Setup"}
              </div>
              <p className="text-xs text-muted-foreground">
                {achievements.length > 0 ? "Profile ready" : "Complete setup"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Latest Badge */}
        {latest && (
          <Card className="overflow-hidden border-2 shadow-md">
            <div className="h-2 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />
            <CardHeader className="flex flex-row items-start justify-between">
              <div className="space-y-2">
                <Badge variant="secondary" className="gap-1.5">
                  <Rocket className="h-3 w-3" aria-hidden="true" />
                  Latest
                </Badge>
                <CardTitle className="text-2xl">{latest.title}</CardTitle>
              </div>
              <div className="rounded-lg bg-primary/10 p-3">
                <Award className="h-8 w-8 text-primary" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                {latest.summary}
              </p>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/30 p-3">
                <Hash className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <code className="text-sm font-mono text-primary">
                  {latest.hash.slice(0, 32)}...
                </code>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next Step - Only show if no achievements */}
        {!latest && (
          <Card className="border-2 border-dashed bg-muted/30">
            <CardHeader>
              <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Target className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Head to Credentials to mint your first badge
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Activity Timeline */}
        {achievements.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Activity Timeline</h2>
            <AchievementList achievements={achievements} />
          </section>
        )}
      </div>
    </AppShell>
  );
}
