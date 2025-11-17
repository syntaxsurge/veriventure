"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useWalletClient } from "wagmi";
import { SESSION_EVENT_NAME } from "@/hooks/use-session-address";
import { useSessionAddress } from "@/hooks/use-session-address";
import { useOnboardingProgress } from "@/lib/onboarding/use-onboarding-progress";
import { useRouter } from "next/navigation";

export function WalletConnectButton() {
  const router = useRouter();
  const { address, status } = useAccount();
  const { data: walletClient } = useWalletClient();
  const session = useSessionAddress();
  const { mark } = useOnboardingProgress();
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (address) {
      mark("walletConnected");
    }
  }, [address, mark]);

  useEffect(() => {
    if (!address || !walletClient || syncing || session.address === address) {
      return;
    }
    let cancelled = false;
    const syncSession = async () => {
      setSyncing(true);
      try {
        const challengeResponse = await fetch("/api/auth/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });
        if (!challengeResponse.ok) {
          throw new Error("Unable to create login challenge.");
        }
        const { message } = (await challengeResponse.json()) as { message: string };
        const signature = await walletClient.signMessage({ message });
        const verifyResponse = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, signature, message }),
        });
        if (!verifyResponse.ok) {
          throw new Error("Signature verification failed.");
        }
        if (!cancelled) {
          window.dispatchEvent(new Event(SESSION_EVENT_NAME));
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to sync wallet session", error);
      } finally {
        if (!cancelled) {
          setSyncing(false);
        }
      }
    };
    void syncSession();
    return () => {
      cancelled = true;
    };
  }, [address, walletClient, session.address, syncing, router]);

  useEffect(() => {
    if (status !== "disconnected" || !session.address || syncing) {
      return;
    }
    let cancelled = false;
    const clearSession = async () => {
      try {
        await fetch("/api/auth/session", { method: "DELETE" });
        if (!cancelled) {
          window.dispatchEvent(new Event(SESSION_EVENT_NAME));
          router.refresh();
        }
      } catch (error) {
        console.error("Failed to clear wallet session", error);
      }
    };
    void clearSession();
    return () => {
      cancelled = true;
    };
  }, [status, session.address, syncing, router]);

  return (
    <div className="flex flex-col items-end gap-1">
      <ConnectButton accountStatus="full" chainStatus="icon" showBalance={false} />
    </div>
  );
}
