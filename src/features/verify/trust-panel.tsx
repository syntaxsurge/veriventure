"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { clientEnv } from "@/env/client";
import { AchievementList } from "@/components/credentials/achievement-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PublicProfile } from "@/lib/server/profile-store";

type TrustPanelProps = {
  profile: PublicProfile;
};

export function TrustPanel({ profile }: TrustPanelProps) {
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;
    const slug = profile.handle || profile.address;
    setShareUrl(`${origin}/verify/${slug}`);
  }, [profile.address, profile.handle]);

  const lastAchievement = profile.achievements[0];
  const noteCount = profile.notes.length;

  const shareHelper = useMemo(() => {
    if (copied === "success") return "Link copied";
    if (copied === "error") return "Clipboard blocked";
    return "";
  }, [copied]);

  const handleCopy = async () => {
    if (!shareUrl || typeof navigator === "undefined" || !navigator.clipboard) {
      setCopied("error");
      setTimeout(() => setCopied("idle"), 2500);
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied("success");
    } catch {
      setCopied("error");
    } finally {
      setTimeout(() => setCopied("idle"), 2500);
    }
  };

  return (
    <div className="space-y-8">
      {profile.achievements.length === 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900">
          No on-chain achievements yet. Mint a badge from the Credentials page
          to populate this trust surface.
        </div>
      )}
      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Proof summary</CardTitle>
            {profile.isDemo && (
              <Badge variant="secondary" className="w-fit">
                Demo Flight
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Achievements minted:{" "}
              <strong className="text-foreground">
                {profile.achievements.length}
              </strong>
            </p>
            <p>
              Community Notes published:{" "}
              <strong className="text-foreground">{noteCount}</strong>
            </p>
            <p>
              Last update:{" "}
              {lastAchievement
                ? new Date(lastAchievement.createdAt).toLocaleString()
                : "Not minted yet"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Share this page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border bg-muted/30 p-3 text-xs font-mono text-muted-foreground break-all">
              {shareUrl || "—"}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy verify link
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!shareUrl) return;
                  window.open(shareUrl, "_blank");
                }}
              >
                Open live page
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
              {shareHelper && (
                <span
                  className={
                    copied === "error"
                      ? "text-xs text-destructive"
                      : "text-xs text-emerald-600"
                  }
                >
                  {shareHelper}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Signed achievements</h2>
          <p className="text-sm text-muted-foreground">
            Each card includes the BLAKE2b hash, metrics, and a recompute
            button. Verifiers can cross-check the contract plus OriginTrail
            references without leaving this page.
          </p>
        </div>
        <AchievementList
          achievements={profile.achievements}
          verifiable={!profile.isDemo}
          ownerAddress={profile.address}
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">OriginTrail Community Notes</h2>
          <p className="text-sm text-muted-foreground">
            Structured summaries with UAL links back to the DKG. Each note
            compares Grokipedia vs Wikipedia and cites supporting references.
          </p>
        </div>
        {profile.notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            Publish a Community Note from the Truth Alignment Lab to populate
            this section.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {profile.notes.map((note) => {
              const noteUrl = buildDkgViewerUrl(note.ual);
              return (
                <Card key={note.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{note.topic}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Published{" "}
                    {new Date(note.createdAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>{note.summary}</p>
                  {note.references.length > 0 && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        References
                      </p>
                      <ul className="mt-1 space-y-1">
                        {note.references.map((reference) => (
                          <li key={reference}>
                            <a
                              href={reference}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline-offset-4 hover:underline break-all"
                            >
                              {reference}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {noteUrl && (
                    <a
                      href={noteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-primary underline-offset-4 hover:underline"
                    >
                      Open DKG asset (UAL)
                    </a>
                  )}
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function buildDkgViewerUrl(ual?: string | null) {
  if (!ual) return null;
  const template = clientEnv.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE;
  return template.replace("{ual}", encodeURIComponent(ual));
}
