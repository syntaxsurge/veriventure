export type ImageStrategy = "manual" | "ai" | "scrape";

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
  textStyles?: SlideTextStyles;
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
  missionStatement: string;
  focusRegion: string;
  customerProfile: string;
  tractionSummary: string;
  goToMarket: string;
  fundingPlan: string;
  team: PitchTeamMember[];
  brandColor: string;
  businessModel: string;
  selectedSlideIds: string[];
  imageStrategy: ImageStrategy;
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
  missionStatement: string;
  focusRegion: string;
  customerProfile: string;
  tractionSummary: string;
  goToMarket: string;
  fundingPlan: string;
  brandColor: string;
  businessModel: string;
  slides: string[];
  imageStrategy: ImageStrategy;
  team: PitchTeamMember[];
};

export type SlideTextStyles = {
  titleSize?: number;
  subtitleSize?: number;
  bulletSize?: number;
  noteSize?: number;
  titleColor?: string;
  subtitleColor?: string;
  bulletColor?: string;
  noteColor?: string;
  captionSize?: number;
};
