export type DocumentType =
  | "pitch_deck"
  | "business_plan"
  | "resume"
  | "social_post";

export type PitchDeckSlide = {
  title: string;
  bullets: string[];
};

export type BusinessPlanSection = {
  heading: string;
  content: string;
};

export type ResumeSection = {
  heading: string;
  bullets: string[];
};

export type SocialPostVariant = {
  channel: string;
  hook: string;
  copy: string;
  callToAction?: string;
  cadence?: string;
};

export type DocumentRecord = {
  id: string;
  ownerAddress: string;
  type: DocumentType;
  title: string;
  summary: string;
  createdAt: string;
  checksum: string;
  data: {
    slides?: PitchDeckSlide[];
    body?: string;
    sections?: BusinessPlanSection[];
    metadata?: Record<string, string>;
    resume?: {
      headline: string;
      summary: string;
      sections: ResumeSection[];
      skills: string[];
    };
    socialPosts?: SocialPostVariant[];
  };
};
