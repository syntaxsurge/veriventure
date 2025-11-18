"use client";

import "@rainbow-me/rainbowkit/styles.css";

import {
  RainbowKitProvider,
  darkTheme,
  getDefaultConfig,
  type Theme,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { moonbaseAlpha, moonbeam } from "wagmi/chains";
import { WagmiProvider } from "wagmi";
import React from "react";

const wagmiConfig = getDefaultConfig({
  appName: "VeriVenture",
  projectId: "455a9939d641d79b258424737e7f9205",
  chains: [moonbaseAlpha, moonbeam],
  ssr: false,
});

const queryClient = new QueryClient();

export function RainbowKitWalletProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={moonbaseAlpha}
          showRecentTransactions
          theme={darkTheme({
            accentColor: "#6366f1",
            accentColorForeground: "#ffffff",
            borderRadius: "none",
            overlayBlur: "small",
          }) as Theme}
        >
          {mounted && children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
