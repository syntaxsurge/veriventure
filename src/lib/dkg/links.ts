const viewerTemplate =
  process.env.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE ??
  "https://dkg-testnet.origintrail.io/explore?ual={ual}";
const txTemplate =
  process.env.NEXT_PUBLIC_DKG_TX_TEMPLATE ??
  "https://neuroweb-testnet.subscan.io/tx/{tx}";

export function buildDkgExplorerUrl(ual?: string | null) {
  if (!ual) return null;
  return viewerTemplate.replace("{ual}", encodeURIComponent(ual));
}

export function buildDkgTxUrl(txHash?: string | null) {
  if (!txHash) return null;
  return txTemplate.replace("{tx}", txHash);
}
