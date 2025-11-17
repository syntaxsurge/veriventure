"use client";

import { useMemo } from "react";
import { AchievementForm } from "@/components/credentials/achievement-form";
import { AchievementList } from "@/components/credentials/achievement-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAchievements } from "@/hooks/use-achievements";
import { useSessionAddress } from "@/hooks/use-session-address";
import type { AchievementRecord } from "@/types/achievement";

type CredentialsManagerProps = {
  address: string | null;
  initialAchievements: AchievementRecord[];
};

export function CredentialsManager({
  address,
  initialAchievements,
}: CredentialsManagerProps) {
  const session = useSessionAddress();
  const activeAddress = useMemo(
    () => session.address ?? address,
    [session.address, address],
  );
  const { achievements, loading, refresh } = useAchievements(activeAddress);
  const records: AchievementRecord[] =
    achievements.length > 0 ? achievements : initialAchievements;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="self-start">
        <CardHeader>
          <CardTitle>Record a milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <AchievementForm
            disabled={!activeAddress}
            address={activeAddress}
            onCreated={() => {
              refresh(activeAddress);
            }}
          />
          {!activeAddress && (
            <p className="mt-4 text-sm text-destructive">
              Connect your wallet to mint a badge.
            </p>
          )}
        </CardContent>
      </Card>
      <div>
        <h2 className="mb-4 text-2xl font-semibold">Live badges</h2>
        <AchievementList
          achievements={records}
          loading={loading}
          onRefresh={() => refresh(activeAddress)}
        />
      </div>
    </div>
  );
}
