import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DkgActivityFeed } from "@/components/dkg/dkg-activity-feed";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listCommunityNotes } from "@/lib/server/community-note-store";
import { listDkgAssets } from "@/lib/server/dkg-asset-store";

export const dynamic = "force-dynamic";

export default async function DkgActivityPage() {
  const address = await requireAuthenticatedAddress();
  const [notes, assets] = await Promise.all([
    listCommunityNotes(address),
    listDkgAssets(address),
  ]);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">DKG</Badge>
        <h1 className="text-3xl font-semibold">Knowledge Asset Activity</h1>
        <p className="text-muted-foreground">
          Every Community Note and AI copilot publish tied to your wallet lives
          here with a Universal Asset Locator (UAL), DKG Explorer link, and
          NeuroWeb Subscan transaction hash. Share these entries directly, or
          direct diligence teams to your `/verify` profile for a consolidated
          view.
        </p>
      </section>
      <Card>
        <CardContent className="pt-6">
          <DkgActivityFeed notes={notes} assets={assets} />
        </CardContent>
      </Card>
    </div>
  );
}
