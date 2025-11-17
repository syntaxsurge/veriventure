/**
 * Utility functions for generating explorer URLs for DKG and blockchain transactions
 */

export type NetworkType = "moonbase" | "neuroweb" | "polkadot";

/**
 * Generate DKG Explorer URL for a UAL (Uniform Asset Locator)
 */
export function getDKGExplorerUrl(ual: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_DKG_EXPLORER_BASE || "https://dkg.origintrail.io";
  return `${baseUrl}/explore?ual=${encodeURIComponent(ual)}`;
}

/**
 * Generate blockchain explorer URL for a transaction hash
 */
export function getChainExplorerUrl(txHash: string, network: NetworkType = "moonbase"): string {
  const explorers: Record<NetworkType, string> = {
    moonbase: process.env.NEXT_PUBLIC_MOONBASE_EXPLORER || "https://moonbase.moonscan.io",
    neuroweb: process.env.NEXT_PUBLIC_NEUROWEB_EXPLORER || "https://neuroweb.subscan.io",
    polkadot: process.env.NEXT_PUBLIC_POLKADOT_EXPLORER || "https://polkadot.subscan.io",
  };

  const baseUrl = explorers[network];

  // Moonbase uses EVM-style URLs
  if (network === "moonbase") {
    return `${baseUrl}/tx/${txHash}`;
  }

  // Polkadot/Substrate chains use different format
  return `${baseUrl}/extrinsic/${txHash}`;
}

/**
 * Get network display name
 */
export function getNetworkDisplayName(network: string): string {
  const names: Record<string, string> = {
    moonbase: "Moonbase Alpha",
    neuroweb: "NeuroWeb",
    polkadot: "Polkadot",
    "moonbase-alpha": "Moonbase Alpha",
  };

  return names[network.toLowerCase()] || network;
}

/**
 * Truncate a hash or address for display
 */
export function truncateHash(hash: string, startChars = 6, endChars = 4): string {
  if (hash.length <= startChars + endChars) {
    return hash;
  }
  return `${hash.slice(0, startChars)}...${hash.slice(-endChars)}`;
}

/**
 * Truncate a UAL for display
 */
export function truncateUAL(ual: string, maxLength = 40): string {
  if (ual.length <= maxLength) {
    return ual;
  }
  const start = Math.floor(maxLength / 2);
  const end = Math.floor(maxLength / 2);
  return `${ual.slice(0, start)}...${ual.slice(-end)}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
}
