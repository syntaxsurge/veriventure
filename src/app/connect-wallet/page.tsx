"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  Wallet,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AnimatedGradientBg } from "@/components/ui/animated-gradient-bg";
import { FloatingElements } from "@/components/ui/floating-elements";
import { useSessionAddress } from "@/hooks/use-session-address";
import { SESSION_EVENT_NAME } from "@/hooks/use-session-address";

function emitSessionUpdate() {
  if (typeof window === "undefined") return;
  window.setTimeout(() => {
    window.dispatchEvent(new Event(SESSION_EVENT_NAME));
  }, 0);
}

export default function ConnectWalletPage() {
  const router = useRouter();
  const { address, status } = useAccount();
  const { data: walletClient } = useWalletClient();
  const session = useSessionAddress();
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoTriggerAttempted, setAutoTriggerAttempted] = useState(false);

  // Automatically trigger wallet connection once
  useEffect(() => {
    if (!autoTriggerAttempted && status === "disconnected") {
      setAutoTriggerAttempted(true);
      // Small delay to ensure UI is rendered before triggering
      const timer = setTimeout(() => {
        const connectButton = document.querySelector('[data-testid="rk-connect-button"]') as HTMLElement;
        if (connectButton) {
          connectButton.click();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoTriggerAttempted, status]);

  // Handle wallet signature flow
  useEffect(() => {
    if (
      !address ||
      !walletClient ||
      syncing ||
      session.loading ||
      session.address === address
    ) {
      return;
    }

    let cancelled = false;
    const syncSession = async () => {
      setSyncing(true);
      setError(null);

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
          emitSessionUpdate();
          // Redirect to dashboard after successful authentication
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to sync wallet session", error);
        if (!cancelled) {
          setError(error instanceof Error ? error.message : "Failed to authenticate wallet");
        }
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
  }, [address, walletClient, session.address, session.loading, syncing, router]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (session.address && !session.loading) {
      router.push("/dashboard");
    }
  }, [session.address, session.loading, router]);

  const connectionSteps = [
    {
      icon: Wallet,
      title: "Connect Wallet",
      description: "Link your Web3 wallet to VeriVenture",
      status: address ? "complete" : syncing ? "active" : "pending"
    },
    {
      icon: Lock,
      title: "Sign Message",
      description: "Verify ownership with a signature",
      status: address && syncing ? "active" : address ? "complete" : "pending"
    },
    {
      icon: CheckCircle2,
      title: "Access Dashboard",
      description: "Start building your verifiable business",
      status: session.address ? "complete" : "pending"
    }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <AnimatedGradientBg />
      <FloatingElements />

      <div className="relative z-10 container-app py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Header */}
          <motion.div
            className="text-center space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Badge
                variant="secondary"
                className="border border-primary/30 bg-primary/10 px-6 py-2.5 text-sm font-medium backdrop-blur-sm"
              >
                <Shield className="mr-2 h-4 w-4" />
                Secure Wallet Authentication
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Connect Your Wallet
              <br />
              <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent animate-gradient">
                to Continue
              </span>
            </motion.h1>

            <motion.p
              className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Sign in with your Web3 wallet to access your dashboard and start building
              your verifiable business on VeriVenture
            </motion.p>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Card className="border-2 border-primary/20 bg-background/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
              <div className="space-y-8">
                {/* Connection Steps */}
                <div className="space-y-4">
                  {connectionSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <motion.div
                        key={step.title}
                        className="flex items-start gap-4 p-4 rounded-xl transition-all"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                        style={{
                          backgroundColor: step.status === "active"
                            ? "hsl(var(--primary) / 0.1)"
                            : "transparent",
                          borderLeft: step.status === "complete"
                            ? "3px solid hsl(var(--primary))"
                            : step.status === "active"
                            ? "3px solid hsl(var(--primary) / 0.5)"
                            : "3px solid transparent"
                        }}
                      >
                        <div className={`
                          flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center
                          ${step.status === "complete"
                            ? "bg-primary/20 text-primary"
                            : step.status === "active"
                            ? "bg-primary/10 text-primary animate-pulse"
                            : "bg-muted text-muted-foreground"
                          }
                        `}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg">{step.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                        </div>
                        {step.status === "complete" && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 10 }}
                          >
                            <CheckCircle2 className="h-6 w-6 text-primary" />
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-destructive">{error}</p>
                      <p className="text-xs text-destructive/80 mt-1">Please try connecting again</p>
                    </div>
                  </motion.div>
                )}

                {/* Connect Button */}
                <motion.div
                  className="pt-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <div className="flex flex-col items-center gap-6">
                    <div className="w-full flex justify-center">
                      <div className="scale-110" data-testid="wallet-connect-wrapper">
                        <ConnectButton
                          accountStatus="full"
                          chainStatus="icon"
                          showBalance={false}
                        />
                      </div>
                    </div>

                    {syncing && (
                      <motion.div
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        Authenticating your wallet...
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Security Note */}
                <motion.div
                  className="pt-4 border-t border-border"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Safe & Secure</p>
                      <p className="text-xs leading-relaxed">
                        We'll never ask for your private keys or seed phrase. Your wallet signature
                        is only used to verify ownership and create a secure session.
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>
          </motion.div>

          {/* Back to Home Link */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to home
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Background Decorations */}
      <motion.div
        className="absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-primary/20 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -left-32 bottom-1/4 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
