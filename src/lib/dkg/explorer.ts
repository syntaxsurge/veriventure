/**
 * DKG Explorer Utility Functions
 * Converts UAL (Uniform Asset Locator) strings to clickable DKG Explorer URLs
 */

/**
 * Convert a UAL to a DKG Explorer URL
 * @param ual The UAL string (e.g., "did:dkg:otp:2043/0x...")
 * @returns The DKG Explorer URL or empty string if invalid
 */
export function ualToExplorerUrl(ual: string): string {
  try {
    if (!ual || typeof ual !== "string") {
      return "";
    }

    const template =
      process.env.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE ||
      "https://dkg-testnet.origintrail.io/explore?ual={ual}";

    if (template.includes("{ual}")) {
      return template.replace("{ual}", encodeURIComponent(ual));
    }

    const url = new URL(template);
    url.searchParams.set("ual", ual);
    return url.toString();
  } catch (error) {
    console.error("Error converting UAL to explorer URL:", error);
    return "";
  }
}

/**
 * Extract network information from a UAL
 * @param ual The UAL string
 * @returns Network information object
 */
export function parseUAL(ual: string): {
  isValid: boolean;
  network?: string;
  chainId?: string;
  assetId?: string;
  networkName?: string;
} {
  try {
    const ualPattern = /^did:dkg:([^:]+):(\d+)\/(.+)$/;
    const match = ual.match(ualPattern);

    if (!match) {
      return { isValid: false };
    }

    const [, network, chainId, assetId] = match;

    // Map network codes to friendly names
    const networkNames: Record<string, string> = {
      'otp': 'NeuroWeb',
      'gnosis': 'Gnosis',
      'polygon': 'Polygon',
      'eth': 'Ethereum',
      'base': 'Base'
    };

    return {
      isValid: true,
      network,
      chainId,
      assetId,
      networkName: networkNames[network.toLowerCase()] || network
    };
  } catch {
    return { isValid: false };
  }
}

/**
 * Get NeuroWeb Subscan URL for a transaction hash
 * @param txHash The transaction hash
 * @returns The Subscan URL
 */
export function getNeuroWebScanUrl(txHash: string): string {
  if (!txHash) return '';
  return `https://neuroweb.subscan.io/extrinsic/${txHash}`;
}

/**
 * Get Moonbase Alpha (Moonscan) URL for a transaction hash
 * @param txHash The transaction hash
 * @returns The Moonscan URL
 */
export function getMoonbaseScanUrl(txHash: string): string {
  if (!txHash) return '';
  return `https://moonbase.moonscan.io/tx/${txHash}`;
}

/**
 * Format UAL for display (truncate middle)
 * @param ual The UAL string
 * @param maxLength Maximum display length
 * @returns Formatted UAL string
 */
export function formatUALDisplay(ual: string, maxLength: number = 50): string {
  if (!ual || ual.length <= maxLength) return ual;

  const start = ual.slice(0, 20);
  const end = ual.slice(-15);
  return `${start}...${end}`;
}

/**
 * Check if a string is a valid UAL
 * @param str The string to check
 * @returns Boolean indicating if it's a valid UAL
 */
export function isValidUAL(str: string): boolean {
  if (!str || typeof str !== 'string') return false;

  const ualPattern = /^did:dkg:([^:]+):(\d+)\/(.+)$/;
  return ualPattern.test(str);
}

/**
 * Get all explorer links for a UAL (DKG Explorer + Network Scanner)
 * @param ual The UAL string
 * @param txHash Optional transaction hash
 * @returns Object with explorer links
 */
export function getAllExplorerLinks(ual: string, txHash?: string): {
  dkgExplorer?: string;
  networkScanner?: string;
} {
  const links: { dkgExplorer?: string; networkScanner?: string } = {};

  // Get DKG Explorer link
  const dkgUrl = ualToExplorerUrl(ual);
  if (dkgUrl) {
    links.dkgExplorer = dkgUrl;
  }

  // Get network scanner link if we have a transaction hash
  if (txHash) {
    const ualInfo = parseUAL(ual);
    if (ualInfo.isValid && ualInfo.network === 'otp') {
      links.networkScanner = getNeuroWebScanUrl(txHash);
    }
  }

  return links;
}
