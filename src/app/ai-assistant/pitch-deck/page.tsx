export const dynamic = "force-dynamic";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PitchDeckStudio } from "@/components/pitch/pitch-deck-studio";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listPitchDecks } from "@/lib/server/pitch-deck-store";

export default async function PitchDeckPage() {
  const address = await getAuthenticatedAddress();
  const decks = await listPitchDecks(address);

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Badge variant="outline">Slides + MCP</Badge>
        <h1 className="text-3xl font-semibold">Pitch Deck Studio</h1>
        <p className="text-muted-foreground">
          Assemble a structured brief, pick the slides that matter for your sector, and let the AI copilot craft a
          branded, verifiable deck. Every run is saved to Convex, linked to your wallet, and can be edited slide-by-slide
          from the workspace view.
        </p>
      </section>

      {address && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your decks</h2>
            {decks.length > 0 && (
              <p className="text-xs text-muted-foreground">
                View or edit decks anytime via the links below.
              </p>
            )}
          </div>
          {decks.length === 0 ? (
            <div className="rounded-2xl border border-dashed bg-muted/20 p-6 text-sm text-muted-foreground">
              No decks yet. Start a draft below and you&apos;ll see it here once the AI run completes.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {decks.map((deck) => (
                <Card key={deck.deckId}>
                  <CardContent className="flex flex-col gap-3 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(deck.createdAt).toLocaleString()}
                        </p>
                        <h3 className="text-lg font-semibold">{deck.startupName}</h3>
                      </div>
                      <Badge variant="secondary">{deck.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {deck.summary}
                    </p>
                    <Link
                      href={`/ai-assistant/pitch-deck/${deck.deckId}`}
                      className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Open deck
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      )}

      <PitchDeckStudio disabled={!address} />
    </div>
  );
}
