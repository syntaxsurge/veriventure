"use client";

import { useMemo, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { DocumentRecord, SocialPostVariant } from "@/types/document";
import { clientEnv } from "@/env/client";

type ApiResponse = {
  campaign?: {
    summary: string;
    posts: SocialPostVariant[];
  };
  document?: DocumentRecord;
  error?: string;
};

const CHANNEL_OPTIONS = [
  "LinkedIn",
  "Twitter",
  "Email",
  "Instagram",
  "Telegram",
];

const initialForm = {
  campaign: "",
  product: "",
  tone: "Trusted operator",
  callToAction: "Book a pilot",
  channels: ["LinkedIn"] as string[],
  metrics: "",
};

export function SocialPostStudio() {
  const autopostReady = clientEnv.NEXT_PUBLIC_SOCIAL_AUTOMATION_READY;
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<ApiResponse["campaign"] | null>(
    null,
  );
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(
    null,
  );

  function toggleChannel(channel: string) {
    setForm((prev) => {
      const exists = prev.channels.includes(channel);
      const channels = exists
        ? prev.channels.filter((item) => item !== channel)
        : [...prev.channels, channel];
      return { ...prev, channels };
    });
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setCampaign(null);
    setDocumentRecord(null);
    try {
      const response = await fetch("/api/ai/social-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.campaign || !payload.document) {
        throw new Error(payload.error ?? "Unable to build the campaign.");
      }
      setCampaign(payload.campaign);
      setDocumentRecord(payload.document);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected campaign error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const csvContent = useMemo(() => {
    if (!campaign?.posts?.length) return "";
    const header = ["Channel", "Hook", "Copy", "Call to action", "Cadence"];
    const rows = campaign.posts.map((post) => [
      post.channel,
      post.hook,
      post.copy.replace(/\n/g, " "),
      post.callToAction ?? "",
      post.cadence ?? "",
    ]);
    return [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
  }, [campaign?.posts]);

  function exportCsv() {
    if (!csvContent) return;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${form.campaign || "campaign"}-posts.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  let content: React.ReactNode;
  if (!autopostReady) {
    content = (
      <div className="flex items-start gap-4 rounded-2xl border border-dashed bg-muted/40 p-4">
        <div className="rounded-full bg-primary/10 p-2 text-primary">
          <CalendarClock className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Coming soon</p>
          <p>
            Social Autopost Studio is slated for a future drop. Keep drafting decks, business plans, and resumes—the
            distribution agent will light up here once we ship scheduling + CSV export hooks.
          </p>
          <p>Until then, use Documents + Notes to capture copy or coordinate with your marketing stack manually.</p>
        </div>
      </div>
    );
  } else {
    content = (
      <>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
          <div className="space-y-1">
            <Label htmlFor="campaign-name">Campaign name</Label>
            <Input
              id="campaign-name"
              value={form.campaign}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, campaign: event.target.value }))
              }
              placeholder="OriginTrail pilot launch"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="campaign-product">Product / offer</Label>
            <Input
              id="campaign-product"
              value={form.product}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, product: event.target.value }))
              }
              placeholder="VeriVenture founder workspace"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="campaign-tone">Tone</Label>
            <Input
              id="campaign-tone"
              value={form.tone}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, tone: event.target.value }))
              }
              placeholder="Optimistic, data-backed"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="campaign-cta">Call to action</Label>
            <Input
              id="campaign-cta"
              value={form.callToAction}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  callToAction: event.target.value,
                }))
              }
              placeholder="Book a call"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Channels</Label>
            <div className="flex flex-wrap gap-4">
              {CHANNEL_OPTIONS.map((channel) => (
                <label
                  key={channel}
                  className="flex items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={form.channels.includes(channel)}
                    onCheckedChange={() => toggleChannel(channel)}
                  />
                  {channel}
                </label>
              ))}
            </div>
            {form.channels.length === 0 && (
              <p className="text-xs text-destructive">
                Select at least one channel.
              </p>
            )}
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="campaign-metrics">Key metrics / proof</Label>
            <Textarea
              id="campaign-metrics"
              rows={3}
              value={form.metrics}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, metrics: event.target.value }))
              }
              placeholder="Backed by badges #123, DKG note UAL::, carbon savings, etc."
            />
          </div>
          <Button
            type="submit"
            className="md:col-span-2"
            disabled={loading || form.channels.length === 0}
          >
            {loading ? "Drafting…" : "Generate posts"}
          </Button>
        </form>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {campaign && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {campaign.summary}
                {documentRecord && (
                  <>
                    {" "}
                    · Saved checksum {documentRecord.checksum} ·{" "}
                    <a
                      href="/documents"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      Open vault
                    </a>
                  </>
                )}
              </p>
              <Button variant="outline" onClick={exportCsv}>
                Export CSV
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {campaign.posts.map((post, index) => (
                <div
                  key={`${post.channel}-${index}`}
                  className="rounded-2xl border bg-muted/30 p-4"
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {post.channel} · {post.cadence ?? "one-off"}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{post.hook}</p>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">
                    {post.copy}
                  </p>
                  {post.callToAction && (
                    <p className="mt-3 text-sm font-medium text-foreground">
                      CTA: {post.callToAction}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Autopost Studio</CardTitle>
        <p className="text-sm text-muted-foreground">
          {autopostReady
            ? "Generate multi-channel copy that references your verifiable traction and export the schedule as CSV to upload into any scheduler."
            : "This workspace is earmarked for a future release so distribution automation can launch once scheduling and approvals are production-ready."}
        </p>
      </CardHeader>
      <CardContent className={autopostReady ? "space-y-6" : "space-y-4"}>
        {content}
      </CardContent>
    </Card>
  );
}
