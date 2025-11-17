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
import { cn } from "@/lib/utils";
import { clientEnv } from "@/env/client";
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

const FIELD_LIMITS: Partial<Record<AchievementField, number>> = {
  title: 160,
  summary: 800,
  metrics: 400,
  evidenceUrl: 400,
  impactArea: 200,
};

function buildExplorerUrl(txHash?: string | null) {
  if (!txHash) return null;
  const template = clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE;
  if (!template.includes("{tx}")) return null;
  return template.replace("{tx}", encodeURIComponent(txHash));
}

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
  const [stage, setStage] = useState<"idle" | "minting" | "saving">("idle");
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiBusy, setAiBusy] = useState<Partial<Record<AchievementField, boolean>>>({});
  const [txDetails, setTxDetails] = useState<{
    hash: string;
    network: string | null;
    contractAddress: string | null;
  } | null>(null);
  const { mark, progress } = useOnboardingProgress();

  const previewHash = useMemo(() => computeAchievementHash(form), [form]);
  const fieldLimit = (field: AchievementField) => FIELD_LIMITS[field];
  const fieldOverLimit = (field: AchievementField) => {
    const limit = FIELD_LIMITS[field];
    return typeof limit === "number" && form[field].length > limit;
  };

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
    setTxDetails(null);
    try {
      const mintResult = await mintAchievementBadge({
        walletClient,
        to: address,
        payloadHash: previewHash,
      });
      setTxDetails({
        hash: mintResult.txHash,
        network: mintResult.network,
        contractAddress: mintResult.contractAddress,
      });
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
      updateField(field, suggestion);
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
      <p className="text-xs text-muted-foreground">
        Fields marked optional can be skipped. Character counts update as you type.
      </p>
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor="title">Milestone title</Label>
            <span className="text-xs text-muted-foreground">(required)</span>
          </div>
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
          aria-invalid={fieldOverLimit("title")}
          className={cn(fieldOverLimit("title") && "border-destructive")}
        />
      </div>
      <FieldCharacterInfo value={form.title} max={fieldLimit("title")} />
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor="summary">Summary</Label>
            <span className="text-xs text-muted-foreground">(required)</span>
          </div>
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
          aria-invalid={fieldOverLimit("summary")}
          className={cn(fieldOverLimit("summary") && "border-destructive")}
        />
      </div>
      <FieldCharacterInfo value={form.summary} max={fieldLimit("summary")} />
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor="metrics">KPIs or metrics</Label>
            <span className="text-xs text-muted-foreground">(required)</span>
          </div>
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
          aria-invalid={fieldOverLimit("metrics")}
          className={cn(fieldOverLimit("metrics") && "border-destructive")}
        />
      </div>
      <FieldCharacterInfo value={form.metrics} max={fieldLimit("metrics")} />
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor="evidenceUrl">Evidence URL</Label>
            <span className="text-xs text-muted-foreground">(optional)</span>
          </div>
        </div>
        <Input
          id="evidenceUrl"
          type="url"
          placeholder="https://example.com/dashboard"
          value={form.evidenceUrl}
          onChange={(event) => updateField("evidenceUrl", event.target.value)}
          aria-invalid={fieldOverLimit("evidenceUrl")}
          className={cn(fieldOverLimit("evidenceUrl") && "border-destructive")}
        />
      </div>
      <FieldCharacterInfo
        value={form.evidenceUrl}
        max={fieldLimit("evidenceUrl")}
      />
      <div className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <Label htmlFor="impactArea">Impact area</Label>
            <span className="text-xs text-muted-foreground">(required)</span>
          </div>
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
          aria-invalid={fieldOverLimit("impactArea")}
          className={cn(fieldOverLimit("impactArea") && "border-destructive")}
        />
      </div>
      <FieldCharacterInfo
        value={form.impactArea}
        max={fieldLimit("impactArea")}
      />

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

      {txDetails && (
        <div className="space-y-2 rounded-xl border bg-muted/40 p-4 text-xs text-muted-foreground">
          <p className="text-sm font-semibold text-foreground">
            Achievement transaction submitted
          </p>
          {txDetails.network && (
            <p>
              Network:{" "}
              <span className="font-mono text-foreground">
                {txDetails.network}
              </span>
            </p>
          )}
          <p className="break-all">
            Hash:{" "}
            <span className="font-mono text-foreground">
              {txDetails.hash}
            </span>
          </p>
          {buildExplorerUrl(txDetails.hash) && (
            <a
              href={buildExplorerUrl(txDetails.hash) ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              View on block explorer
            </a>
          )}
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
    </form>
  );
}

function FieldCharacterInfo({
  value,
  max,
}: {
  value: string;
  max?: number;
}) {
  const length = value.length;
  if (typeof max === "number") {
    const over = length > max;
    return (
      <p
        className={cn(
          "text-xs text-muted-foreground",
          over && "text-destructive",
        )}
      >
        {length}/{max} characters
      </p>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">{length} characters</p>
  );
}
