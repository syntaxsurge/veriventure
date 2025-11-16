import { ConvexHttpClient } from "convex/browser";

let cachedClient: ConvexHttpClient | null = null;

function resolveConvexUrl() {
  const candidates = [
    process.env.CONVEX_URL,
    process.env.CONVEX_DEPLOYMENT_URL,
    process.env.NEXT_PUBLIC_CONVEX_URL,
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
    return process.env.NEXT_PUBLIC_CONVEX_URL ?? "http://127.0.0.1:8000";
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
