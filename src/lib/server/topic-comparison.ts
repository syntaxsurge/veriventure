"use server";

import { slugifyTopic } from "@/lib/alignment/text";
import { buildAlignmentReport } from "@/lib/alignment/analysis";
import { fetchGrokipediaArticle } from "@/lib/server/grokipedia";
import { fetchWikipediaArticle } from "@/lib/server/wikipedia";

export async function analyzeTopic(topic: string) {
  const normalizedTopic = topic.trim();
  if (!normalizedTopic) {
    throw new Error("Topic is required.");
  }
  const slug = slugifyTopic(normalizedTopic);
  const wikipedia = await fetchWikipediaArticle(normalizedTopic);
  const grokipedia = await fetchGrokipediaArticle(normalizedTopic, {
    referenceText: wikipedia.plainText,
  });

  const report = await buildAlignmentReport({
    topic: normalizedTopic,
    slug,
    wikipedia,
    grokipedia,
  });

  return report;
}
