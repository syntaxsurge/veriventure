export type ArticleSource = "wikipedia" | "grok-live" | "grok-fallback";

export type ArticleSnapshot = {
  title: string;
  url?: string | null;
  summary: string;
  plainText: string;
  wordCount: number;
  lastModified?: string | null;
  source: ArticleSource;
  references: string[];
};

export type DivergenceInsightCategory = "bias" | "omission" | "hallucination";

export type DivergenceInsight = {
  sentence: string;
  category: DivergenceInsightCategory;
  rationale: string;
};

export type SimilaritySummary = {
  cosineScore: number;
  overlapRatio: number;
  readingTimeDelta: number;
  riskLevel: "low" | "medium" | "high";
  uniqueClaims: DivergenceInsight[];
  missingTopics: string[];
  summary: string;
};

export type AlignmentReport = {
  topic: string;
  slug: string;
  wikipedia: ArticleSnapshot;
  grokipedia: ArticleSnapshot;
  similarity: SimilaritySummary;
  references: string[];
  noteTemplate: string;
};
