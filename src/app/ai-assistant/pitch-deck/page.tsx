export const dynamic = "force-dynamic";

import Link from "next/link";
import { Presentation, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PitchDeckStudio } from "@/components/pitch/pitch-deck-studio";
import { requireAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listPitchDecks } from "@/lib/server/pitch-deck-store";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";

export default async function PitchDeckPage() {
  const address = await requireAuthenticatedAddress();
  const decks = await listPitchDecks(address);

  return (
    <AppShell sidebar maxWidth="7xl">
      <div className="section-spacing animate-in">
        <PageHeader
          title="Pitch Deck Studio"
          description="Create professional pitch decks with AI assistance"
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "AI Assistant", href: "/ai-assistant" },
            { label: "Pitch Deck Studio" },
          ]}
        >
          <Badge variant="secondary">AI-Powered</Badge>
        </PageHeader>

        {/* Your Decks - Only show if there are any */}
        {decks.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Your Decks</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <Card key={deck.deckId} className="group border-2 transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Presentation className="h-5 w-5 text-primary" aria-hidden="true" />
                      </div>
                      <Badge variant="secondary">{deck.status}</Badge>
                    </div>
                    <CardTitle className="line-clamp-1">{deck.startupName}</CardTitle>
                    <CardDescription className="text-xs">
                      {new Date(deck.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {deck.summary}
                    </p>
                    <Button variant="ghost" className="w-full justify-start gap-2" asChild>
                      <Link href={`/ai-assistant/pitch-deck/${deck.deckId}`}>
                        <span>Open deck</span>
                        <ArrowRight
                          className="h-4 w-4 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Pitch Deck Studio */}
        <Card className="border-2 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Presentation className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle>Create New Deck</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {decks.length === 0 && (
              <div className="mb-6">
                <EmptyState
                  icon={Presentation}
                  title="No decks yet"
                  description="Create your first pitch deck below"
                />
              </div>
            )}
            <PitchDeckStudio />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
