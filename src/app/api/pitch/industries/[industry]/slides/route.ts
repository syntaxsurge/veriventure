import { NextResponse } from "next/server";
import { getIndustry } from "@/data/pitch-industries";

type RouteContext = {
  params: Promise<{ industry: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { industry: slug } = await context.params;
  const industry = getIndustry(slug);
  if (!industry) {
    return NextResponse.json({ error: "Industry not found." }, { status: 404 });
  }
  return NextResponse.json({
    slides: industry.slides.map((slide) => ({
      id: slide.id,
      title: slide.title,
      description: slide.description,
    })),
  });
}
