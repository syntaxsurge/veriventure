export type CommunityNoteRecord = {
  id: string;
  ownerAddress: string;
  topic: string;
  summary: string;
  references: string[];
  ual: string;
  txHash?: string | null;
  createdAt: string;
  dkgResponse?: unknown;
};
