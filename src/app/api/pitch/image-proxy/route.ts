import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import { z } from "zod";

const proxySchema = z.object({
  url: z.string().url(),
});

function isHttpProtocol(url: URL) {
  return url.protocol === "http:" || url.protocol === "https:";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = proxySchema.safeParse({ url: searchParams.get("url") });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid image url" }, { status: 400 });
  }
  const targetUrl = new URL(parsed.data.url);
  if (!isHttpProtocol(targetUrl)) {
    return NextResponse.json({ error: "Unsupported protocol" }, { status: 400 });
  }
  try {
    const upstream = await fetch(targetUrl, { cache: "no-store" });
    if (!upstream.ok) {
      return NextResponse.json({ error: "Unable to fetch image" }, { status: upstream.status });
    }
    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const buffer = Buffer.from(await upstream.arrayBuffer());
    const dataUrl = `data:${contentType};base64,${buffer.toString("base64")}`;
    return NextResponse.json(
      { dataUrl },
      {
        status: 200,
        headers: { "Cache-Control": "public, max-age=300" },
      },
    );
  } catch {
    return NextResponse.json({ error: "Image proxy request failed" }, { status: 502 });
  }
}
