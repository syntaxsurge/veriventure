"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PitchDeckRecord, PitchSlideRecord } from "@/types/pitch";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type ViewerProps = {
  deck: PitchDeckRecord;
};

export function PitchDeckViewer({ deck }: ViewerProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<PitchSlideRecord[]>(deck.slides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [imageUrl, setImageUrl] = useState(slides[0]?.images[0]?.url ?? "");
  const [imageCaption, setImageCaption] = useState(
    slides[0]?.images[0]?.caption ?? "",
  );
  const [loadingCorrection, setLoadingCorrection] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;

  const theme = useMemo(
    () => ({
      background: deck.brandKit.background || "#111827",
      title: deck.brandKit.title || "#FFFFFF",
      bullets: deck.brandKit.bullets || "#E5E7EB",
      note: deck.brandKit.note || "#9CA3AF",
    }),
    [deck.brandKit],
  );

  async function handleCorrection() {
    if (!instruction.trim()) {
      setError("Add an instruction before sending.");
      return;
    }
    setError(null);
    setLoadingCorrection(true);
    try {
      const response = await fetch(
        `/api/pitch/decks/${deck.deckId}/slides/${activeSlide.id}/correct`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ instruction }),
        },
      );
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to correct slide.",
        );
      }
      const payload = (await response.json()) as { slide: PitchSlideRecord };
      setSlides((prev) =>
        prev.map((entry) =>
          entry.id === payload.slide.id ? payload.slide : entry,
        ),
      );
      setInstruction("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to correct slide.");
    } finally {
      setLoadingCorrection(false);
    }
  }

  async function handleImageUpdate() {
    if (!imageUrl.trim()) {
      setError("Provide an image URL first.");
      return;
    }
    setError(null);
    setLoadingImage(true);
    try {
      const response = await fetch(
        `/api/pitch/decks/${deck.deckId}/slides/${activeSlide.id}/image`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: imageUrl, caption: imageCaption }),
        },
      );
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to update image.",
        );
      }
      const payload = (await response.json()) as { slide: PitchSlideRecord };
      setSlides((prev) =>
        prev.map((entry) =>
          entry.id === payload.slide.id ? payload.slide : entry,
        ),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update image.");
    } finally {
      setLoadingImage(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="rounded-2xl border bg-card/70 p-4">
        <p className="mb-3 text-sm font-semibold text-muted-foreground">
          Slides ({slideCount})
        </p>
        <div className="space-y-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => {
                setActiveIndex(index);
                setImageUrl(slide.images[0]?.url ?? "");
                setImageCaption(slide.images[0]?.caption ?? "");
              }}
              className={cn(
                "w-full rounded-xl border px-3 py-2 text-left text-sm transition",
                activeIndex === index
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-muted",
              )}
            >
              <span className="block font-semibold">{slide.title}</span>
              {slide.subtitle && (
                <span className="text-xs text-muted-foreground">
                  {slide.subtitle}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      <section className="space-y-6">
        <Card className="overflow-hidden border-none shadow-none">
          <div
            className="rounded-3xl p-8 text-white"
            style={{ backgroundColor: theme.background }}
          >
            <h2
              className="text-3xl font-semibold"
              style={{ color: theme.title }}
            >
              {activeSlide.title}
            </h2>
            {activeSlide.subtitle && (
              <p
                className="mt-2 text-base"
                style={{ color: theme.note }}
              >
                {activeSlide.subtitle}
              </p>
            )}
            <ul className="mt-6 space-y-3">
              {activeSlide.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="text-base leading-relaxed"
                  style={{ color: theme.bullets }}
                >
                  • {bullet}
                </li>
              ))}
            </ul>
            {activeSlide.notes && (
              <p className="mt-6 text-sm" style={{ color: theme.note }}>
                {activeSlide.notes}
              </p>
            )}
          </div>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold">AI correction</p>
            <Textarea
              rows={4}
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Ask for tighter copy, add a metric, etc."
              className="mt-3"
            />
            <Button
              onClick={handleCorrection}
              disabled={loadingCorrection}
              className="mt-3 w-full"
            >
              {loadingCorrection && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send to AI editor
            </Button>
          </div>
          <div className="rounded-2xl border p-4">
            <p className="text-sm font-semibold">Hero image</p>
            <Input
              className="mt-3"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://"
            />
            <Input
              className="mt-2"
              value={imageCaption}
              onChange={(event) => setImageCaption(event.target.value)}
              placeholder="Caption"
            />
            <Button
              variant="outline"
              className="mt-3 w-full"
              onClick={handleImageUpdate}
              disabled={loadingImage}
            >
              {loadingImage && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save image
            </Button>
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </section>
    </div>
  );
}
