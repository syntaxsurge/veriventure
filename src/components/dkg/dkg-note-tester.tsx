"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

  async function handlePublish(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setUal(null);
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
      const payload = (await response.json()) as { note?: { UAL?: string } };
      if (!response.ok) {
        const message =
          typeof payload === "object" && "error" in payload
            ? (payload as { error: string }).error
            : "Unable to publish Community Note.";
        throw new Error(message);
      }
      setUal(payload.note?.UAL ?? "UAL unavailable in response.");
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
        <p className="text-xs text-muted-foreground break-all">UAL: {ual}</p>
      )}
    </form>
  );
}
