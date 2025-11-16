import { Crosshair2Icon, RocketIcon } from "@radix-ui/react-icons";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AchievementList } from "@/components/credentials/achievement-list";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listAchievements } from "@/lib/server/achievement-store";

export default async function DashboardPage() {
  const address = await getAuthenticatedAddress();
  const achievements = address ? await listAchievements(address) : [];
  const latest = achievements[0];

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <Badge variant="secondary" className="mb-2">
                Live status
              </Badge>
              <CardTitle className="text-3xl font-semibold">
                {latest
                  ? `Latest badge: ${latest.title}`
                  : "Mint your first badge to unlock verification."}
              </CardTitle>
            </div>
            <RocketIcon className="h-10 w-10 text-primary" />
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            {latest ? (
              <>
                <p>{latest.summary}</p>
                <p className="text-sm font-mono text-primary">
                  Hash: {latest.hash.slice(0, 18)}…
                </p>
              </>
            ) : (
              <p>
                Wallet sessions sync directly with the AchievementBadge
                contract. Save your first milestone to generate a verifiable
                fingerprint.
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crosshair2Icon className="h-5 w-5" />
              Next objective
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {latest ? (
              <>
                <p>
                  Publish a Community Note referencing {latest.impactArea} so AI
                  copilots inherit the same evidence.
                </p>
                <p>
                  Share your verify link after the note is anchored on the DKG
                  to complete the truth loop.
                </p>
              </>
            ) : (
              <p>
                Head to the Credentials page, document a milestone, and mint the
                badge. Every other workflow depends on it.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Activity timeline</h2>
          <p className="text-sm text-muted-foreground">
            Every entry below references an on-chain hash so you can defend your
            traction narrative anytime.
          </p>
        </div>
        <AchievementList achievements={achievements} />
      </section>
    </div>
  );
}
