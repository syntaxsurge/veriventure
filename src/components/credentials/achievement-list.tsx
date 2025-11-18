"use client";

import { useMemo } from "react";
import { clientEnv } from "@/env/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Clock, ExternalLink, Hash, Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AchievementRecord } from "@/types/achievement";

type AchievementListProps = {
  achievements: AchievementRecord[];
  loading?: boolean;
  onRefresh?: () => void;
};

export function AchievementList({
  achievements,
  loading,
  onRefresh,
}: AchievementListProps) {
  const sorted = useMemo(
    () =>
      [...achievements].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [achievements],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-3xl" />
      </div>
    );
  }

  if (!sorted.length) {
    return (
      <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
        No achievements minted yet. Capture your first milestone to populate
        this list and unlock the Verify page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sorted.map((achievement) => (
        <Card key={achievement.id ?? achievement.hash} className="border-2 border-primary/20 bg-linear-to-br from-background to-primary/5 overflow-hidden hover:shadow-lg transition-all">
          <div className="h-1 bg-linear-to-r from-primary via-purple-500 to-primary" />
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="gap-1.5">
                    <Award className="h-3 w-3" />
                    {achievement.impactArea}
                  </Badge>
                  <Badge variant="outline" className="font-mono text-xs">
                    {achievement.hash.slice(0, 12)}…
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold">{achievement.title}</CardTitle>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 shadow-lg">
                <Award className="h-8 w-8 text-primary" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base text-muted-foreground leading-relaxed">{achievement.summary}</p>

            <div className="rounded-xl border-2 bg-muted/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Metrics
                </p>
              </div>
              <p className="text-sm font-medium">{achievement.metrics}</p>
            </div>

            <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="h-4 w-4 text-primary" />
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Verifiable Hash
                </p>
              </div>
              <code className="text-xs font-mono text-primary break-all block">
                {achievement.hash}
              </code>
            </div>

            {(achievement.network || achievement.txHash) && (
              <div className="rounded-xl border-2 bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Blockchain Details
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  {achievement.network && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Network:</span>
                      <Badge variant="secondary">{achievement.network}</Badge>
                    </div>
                  )}
                  {achievement.txHash && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">Transaction:</span>
                        <code className="text-xs font-mono flex-1 break-all">
                          {achievement.txHash.slice(0, 20)}…
                        </code>
                      </div>
                      {getExplorerUrl(achievement.txHash) && (
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <a
                            href={getExplorerUrl(achievement.txHash) ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View on Block Explorer
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(achievement.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              {achievement.evidenceUrl ? (
                <Button asChild variant="ghost" size="sm">
                  <a
                    href={achievement.evidenceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Evidence
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground italic">No evidence URL</span>
              )}
            </div>

          </CardContent>
        </Card>
      ))}
      {onRefresh && (
        <Button variant="outline" size="lg" className="w-full" onClick={() => onRefresh()}>
          <ArrowUpRight className="mr-2 h-5 w-5" />
          Refresh Timeline
        </Button>
      )}
    </div>
  );
}

function getExplorerUrl(txHash?: string | null) {
  if (!txHash) return null;
  const template = clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE;
  return template.replace("{tx}", encodeURIComponent(txHash));
}
