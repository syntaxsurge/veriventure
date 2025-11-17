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
      <section className="space-y-6">
        <div className="rounded-2xl border-2 bg-gradient-to-br from-green-500/5 via-background to-background p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Truth Alignment Community Notes
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Direct publishes from the Truth Alignment Lab. Each entry includes a
            copyable UAL plus explorer links.
          </p>
        </div>
        {notes.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Publish your first note from the Truth Alignment Lab to see it here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {notes.map((note) => {
              const explorer = buildDkgExplorerUrl(note.ual);
              const subscan = buildDkgTxUrl(note.txHash);
              return (
                <Card key={note.id} className="border-2 hover:shadow-xl hover:border-primary/30 transition-all">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold">{note.topic}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(note.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })} at {new Date(note.createdAt).toLocaleTimeString(undefined, {
                        timeStyle: "short",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground leading-relaxed">{note.summary}</p>
                    {note.references.length > 0 && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">References</p>
                        <ul className="space-y-2 text-xs">
                          {note.references.map((ref) => (
                            <li key={ref} className="break-all">
                              <a
                                href={ref}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                              >
                                {ref}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-[10px] font-semibold mb-1 uppercase tracking-wide text-muted-foreground">UAL</p>
                        <p className="break-all font-mono text-[11px] text-muted-foreground">
                          {note.ual}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        {explorer && (
                          <a
                            href={explorer}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                          >
                            DKG Explorer →
                          </a>
                        )}
                        {subscan && (
                          <a
                            href={subscan}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                          >
                            Subscan TX →
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

      <section className="space-y-6">
        <div className="rounded-2xl border-2 bg-gradient-to-br from-blue-500/5 via-background to-background p-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            AI Copilot DKG Assets
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Business plans, resumes, and other copilots published as Knowledge
            Assets. Every entry inherits a UAL plus an on-chain transaction
            hash.
          </p>
        </div>
        {assets.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Publish from Business Plan Lab, Resume Builder, or another copilot
              to populate this section.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              const explorer = buildDkgExplorerUrl(asset.ual);
              const subscan = buildDkgTxUrl(asset.txHash);
              return (
                <Card key={asset.id} className="border-2 hover:shadow-xl hover:border-primary/30 transition-all flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-base font-bold">
                        {TYPE_LABELS[asset.type] ?? asset.type}
                      </CardTitle>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {asset.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm flex-1 flex flex-col">
                    <p className="text-muted-foreground leading-relaxed line-clamp-3 flex-1">{asset.summary}</p>
                    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-[10px] font-semibold mb-1 uppercase tracking-wide text-muted-foreground">UAL</p>
                        <p className="break-all font-mono text-[11px] text-muted-foreground line-clamp-2">
                          {asset.ual}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs">
                        {explorer && (
                          <a
                            href={explorer}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                          >
                            Explorer →
                          </a>
                        )}
                        {subscan && (
                          <a
                            href={subscan}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
                          >
                            Subscan →
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
