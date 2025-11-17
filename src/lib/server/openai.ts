"use server";

import { Buffer } from "node:buffer";
import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { serverEnv } from "@/env/server";
import { clampText } from "@/lib/alignment/text";
import type {
  BusinessPlanSection,
  PitchDeckSlide,
  ResumeSection,
  SocialPostVariant,
} from "@/types/document";
import type { AchievementPayload } from "@/types/achievement";
import type {
  ImageStrategy,
  PitchBrandKit,
  PitchSlideRecord,
  PitchTeamMember,
  PitchWizardDraft,
} from "@/types/pitch";
import type { SlideTemplate } from "@/data/pitch-industries";

let cachedClient: OpenAI | null = null;
const COMPLETIONS_MODEL = serverEnv.OPENAI_COMPLETIONS_MODEL;
const EMBEDDING_MODEL = serverEnv.OPENAI_EMBEDDING_MODEL;
const IMAGE_MODEL = serverEnv.OPENAI_IMAGE_MODEL;
const DEFAULT_IMAGE_SIZE = serverEnv.PITCH_DECK_IMAGE_SIZE;
const SCRAPE_IMAGE_SIZE = serverEnv.PITCH_DECK_SCRAPE_SIZE;

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }
  const apiKey = serverEnv.OPENAI_API_KEY;
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

export async function createEmbedding(text: string) {
  const client = getClient();
  const trimmed = clampText(text, 8000);
  const response = await client.embeddings.create({
    model: EMBEDDING_MODEL,
    input: trimmed,
  });
  const vector = response.data[0]?.embedding;
  if (!vector) {
    throw new Error("OpenAI did not return an embedding vector.");
  }
  return vector;
}

export async function generateAiArticle(topic: string, context?: string) {
  const client = getClient();
  const basePrompt = [
    `You are Grokipedia, an AI-generated encyclopedia writing about "${topic}".`,
    "Produce 4 concise paragraphs highlighting contested viewpoints, critiques, and any skepticism you detect.",
    "Stay factual, cite data when possible, and close with an outlook paragraph.",
  ];
  if (context) {
    basePrompt.push(
      "The trusted reference text is below. Focus on potential disagreements or missing skepticism relative to it:\n",
    );
    basePrompt.push(clampText(context, 2000));
  }

  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.3,
    messages: [
      {
        role: "system",
        content:
          "You output plain text encyclopedia entries with neutral tone. Avoid markdown headings.",
      },
      {
        role: "user",
        content: basePrompt.join("\n"),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Unable to synthesize the Grokipedia fallback article.");
  }
  return content;
}

type PitchDeckInput = {
  idea: string;
  customer: string;
  problem: string;
  solution: string;
  traction?: string;
};

export async function generatePitchDeckSlides(input: PitchDeckInput) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You create concise venture pitch decks. Respond with JSON: {"slides":[{"title":"","bullets":["",...]},...],"summary":""}. 12-14 slides max.',
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("OpenAI returned an empty pitch deck response.");
  }

  let parsed: { slides?: PitchDeckSlide[]; summary?: string };
  try {
    parsed = JSON.parse(content) as {
      slides?: PitchDeckSlide[];
      summary?: string;
    };
  } catch {
    throw new Error("Pitch deck output was not valid JSON.");
  }

  const slides =
    parsed.slides
      ?.map((slide) => ({
        title: slide.title?.trim() || "Slide",
        bullets: Array.isArray(slide.bullets)
          ? slide.bullets.map((bullet) => bullet.trim()).filter(Boolean)
          : [],
      }))
      .filter((slide) => slide.title && slide.bullets.length) ?? [];

  if (!slides.length) {
    throw new Error("Pitch deck generation returned no slides.");
  }

  return {
    slides,
    summary: parsed.summary ?? slides[0]?.bullets?.[0] ?? "Pitch deck ready.",
  };
}

type OpenAIImageSize =
  | "256x256"
  | "512x512"
  | "1024x1024"
  | "1024x1536"
  | "1536x1024"
  | "1024x1792"
  | "1792x1024";

const IMAGE_SIZE = ((): OpenAIImageSize => {
  const allowed: OpenAIImageSize[] = [
    "256x256",
    "512x512",
    "1024x1024",
    "1024x1536",
    "1536x1024",
    "1024x1792",
    "1792x1024",
  ];
  const candidate = DEFAULT_IMAGE_SIZE as OpenAIImageSize | undefined;
  return candidate && allowed.includes(candidate)
    ? candidate
    : ("1792x1024" as OpenAIImageSize);
})();
const SCRAPE_DIMENSIONS = SCRAPE_IMAGE_SIZE;
const IMAGE_CONTEXT_LIMIT = 360;

export type SlideImageContext = {
  startupName: string;
  missionStatement: string;
  focusRegion: string;
  customerProfile: string;
  brandColor: string;
};

function buildSlideImagePrompt({
  slide,
  context,
}: {
  slide: PitchSlideRecord;
  context: SlideImageContext;
}) {
  const bulletSummary = clampText(slide.bullets.join("; "), IMAGE_CONTEXT_LIMIT);
  const noteSummary = clampText(slide.notes, 200);
  const segments = [
    `Design a cinematic hero image for a modern Google Slides / PowerPoint deck titled "${slide.title}".`,
    `Startup: ${context.startupName}. Mission: ${context.missionStatement}. Audience focus: ${context.customerProfile} in ${context.focusRegion}.`,
    `Visual language: organized grid, clean typography, glassmorphism shadows, ${context.brandColor} as accent with deep contrast.`,
  ];
  if (bulletSummary) {
    segments.push(`Narrative focus: ${bulletSummary}.`);
  }
  if (noteSummary) {
    segments.push(`Tone guide: ${noteSummary}.`);
  }
  segments.push(
    "Render as a 16:9 presentation background, no logos or text, just conceptual imagery.",
  );
  return segments.join(" ");
}

async function generateSlideIllustration({
  slide,
  context,
}: {
  slide: PitchSlideRecord;
  context: SlideImageContext;
}) {
  const client = getClient();
  const response = await client.images.generate({
    model: IMAGE_MODEL,
    prompt: buildSlideImagePrompt({ slide, context }),
    size: IMAGE_SIZE,
    quality: "high",
    response_format: "b64_json",
  });
  const imagePayload = Array.isArray(response.data)
    ? response.data[0]
    : undefined;
  const base64 = imagePayload?.b64_json;
  if (!base64) {
    throw new Error("OpenAI image generation returned no image data.");
  }
  return `data:image/png;base64,${base64}`;
}

async function fetchRemoteImageAsDataUrl(url: string) {
  const response = await fetch(url, {
    headers: { Accept: "image/avif,image/webp,image/png,image/jpeg" },
  });
  if (!response.ok) {
    throw new Error(`Unable to fetch image from ${url}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mime =
    response.headers.get("content-type")?.split(";")[0] || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

async function scrapeSlideImage({
  slide,
  context,
}: {
  slide: PitchSlideRecord;
  context: SlideImageContext;
}) {
  const query = encodeURIComponent(
    `${context.startupName} ${slide.title} ${context.focusRegion} ${slide.bullets
      .slice(0, 2)
      .join(" ")}`.trim(),
  );
  const url = `https://source.unsplash.com/${SCRAPE_DIMENSIONS}/?${query}`;
  return fetchRemoteImageAsDataUrl(url);
}

async function resolveSlideImage(
  strategy: ImageStrategy,
  params: { slide: PitchSlideRecord; context: SlideImageContext },
) {
  if (strategy === "ai") {
    return generateSlideIllustration(params);
  }
  return scrapeSlideImage(params);
}

export async function buildSlideImageAsset({
  slide,
  strategy,
  context,
}: {
  slide: PitchSlideRecord;
  strategy: ImageStrategy;
  context: SlideImageContext;
}) {
  if (strategy === "manual") {
    throw new Error("Manual strategy does not support automatic images.");
  }
  const imageUrl = await resolveSlideImage(strategy, { slide, context });
  return {
    ...slide,
    images: [
      {
        url: imageUrl,
        caption: slide.images[0]?.caption || slide.title,
      },
    ],
  };
}

async function applyImageStrategyToSlides({
  slides,
  strategy,
  context,
}: {
  slides: PitchSlideRecord[];
  strategy: ImageStrategy;
  context: SlideImageContext;
}) {
  if (strategy === "manual") {
    return slides;
  }
  const enriched = await Promise.all(
    slides.map(async (slide) => {
      try {
        const imageUrl = await resolveSlideImage(strategy, { slide, context });
        return {
          ...slide,
          images: [
            {
              url: imageUrl,
              caption: slide.images[0]?.caption || slide.title,
            },
          ],
        };
      } catch (error) {
        console.error(
          `Failed to build image for slide "${slide.title}":`,
          error,
        );
        return slide;
      }
    }),
  );
  return enriched;
}

type AdvancedPitchDeckInput = {
  startupName: string;
  missionStatement: string;
  focusRegion: string;
  customerProfile: string;
  tractionSummary: string;
  goToMarket: string;
  fundingPlan: string;
  brandColor: string;
  businessModel: string;
  imageStrategy: ImageStrategy;
  slides: SlideTemplate[];
  team: PitchTeamMember[];
};

type GeneratedSlide = {
  title?: string;
  subtitle?: string;
  slideType?: string;
  bullets?: string[];
  notes?: string;
  heroImage?: {
    caption?: string;
    suggestion?: string;
  };
};

export async function generateAdvancedPitchDeck(input: AdvancedPitchDeckInput) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.45,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a world-class venture designer. Produce JSON with fields {\"summary\":\"\",\"brandKit\":{\"background\":\"#111827\",\"title\":\"#FFFFFF\",\"bullets\":\"#E5E7EB\",\"note\":\"#CBD5F5\"},\"slides\":[{\"title\":\"\",\"subtitle\":\"\",\"slideType\":\"standard|team\",\"bullets\":[\"\"],\"notes\":\"\",\"heroImage\":{\"caption\":\"\",\"suggestion\":\"\"}}]} }.",
      },
      {
        role: "user",
        content: JSON.stringify({
          ...input,
          slides: input.slides.map((slide) => ({
            id: slide.id,
            title: slide.title,
            prompt: slide.prompt,
          })),
          context: {
            mission: input.missionStatement,
            customerProfile: input.customerProfile,
            focusRegion: input.focusRegion,
            traction: input.tractionSummary,
            goToMarket: input.goToMarket,
            businessModel: input.businessModel,
            capitalPlan: input.fundingPlan,
          },
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Pitch deck generation returned no content.");
  }

  let parsed:
    | {
        summary?: string;
        brandKit?: PitchBrandKit;
        slides?: GeneratedSlide[];
      }
    | undefined;
  try {
    parsed = JSON.parse(content) as {
      summary?: string;
      brandKit?: PitchBrandKit;
      slides?: GeneratedSlide[];
    };
  } catch {
    throw new Error("Advanced pitch deck output was not valid JSON.");
  }

  const brandKit: PitchBrandKit = {
    background: parsed?.brandKit?.background || input.brandColor || "#111827",
    title: parsed?.brandKit?.title || "#FFFFFF",
    bullets: parsed?.brandKit?.bullets || "#F5F5F4",
    note: parsed?.brandKit?.note || "#D1D5DB",
  };

  const slides: PitchSlideRecord[] =
    parsed?.slides?.map((slide, index) => ({
      id: randomUUID(),
      title: slide.title?.trim() || input.slides[index]?.title || "Slide",
      subtitle: slide.subtitle?.trim(),
      slideType: slide.slideType === "team" ? "team" : "standard",
      bullets:
        slide.bullets?.map((bullet) => bullet.trim()).filter(Boolean) ?? [],
      notes: slide.notes?.trim() ?? "",
      images: [
        {
          url: "",
          caption:
            slide.heroImage?.caption ||
            input.slides[index]?.title ||
            `Slide ${index + 1}`,
        },
      ],
      background: brandKit.background,
    })) ?? [];

  if (!slides.length) {
    throw new Error("Advanced pitch deck returned no slides.");
  }

  const slidesWithImages = await applyImageStrategyToSlides({
    slides,
    strategy: input.imageStrategy,
    context: {
      startupName: input.startupName,
      missionStatement: input.missionStatement,
      focusRegion: input.focusRegion,
      customerProfile: input.customerProfile,
      brandColor: brandKit.background,
    },
  });

  return {
    summary:
      parsed?.summary ??
      slidesWithImages[0]?.bullets?.[0] ??
      `${input.startupName} deck ready`,
    brandKit,
    slides: slidesWithImages,
  };
}

type SlideCorrectionInput = {
  instruction: string;
  slide: PitchSlideRecord;
  brief: {
    startupName: string;
    missionStatement: string;
    focusRegion: string;
    customerProfile: string;
    tractionSummary: string;
    goToMarket: string;
    businessModel: string;
    fundingPlan: string;
  };
};

export async function revisePitchDeckSlide(input: SlideCorrectionInput) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are an editor that revises a single pitch deck slide. Respond with JSON {"title":"","subtitle":"","bullets":[],"notes":"","slideType":"standard|team"}.',
      },
      {
        role: "user",
        content: JSON.stringify({
          brief: input.brief,
          slide: input.slide,
          instruction: input.instruction,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Slide correction returned no content.");
  }
  let parsed:
    | {
        title?: string;
        subtitle?: string;
        bullets?: string[];
        notes?: string;
        slideType?: string;
      }
    | undefined;
  try {
    parsed = JSON.parse(content) as {
      title?: string;
      subtitle?: string;
      bullets?: string[];
      notes?: string;
      slideType?: string;
    };
  } catch {
    throw new Error("Slide correction output was not valid JSON.");
  }

  const updated: PitchSlideRecord = {
    ...input.slide,
    title: parsed?.title?.trim() || input.slide.title,
    subtitle: parsed?.subtitle?.trim() || input.slide.subtitle,
    bullets:
      parsed?.bullets?.map((bullet) => bullet.trim()).filter(Boolean) ??
      input.slide.bullets,
    notes: parsed?.notes?.trim() ?? input.slide.notes,
    slideType: parsed?.slideType === "team" ? "team" : "standard",
  };
  return updated;
}

type BusinessPlanInput = {
  idea: string;
  market: string;
  goToMarket: string;
  differentiation: string;
  impact?: string;
};

export async function generateBusinessPlanSections(input: BusinessPlanInput) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You draft concise business plans. Respond with JSON {"sections":[{"heading":"","content":""},...],"summary":""}. Include sections for Overview, Market, GoToMarket, Differentiation, Financials, Impact.',
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Business plan generation returned no content.");
  }

  let parsed: { sections?: BusinessPlanSection[]; summary?: string };
  try {
    parsed = JSON.parse(content) as {
      sections?: BusinessPlanSection[];
      summary?: string;
    };
  } catch {
    throw new Error("Business plan output was not valid JSON.");
  }

  const sections =
    parsed.sections
      ?.map((section) => ({
        heading: section.heading?.trim() || "Section",
        content: section.content?.trim() || "",
      }))
      .filter((section) => section.content.length > 0) ?? [];

  if (!sections.length) {
    throw new Error("Business plan generation returned no sections.");
  }

  return {
    sections,
    summary: parsed.summary ?? sections[0]?.content.slice(0, 200) ?? "",
  };
}

type ResumeInput = {
  fullName: string;
  headline: string;
  achievements: string;
  experience: string;
  focus?: string;
};

export async function generateResumeBlueprint(input: ResumeInput) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.35,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You are an executive resume strategist. Respond with JSON {"headline":"","summary":"","sections":[{"heading":"","bullets":["",...] }],"skills":["",...]}. Each bullet should begin with a strong verb and reference measurable impact.',
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Resume generation returned no content.");
  }

  let parsed: {
    headline?: string;
    summary?: string;
    sections?: ResumeSection[];
    skills?: string[];
  };
  try {
    parsed = JSON.parse(content) as typeof parsed;
  } catch {
    throw new Error("Resume output was not valid JSON.");
  }

  const sections = Array.isArray(parsed.sections)
    ? parsed.sections.map((section) => ({
        heading: section.heading?.trim() || "Section",
        bullets: Array.isArray(section.bullets)
          ? section.bullets.map((bullet) => bullet.trim()).filter(Boolean)
          : [],
      }))
    : [];

  if (!sections.length) {
    throw new Error("Resume generation returned empty sections.");
  }

  return {
    headline: parsed.headline?.trim() || input.headline,
    summary:
      parsed.summary?.trim() || sections[0].bullets[0] || input.achievements,
    sections,
    skills: Array.isArray(parsed.skills)
      ? parsed.skills.map((skill) => skill.trim()).filter(Boolean)
      : [],
  };
}

type SocialPostInput = {
  campaign: string;
  product: string;
  tone: string;
  callToAction: string;
  channels: string[];
  metrics?: string;
};

export async function generateSocialPosts(input: SocialPostInput) {
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature: 0.5,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'You write social campaigns. Respond with JSON {"summary":"","posts":[{"channel":"LinkedIn","hook":"","copy":"","callToAction":"","cadence":"Weekly"}...]}. Max 5 posts. Align copy to the requested tone.',
      },
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("Unable to synthesize social posts.");
  }

  let parsed: { summary?: string; posts?: SocialPostVariant[] };
  try {
    parsed = JSON.parse(content) as typeof parsed;
  } catch {
    throw new Error("Social post output was not valid JSON.");
  }

  const posts = Array.isArray(parsed.posts)
    ? parsed.posts
        .map((post) => ({
          channel: post.channel?.trim() || "Social",
          hook: post.hook?.trim() || "",
          copy: post.copy?.trim() || "",
          callToAction: post.callToAction?.trim(),
          cadence: post.cadence?.trim(),
        }))
        .filter((post) => post.hook && post.copy)
    : [];

  if (!posts.length) {
    throw new Error("Social campaign generation returned no posts.");
  }

  return {
    summary: parsed.summary ?? posts[0].hook,
    posts,
  };
}
type PitchAssistField = keyof Pick<
  PitchWizardDraft,
  | "missionStatement"
  | "focusRegion"
  | "customerProfile"
  | "tractionSummary"
  | "goToMarket"
  | "businessModel"
  | "fundingPlan"
>;

const ASSIST_HINTS: Record<PitchAssistField, string> = {
  missionStatement:
    "Craft a bold mission headline highlighting outcomes and who benefits.",
  focusRegion:
    "Summarize the operating focus, region, or category in 12 words or fewer.",
  customerProfile:
    "Describe the buyer persona, segments, or stakeholders with relevant qualifiers.",
  tractionSummary:
    "List concise metrics or proof points (ARR, pilots, carbon saved, etc.).",
  goToMarket:
    "Highlight launch channels, partnerships, and upcoming milestones in order.",
  businessModel:
    "Explain how money is made, including pricing model and ACV if known.",
  fundingPlan:
    "Explain the raise target, allocation, and 12-month outcomes.",
};

const BUSINESS_PLAN_HINTS = {
  idea: "Write 2 sentences summarizing the product vision, problem, and traction signals.",
  market:
    "Define the target market or buyer segment with size or geography context in one sentence.",
  goToMarket:
    "Lay out the distribution / launch strategy with channels or partners ordered by priority.",
  differentiation:
    "Explain the unique moat, tech, or compliance edge that makes this team defensible.",
  impact:
    "Describe measurable outcomes (jobs created, carbon avoided, SME adoption) in sentence form.",
} satisfies Record<keyof BusinessPlanInput, string>;

const BUSINESS_PLAN_LIMITS: Record<keyof BusinessPlanInput, number> = {
  idea: 1000,
  market: 240,
  goToMarket: 800,
  differentiation: 800,
  impact: 800,
};

const RESUME_HINTS = {
  fullName:
    "Return a polished founder name based on context; echo the existing value if already provided.",
  headline:
    "Write a 5-8 word exec headline highlighting climate/mission focus and priority roles.",
  achievements:
    "List recent wins with concrete metrics or references to badges/DKG notes in 2 sentences.",
  experience:
    "Describe leadership experience or roles in a tight paragraph using action verbs and data.",
  focus:
    "Summarize top sectors, regions, or thesis areas the founder is pursuing.",
} satisfies Record<keyof ResumeInput, string>;

const RESUME_LIMITS: Record<keyof ResumeInput, number> = {
  fullName: 120,
  headline: 160,
  achievements: 800,
  experience: 1200,
  focus: 400,
};

type AchievementInput = AchievementPayload;

const ACHIEVEMENT_HINTS = {
  title:
    "Write a milestone headline that pairs a concrete metric with the beneficiary (e.g. ARR, pilots, regions) in under 12 words.",
  summary:
    "Explain the milestone in 2 crisp sentences that reference the counterparties, proof sources, and why it matters.",
  metrics:
    "List 2-4 KPIs separated by commas (ARR, CAC, retention, carbon impact, etc.) with units.",
  evidenceUrl:
    "Return a single https:// link to a dashboard, press article, or notarized doc that substantiates the milestone.",
  impactArea:
    "Name the sector or impact theme in under 5 words (e.g. SME climate finance, agroforestry Kenya).",
} satisfies Record<keyof AchievementInput, string>;

const ACHIEVEMENT_LIMITS: Record<keyof AchievementInput, number> = {
  title: 160,
  summary: 800,
  metrics: 400,
  evidenceUrl: 400,
  impactArea: 200,
};

type AssistOptions<Field extends string, Payload extends Record<string, unknown>> = {
  assistantName: string;
  field: Field;
  payload: Payload;
  hint: string;
  maxLength?: number;
  temperature?: number;
};

function normalizeAssistSuggestion<Field extends string>(
  raw: string,
  field: Field,
) {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  const fromValue = (value: unknown): string | null => {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const result = fromValue(entry);
        if (result) return result;
      }
      return null;
    }
    if (!value || typeof value !== "object") {
      return null;
    }
    const record = value as Record<string, unknown>;
    if (typeof record[field] === "string") {
      return (record[field] as string).trim();
    }
    if (typeof record.suggestion === "string") {
      return (record.suggestion as string).trim();
    }
    if (typeof record.value === "string") {
      return (record.value as string).trim();
    }
    if (record.draft) {
      const nested = fromValue(record.draft);
      if (nested) return nested;
    }
    if (record.data) {
      const nested = fromValue(record.data);
      if (nested) return nested;
    }
    const firstText = Object.values(record).find(
      (entry) => typeof entry === "string" && entry.trim().length > 0,
    );
    if (typeof firstText === "string") {
      return firstText.trim();
    }
    return null;
  };

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      const extracted = fromValue(parsed);
      if (extracted) {
        return extracted;
      }
    } catch {
      // ignore invalid JSON and fall through to raw text
    }
  }

  return trimmed;
}

async function requestAssistSuggestion<Field extends string, Payload extends Record<string, unknown>>(
  options: AssistOptions<Field, Payload>,
) {
  const { assistantName, field, payload, hint, maxLength, temperature = 0.4 } =
    options;
  const client = getClient();
  const completion = await client.chat.completions.create({
    model: COMPLETIONS_MODEL,
    temperature,
    messages: [
      {
        role: "system",
        content: [
          `You help founders complete the ${assistantName} form.`,
          "Respond with at most two sentences of plain text.",
          hint,
          maxLength ? `Hard limit: ${maxLength} characters.` : "",
        ]
          .filter(Boolean)
          .join(" "),
      },
      {
        role: "user",
        content: JSON.stringify({ field, payload }),
      },
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI suggestion response was empty.");
  }
  const normalized = normalizeAssistSuggestion(text, field);
  if (!normalized) {
    throw new Error("AI suggestion response was empty.");
  }
  return typeof maxLength === "number" && maxLength > 0
    ? clampText(normalized, maxLength)
    : normalized;
}

export async function generatePitchFieldSuggestion(
  field: PitchAssistField,
  draft: Partial<PitchWizardDraft>,
  maxLength?: number,
) {
  return requestAssistSuggestion({
    assistantName: "Pitch Deck Studio",
    field,
    payload: draft,
    hint: ASSIST_HINTS[field],
    maxLength,
  });
}

type BusinessPlanField = keyof BusinessPlanInput;

export async function generateBusinessPlanFieldSuggestion(
  field: BusinessPlanField,
  draft: Partial<BusinessPlanInput>,
) {
  return requestAssistSuggestion({
    assistantName: "Business Plan Lab",
    field,
    payload: draft as Record<string, unknown>,
    hint: BUSINESS_PLAN_HINTS[field],
    maxLength: BUSINESS_PLAN_LIMITS[field],
    temperature: 0.35,
  });
}

type ResumeField = keyof ResumeInput;

export async function generateResumeFieldSuggestion(
  field: ResumeField,
  draft: Partial<ResumeInput>,
) {
  return requestAssistSuggestion({
    assistantName: "Resume & Bio Builder",
    field,
    payload: draft as Record<string, unknown>,
    hint: RESUME_HINTS[field],
    maxLength: RESUME_LIMITS[field],
    temperature: 0.35,
  });
}

type AchievementField = keyof AchievementInput;

export async function generateAchievementFieldSuggestion(
  field: AchievementField,
  draft: Partial<AchievementInput>,
) {
  return requestAssistSuggestion({
    assistantName: "Credentials Studio",
    field,
    payload: draft as Record<string, unknown>,
    hint: ACHIEVEMENT_HINTS[field],
    maxLength: ACHIEVEMENT_LIMITS[field],
    temperature: field === "evidenceUrl" ? 0.2 : 0.35,
  });
}
