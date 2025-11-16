export type AchievementPayload = {
  title: string;
  summary: string;
  metrics: string;
  evidenceUrl: string;
  impactArea: string;
};

export type AchievementRecord = AchievementPayload & {
  id: string;
  ownerAddress: string;
  hash: string;
  hashAlgorithm: "blake2b256";
  createdAt: string;
  txHash: string | null;
  network: string | null;
  contractAddress: string | null;
};
