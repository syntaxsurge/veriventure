"use client";

import { forwardRef, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type {
  ImageStrategy,
  PitchDeckRecord,
  PitchSlideRecord,
  PitchTeamMember,
} from "@/types/pitch";
import { cn } from "@/lib/utils";
import {
  buildSlidePalette,
  determineVariant,
  SLIDE_BASE_HEIGHT,
  SLIDE_BASE_WIDTH,
  type ThemeTokens,
  type SlidePalette,
  withAlpha,
} from "@/lib/pitch-theme";
import { exportDeckAsPdf, exportDeckAsPptx } from "@/lib/pitch-export";
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";

type ViewerProps = {
  deck: PitchDeckRecord;
};

type ExportState = "pdf" | "pptx" | null;

const IMAGE_MODES: { value: ImageStrategy; label: string }[] = [
  { value: "manual", label: "Manual upload" },
  { value: "ai", label: "AI render" },
  { value: "scrape", label: "Web search" },
];

const THUMBNAIL_WIDTH = 220;
const THUMBNAIL_SCALE = THUMBNAIL_WIDTH / SLIDE_BASE_WIDTH;
const THUMBNAIL_HEIGHT = SLIDE_BASE_HEIGHT * THUMBNAIL_SCALE;

export function PitchDeckViewer({ deck }: ViewerProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<PitchSlideRecord[]>(deck.slides);
  const teamMembers = deck.team ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [imagePrompt, setImagePrompt] = useState(slides[0]?.notes ?? "");
  const [imageMode, setImageMode] = useState<ImageStrategy>(
    deck.imageStrategy,
  );
  const [imageUrl, setImageUrl] = useState(slides[0]?.images[0]?.url ?? "");
  const [imageCaption, setImageCaption] = useState(
    slides[0]?.images[0]?.caption ?? slides[0]?.title ?? "",
  );
  const [loadingCorrection, setLoadingCorrection] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportState>(null);

  const activeSlide = slides[activeIndex];
  const slideCount = slides.length;

  const theme = useMemo<ThemeTokens>(
    () => ({
      background: deck.brandKit.background || "#111827",
      title: deck.brandKit.title || "#FFFFFF",
      bullets: deck.brandKit.bullets || "#E5E7EB",
      note: deck.brandKit.note || "#9CA3AF",
    }),
    [deck.brandKit],
  );

  useEffect(() => {
    const slide = slides[activeIndex];
    if (!slide) return;
    setImageUrl(slide.images[0]?.url ?? "");
    setImageCaption(slide.images[0]?.caption ?? slide.title);
    setImagePrompt(slide.notes ?? "");
  }, [activeIndex, slides]);

  const handleCorrection = useCallback(async () => {
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
      setSlides((previous) =>
        previous.map((entry) =>
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
  }, [instruction, deck.deckId, activeSlide?.id, router]);

  const handleManualImageUpdate = useCallback(async () => {
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
      setSlides((previous) =>
        previous.map((entry) =>
          entry.id === payload.slide.id ? payload.slide : entry,
        ),
      );
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update image.");
    } finally {
      setLoadingImage(false);
    }
  }, [imageUrl, imageCaption, deck.deckId, activeSlide?.id, router]);

  const handleGenerateImage = useCallback(async () => {
    if (imageMode === "manual") {
      await handleManualImageUpdate();
      return;
    }
    setError(null);
    setLoadingImage(true);
    try {
      const response = await fetch(
        `/api/pitch/decks/${deck.deckId}/slides/${activeSlide.id}/image/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            strategy: imageMode,
            prompt: imagePrompt,
          }),
        },
      );
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(
          typeof payload?.error === "string"
            ? payload.error
            : "Unable to generate image.",
        );
      }
      const payload = (await response.json()) as { slide: PitchSlideRecord };
      setSlides((previous) =>
        previous.map((entry) =>
          entry.id === payload.slide.id ? payload.slide : entry,
        ),
      );
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate slide image.",
      );
    } finally {
      setLoadingImage(false);
    }
  }, [
    imageMode,
    imagePrompt,
    handleManualImageUpdate,
    deck.deckId,
    activeSlide?.id,
    router,
  ]);

  const handleExportPdf = useCallback(async () => {
    if (exporting) return;
    setExporting("pdf");
    setError(null);
    try {
      await exportDeckAsPdf(deck, slides);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export deck as PDF.",
      );
    } finally {
      setExporting(null);
    }
  }, [deck, slides, exporting]);

  const handleExportPptx = useCallback(async () => {
    if (exporting) return;
    setExporting("pptx");
    setError(null);
    try {
      await exportDeckAsPptx(deck, slides);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export deck as PPTX.",
      );
    } finally {
      setExporting(null);
    }
  }, [deck, slides, exporting]);

  if (!activeSlide) {
    return (
      <div className="flex min-h-[400px] items-center justify-center text-sm text-slate-500">
        No slides available for this deck yet.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              className="gap-2"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                Pitch deck workspace
              </p>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{deck.startupName}</h1>
                <Badge variant="secondary">{slideCount} slides</Badge>
                <Badge variant="outline">{deck.imageStrategy} visuals</Badge>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={handleExportPdf}
              disabled={exporting !== null}
            >
              {exporting === "pdf" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export PDF
            </Button>
            <Button
              type="button"
              className="gap-2 bg-primary text-white hover:bg-primary/90"
              onClick={handleExportPptx}
              disabled={exporting !== null}
            >
              {exporting === "pptx" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ImageIcon className="h-4 w-4" />
              )}
              Export PPTX
            </Button>
          </div>
        </div>
      </header>

      {error && (
        <div className="mx-auto max-w-4xl px-4 pt-4">
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
            {error}
          </p>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-24 pt-6 lg:flex-row">
        <aside className="hidden w-64 flex-shrink-0 lg:flex">
          <div className="sticky top-28 h-fit w-full rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Slides
              </p>
              <span className="text-xs text-slate-500">
                {activeIndex + 1}/{slideCount}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {slides.map((slide, index) => (
                <SlideThumbnail
                  key={slide.id}
                  slide={slide}
                  index={index}
                  isActive={index === activeIndex}
                  theme={theme}
                  teamMembers={teamMembers}
                  onSelect={() => setActiveIndex(index)}
                />
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="rounded-3xl bg-transparent">
            <SlideCanvas
              slide={activeSlide}
              theme={theme}
              teamMembers={teamMembers}
              slideIndex={activeIndex}
              size="display"
              isActive
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Card className="space-y-4 rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">AI correction</p>
                  <p className="text-xs text-slate-500">
                    Ask the editor to tighten copy, add proof, or reframe tone.
                  </p>
                </div>
              </div>
              <Textarea
                rows={5}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="Example: Punchier intro with a data point about growth."
              />
              <Button
                type="button"
                className="w-full gap-2"
                onClick={handleCorrection}
                disabled={loadingCorrection}
              >
                {loadingCorrection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Apply revision
              </Button>
            </Card>

            <Card className="space-y-4 rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold">Slide imagery</p>
                  <p className="text-xs text-slate-500">
                    Swap visuals via manual URLs, AI renders, or curated web
                    pulls.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {IMAGE_MODES.map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    size="sm"
                    variant={
                      imageMode === mode.value ? "default" : "outline"
                    }
                    onClick={() => setImageMode(mode.value)}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>

              {imageMode === "manual" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase text-slate-400">
                      Image URL
                    </label>
                    <Input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-slate-400">
                      Caption
                    </label>
                    <Input
                      value={imageCaption}
                      onChange={(event) => setImageCaption(event.target.value)}
                      placeholder="Hero visual label"
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={handleManualImageUpdate}
                    disabled={loadingImage}
                  >
                    {loadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    Save image
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase text-slate-400">
                      Visual direction
                    </label>
                    <Textarea
                      rows={4}
                      value={imagePrompt}
                      onChange={(event) => setImagePrompt(event.target.value)}
                      placeholder="Describe the mood, subjects, or region to highlight."
                    />
                  </div>
                  <Button
                    type="button"
                    className="w-full gap-2"
                    onClick={handleGenerateImage}
                    disabled={loadingImage}
                  >
                    {loadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ImageIcon className="h-4 w-4" />
                    )}
                    {imageMode === "ai" ? "Generate with AI" : "Pull from web"}
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </main>
      </div>

    </div>
  );
}

type SlideThumbnailProps = {
  slide: PitchSlideRecord;
  index: number;
  isActive: boolean;
  theme: ThemeTokens;
  teamMembers: PitchTeamMember[];
  onSelect: () => void;
};

function SlideThumbnail({
  slide,
  index,
  isActive,
  theme,
  teamMembers,
  onSelect,
}: SlideThumbnailProps) {
  const palette = buildSlidePalette(theme);
  const activeBorder = withAlpha(palette.contrast, 0.4);
  const inactiveBorder = withAlpha(palette.contrast, 0.15);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full flex-col gap-2 text-left focus-visible:outline-none"
    >
      <div
        className="relative overflow-hidden rounded-xl border transition-shadow"
        style={{
          width: THUMBNAIL_WIDTH,
          borderColor: isActive ? activeBorder : inactiveBorder,
          boxShadow: isActive
            ? `0 0 0 3px ${withAlpha(palette.contrast, 0.25)}`
            : "none",
        }}
      >
        <SlideCanvas
          slide={slide}
          theme={theme}
          teamMembers={teamMembers}
          slideIndex={index}
          size="thumbnail"
        />
        <span
          className="pointer-events-none absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest"
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            color: "#fff",
          }}
        >
          {index + 1}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-700 line-clamp-1">
          {slide.title}
        </p>
        {slide.bullets[0] && (
          <p className="text-[11px] text-slate-500 line-clamp-1">
            {slide.bullets[0]}
          </p>
        )}
      </div>
    </button>
  );
}

type SlideCanvasProps = {
  slide: PitchSlideRecord;
  theme: ThemeTokens;
  teamMembers: PitchTeamMember[];
  slideIndex: number;
  size?: "display" | "thumbnail" | "export";
  isActive?: boolean;
};

const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ slide, theme, teamMembers, slideIndex, size = "display", isActive }, ref) => {
    const palette = useMemo(() => buildSlidePalette(theme), [theme]);
    const variant = determineVariant(slide, slideIndex);
    const hero = slide.images[0]?.url;
    const caption = slide.images[0]?.caption || slide.title;

    const scale = size === "thumbnail" ? THUMBNAIL_SCALE : 1;

    const wrapperStyle =
      size === "thumbnail"
        ? {
            width: THUMBNAIL_WIDTH,
            height: THUMBNAIL_HEIGHT,
          }
        : size === "export"
        ? { width: SLIDE_BASE_WIDTH, height: SLIDE_BASE_HEIGHT }
        : { width: "100%", aspectRatio: "16 / 9" };

    const overlayA = `radial-gradient(circle at 15% 15%, ${palette.glow}, transparent 55%)`;
    const overlayB = `radial-gradient(circle at 80% 20%, ${withAlpha(
      palette.accent,
      0.25,
    )}, transparent 60%)`;

    const content = (() => {
      switch (variant) {
        case "team":
          return renderTeamLayout(teamMembers, palette, slide);
        case "spotlight":
          return renderSpotlightLayout(slide, hero, caption, palette);
        case "columns":
          return renderColumnsLayout(slide, hero, caption, palette);
        case "statement":
          return renderStatementLayout(slide, hero, caption, palette);
        case "hero":
        default:
          return renderHeroLayout(slide, hero, caption, palette);
      }
    })();

    const borderColor = withAlpha(palette.contrast, size === "thumbnail" ? 0.12 : 0.2);
    const baseShadow = "0 35px 80px rgba(2,6,23,0.45)";
    const activeShadow =
      size === "display" && isActive
        ? `${baseShadow}, 0 0 0 4px ${withAlpha(palette.contrast, 0.25)}`
        : baseShadow;

    return (
      <div
        ref={ref}
        className="relative overflow-hidden transition-all"
        style={{
          ...wrapperStyle,
          borderRadius: size === "thumbnail" ? 16 : 28,
          border: `1px solid ${borderColor}`,
          boxShadow: size === "thumbnail" ? "0 12px 25px rgba(15,23,42,0.18)" : activeShadow,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              variant === "statement"
                ? `linear-gradient(140deg, ${palette.strong}, ${palette.base})`
                : `linear-gradient(135deg, ${palette.base}, ${palette.accent})`,
            transform: size === "thumbnail" ? `scale(${scale})` : undefined,
            transformOrigin: "top left",
            width: size === "thumbnail" ? SLIDE_BASE_WIDTH : "100%",
            height: size === "thumbnail" ? SLIDE_BASE_HEIGHT : "100%",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{ background: overlayA }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-70"
            style={{ background: overlayB }}
          />
          <div className="relative z-10 h-full w-full">{content}</div>
        </div>
      </div>
    );
  },
);

SlideCanvas.displayName = "SlideCanvas";

function renderHeroLayout(
  slide: PitchSlideRecord,
  hero: string | undefined,
  caption: string,
  palette: SlidePalette,
) {
  return (
    <div className="grid h-full gap-8 p-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col justify-between gap-6">
        <div>
          <p
            className="text-[12px] font-semibold uppercase tracking-[0.35em]"
            style={{ color: withAlpha(palette.contrast, 0.75) }}
          >
            {caption}
          </p>
          <h2
            className="mt-3 text-4xl font-semibold leading-tight"
            style={{ color: palette.contrast }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="mt-3 text-base leading-relaxed"
              style={{ color: palette.muted }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>
        <ul className="space-y-3">
          {slide.bullets.map((bullet) => (
            <li
              key={bullet}
              className="rounded-2xl px-4 py-3 text-sm font-medium"
              style={{
                backgroundColor: palette.accentSoft,
                color: palette.contrast,
              }}
            >
              {bullet}
            </li>
          ))}
        </ul>
        {slide.notes && (
          <p
            className="text-sm italic"
            style={{ color: withAlpha(palette.contrast, 0.7) }}
          >
            {slide.notes}
          </p>
        )}
      </div>
      <div className="relative overflow-hidden rounded-3xl">
        <SlideImagePanel hero={hero} caption={caption} palette={palette} />
      </div>
    </div>
  );
}

function renderSpotlightLayout(
  slide: PitchSlideRecord,
  hero: string | undefined,
  caption: string,
  palette: SlidePalette,
) {
  const bullets = slide.bullets.slice(0, 4);
  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <SlideImagePanel hero={hero} caption={caption} palette={palette} variant="wide" />
      <div className="grid gap-4 md:grid-cols-2">
        {bullets.map((bullet, index) => (
          <div
            key={bullet}
            className="rounded-2xl border px-4 py-3 text-sm"
            style={{
              backgroundColor: palette.accentSoft,
              borderColor: withAlpha(palette.contrast, 0.15),
              color: palette.contrast,
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-widest">
              Milestone {index + 1}
            </p>
            <p className="mt-1 leading-relaxed text-sm">{bullet}</p>
          </div>
        ))}
        {!bullets.length && (
          <p style={{ color: palette.muted }}>Add highlights to show momentum.</p>
        )}
      </div>
    </div>
  );
}

function renderColumnsLayout(
  slide: PitchSlideRecord,
  hero: string | undefined,
  caption: string,
  palette: SlidePalette,
) {
  const half = Math.ceil(slide.bullets.length / 2);
  const left = slide.bullets.slice(0, half);
  const right = slide.bullets.slice(half);
  return (
    <div className="grid h-full gap-6 p-8 lg:grid-cols-2">
      <div className="space-y-4">
        <SlideImagePanel hero={hero} caption={caption} palette={palette} variant="portrait" />
        <p
          className="text-sm"
          style={{ color: withAlpha(palette.contrast, 0.8) }}
        >
          {slide.subtitle || slide.notes}
        </p>
      </div>
      <div className="grid gap-4">
        {[left, right].map((bucket, bucketIndex) => (
          <div
            key={bucketIndex}
            className="rounded-3xl border px-4 py-3"
            style={{
              borderColor: withAlpha(palette.contrast, 0.1),
              backgroundColor: withAlpha(palette.base, 0.4),
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: withAlpha(palette.contrast, 0.6) }}
            >
              {bucketIndex === 0 ? "Drivers" : "Proof"}
            </p>
            <ul className="mt-2 space-y-2">
              {bucket.map((bullet) => (
                <li
                  key={bullet}
                  className="text-sm font-medium"
                  style={{ color: palette.contrast }}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderStatementLayout(
  slide: PitchSlideRecord,
  hero: string | undefined,
  caption: string,
  palette: SlidePalette,
) {
  return (
    <div className="flex h-full flex-col justify-between gap-6 p-8">
      <div>
        <p
          className="text-[11px] font-semibold uppercase tracking-[0.5em]"
          style={{ color: withAlpha(palette.contrast, 0.75) }}
        >
          {caption}
        </p>
        <h2
          className="mt-4 text-5xl font-semibold leading-tight"
          style={{ color: palette.contrast }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p
            className="mt-3 max-w-3xl text-lg leading-relaxed"
            style={{ color: palette.muted }}
          >
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {slide.bullets.slice(0, 5).map((bullet) => (
          <span
            key={bullet}
            className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide"
            style={{
              backgroundColor: palette.accentSoft,
              color: palette.contrast,
            }}
          >
            {bullet}
          </span>
        ))}
      </div>
      <SlideImagePanel hero={hero} caption={caption} palette={palette} variant="wide" />
    </div>
  );
}

function renderTeamLayout(
  teamMembers: PitchTeamMember[],
  palette: SlidePalette,
  slide: PitchSlideRecord,
) {
  return (
    <div className="flex h-full flex-col gap-6 p-8">
      <div>
        <p
          className="text-[12px] font-semibold uppercase tracking-[0.35em]"
          style={{ color: withAlpha(palette.contrast, 0.75) }}
        >
          Team
        </p>
        <h2
          className="mt-3 text-4xl font-semibold"
          style={{ color: palette.contrast }}
        >
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="mt-2 text-base" style={{ color: palette.muted }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="grid flex-1 gap-4 md:grid-cols-3">
        {teamMembers.map((member) => (
          <div
            key={member.id}
            className="rounded-2xl border p-4"
            style={{
              borderColor: withAlpha(palette.contrast, 0.2),
              backgroundColor: palette.accentSoft,
              color: palette.contrast,
            }}
          >
            <p className="text-lg font-semibold">{member.name}</p>
            <p className="text-sm" style={{ color: withAlpha(palette.contrast, 0.8) }}>
              {member.role}
            </p>
            <p className="mt-2 text-xs leading-relaxed">{member.expertise}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideImagePanel({
  hero,
  caption,
  palette,
  variant = "standard",
}: {
  hero?: string;
  caption: string;
  palette: SlidePalette;
  variant?: "standard" | "wide" | "portrait";
}) {
  return (
    <div
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl border",
        variant === "wide" && "h-64",
        variant === "portrait" && "h-full",
      )}
      style={{
        borderColor: withAlpha(palette.contrast, 0.12),
        backgroundColor: withAlpha(palette.base, 0.35),
      }}
    >
      {hero ? (
        <img
          src={hero}
          alt={caption}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-12 w-12" style={{ color: palette.muted }} />
        </div>
      )}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
        style={{
          background: `linear-gradient(180deg, transparent, ${withAlpha(
            palette.base,
            0.85,
          )})`,
        }}
      />
      <p
        className="absolute left-4 bottom-4 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
        style={{
          backgroundColor: palette.accentSoft,
          color: palette.contrast,
        }}
      >
        {caption}
      </p>
    </div>
  );
}
