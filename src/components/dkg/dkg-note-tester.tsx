"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PublishResponse = {
  ok: boolean;
  ual?: string;
  txHash?: string | null;
  explorer?: string | null;
  subscan?: string | null;
  error?: string;
};

export function DkgNoteTester() {
  const [topic, setTopic] = useState("Climate resilience playbook");
  const [summary, setSummary] = useState(
    "Comparing Grokipedia and Wikipedia entries for climate resilience to flag divergences.",
  );
  const [reference, setReference] = useState(
    "https://wikipedia.org/wiki/Climate_change",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ual, setUal] = useState<string | null>(null);
  const [links, setLinks] = useState<{
    explorer: string | null;
    subscan: string | null;
  } | null>(null);

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setUal(null);
     setLinks(null);
    try {
      const response = await fetch("/api/dkg/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          summary,
          references: reference ? [reference] : [],
        }),
      });
      const payload = (await response.json()) as PublishResponse;
      if (!response.ok || !payload.ok || !payload.ual) {
        throw new Error(
          payload.error ?? "Unable to publish Community Note.",
        );
      }
      setUal(payload.ual);
      setLinks({
        explorer: payload.explorer ?? null,
        subscan: payload.subscan ?? null,
      });
    } catch (err) {
      const fallback = err instanceof Error ? err.message : "Unexpected error.";
      setError(fallback);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handlePublish}
      className="space-y-4 rounded-2xl border bg-muted/40 p-4"
    >
      <div className="space-y-1">
        <Label htmlFor="note-topic">Sample topic</Label>
        <Input
          id="note-topic"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="note-summary">Summary</Label>
        <Textarea
          id="note-summary"
          rows={3}
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="note-reference">Reference (optional)</Label>
        <Input
          id="note-reference"
          type="url"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Publishing…" : "Publish sample note"}
      </Button>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {ual && (
        <div className="space-y-2 rounded-xl border bg-background/60 p-3 text-xs text-foreground">
          <p className="font-semibold">UAL</p>
          <code className="block break-all font-mono text-[11px] text-muted-foreground">
            {ual}
          </code>
          <div className="flex flex-wrap gap-3">
            {links?.explorer && (
              <a
                href={links.explorer}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                View on DKG Explorer
              </a>
            )}
            {links?.subscan && (
              <a
                href={links.subscan}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                View tx on Subscan
              </a>
            )}
          </div>
        </div>
      )}
    </form>
  );
}
