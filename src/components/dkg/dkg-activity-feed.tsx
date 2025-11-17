"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommunityNoteRecord } from "@/types/community-note";
import type { DkgAssetRecord } from "@/types/dkg-asset";
import { buildDkgExplorerUrl, buildDkgTxUrl } from "@/lib/dkg/links";

type Props = {
  notes: CommunityNoteRecord[];
  assets: DkgAssetRecord[];
};

const TYPE_LABELS: Record<string, string> = {
  business_plan: "Business Plan",
  resume: "Resume",
  pitch_deck: "Pitch Deck",
  social_post: "Social Campaign",
};

export function DkgActivityFeed({ notes, assets }: Props) {
  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">
            Truth Alignment Community Notes
          </h2>
          <p className="text-sm text-muted-foreground">
            Direct publishes from the Truth Alignment Lab. Each entry includes a
            copyable UAL plus explorer links.
          </p>
        </div>
        {notes.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            Publish your first note from the Truth Alignment Lab to see it here.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {notes.map((note) => {
              const explorer = buildDkgExplorerUrl(note.ual);
              const subscan = buildDkgTxUrl(note.txHash);
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
                      <ul className="list-disc space-y-1 pl-5 text-xs">
                        {note.references.map((ref) => (
                          <li key={ref} className="break-all">
                            <a
                              href={ref}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              {ref}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="space-y-1">
                      <p className="break-all font-mono text-[11px] text-muted-foreground">
                        {note.ual}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold">
                        {explorer && (
                          <a
                            href={explorer}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            View on DKG Explorer
                          </a>
                        )}
                        {subscan && (
                          <a
                            href={subscan}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            View tx on Subscan
                          </a>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">AI Copilot DKG Assets</h2>
          <p className="text-sm text-muted-foreground">
            Business plans, resumes, and other copilots published as Knowledge
            Assets. Every entry inherits a UAL plus an on-chain transaction
            hash.
          </p>
        </div>
        {assets.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
            Publish from Business Plan Lab, Resume Builder, or another copilot
            to populate this section.
          </p>
        ) : (
          <div className="space-y-4">
            {assets.map((asset) => {
              const explorer = buildDkgExplorerUrl(asset.ual);
              const subscan = buildDkgTxUrl(asset.txHash);
              return (
                <Card key={asset.id}>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-lg">
                      {TYPE_LABELS[asset.type] ?? asset.type}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {asset.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Published{" "}
                      {new Date(asset.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>{asset.summary}</p>
                    <div className="space-y-1">
                      <p className="break-all font-mono text-[11px] text-muted-foreground">
                        {asset.ual}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs font-semibold">
                        {explorer && (
                          <a
                            href={explorer}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            View on DKG Explorer
                          </a>
                        )}
                        {subscan && (
                          <a
                            href={subscan}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            View tx on Subscan
                          </a>
                        )}
                      </div>
                    </div>
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
