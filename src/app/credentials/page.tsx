import { FileCheck, Wallet, Share2 } from "lucide-react";
import { CredentialsManager } from "@/components/credentials/credentials-manager";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listAchievements } from "@/lib/server/achievement-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

const credentialSteps = [
  {
    title: "Capture",
    icon: FileCheck,
    detail: "Document milestones and compute verifiable hashes",
  },
  {
    title: "Sign & Mint",
    icon: Wallet,
    detail: "Submit to Moonbase Alpha with wallet signature",
  },
  {
    title: "Publish",
    icon: Share2,
    detail: "Create Community Notes on OriginTrail DKG",
  },
];

export default async function CredentialsPage() {
  const address = await requireAuthenticatedAddress();
  const achievements = await listAchievements(address);

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Credentials"
          description="Create verifiable badges for your achievements"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Dashboard", href: "/dashboard" },
            { label: "Credentials" },
          ]}
        />

        {/* Process Steps */}
        <div className="grid gap-6 md:grid-cols-3">
          {credentialSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={step.title} className="border-2 transition-all hover:shadow-lg">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Step {index + 1}
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription className="text-base">{step.detail}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {/* Credentials Manager */}
        <CredentialsManager address={address} initialAchievements={achievements} />
      </div>
    </AppShell>
  );
}
