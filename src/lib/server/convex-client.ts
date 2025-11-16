import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { serverEnv } from "@/env/server";
import { clientEnv } from "@/env/client";

let cachedClient: ConvexHttpClient | null = null;

function resolveConvexUrl() {
  const candidates = [
    serverEnv.CONVEX_URL,
    serverEnv.CONVEX_DEPLOYMENT_URL,
    clientEnv.NEXT_PUBLIC_CONVEX_URL,
  ];

  const url = candidates.find(
    (value) => typeof value === "string" && value.trim().length > 0,
  );

  if (!url) {
    throw new Error(
      "Set CONVEX_URL or NEXT_PUBLIC_CONVEX_URL to connect to the Convex backend.",
    );
  }

  const normalized = url.trim();
  if (normalized.startsWith("dev:")) {
    return clientEnv.NEXT_PUBLIC_CONVEX_URL;
  }

  if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
    return normalized;
  }

  throw new Error(
    `Unsupported Convex URL "${normalized}". Use https://... or a dev: identifier.`,
  );
}

export function getConvexClient() {
  if (!cachedClient) {
    const url = resolveConvexUrl();
    cachedClient = new ConvexHttpClient(url);
  }
  return cachedClient;
}

export { api };
