"use server";

import OpenAI from "openai";
import { clampText } from "@/lib/alignment/text";
import type {
  BusinessPlanSection,
  PitchDeckSlide,
  ResumeSection,
  SocialPostVariant,
} from "@/types/document";

let cachedClient: OpenAI | null = null;

function getClient() {
  if (cachedClient) {
    return cachedClient;
  }
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY must be configured to run the Truth Alignment Lab.",
    );
  }
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

export async function createEmbedding(text: string) {
  const client = getClient();
  const trimmed = clampText(text, 8000);
  const response = await client.embeddings.create({
    model: process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small",
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
    model: process.env.OPENAI_COMPLETIONS_MODEL ?? "gpt-4o-mini",
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
    model: process.env.OPENAI_COMPLETIONS_MODEL ?? "gpt-4o-mini",
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
    model: process.env.OPENAI_COMPLETIONS_MODEL ?? "gpt-4o-mini",
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
    model: process.env.OPENAI_COMPLETIONS_MODEL ?? "gpt-4o-mini",
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
    model: process.env.OPENAI_COMPLETIONS_MODEL ?? "gpt-4o-mini",
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
