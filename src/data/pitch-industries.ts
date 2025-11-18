export type SlideTemplate = {
  id: string;
  title: string;
  description: string;
  prompt: string;
  slideType?: "standard" | "team";
  category?: string;
};

export const pitchSlideLibrary: SlideTemplate[] = [
  {
    id: "vision",
    title: "Vision snapshot",
    description:
      "Condense the mission statement and end-game outcome into a single page.",
    prompt:
      "Write three bullets: (1) Mission statement, (2) Why now, (3) Long-term change you unlock. Keep each bullet under 18 words.",
    category: "Vision",
  },
  {
    id: "intro",
    title: "Opening narrative",
    description:
      "Mission statement plus the single strongest proof point you have today.",
    prompt:
      "Summarize the mission in one sentence, add a traction bullet (revenue, users, pilots) and another bullet with the product promise.",
    category: "Vision",
  },
  {
    id: "problem",
    title: "Problem",
    description: "Outline the pain points, the current workaround, and urgency.",
    prompt:
      "List up to three quantifiable pain points. Cite a trusted data source per bullet when possible.",
    category: "Market",
  },
  {
    id: "solution",
    title: "Solution",
    description: "Describe how your product uniquely fixes the pain.",
    prompt:
      "Explain the product in plain language. Include differentiators vs. legacy players.",
    category: "Product",
  },
  {
    id: "market",
    title: "Market size",
    description: "Share TAM/SAM/SOM or a practical wedge.",
    prompt:
      "Provide TAM/SAM/SOM or an attainable wedge. Use USD and cite a report in the notes.",
    category: "Market",
  },
  {
    id: "regulation",
    title: "Regulatory & trust moat",
    description:
      "Great for fintech, gov-tech, or climate. Highlight compliance, certifications, or data provenance advantages.",
    prompt:
      "List approvals, audits, or infrastructure that are hard to replicate. Mention how they accelerate adoption.",
    category: "Trust",
  },
  {
    id: "business_model",
    title: "Business model",
    description: "How money flows and why it scales.",
    prompt:
      "Highlight primary revenue streams, average contract value, and gross margin targets.",
    category: "Business",
  },
  {
    id: "go_to_market",
    title: "Go-to-market",
    description: "How you win distribution.",
    prompt:
      "Explain launch channels, partnerships, and the next critical milestone.",
    category: "Execution",
  },
  {
    id: "traction",
    title: "Traction & proof",
    description: "Showcase metrics that de-risk the bet.",
    prompt:
      "List KPIs such as ARR, retention, waitlist, or pilots. Reference verified achievements from badges.",
    category: "Evidence",
  },
  {
    id: "climate_impact",
    title: "Impact metrics",
    description:
      "Optional slide for climate, social, or governance ventures that need measurable proof.",
    prompt:
      "Quantify CO₂ saved, jobs created, or other verifiable impact. Cite data sources and connect to business outcomes.",
    category: "Impact",
  },
  {
    id: "team",
    title: "Team",
    description: "Highlight people building the company.",
    prompt:
      "Summarize why the team is uniquely capable. Highlight leadership roles and proof points per member.",
    slideType: "team",
    category: "Team",
  },
  {
    id: "financials",
    title: "Financial outlook",
    description: "Forecast or key unit economics.",
    prompt:
      "Share a one-year forecast, burn, and runway. Mention the raise target if applicable.",
    category: "Business",
  },
  {
    id: "impact",
    title: "Impact & ask",
    description: "State the broader impact and capital ask.",
    prompt:
      "Connect to sustainability/impact goals and share the precise ask or next partnership needed.",
    category: "Impact",
  },
  {
    id: "product_deep_dive",
    title: "Product walkthrough",
    description:
      "Use for screen-heavy products to highlight core features and proof of usability.",
    prompt:
      "Describe the user journey in three steps. Mention supporting AI, blockchain, or automation pieces.",
    category: "Product",
  },
];

export function getSlideTemplates(ids: string[]) {
  return pitchSlideLibrary.filter((slide) => ids.includes(slide.id));
}
