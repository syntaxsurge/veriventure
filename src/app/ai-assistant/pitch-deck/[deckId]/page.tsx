import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
    <div className="space-y-8">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="outline">Deck workspace</Badge>
          <h1 className="text-3xl font-semibold">{deck.startupName}</h1>
          <p className="text-sm text-muted-foreground">
            Last updated {new Date(deck.updatedAt).toLocaleString()}
          </p>
        </div>
        <Link
          href="/ai-assistant/pitch-deck"
          className="text-sm text-primary underline-offset-4 hover:underline"
        >
          Back to studio
        </Link>
      </section>
      <PitchDeckViewer deck={deck} />
    </div>
  );
}
