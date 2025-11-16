"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";
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

type ThemeTokens = {
  background: string;
  title: string;
  bullets: string;
  note: string;
};

type ExportState = "pdf" | "pptx" | null;

const IMAGE_MODES: { value: ImageStrategy; label: string }[] = [
  { value: "manual", label: "Manual upload" },
  { value: "ai", label: "AI render" },
  { value: "scrape", label: "Web search" },
];

const PPT_WIDTH = 10;
const PPT_HEIGHT = (PPT_WIDTH * 9) / 16;

export function PitchDeckViewer({ deck }: ViewerProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<PitchSlideRecord[]>(deck.slides);
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
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  const captureSlides = useCallback(async () => {
    const nodes = exportRefs.current.filter(Boolean);
    if (!nodes.length) {
      throw new Error("No slides available for export.");
    }
    const canvases: HTMLCanvasElement[] = [];
    for (const node of nodes) {
      const canvas = await html2canvas(node as HTMLDivElement, {
        scale: 2,
        backgroundColor: null,
      });
      canvases.push(canvas);
    }
    return canvases;
  }, []);

  const handleExportPdf = useCallback(async () => {
    if (exporting) return;
    setExporting("pdf");
    setError(null);
    try {
      const canvases = await captureSlides();
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [1280, 720],
      });
      canvases.forEach((canvas, index) => {
        const imgData = canvas.toDataURL("image/png");
        doc.addImage(imgData, "PNG", 0, 0, 1280, 720);
        if (index < canvases.length - 1) {
          doc.addPage();
        }
      });
      doc.save(`${deck.startupName}-deck.pdf`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export deck as PDF.",
      );
    } finally {
      setExporting(null);
    }
  }, [captureSlides, deck.startupName, exporting]);

  const handleExportPptx = useCallback(async () => {
    if (exporting) return;
    setExporting("pptx");
    setError(null);
    try {
      const canvases = await captureSlides();
      const pptx = new PptxGenJS();
      canvases.forEach((canvas) => {
        const slide = pptx.addSlide();
        const imgData = canvas.toDataURL("image/png");
        slide.addImage({
          data: imgData,
          x: 0,
          y: 0,
          w: PPT_WIDTH,
          h: PPT_HEIGHT,
        });
      });
      await pptx.writeFile({
        fileName: `${deck.startupName}-deck.pptx`,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to export deck as PPTX.",
      );
    } finally {
      setExporting(null);
    }
  }, [captureSlides, deck.startupName, exporting]);

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
              teamMembers={deck.team}
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

      <div
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] top-0"
      >
        {slides.map((slide, index) => (
          <SlideCanvas
            key={`export-${slide.id}`}
            slide={slide}
            theme={theme}
            teamMembers={deck.team}
            size="fixed"
            ref={(element) => {
              exportRefs.current[index] = element;
            }}
          />
        ))}
      </div>
    </div>
  );
}

type SlideThumbnailProps = {
  slide: PitchSlideRecord;
  index: number;
  isActive: boolean;
  onSelect: () => void;
};

function SlideThumbnail({ slide, index, isActive, onSelect }: SlideThumbnailProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isActive
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-slate-200 bg-white/70 hover:border-slate-300",
      )}
    >
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        Slide {index + 1}
      </p>
      <p className="text-sm font-semibold text-slate-900">{slide.title}</p>
      {slide.bullets[0] && (
        <p className="text-xs text-slate-500 line-clamp-2">
          {slide.bullets[0]}
        </p>
      )}
    </button>
  );
}

type SlideCanvasProps = {
  slide: PitchSlideRecord;
  theme: ThemeTokens;
  teamMembers: PitchTeamMember[];
  isActive?: boolean;
  size?: "fluid" | "fixed";
};

const SlideCanvas = forwardRef<HTMLDivElement, SlideCanvasProps>(
  ({ slide, theme, teamMembers, isActive, size = "fluid" }, ref) => {
    const hero = slide.images[0]?.url;
    const caption = slide.images[0]?.caption || slide.title;
    const baseClasses =
      "relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-black/10 shadow-2xl";

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          isActive && "ring-4 ring-primary/40",
          size === "fluid"
            ? "aspect-video w-full"
            : "h-[720px] w-[1280px] bg-transparent",
        )}
        style={{ backgroundColor: theme.background }}
      >
        <div className="absolute inset-0 opacity-40 blur-3xl">
          <div className="absolute -left-10 top-10 h-64 w-64 rounded-full bg-white/20" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-primary/30" />
        </div>
        {slide.slideType === "team" ? (
          <div className="relative z-10 flex h-full flex-col gap-6 p-8 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                {caption}
              </p>
              <h2 className="text-4xl font-semibold" style={{ color: theme.title }}>
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-2 text-base" style={{ color: theme.note }}>
                  {slide.subtitle}
                </p>
              )}
            </div>
            <div className="grid flex-1 gap-4 md:grid-cols-3">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-lg font-semibold">{member.name}</p>
                  <p className="text-sm text-white/80">{member.role}</p>
                  <p className="mt-2 text-xs leading-relaxed text-white/70">
                    {member.expertise}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative z-10 grid h-full gap-6 p-8 md:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex flex-col justify-between text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                  {caption}
                </p>
                <h2 className="text-4xl font-semibold" style={{ color: theme.title }}>
                  {slide.title}
                </h2>
                {slide.subtitle && (
                  <p className="mt-3 text-base leading-relaxed" style={{ color: theme.note }}>
                    {slide.subtitle}
                  </p>
                )}
              </div>
              <ul className="mt-4 space-y-3 text-base leading-relaxed">
                {slide.bullets.map((bullet) => (
                  <li key={bullet} style={{ color: theme.bullets }}>
                    • {bullet}
                  </li>
                ))}
              </ul>
              {slide.notes && (
                <p className="mt-4 text-sm italic" style={{ color: theme.note }}>
                  {slide.notes}
                </p>
              )}
            </div>
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
              {hero ? (
                <img
                  src={hero}
                  alt={caption}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10 text-white/60">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

SlideCanvas.displayName = "SlideCanvas";
