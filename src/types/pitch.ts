export type PitchTeamMember = {
  id: string;
  name: string;
  role: string;
  expertise: string;
};

export type PitchSlideImage = {
  url: string;
  caption: string;
};

export type PitchSlideRecord = {
  id: string;
  title: string;
  subtitle?: string;
  slideType: "standard" | "team";
  bullets: string[];
  notes: string;
  images: PitchSlideImage[];
  background: string;
};

export type PitchBrandKit = {
  background: string;
  title: string;
  bullets: string;
  note: string;
};

export type PitchDeckRecord = {
  deckId: string;
  ownerAddress: string;
  startupName: string;
  industry: string;
  missionStatement?: string;
  customerProfile?: string;
  features: string;
  problems: string;
  solutions: string;
  competitions: string;
  tractionSummary?: string;
  team: PitchTeamMember[];
  scope: string;
  moreInfo: string;
  fundingPlan?: string;
  brandColor: string;
  businessModel: string;
  selectedSlideIds: string[];
  imageStrategy: "manual" | "ai";
  status: "processing" | "completed";
  progress: number;
  summary: string;
  brandKit: PitchBrandKit;
  slides: PitchSlideRecord[];
  createdAt: string;
  updatedAt: string;
};

export type PitchWizardDraft = {
  startupName: string;
  industry: string;
  missionStatement: string;
  customerProfile: string;
  features: string;
  problems: string;
  solutions: string;
  competitions: string;
  tractionSummary: string;
  scope: string;
  moreInfo: string;
  fundingPlan: string;
  brandColor: string;
  businessModel: string;
  slides: string[];
  imageStrategy: "manual" | "ai";
  team: PitchTeamMember[];
};
