"use server";

import { serverEnv } from "@/env/server";
import { slugifyTopic, stripHtml } from "@/lib/alignment/text";
import type { ArticleSnapshot } from "@/types/alignment";

export async function fetchWikipediaArticle(
  topic: string,
): Promise<ArticleSnapshot> {
  const normalizedTopic = topic.trim();
  const slug = slugifyTopic(normalizedTopic) || normalizedTopic;
  const encodedTitle = encodeURIComponent(normalizedTopic);
  const summaryEndpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodedTitle}`;
  const htmlEndpoint = `https://en.wikipedia.org/api/rest_v1/page/html/${encodedTitle}`;
  const headers = {
    "User-Agent": serverEnv.WIKIPEDIA_USER_AGENT,
    Accept: "application/json",
  };

  const summaryResponse = await fetch(summaryEndpoint, {
    headers,
    next: { revalidate: 120 },
  });
  if (summaryResponse.status === 404) {
    throw new Error("Wikipedia did not return an article for that topic.");
  }
  if (!summaryResponse.ok) {
    throw new Error("Failed to fetch Wikipedia summary.");
  }

  const summaryPayload = (await summaryResponse.json()) as {
    title?: string;
    extract?: string;
    description?: string;
    content_urls?: { desktop?: { page?: string } };
    timestamp?: string;
  };

  const targetUrl =
    summaryPayload.content_urls?.desktop?.page ??
    `https://en.wikipedia.org/wiki/${slug}`;
  let plainText = summaryPayload.extract ?? "";
  let htmlSummary = summaryPayload.description ?? "";

  const htmlResponse = await fetch(htmlEndpoint, {
    headers: {
      ...headers,
      Accept: "text/html",
    },
    next: { revalidate: 120 },
  });
  if (htmlResponse.ok) {
    const html = await htmlResponse.text();
    const stripped = stripHtml(html);
    if (stripped.length > 0) {
      plainText = stripped;
      htmlSummary = stripped.split("\n")[0] ?? stripped.slice(0, 280);
    }
  }

  if (!plainText) {
    throw new Error("Wikipedia returned an empty article.");
  }

  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const lastModified = summaryPayload.timestamp ?? null;

  return {
    title: summaryPayload.title ?? normalizedTopic,
    url: targetUrl,
    summary: htmlSummary || plainText.slice(0, 280),
    plainText,
    wordCount,
    lastModified,
    source: "wikipedia",
    references: [targetUrl],
  };
}
