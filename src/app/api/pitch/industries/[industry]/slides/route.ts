import { NextResponse } from "next/server";
import { pitchSlideLibrary } from "@/data/pitch-industries";

export function GET() {
  return NextResponse.json({
    slides: pitchSlideLibrary.map((slide) => ({
      id: slide.id,
      title: slide.title,
      description: slide.description,
    })),
  });
}
