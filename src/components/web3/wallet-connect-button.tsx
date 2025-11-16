"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Button } from "@/components/ui/button";
import { SESSION_EVENT_NAME } from "@/hooks/use-session-address";
import { loadExtensionDapp } from "@/lib/web3/extension-dapp";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";

const DAPP_NAME = "VeriVenture";

type SessionResponse = {
  address: string | null;
};

function encodeMessage(message: string) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(message);
  return `0x${Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function WalletConnectButton() {
  const router = useRouter();
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { mark } = useOnboardingProgress();

  const fetchSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });
      if (!response.ok) return;
      const data = (await response.json()) as SessionResponse;
      setAddress(data.address);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    if (address) {
      mark("walletConnected");
    }
  }, [address, mark]);

  const truncatedAddress = useMemo(() => {
    if (!address) return null;
    return `${address.slice(0, 6)}…${address.slice(-4)}`;
  }, [address]);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await cryptoWaitReady();
      const { web3Enable, web3Accounts, web3FromAddress } =
        await loadExtensionDapp();
      const extensions = await web3Enable(DAPP_NAME);
      if (!extensions.length) {
        throw new Error(
          "Please install or authorize a Polkadot wallet extension.",
        );
      }

      const accounts = await web3Accounts();
      if (!accounts.length) {
        throw new Error("No accounts available. Create one first.");
      }

      const primary = accounts[0];
      const injector = await web3FromAddress(primary.address);
      const signer = injector?.signer;

      if (!signer || !signer.signRaw) {
        throw new Error("Wallet signer is unavailable.");
      }

      const challengeResponse = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address: primary.address }),
      });

      if (!challengeResponse.ok) {
        throw new Error("Unable to create login challenge.");
      }

      const { message } = (await challengeResponse.json()) as {
        message: string;
      };

      const { signature } = await signer.signRaw({
        address: primary.address,
        data: encodeMessage(message),
        type: "bytes",
      });

      const verifyResponse = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: primary.address,
          signature,
          message,
        }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Signature verification failed.");
      }

      setAddress(primary.address);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(SESSION_EVENT_NAME));
      }
      router.refresh();
    } catch (err) {
      const fallback = err instanceof Error ? err.message : "Unknown error";
      setError(fallback);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleDisconnect = useCallback(async () => {
    setLoading(true);
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
      });
      setAddress(null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(SESSION_EVENT_NAME));
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }, [router]);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant={address ? "outline" : "default"}
        disabled={loading}
        onClick={address ? handleDisconnect : handleConnect}
      >
        {loading && "Processing…"}
        {!loading && address && (
          <>
            Disconnect
            <span className="ml-2 text-xs text-muted-foreground">
              {truncatedAddress}
            </span>
          </>
        )}
        {!loading && !address && "Connect wallet"}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
