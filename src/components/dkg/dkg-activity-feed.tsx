"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { CommunityNoteRecord } from "@/types/community-note";
import type { DkgAssetRecord } from "@/types/dkg-asset";
import { buildDkgExplorerUrl, buildDkgTxUrl } from "@/lib/dkg/links";
import {
  BookOpen,
  Copy,
  ExternalLink,
  CheckCircle2,
  FileText,
  Sparkles,
  Link2,
  Eye
} from "lucide-react";
import { toast } from "sonner";

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

const TYPE_COLORS: Record<string, string> = {
  business_plan: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900",
  resume: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900",
  pitch_deck: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900",
  social_post: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900",
};

export function DkgActivityFeed({ notes, assets }: Props) {
  const [copiedUal, setCopiedUal] = useState<string | null>(null);

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUal(id);
      toast.success("Copied to clipboard!", {
        description: "UAL copied successfully",
      });
      setTimeout(() => setCopiedUal(null), 2000);
    } catch (error) {
      console.error("Failed to copy proof link:", error);
      toast.error("Failed to copy", {
        description: "Please try again",
      });
    }
  }

  return (
    <div className="space-y-12">
      {/* Truth Alignment Community Notes Section */}
      <section className="space-y-6">
        <Card className="border-2 bg-gradient-to-br from-green-500/5 via-background to-background shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex-shrink-0">
                <BookOpen className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold mb-2">
                  Truth Alignment Community Notes
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Direct publishes from the Truth Alignment Lab. Each entry includes a copyable UAL,
                  DKG Explorer link, and on-chain transaction verification.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {notes.length === 0 ? (
          <Card className="border-2 border-dashed bg-muted/20">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium mb-1">No Community Notes Yet</p>
                  <p className="text-sm text-muted-foreground">
                    Publish your first note from the Truth Alignment Lab to see it here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {notes.map((note) => {
              const explorer = buildDkgExplorerUrl(note.ual);
              const subscan = buildDkgTxUrl(note.txHash);
              const isCopied = copiedUal === note.id;

              return (
                <Card
                  key={note.id}
                  className="border-2 hover:shadow-xl hover:border-primary/50 transition-all"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <CardTitle className="text-lg font-bold flex-1">
                        {note.topic}
                      </CardTitle>
                      <Badge variant="outline" className="flex-shrink-0">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Published
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>
                        {new Date(note.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(note.createdAt).toLocaleTimeString(undefined, {
                          timeStyle: "short",
                        })}
                      </span>
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {note.summary}
                    </p>

                    {note.references.length > 0 && (
                      <div className="rounded-lg border-2 bg-muted/30 p-4">
                        <p className="text-xs font-semibold mb-3 uppercase tracking-wide text-muted-foreground flex items-center gap-2">
                          <Link2 className="h-3 w-3" />
                          References ({note.references.length})
                        </p>
                        <ul className="space-y-2">
                          {note.references.map((ref) => (
                            <li key={ref}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-auto py-2 px-3 w-full justify-start text-left"
                                asChild
                              >
                                <a
                                  href={ref}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="break-all text-xs"
                                >
                                  <ExternalLink className="h-3 w-3 mr-2 flex-shrink-0" />
                                  <span className="flex-1">{ref}</span>
                                </a>
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="space-y-3 rounded-lg border-2 bg-gradient-to-br from-muted/50 to-muted/20 p-4">
                      <div>
                        <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">
                          Universal Asset Locator
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-background/80 px-3 py-2 text-[11px] font-mono break-all border">
                            {note.ual}
                          </code>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(note.ual, note.id)}
                            className="flex-shrink-0"
                          >
                            {isCopied ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {explorer && (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="gap-2"
                            asChild
                          >
                            <a href={explorer} target="_blank" rel="noreferrer">
                              <Eye className="h-3.5 w-3.5" />
                              DKG Explorer
                            </a>
                          </Button>
                        )}
                        {subscan && (
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            asChild
                          >
                            <a href={subscan} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Subscan TX
                            </a>
                          </Button>
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

      {/* AI Copilot DKG Assets Section */}
      <section className="space-y-6">
        <Card className="border-2 bg-gradient-to-br from-blue-500/5 via-background to-background shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex-shrink-0">
                <FileText className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl font-bold mb-2">
                  AI Copilot DKG Assets
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Business plans, resumes, pitch decks, and other AI-generated copilots published as
                  Knowledge Assets. Every entry includes a UAL and on-chain transaction hash.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {assets.length === 0 ? (
          <Card className="border-2 border-dashed bg-muted/20">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium mb-1">No AI Assets Published Yet</p>
                  <p className="text-sm text-muted-foreground">
                    Publish from Business Plan Lab, Resume Builder, or another copilot to populate this section.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assets.map((asset) => {
              const explorer = buildDkgExplorerUrl(asset.ual);
              const subscan = buildDkgTxUrl(asset.txHash);
              const isCopied = copiedUal === asset.id;
              const colorClass = TYPE_COLORS[asset.type] ?? "bg-muted text-foreground border-border";

              return (
                <Card
                  key={asset.id}
                  className="border-2 hover:shadow-xl hover:border-primary/50 transition-all flex flex-col"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <Badge variant="outline" className={`${colorClass} border`}>
                        {TYPE_LABELS[asset.type] ?? asset.type}
                      </Badge>
                    </div>
                    <CardTitle className="text-base font-bold mb-2 leading-tight">
                      {asset.title}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {new Date(asset.createdAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                      {asset.summary}
                    </p>

                    <div className="space-y-3 rounded-lg border-2 bg-gradient-to-br from-muted/50 to-muted/20 p-3">
                      <div>
                        <p className="text-[10px] font-semibold mb-2 uppercase tracking-wide text-muted-foreground">
                          UAL
                        </p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 rounded bg-background/80 px-2 py-1.5 text-[10px] font-mono break-all border line-clamp-2">
                            {asset.ual}
                          </code>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(asset.ual, asset.id)}
                            className="flex-shrink-0 h-7 w-7 p-0"
                          >
                            {isCopied ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        {explorer && (
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="gap-2 w-full"
                            asChild
                          >
                            <a href={explorer} target="_blank" rel="noreferrer">
                              <Eye className="h-3.5 w-3.5" />
                              View on Explorer
                            </a>
                          </Button>
                        )}
                        {subscan && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2 w-full"
                            asChild
                          >
                            <a href={subscan} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3.5 w-3.5" />
                              Subscan TX
                            </a>
                          </Button>
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
