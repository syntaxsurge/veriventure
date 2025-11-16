"use server";

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "that",
  "the",
  "this",
  "to",
  "was",
  "with",
  "their",
  "which",
  "these",
  "those",
  "through",
  "into",
  "about",
  "across",
  "also",
  "such",
  "can",
  "will",
  "may",
  "not",
]);

export function slugifyTopic(topic: string) {
  return topic
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(input: string) {
  return input
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function splitSentences(text: string) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

export function normalizeSentence(sentence: string) {
  return sentence
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function topKeywords(text: string, limit = 8) {
  const counts = new Map<string, number>();
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
}

export function clampText(input: string, maxLength: number) {
  if (input.length <= maxLength) {
    return input;
  }
  return input.slice(0, maxLength);
}
