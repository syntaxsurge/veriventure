export type CommunityNoteRecord = {
  id: string;
  ownerAddress: string;
  topic: string;
  summary: string;
  references: string[];
  ual: string;
  createdAt: string;
  dkgResponse?: unknown;
};
