import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PitchDeckViewer } from "@/components/pitch/deck-viewer";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { getPitchDeck } from "@/lib/server/pitch-deck-store";

type RouteParams = {
  params: Promise<{
    deckId: string;
  }>;
};

export default async function PitchDeckDetailPage({ params }: RouteParams) {
  const { deckId } = await params;
  const address = await requireAuthenticatedAddress();
  const deck = await getPitchDeck(deckId);
  if (!deck || deck.ownerAddress !== address) {
    notFound();
  }

  return (
    <div className="section-spacing animate-in py-8">
      {/* Header */}
      <section className="container-app">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <Badge variant="secondary">Deck Workspace</Badge>
            <h1>{deck.startupName}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Last updated {new Date(deck.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/ai-assistant/pitch-deck">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Studio</span>
            </Link>
          </Button>
        </div>
      </section>

      {/* Deck Viewer */}
      <PitchDeckViewer deck={deck} />
    </div>
  );
}
