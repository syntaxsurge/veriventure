export type DkgAssetRecord = {
  id: string;
  ownerAddress: string;
  type: string;
  title: string;
  summary: string;
  references: string[];
  ual: string;
  txHash?: string | null;
  metadata?: unknown;
  createdAt: string;
};
