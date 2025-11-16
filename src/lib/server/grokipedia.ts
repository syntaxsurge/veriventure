"use server";

import { generateAiArticle } from "@/lib/server/openai";
import { slugifyTopic, stripHtml } from "@/lib/alignment/text";
import type { ArticleSnapshot } from "@/types/alignment";

type FetchOptions = {
  referenceText?: string;
};

const DEFAULT_USER_AGENT =
  process.env.GROKIPEDIA_USER_AGENT?.trim() ??
  "VeriVenture/1.0 (+https://veriventure.app)";

async function attemptLiveArticle(
  topic: string,
): Promise<ArticleSnapshot | null> {
  const baseUrl = process.env.GROKIPEDIA_BASE_URL?.trim();
  if (!baseUrl) {
    return null;
  }
  const slug = slugifyTopic(topic) || encodeURIComponent(topic.trim());
  const url = `${baseUrl.replace(/\/$/, "")}/${slug}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": DEFAULT_USER_AGENT,
      Accept: "text/html",
    },
  });
  if (!response.ok) {
    return null;
  }
  const html = await response.text();
  if (/cf-chl/i.test(html) || html.includes("Just a moment")) {
    return null;
  }

  const plainText = stripHtml(html);
  const summary = plainText.split("\n")[0] ?? plainText.slice(0, 280);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  return {
    title: `Grokipedia: ${topic}`,
    url,
    summary,
    plainText,
    wordCount,
    lastModified: null,
    source: "grok-live",
    references: [url],
  };
}

export async function fetchGrokipediaArticle(
  topic: string,
  options?: FetchOptions,
): Promise<ArticleSnapshot> {
  const live = await attemptLiveArticle(topic);
  if (live) {
    return live;
  }
  const fallbackText = await generateAiArticle(topic, options?.referenceText);
  const summary = fallbackText.split("\n")[0] ?? fallbackText.slice(0, 280);
  const wordCount = fallbackText.split(/\s+/).filter(Boolean).length;
  return {
    title: `Grokipedia (AI) – ${topic}`,
    url: null,
    summary,
    plainText: fallbackText,
    wordCount,
    lastModified: null,
    source: "grok-fallback",
    references: [],
  };
}
