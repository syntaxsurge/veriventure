"use server";

import { slugifyTopic } from "@/lib/alignment/text";
import type { ArticleSnapshot } from "@/types/alignment";

type WikipediaPage = {
  title: string;
  extract?: string;
  contentmodel?: string;
  fullurl?: string;
  touched?: string;
  revisions?: { timestamp: string }[];
};

export async function fetchWikipediaArticle(
  topic: string,
): Promise<ArticleSnapshot> {
  const slug = slugifyTopic(topic) || topic.trim().toLowerCase();
  const params = new URLSearchParams({
    action: "query",
    prop: "extracts|info|revisions",
    explaintext: "1",
    format: "json",
    formatversion: "2",
    redirects: "1",
    titles: topic,
    inprop: "url",
    rvprop: "timestamp",
    rvlimit: "1",
  });

  const endpoint = `https://en.wikipedia.org/w/api.php?${params.toString()}`;
  const response = await fetch(endpoint, {
    headers: { "User-Agent": "VeriVenture/1.0 (https://veriventure.app)" },
    next: { revalidate: 60 },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch Wikipedia content.");
  }
  const payload = (await response.json()) as {
    query?: { pages?: WikipediaPage[] };
  };
  const page = payload.query?.pages?.[0];
  if (!page || page.extract === undefined) {
    throw new Error("Wikipedia did not return an article for that topic.");
  }

  const plainText = page.extract ?? "";
  const summary = plainText.split("\n")[0] ?? "";
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const lastModified = page.revisions?.[0]?.timestamp ?? page.touched ?? null;

  return {
    title: page.title ?? topic,
    url: page.fullurl ?? `https://en.wikipedia.org/wiki/${slug}`,
    summary,
    plainText,
    wordCount,
    lastModified,
    source: "wikipedia",
    references: [page.fullurl ?? `https://en.wikipedia.org/wiki/${slug}`],
  };
}
