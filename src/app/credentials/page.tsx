import { CredentialsManager } from "@/components/credentials/credentials-manager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listAchievements } from "@/lib/server/achievement-store";

const credentialSteps = [
  {
    title: "Capture context",
    detail:
      "Summarize the milestone, add KPIs or URLs, and compute a content hash that becomes the badge fingerprint.",
  },
  {
    title: "Sign & mint",
    detail:
      "Submit the hash to the ink! AchievementBadge contract. Your wallet signature proves authorship forever.",
  },
  {
    title: "Publish provenance",
    detail:
      "Generate a JSON-LD Community Note that links evidence, badge hash, and verifiable claims on the OriginTrail DKG.",
  },
];

export default async function CredentialsPage() {
  const address = await getAuthenticatedAddress();
  const achievements = address ? await listAchievements(address) : [];

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">Credentials</h1>
        <p className="text-muted-foreground">
          Every badge is non-transferable, wallet-native, and discoverable via
          your public verification link. They are the foundation for pitch
          decks, MCP prompts, and external diligence.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {credentialSteps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {step.detail}
            </CardContent>
          </Card>
        ))}
      </section>

      <CredentialsManager
        address={address}
        initialAchievements={achievements}
      />
    </div>
  );
}
