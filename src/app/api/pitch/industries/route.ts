import { NextResponse } from "next/server";
import { pitchIndustries } from "@/data/pitch-industries";

export function GET() {
  return NextResponse.json({
    industries: pitchIndustries.map((industry) => ({
      slug: industry.slug,
      label: industry.label,
      summary: industry.summary,
      slideCount: industry.slides.length,
    })),
  });
}
