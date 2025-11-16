export type SlideTemplate = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  slideType?: "standard" | "team";
};

export type PitchIndustry = {
  slug: string;
  label: string;
  summary: string;
  slides: SlideTemplate[];
};

const sharedSlides: SlideTemplate[] = [
  {
    id: "intro",
    title: "Opening narrative",
    description:
      "Mission statement plus the single strongest proof point you have today.",
    prompt:
      "Summarize the mission in one sentence, add a sub-bullet with traction (revenue, users, pilots) and another bullet with the vision.",
  },
  {
    id: "problem",
    title: "Problem",
    description: "Outline the pain points, the current workaround, and urgency.",
    prompt:
      "List up to three quantifiable pain points. Cite a trusted data source per bullet when possible.",
  },
  {
    id: "solution",
    title: "Solution",
    description: "Describe how your product uniquely fixes the pain.",
    prompt:
      "Explain the product in plain language. Include differentiators vs. legacy players.",
  },
  {
    id: "market",
    title: "Market size",
    description: "Share TAM/SAM/SOM or a practical wedge.",
    prompt:
      "Provide TAM/SAM/SOM or an attainable wedge. Use USD and cite a report in the notes.",
  },
  {
    id: "business_model",
    title: "Business model",
    description: "How money flows and why it scales.",
    prompt:
      "Highlight primary revenue streams, average contract value, and gross margin targets.",
  },
  {
    id: "go_to_market",
    title: "Go-to-market",
    description: "How you win distribution.",
    prompt:
      "Explain launch channels, partnerships, and the next critical milestone.",
  },
  {
    id: "traction",
    title: "Traction & proof",
    description: "Showcase metrics that de-risk the bet.",
    prompt:
      "List KPIs such as ARR, retention, waitlist, or pilots. Reference verified achievements from badges.",
  },
  {
    id: "team",
    title: "Team",
    description: "Highlight people building the company.",
    prompt:
      "Summarize why the team is uniquely capable. Mention category expertise per member.",
    slideType: "team",
  },
  {
    id: "financials",
    title: "Financial outlook",
    description: "Forecast or key unit economics.",
    prompt:
      "Share a one-year forecast, burn, and runway. Mention the raise target if applicable.",
  },
  {
    id: "impact",
    title: "Impact & ask",
    description: "State the broader impact and capital ask.",
    prompt:
      "Connect to sustainability/impact goals and share the precise ask or next partnership needed.",
  },
];

export const pitchIndustries: PitchIndustry[] = [
  {
    slug: "climate",
    label: "Climate & sustainability",
    summary:
      "Designed for founders working on climate resilience, carbon accounting, regenerative agriculture, or sustainability marketplaces.",
    slides: sharedSlides.map((slide) => ({ ...slide })),
  },
  {
    slug: "fintech",
    label: "Fintech & payments",
    summary:
      "Great for embedded finance, cross-border payments, or credit infrastructure products.",
    slides: sharedSlides.map((slide) =>
      slide.id === "impact"
        ? {
            ...slide,
            description: "Address regulatory readiness and the exact raise ask.",
            prompt:
              "Explain compliance posture, licenses or partners, and the fundraising ask (amount + allocation).",
          }
        : { ...slide },
    ),
  },
  {
    slug: "health",
    label: "Health & biotech",
    summary:
      "Use this for digital health, biotech tooling, or AI diagnostics. Adds emphasis on safety and outcomes.",
    slides: sharedSlides.map((slide) =>
      slide.id === "traction"
        ? {
            ...slide,
            description: "Emphasize pilots, clinical outcomes, and regulatory milestones.",
            prompt:
              "Highlight clinical outcomes, partnerships with hospitals, and regulatory progress (e.g., IRB, FDA).",
          }
        : { ...slide },
    ),
  },
];

export function getIndustry(slug: string) {
  return pitchIndustries.find((industry) => industry.slug === slug);
}

export function getSlideTemplates(slug: string, ids: string[]) {
  const industry = getIndustry(slug);
  if (!industry) return [];
  return industry.slides.filter((slide) => ids.includes(slide.id));
}
