import { notFound } from "next/navigation";
import Link from "next/link";
import { AchievementList } from "@/components/credentials/achievement-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listAchievements } from "@/lib/server/achievement-store";
import { listCommunityNotes } from "@/lib/server/community-note-store";

type VerifyPageProps = {
  params: {
    handle: string;
  };
};

export default async function VerifyHandlePage({ params }: VerifyPageProps) {
  const { handle } = params;
  if (!handle) {
    notFound();
  }

  const achievements = await listAchievements(handle);
  const ownerAddress = achievements[0]?.ownerAddress ?? handle;
  const notes = await listCommunityNotes(ownerAddress);

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-3xl border bg-muted/30 p-6">
        <Badge variant="outline">Public verification</Badge>
        <h1 className="text-3xl font-semibold break-all">{ownerAddress}</h1>
        <p className="text-muted-foreground">
          This page confirms wallet-linked achievements and the hashes tied to
          each milestone. Share this URL with partners or investors for instant
          diligence.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proof summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Achievements minted: <strong>{achievements.length}</strong>
            </p>
            <p>
              Last update:{" "}
              {achievements[0]
                ? new Date(achievements[0].createdAt).toLocaleString()
                : "No badges yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Need deeper evidence?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Verify signatures live: recompute the hash on this page and call
              the contract directly. Community Notes expose references anchored
              on the OriginTrail DKG.
            </p>
            <Link
              href="/documents"
              className="text-primary underline-offset-4 hover:underline"
            >
              View supporting documents
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Signed achievements</h2>
        <AchievementList
          achievements={achievements}
          verifiable
          ownerAddress={ownerAddress}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">
            OriginTrail Community Notes
          </h2>
          <p className="text-sm text-muted-foreground">
            Notes are structured JSON-LD knowledge assets with a DKG UAL link.
            They capture Grokipedia vs Wikipedia comparisons and other trust
            signals tied to this wallet.
          </p>
        </div>
        {notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            No public notes published yet. Run the Truth Alignment Lab or DKG
            tester to publish your first Community Note.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{note.topic}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Published {new Date(note.createdAt).toLocaleString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{note.summary}</p>
                  {note.references.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        References
                      </p>
                      <ul className="mt-1 space-y-1">
                        {note.references.map((reference) => (
                          <li key={reference}>
                            <a
                              href={reference}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline-offset-4 hover:underline break-all"
                            >
                              {reference}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {note.ual && (
                    <a
                      href={note.ual}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Open DKG asset (UAL)
                    </a>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
