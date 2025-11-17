import { Badge } from "@/components/ui/badge";
import { DkgActivityFeed } from "@/components/dkg/dkg-activity-feed";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listCommunityNotes } from "@/lib/server/community-note-store";
import { listDkgAssets } from "@/lib/server/dkg-asset-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";

export const dynamic = "force-dynamic";

export default async function DkgActivityPage() {
  const address = await requireAuthenticatedAddress();
  const [notes, assets] = await Promise.all([
    listCommunityNotes(address),
    listDkgAssets(address),
  ]);

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Knowledge Asset Activity"
          description="Every Community Note and AI copilot publish tied to your wallet lives here with a Universal Asset Locator (UAL), DKG Explorer link, and NeuroWeb Subscan transaction hash. Share these entries directly, or direct diligence teams to your /verify profile for a consolidated view."
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Assistant", href: "/ai-assistant" },
            { label: "DKG Activity" },
          ]}
        >
          <Badge variant="secondary">DKG</Badge>
        </PageHeader>

        <DkgActivityFeed notes={notes} assets={assets} />
      </div>
    </AppShell>
  );
}
