"use client";

import Link from "next/link";
import { useState } from "react";
import { FileText, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { DocumentRecord } from "@/types/document";

type DocumentListProps = {
  documents: DocumentRecord[];
};

function formatType(type: DocumentRecord["type"]) {
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

export function DocumentList({ documents }: DocumentListProps) {
  const [copiedChecksum, setCopiedChecksum] = useState<string | null>(null);

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

  async function copyChecksum(record: DocumentRecord) {
    await navigator.clipboard.writeText(record.checksum);
    setCopiedChecksum(record.id);
    setTimeout(() => setCopiedChecksum(null), 2000);
  }

  if (!documents.length) {
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
      {documents.map((record) => (
        <Card key={record.id} className="group border-2 transition-all hover:shadow-lg">
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{record.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {new Date(record.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Badge variant="secondary" className="flex-shrink-0">
                {formatType(record.type)}
              </Badge>
            </div>

            {/* Summary - single line only */}
            <p className="text-sm text-muted-foreground line-clamp-1">
              {record.summary}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {record.type === "resume" && (
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/ai-assistant/resume/${record.id}`}>
                    <FileText className="h-3 w-3 mr-1" />
                    Open
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyChecksum(record)}
                className="flex-1"
              >
                {copiedChecksum === record.id ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Hash
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => download(record)}
                className="flex-1"
              >
                <Download className="h-3 w-3 mr-1" />
                JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
