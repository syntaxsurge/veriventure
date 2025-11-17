"use client";

import { useCallback, useMemo, useState } from "react";
import { clientEnv } from "@/env/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { AchievementRecord } from "@/types/achievement";
import { computeAchievementHash } from "@/lib/achievement-hash";

type AchievementListProps = {
  achievements: AchievementRecord[];
  loading?: boolean;
  onRefresh?: () => void;
  verifiable?: boolean;
  ownerAddress?: string;
};

export function AchievementList({
  achievements,
  loading,
  onRefresh,
  verifiable = false,
  ownerAddress,
}: AchievementListProps) {
  const sorted = useMemo(
    () =>
      [...achievements].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [achievements],
  );
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    Record<
      string,
      {
        state: "valid" | "invalid" | "error";
        message: string;
      }
    >
  >({});

  const handleVerify = useCallback(
    async (record: AchievementRecord) => {
      if (!ownerAddress) return;
      setVerifyingId(record.id);
      try {
        const localHash = computeAchievementHash({
          title: record.title,
          summary: record.summary,
          metrics: record.metrics,
          evidenceUrl: record.evidenceUrl,
          impactArea: record.impactArea,
        });
        const localMatch =
          localHash.toLowerCase() === record.hash.toLowerCase();

        const response = await fetch("/api/achievements/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: ownerAddress,
            hash: record.hash,
          }),
        });
        const payload = (await response.json()) as {
          onChainMatch?: boolean;
          onChainCount?: number;
          error?: string;
        };
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to verify hash.");
        }

        const onChainMatch = payload.onChainMatch === true;
        const parts = [
          localMatch
            ? "Local hash matches the displayed content."
            : "Local hash mismatch — content differs from the signed record.",
          onChainMatch
            ? "Hash found on-chain."
            : "Hash missing from on-chain contract.",
        ];

        setVerificationStatus((prev) => ({
          ...prev,
          [record.id]: {
            state: localMatch && onChainMatch ? "valid" : "invalid",
            message: parts.join(" "),
          },
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Verification failed.";
        setVerificationStatus((prev) => ({
          ...prev,
          [record.id]: {
            state: "error",
            message,
          },
        }));
      } finally {
        setVerifyingId(null);
      }
    },
    [ownerAddress],
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
    <div className="space-y-4">
      {sorted.map((achievement) => (
        <Card key={achievement.id} className="border border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">{achievement.title}</CardTitle>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {achievement.impactArea}
              </p>
            </div>
            <Badge variant="outline" className="font-mono">
              {achievement.hash.slice(0, 10)}…
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{achievement.summary}</p>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Metrics
              </p>
              <p>{achievement.metrics}</p>
            </div>
            {(achievement.network || achievement.txHash) && (
              <div className="rounded-lg border bg-background/50 p-3 text-xs font-mono">
                {achievement.network && (
                  <p className="mb-1">
                    Network:{" "}
                    <span className="font-sans">{achievement.network}</span>
                  </p>
                )}
                {achievement.txHash && (
                  <p className="break-all">
                    Tx: {achievement.txHash.slice(0, 20)}…
                    {getExplorerUrl(achievement.txHash) && (
                      <>
                        {" "}
                        <a
                          className="font-sans text-primary underline-offset-4 hover:underline"
                          href={getExplorerUrl(achievement.txHash) ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          View explorer
                        </a>
                      </>
                    )}
                  </p>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              {achievement.evidenceUrl ? (
                <a
                  className="text-primary underline-offset-4 hover:underline"
                  href={achievement.evidenceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  View evidence
                </a>
              ) : (
                <span className="text-muted-foreground">No evidence URL</span>
              )}
              <span>
                {new Date(achievement.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
            </div>
            {verifiable && ownerAddress && (
              <div className="space-y-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={verifyingId === achievement.id}
                  onClick={() => handleVerify(achievement)}
                >
                  {verifyingId === achievement.id
                    ? "Verifying…"
                    : "Recompute hash"}
                </Button>
                {verificationStatus[achievement.id] && (
                  <p
                    className={
                      verificationStatus[achievement.id].state === "valid"
                        ? "text-xs text-emerald-600"
                        : verificationStatus[achievement.id].state === "invalid"
                          ? "text-xs text-amber-600"
                          : "text-xs text-destructive"
                    }
                  >
                    {verificationStatus[achievement.id].message}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={() => onRefresh()}>
          Refresh
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
