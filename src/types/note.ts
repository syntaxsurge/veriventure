export type NoteRecord = {
  id: string;
  ownerAddress: string;
  title: string;
  body: string;
  tags: string[];
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  title: string;
  body: string;
  tags?: string[];
  pinned?: boolean;
};
