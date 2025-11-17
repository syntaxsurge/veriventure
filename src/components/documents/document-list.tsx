"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DocumentRecord } from "@/types/document";

type DocumentListProps = {
  documents: DocumentRecord[];
};

function formatType(type: DocumentRecord["type"]) {
  switch (type) {
    case "pitch_deck":
      return "Pitch deck";
    case "business_plan":
      return "Business plan";
    case "resume":
      return "Resume";
    case "social_post":
      return "Social media";
    default:
      return type;
  }
}

function renderTypeDetails(record: DocumentRecord) {
  if (record.type === "resume" && record.data.resume) {
    const resume = record.data.resume;
    return (
      <div className="space-y-2">
        <p className="text-sm font-semibold text-foreground">
          {resume.headline}
        </p>
        <p className="text-xs text-muted-foreground">{resume.summary}</p>
        {resume.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {resume.skills.slice(0, 6).map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
            {resume.skills.length > 6 && (
              <Badge variant="outline">+{resume.skills.length - 6}</Badge>
            )}
          </div>
        )}
      </div>
    );
  }

  if (record.type === "social_post" && record.data.socialPosts) {
    const posts = record.data.socialPosts;
    return (
      <div className="space-y-2 text-sm text-muted-foreground">
        {posts.slice(0, 3).map((post, index) => (
          <div
            key={`${post.channel}-${index}`}
            className="rounded-lg border bg-background/60 p-2"
          >
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {post.channel} · {post.cadence ?? "One off"}
            </p>
            <p className="font-medium text-foreground">{post.hook}</p>
            <p>{post.copy}</p>
          </div>
        ))}
        {posts.length > 3 && (
          <p className="text-xs text-muted-foreground">
            +{posts.length - 3} more posts saved
          </p>
        )}
      </div>
    );
  }

  return null;
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
      <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
        No generated documents yet. Use the AI Assistant to generate a pitch
        deck or business plan — we&apos;ll log it here automatically with a
        checksum for tamper checks.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {documents.map((record) => (
        <Card key={record.id}>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{record.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date(record.createdAt).toLocaleString()}
              </p>
            </div>
            <Badge variant="outline">{formatType(record.type)}</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{record.summary}</p>
            {renderTypeDetails(record)}
            {record.data?.metadata && (
              <dl className="grid gap-2 md:grid-cols-2">
                {Object.entries(record.data.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {key}
                    </dt>
                    <dd className="font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
              <span className="truncate">Checksum: {record.checksum}</span>
              {record.type === "resume" && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/ai-assistant/resume/${record.id}`}>
                    Open resume
                  </Link>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyChecksum(record)}
              >
                {copiedChecksum === record.id ? "Copied" : "Copy checksum"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => download(record)}
              >
                Download JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
