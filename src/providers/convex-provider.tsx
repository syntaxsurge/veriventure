"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient, ConvexProvider } from "convex/react";
import { clientEnv } from "@/env/client";

let cachedClient: ConvexReactClient | null = null;

function getConvexClient() {
  if (!cachedClient) {
    cachedClient = new ConvexReactClient(clientEnv.NEXT_PUBLIC_CONVEX_URL);
  }
  return cachedClient;
}

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => getConvexClient(), []);
  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

