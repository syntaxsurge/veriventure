"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { computeAchievementHash } from "@/lib/achievement-hash";
import { mintAchievementBadge } from "@/lib/web3/validity-contract";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";
import { Coachmark } from "@/components/onboarding/coachmark";
import type {
  AchievementPayload,
  AchievementRecord,
} from "@/types/achievement";
import { useWalletClient } from "wagmi";

type AchievementFormProps = {
  disabled?: boolean;
  address?: string | null;
  onCreated?: (record: AchievementRecord) => void;
};

const initialState: AchievementPayload = {
  title: "",
  summary: "",
  metrics: "",
  evidenceUrl: "",
  impactArea: "",
};

type AchievementField = keyof AchievementPayload;

export function AchievementForm({
  disabled,
  address,
  onCreated,
}: AchievementFormProps) {
  const { data: walletClient } = useWalletClient();
  const [form, setForm] = useState<AchievementPayload>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "minting" | "saving">("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<Partial<Record<AchievementField, boolean>>>({});
  const { mark, progress } = useOnboardingProgress();

  const previewHash = useMemo(() => computeAchievementHash(form), [form]);

  function updateField<K extends keyof AchievementPayload>(
    key: K,
    value: AchievementPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (disabled || !address) {
      setError("Connect your wallet before minting.");
      return;
    }
    if (!walletClient) {
      setError("Wallet provider is unavailable. Reconnect and try again.");
      return;
    }

    setSubmitting(true);
    setStage("minting");
    setError(null);
    setSuccess(null);
    setTxHash(null);
    try {
      const mintResult = await mintAchievementBadge({
        walletClient,
        to: address,
        payloadHash: previewHash,
      });
      setTxHash(mintResult.txHash);
      setStage("saving");

      const response = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: form,
          txHash: mintResult.txHash,
          network: mintResult.network,
          contractAddress: mintResult.contractAddress,
        }),
      });
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(
          payload.error ?? "Unable to store achievement metadata.",
        );
      }
      const payload = (await response.json()) as {
        achievement: AchievementRecord;
      };
      setForm(initialState);
      setSuccess("Achievement minted and captured successfully.");
      setStage("idle");
      mark("firstAchievementMinted");
      onCreated?.(payload.achievement);
    } catch (err) {
      const fallback = err instanceof Error ? err.message : "Unexpected error";
      setError(fallback);
    } finally {
      setStage("idle");
      setSubmitting(false);
    }
  }

  function extractEvidenceUrl(value: string) {
    const match = value.match(/https?:\/\/[^\s"'<>]+/i);
    return match?.[0]?.trim() ?? "";
  }

  async function handleAssist(field: AchievementField) {
    setAiBusy((prev) => ({ ...prev, [field]: true }));
    setAiError(null);
    try {
      const response = await fetch("/api/ai/forms/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assistant: "achievement",
          field,
          form,
        }),
      });
      const payload = (await response.json()) as {
        suggestion?: string;
        error?: string;
      };
      const suggestion = payload.suggestion?.trim();
      if (!response.ok || !suggestion) {
        throw new Error(payload.error ?? "Unable to suggest content.");
      }
      const normalized =
        field === "evidenceUrl" ? extractEvidenceUrl(suggestion) : suggestion;
      if (field === "evidenceUrl" && !normalized) {
        throw new Error("AI did not return a valid URL. Please try again.");
      }
      updateField(field, normalized);
    } catch (err) {
      const fallback =
        err instanceof Error ? err.message : "Unable to suggest content.";
      setAiError(fallback);
    } finally {
      setAiBusy((prev) => ({ ...prev, [field]: false }));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="title">Milestone title</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleAssist("title")}
            disabled={disabled || submitting || aiBusy.title}
          >
            {aiBusy.title ? "Generating…" : "Use AI"}
          </Button>
        </div>
        <Input
          id="title"
          placeholder="Closed $85K ARR with 4 logos"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="summary">Summary</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleAssist("summary")}
            disabled={disabled || submitting || aiBusy.summary}
          >
            {aiBusy.summary ? "Generating…" : "Use AI"}
          </Button>
        </div>
        <Textarea
          id="summary"
          rows={4}
          placeholder="Add the context investors or partners need to trust this proof."
          value={form.summary}
          onChange={(event) => updateField("summary", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="metrics">KPIs or metrics</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleAssist("metrics")}
            disabled={disabled || submitting || aiBusy.metrics}
          >
            {aiBusy.metrics ? "Generating…" : "Use AI"}
          </Button>
        </div>
        <Textarea
          id="metrics"
          rows={3}
          placeholder="MRR: $8.5K, CAC: $414, Carbon credits tokenized: 120 tons"
          value={form.metrics}
          onChange={(event) => updateField("metrics", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="evidenceUrl">Evidence URL</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleAssist("evidenceUrl")}
            disabled={disabled || submitting || aiBusy.evidenceUrl}
          >
            {aiBusy.evidenceUrl ? "Generating…" : "Use AI"}
          </Button>
        </div>
        <Input
          id="evidenceUrl"
          type="url"
          placeholder="https://example.com/dashboard"
          value={form.evidenceUrl}
          onChange={(event) => updateField("evidenceUrl", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="impactArea">Impact area</Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => handleAssist("impactArea")}
            disabled={disabled || submitting || aiBusy.impactArea}
          >
            {aiBusy.impactArea ? "Generating…" : "Use AI"}
          </Button>
        </div>
        <Input
          id="impactArea"
          placeholder="SME climate financing"
          value={form.impactArea}
          onChange={(event) => updateField("impactArea", event.target.value)}
          required
        />
      </div>

      <div className="rounded-xl border bg-muted/60 p-4 text-sm">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          Hash preview (BLAKE2b-256)
        </p>
        <p className="break-all font-mono text-xs">{previewHash}</p>
      </div>

      {stage !== "idle" && (
        <div className="rounded-xl border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
          {stage === "minting"
            ? "Waiting for wallet signature and contract finalization…"
            : "Saving metadata to the local registry…"}
        </div>
      )}

      {aiError && (
        <p className="text-xs text-destructive" role="alert">
          {aiError}
        </p>
      )}

      <Button
        id="mint-achievement-button"
        type="submit"
        className="w-full"
        disabled={disabled || submitting}
      >
        {submitting ? "Submitting…" : "Mint achievement"}
      </Button>
      <Coachmark
        id="achievement"
        targetId="mint-achievement-button"
        text="Mint at least one badge to unlock every other workflow."
        active={
          progress.walletConnected &&
          !progress.firstAchievementMinted
        }
      />
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-emerald-600" role="status">
          {success}
        </p>
      )}
      {txHash && (
        <p className="text-xs text-muted-foreground break-all">
          Tx hash: {txHash}
        </p>
      )}
    </form>
  );
}
