"use server";

import { cosineSimilarity } from "@/lib/alignment/math";
import {
  normalizeSentence,
  splitSentences,
  topKeywords,
} from "@/lib/alignment/text";
import { createEmbedding } from "@/lib/server/openai";
import type {
  AlignmentReport,
  ArticleSnapshot,
  DivergenceInsight,
  SimilaritySummary,
} from "@/types/alignment";

type ComparisonInput = {
  topic: string;
  slug: string;
  wikipedia: ArticleSnapshot;
  grokipedia: ArticleSnapshot;
};

const biasKeywords = [
  "hoax",
  "fraud",
  "disputed",
  "skeptic",
  "bias",
  "propaganda",
  "agenda",
  "critics",
  "denier",
  "conspiracy",
];

function categorizeClaim(sentence: string): DivergenceInsight["category"] {
  const lower = sentence.toLowerCase();
  if (biasKeywords.some((word) => lower.includes(word))) {
    return "bias";
  }
  if (lower.includes("alleged") || lower.includes("unverified")) {
    return "hallucination";
  }
  return "hallucination";
}

function buildUniqueClaims(
  wikipedia: ArticleSnapshot,
  grokipedia: ArticleSnapshot,
): DivergenceInsight[] {
  const reference = new Set(
    splitSentences(wikipedia.plainText).map(normalizeSentence).filter(Boolean),
  );
  const claims: DivergenceInsight[] = [];
  for (const sentence of splitSentences(grokipedia.plainText)) {
    if (sentence.length < 40) continue;
    const normalized = normalizeSentence(sentence);
    if (!normalized || reference.has(normalized)) continue;
    const category = categorizeClaim(sentence);
    const rationale =
      category === "bias"
        ? "Sentence introduces charged framing not visible in the Wikipedia entry."
        : "Statement does not appear verbatim in the Wikipedia entry.";
    claims.push({ sentence, category, rationale });
    if (claims.length >= 5) break;
  }
  return claims;
}

function buildSimilaritySummary(
  cosineScore: number,
  uniqueClaims: DivergenceInsight[],
  missingTopics: string[],
  readingTimeDelta: number,
): Pick<SimilaritySummary, "riskLevel" | "summary"> {
  const missingSeverity = missingTopics.length;
  const readingSeverity =
    readingTimeDelta >= 3
      ? "major"
      : readingTimeDelta >= 1.5
        ? "moderate"
        : "minor";
  const hasMaterialOmissions =
    missingSeverity >= 3 || readingSeverity === "major";

  if (
    cosineScore >= 0.8 &&
    uniqueClaims.length <= 2 &&
    missingSeverity <= 1 &&
    readingSeverity === "minor"
  ) {
    return {
      riskLevel: "low",
      summary:
        "Both articles align closely; Grokipedia mirrors the human-written focus areas and keeps a similar length.",
    };
  }

  const omissionNote = missingSeverity
    ? `Wikipedia emphasises ${missingTopics.slice(0, 3).join(", ")}, which Grokipedia omits.`
    : "Coverage spans the same focus areas.";
  const readingNote =
    readingSeverity === "major"
      ? "The AI article is significantly shorter, signalling trimmed evidence."
      : readingSeverity === "moderate"
        ? "Slight length delta may indicate light context loss."
        : "Article lengths are nearly identical.";

  if (!hasMaterialOmissions && cosineScore >= 0.6) {
    return {
      riskLevel: "medium",
      summary: `Content largely overlaps, but Grokipedia introduces new claims and drops select sections. ${omissionNote} ${readingNote}`,
    };
  }

  return {
    riskLevel: "high",
    summary: `Substantial divergences detected: new claims surface while ${missingSeverity} Wikipedia topics disappear. ${readingNote}`,
  };
}

function buildNoteTemplate(
  topic: string,
  similarity: SimilaritySummary,
  wikipedia: ArticleSnapshot,
  grokipedia: ArticleSnapshot,
): string {
  const claimSnippet = similarity.uniqueClaims
    .map((claim) => claim.sentence)
    .slice(0, 2)
    .join(" ");
  const missingSnippet = similarity.missingTopics.join(", ");
  const wikiRef = wikipedia.url ?? "https://en.wikipedia.org";
  const grokRef = grokipedia.url ?? "Grokipedia AI fallback";

  return [
    `Compared Wikipedia vs Grokipedia for "${topic}".`,
    `Similarity score: ${(similarity.cosineScore * 100).toFixed(1)}%. Risk: ${
      similarity.riskLevel
    }.`,
    missingSnippet
      ? `Wikipedia emphasizes ${missingSnippet}, which Grokipedia does not cover.`
      : "",
    claimSnippet
      ? `Grokipedia adds: ${claimSnippet}`
      : "Grokipedia did not add substantial new claims.",
    `References: ${wikiRef} | ${grokRef}`,
  ]
    .filter(Boolean)
    .join(" ");
}

export async function buildAlignmentReport(
  input: ComparisonInput,
): Promise<AlignmentReport> {
  const { topic, slug, wikipedia, grokipedia } = input;

  const [wikiEmbedding, grokEmbedding] = await Promise.all([
    createEmbedding(wikipedia.plainText),
    createEmbedding(grokipedia.plainText),
  ]);

  const cosineScore = Number(
    cosineSimilarity(wikiEmbedding, grokEmbedding).toFixed(4),
  );

  const wikiKeywords = topKeywords(wikipedia.plainText, 12);
  const grokKeywords = topKeywords(grokipedia.plainText, 12);

  const overlappingKeywords = wikiKeywords.filter((keyword) =>
    grokKeywords.includes(keyword),
  );
  const overlapRatio = wikiKeywords.length
    ? Number((overlappingKeywords.length / wikiKeywords.length).toFixed(4))
    : 0;

  const missingTopics = wikiKeywords
    .filter((keyword) => !grokKeywords.includes(keyword))
    .slice(0, 6);

  const readingTimeDelta = Number(
    Math.abs(wikipedia.wordCount - grokipedia.wordCount) / 200,
  );

  const uniqueClaims = buildUniqueClaims(wikipedia, grokipedia);
  const summaryBits = buildSimilaritySummary(
    cosineScore,
    uniqueClaims,
    missingTopics,
    readingTimeDelta,
  );

  const similarity: SimilaritySummary = {
    cosineScore,
    overlapRatio,
    readingTimeDelta,
    riskLevel: summaryBits.riskLevel,
    uniqueClaims,
    missingTopics,
    summary: summaryBits.summary,
  };

  const references = [
    ...(wikipedia.references ?? []),
    ...(grokipedia.references ?? []),
  ].filter(Boolean);

  const referenceSet = Array.from(new Set(references));

  return {
    topic,
    slug,
    wikipedia,
    grokipedia,
    similarity,
    references: referenceSet,
    noteTemplate: buildNoteTemplate(topic, similarity, wikipedia, grokipedia),
  };
}
