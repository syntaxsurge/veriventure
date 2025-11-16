import { NextResponse } from "next/server";
import { pitchSlideLibrary } from "@/data/pitch-industries";

export function GET() {
  const categories = Array.from(
    pitchSlideLibrary.reduce((set, slide) => {
      set.add(slide.category ?? "General");
      return set;
    }, new Set<string>()),
  );

  return NextResponse.json({
    industries: categories.map((label) => ({
      slug: label.toLowerCase().replace(/[^a-z0-9]+/gi, "-"),
      label,
      summary: `Curated slides focused on ${label.toLowerCase()} narratives.`,
      slideCount: pitchSlideLibrary.filter(
        (slide) => (slide.category ?? "General") === label,
      ).length,
    })),
  });
}
