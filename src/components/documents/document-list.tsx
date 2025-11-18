"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Download, Copy, Check, ExternalLink, Presentation, FileSpreadsheet, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentRecord } from "@/types/document";
import type { PitchDeckRecord } from "@/types/pitch";

type DocumentListProps = {
  documents: DocumentRecord[];
  pitchDecks?: PitchDeckRecord[];
};

type CombinedItem =
  | { type: "document"; data: DocumentRecord }
  | { type: "pitch_deck"; data: PitchDeckRecord };

function formatType(type: DocumentRecord["type"] | "pitch_deck") {
  switch (type) {
    case "pitch_deck":
      return "Pitch Deck";
    case "business_plan":
      return "Business Plan";
    case "resume":
      return "Resume";
    case "social_post":
      return "Social Post";
    default:
      return type;
  }
}

function getIcon(type: DocumentRecord["type"] | "pitch_deck") {
  switch (type) {
    case "pitch_deck":
      return Presentation;
    case "business_plan":
      return Briefcase;
    case "resume":
      return FileText;
    case "social_post":
      return FileSpreadsheet;
    default:
      return FileText;
  }
}

function getViewLink(item: CombinedItem): string | null {
  if (item.type === "pitch_deck") {
    return `/ai-assistant/pitch-deck/${item.data.deckId}`;
  }

  switch (item.data.type) {
    case "resume":
      return `/ai-assistant/resume/${item.data.id}`;
    case "business_plan":
      return `/ai-assistant/business-plan/${item.data.id}`;
    default:
      return null;
  }
}

export function DocumentList({ documents, pitchDecks = [] }: DocumentListProps) {
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);

  // Combine documents and pitch decks
  const allItems: CombinedItem[] = [
    ...pitchDecks.map((deck): CombinedItem => ({ type: "pitch_deck", data: deck })),
    ...documents.map((doc): CombinedItem => ({ type: "document", data: doc })),
  ];

  // Sort by creation date (newest first)
  allItems.sort((a, b) => {
    const dateA = a.type === "pitch_deck" ? a.data.createdAt : a.data.createdAt;
    const dateB = b.type === "pitch_deck" ? b.data.createdAt : b.data.createdAt;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  function download(record: DocumentRecord) {
    const blob = new Blob([JSON.stringify(record.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const slug = record.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.download = `${slug || "veriventure-document"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function downloadPitchDeck(deck: PitchDeckRecord) {
    const blob = new Blob([JSON.stringify(deck, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const slug = deck.startupName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.download = `${slug || "pitch-deck"}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function copyChecksum(checksum: string, id: string) {
    await navigator.clipboard.writeText(checksum);
    setCopiedChecksum(id);
    setTimeout(() => setCopiedChecksum(null), 2000);
  }

  if (allItems.length === 0) {
    return (
      <Card className="border-2 border-dashed bg-muted/30">
        <CardContent className="py-12 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No documents yet. Use AI Assistant to create your first document.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {allItems.map((item) => {
        const isPitchDeck = item.type === "pitch_deck";
        const itemType = isPitchDeck ? "pitch_deck" : item.data.type;
        const title = isPitchDeck ? item.data.startupName : item.data.title;
        const summary = isPitchDeck ? item.data.summary : item.data.summary;
        const createdAt = item.data.createdAt;
        const id = isPitchDeck ? item.data.deckId : item.data.id;
        const checksum = isPitchDeck ? null : (item.data as DocumentRecord).checksum;
        const Icon = getIcon(itemType);
        const viewLink = getViewLink(item);

        return (
          <Card key={id} className="group relative overflow-hidden border-2 transition-all hover:shadow-xl hover:border-primary/50">
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="relative p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary/20 to-primary/5 shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-base">{title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  {formatType(itemType)}
                </Badge>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                {summary}
              </p>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {viewLink && (
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1 gap-1.5 font-medium shadow-sm"
                    asChild
                  >
                    <Link href={viewLink}>
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open
                    </Link>
                  </Button>
                )}

                {checksum && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyChecksum(checksum, id)}
                    className="flex-1 gap-1.5"
                  >
                    {copiedChecksum === id ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Hash
                      </>
                    )}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => isPitchDeck ? downloadPitchDeck(item.data as PitchDeckRecord) : download(item.data as DocumentRecord)}
                  className="flex-1 gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
