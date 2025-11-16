"use client";

/* eslint-disable @next/next/no-img-element */

import {
  MutableRefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  ImageStrategy,
  PitchDeckRecord,
  PitchSlideRecord,
  SlideTextStyles,
} from "@/types/pitch";
import { exportDeckAsPdf, exportDeckAsPptx } from "@/lib/pitch-export";
import { DECK_PLACEHOLDER_IMAGE } from "@/lib/pitch-constants";
import { withAlpha } from "@/lib/pitch-theme";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  Image as ImageIcon,
  Loader2,
  Palette,
  Play,
  Redo2,
  Sparkles,
  Type,
  Undo2,
  Wand2,
} from "lucide-react";

type ViewerProps = {
  deck: PitchDeckRecord;
};

type ExportState = "pdf" | "pptx" | null;

type BrandColors = {
  background: string;
  title: string;
  bullets: string;
  note: string;
};

const IMAGE_MODES: { value: ImageStrategy; label: string }[] = [
  { value: "manual", label: "Manual upload" },
  { value: "ai", label: "AI render" },
  { value: "scrape", label: "Web search" },
];

const TEXT_SIZE_DEFAULTS = {
  title: 42,
  subtitle: 18,
  bullet: 16,
  note: 14,
} as const;

export function PitchDeckViewer({ deck }: ViewerProps) {
  const router = useRouter();
  const [slides, setSlides] = useState<PitchSlideRecord[]>(deck.slides);
  const [activeIndex, setActiveIndex] = useState(0);
  const [instruction, setInstruction] = useState("");
  const [imagePrompt, setImagePrompt] = useState(slides[0]?.notes ?? "");
  const [imageMode, setImageMode] = useState<ImageStrategy>(deck.imageStrategy);
  const [imageUrl, setImageUrl] = useState(slides[0]?.images[0]?.url ?? "");
  const [imageCaption, setImageCaption] = useState(
    slides[0]?.images[0]?.caption ?? slides[0]?.title ?? "",
  );
  const [loadingCorrection, setLoadingCorrection] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportState>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  const activeSlide = slides[activeIndex];
  const brandColors = useMemo<BrandColors>(
    () => ({
      background: deck.brandKit.background || "#12110D",
      title: deck.brandKit.title || "#FFFFFF",
      bullets: deck.brandKit.bullets || "#F8FAFC",
      note: deck.brandKit.note || "#CBD5F5",
    }),
    [deck.brandKit],
  );

  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (!activeSlide) return;
    setImageUrl(activeSlide.images[0]?.url ?? "");
    setImageCaption(activeSlide.images[0]?.caption ?? activeSlide.title);
    setImagePrompt(activeSlide.notes ?? "");
  }, [activeIndex, slides, activeSlide]);

  useEffect(() => {
    if (activeIndex < slides.length) return;
    setActiveIndex(Math.max(0, slides.length - 1));
  }, [activeIndex, slides.length]);

  const replaceSlide = useCallback((nextSlide: PitchSlideRecord) => {
    setSlides((previous) =>
      previous.map((entry) => (entry.id === nextSlide.id ? nextSlide : entry)),
    );
  }, []);

  const mutateSlide = useCallback(
    (slideId: string, mutator: (slide: PitchSlideRecord) => PitchSlideRecord) => {
      setSlides((previous) =>
        previous.map((entry) => (entry.id === slideId ? mutator(entry) : entry)),
      );
    },
    [],
  );

  const applyToActiveSlide = useCallback(
    (updater: (slide: PitchSlideRecord) => PitchSlideRecord) => {
      if (!activeSlide) return;
      mutateSlide(activeSlide.id, updater);
    },
    [activeSlide, mutateSlide],
  );

  const updateActiveSlideField = useCallback(
    (patch: Partial<PitchSlideRecord>) => {
      applyToActiveSlide((slide) => ({ ...slide, ...patch }));
    },
    [applyToActiveSlide],
  );

  const updateActiveSlideStyles = useCallback(
    (patch: Partial<SlideTextStyles>) => {
      applyToActiveSlide((slide) => {
        const nextStyles = { ...slide.textStyles, ...patch };
        for (const key of Object.keys(nextStyles) as (keyof SlideTextStyles)[]) {
          if (nextStyles[key] === undefined) {
            delete nextStyles[key];
          }
        }
        return {
          ...slide,
          textStyles: Object.keys(nextStyles).length ? nextStyles : undefined,
        };
      });
    },
    [applyToActiveSlide],
  );

  const handleSlideVisible = useCallback((index: number) => {
    setActiveIndex((current) => (current === index ? current : index));
  }, []);

  const scrollToSlide = useCallback((index: number) => {
    const el = slideRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const handleCorrection = useCallback(async () => {
    if (!instruction.trim() || !activeSlide) {
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
      replaceSlide(payload.slide);
      setInstruction("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to correct slide.");
    } finally {
      setLoadingCorrection(false);
    }
  }, [instruction, deck.deckId, activeSlide, router, replaceSlide]);

  const handleManualImageUpdate = useCallback(async () => {
    if (!activeSlide) return;
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
      replaceSlide(payload.slide);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update image.");
    } finally {
      setLoadingImage(false);
    }
  }, [activeSlide, imageUrl, imageCaption, deck.deckId, router, replaceSlide]);

  const handleGenerateImage = useCallback(async () => {
    if (imageMode === "manual") {
      await handleManualImageUpdate();
      return;
    }
    if (!activeSlide) return;
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
      replaceSlide(payload.slide);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate slide image.",
      );
    } finally {
      setLoadingImage(false);
    }
  }, [imageMode, imagePrompt, activeSlide, deck.deckId, router, replaceSlide, handleManualImageUpdate]);

  const handleExportPdf = useCallback(async () => {
    if (exporting) return;
    setExporting("pdf");
    setError(null);
    try {
      await exportDeckAsPdf(deck, slides);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to export deck as PDF.");
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
    <div className="relative flex min-h-screen bg-[#0c0b08] text-white">
      <SlideRail
        deckName={deck.startupName}
        slides={slides}
        activeIndex={activeIndex}
        brandColors={brandColors}
        onSlideSelect={scrollToSlide}
      />

      <div className="flex-1 lg:ml-72">
        <SlideToolbar
          deckName={deck.startupName}
          slideCount={slides.length}
          strategy={deck.imageStrategy}
          status={deck.status}
          exporting={exporting}
          onBack={() => router.push("/ai-assistant/pitch-deck")}
          onExportPdf={handleExportPdf}
          onExportPptx={handleExportPptx}
          onScrollStart={() => scrollToSlide(0)}
        />

        {error && (
          <div className="mx-auto max-w-4xl px-4 pt-4">
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </p>
          </div>
        )}

        <main className="px-4 pb-24 pt-8">
          <section className="mx-auto max-w-6xl space-y-12">
            <SlideStack
              slides={slides}
              brandColors={brandColors}
              activeIndex={activeIndex}
              slideRefs={slideRefs}
              onSlideVisible={handleSlideVisible}
            />
          </section>

          <section className="mx-auto mt-12 flex max-w-6xl flex-col gap-6">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card className="space-y-4 rounded-3xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">AI correction</p>
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
                  <Type className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Manual canvas editor</p>
                    <p className="text-xs text-slate-500">
                      Adjust text, bullets, and palette instantly.
                    </p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <fieldset className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Title
                    </label>
                    <Input
                      value={activeSlide.title}
                      onChange={(event) =>
                        updateActiveSlideField({ title: event.target.value })
                      }
                    />
                  </fieldset>
                  <fieldset className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Subtitle
                    </label>
                    <Input
                      value={activeSlide.subtitle ?? ""}
                      onChange={(event) =>
                        updateActiveSlideField({
                          subtitle: event.target.value || undefined,
                        })
                      }
                      placeholder="Optional supporting sentence"
                    />
                  </fieldset>
                  <fieldset className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Notes
                    </label>
                    <Textarea
                      rows={3}
                      value={activeSlide.notes}
                      onChange={(event) =>
                        updateActiveSlideField({ notes: event.target.value })
                      }
                      placeholder="Presenter notes or context"
                    />
                  </fieldset>
                  <fieldset className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Bullets (one per line)
                    </label>
                    <Textarea
                      rows={4}
                      value={activeSlide.bullets.join("\n")}
                      onChange={(event) => {
                        const lines = event.target.value
                          .split("\n")
                          .map((line) => line.trim())
                          .filter((line) => line.length > 0);
                        updateActiveSlideField({ bullets: lines.length ? lines : [""] });
                      }}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          updateActiveSlideField({
                            bullets: [...activeSlide.bullets, "New idea"],
                          })
                        }
                      >
                        Add bullet
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => updateActiveSlideField({ bullets: [] })}
                      >
                        Clear bullets
                      </Button>
                    </div>
                  </fieldset>
                  <div className="grid gap-4 md:grid-cols-2">
                    <fieldset className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Slide background
                      </label>
                      <Input
                        type="color"
                        value={activeSlide.background || brandColors.background}
                        onChange={(event) =>
                          updateActiveSlideField({ background: event.target.value })
                        }
                      />
                    </fieldset>
                    <fieldset className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Title color
                      </label>
                      <Input
                        type="color"
                        value={activeSlide.textStyles?.titleColor || brandColors.title}
                        onChange={(event) =>
                          updateActiveSlideStyles({ titleColor: event.target.value })
                        }
                      />
                    </fieldset>
                    <fieldset className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Subtitle color
                      </label>
                      <Input
                        type="color"
                        value={activeSlide.textStyles?.subtitleColor || brandColors.note}
                        onChange={(event) =>
                          updateActiveSlideStyles({ subtitleColor: event.target.value })
                        }
                      />
                    </fieldset>
                    <fieldset className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Bullet color
                      </label>
                      <Input
                        type="color"
                        value={activeSlide.textStyles?.bulletColor || brandColors.bullets}
                        onChange={(event) =>
                          updateActiveSlideStyles({ bulletColor: event.target.value })
                        }
                      />
                    </fieldset>
                    <fieldset className="space-y-2">
                      <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Notes color
                      </label>
                      <Input
                        type="color"
                        value={activeSlide.textStyles?.noteColor || brandColors.note}
                        onChange={(event) =>
                          updateActiveSlideStyles({ noteColor: event.target.value })
                        }
                      />
                    </fieldset>
                  </div>
                  <div className="space-y-4">
                    {(["title", "subtitle", "bullet", "note"] as const).map((key) => {
                      const label = `${key.charAt(0).toUpperCase()}${key.slice(1)} size`;
                      const styleKey = `${key}Size` as keyof SlideTextStyles;
                      const current =
                        (activeSlide.textStyles?.[styleKey] as number | undefined) ??
                        TEXT_SIZE_DEFAULTS[key];
                      return (
                        <fieldset key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-semibold uppercase tracking-wide text-slate-400">
                              {label}
                            </span>
                            <span>{Math.round(current)}px</span>
                          </div>
                          <input
                            type="range"
                            min={key === "note" ? 12 : 16}
                            max={key === "title" ? 72 : 48}
                            value={current}
                            onChange={(event) =>
                              updateActiveSlideStyles({
                                [styleKey]: Number(event.target.value),
                              })
                            }
                          />
                        </fieldset>
                      );
                    })}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="justify-start gap-2 text-slate-500 hover:text-slate-900"
                    onClick={() =>
                      updateActiveSlideStyles({
                        titleSize: undefined,
                        subtitleSize: undefined,
                        bulletSize: undefined,
                        noteSize: undefined,
                        captionSize: undefined,
                        titleColor: undefined,
                        subtitleColor: undefined,
                        bulletColor: undefined,
                        noteColor: undefined,
                      })
                    }
                  >
                    <Palette className="h-4 w-4" />
                    Reset typography & colors
                  </Button>
                </div>
              </Card>
            </div>

            <Card className="space-y-4 rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Slide imagery</p>
                  <p className="text-xs text-slate-500">
                    Swap visuals via manual URLs, AI renders, or curated web pulls.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {IMAGE_MODES.map((mode) => (
                  <Button
                    key={mode.value}
                    type="button"
                    size="sm"
                    variant={imageMode === mode.value ? "default" : "outline"}
                    onClick={() => setImageMode(mode.value)}
                  >
                    {mode.label}
                  </Button>
                ))}
              </div>

              {imageMode === "manual" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs uppercase text-slate-400">Image URL</label>
                    <Input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase text-slate-400">Caption</label>
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
          </section>
        </main>
      </div>
    </div>
  );
}

type SlideToolbarProps = {
  deckName: string;
  slideCount: number;
  strategy: ImageStrategy;
  status: PitchDeckRecord["status"];
  exporting: ExportState;
  onBack: () => void;
  onExportPdf: () => void;
  onExportPptx: () => void;
  onScrollStart: () => void;
};

function SlideToolbar({
  deckName,
  slideCount,
  strategy,
  status,
  exporting,
  onBack,
  onExportPdf,
  onExportPptx,
  onScrollStart,
}: SlideToolbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-gradient-to-b from-[#11100c] to-[#0c0b08] px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-4">
          <Button type="button" variant="ghost" className="gap-2 text-white" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
            Back to studio
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Deck workspace</p>
            <div className="flex flex-wrap items-center gap-3 text-white">
              <span className="text-lg font-semibold">{deckName}</span>
              <Badge variant="secondary" className="bg-white/10 text-white">
                {slideCount} slides
              </Badge>
              <Badge variant="outline" className="border-white/30 text-white">
                {strategy} visuals
              </Badge>
              <Badge variant="outline" className="border-emerald-400/40 text-emerald-200">
                {status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ToolbarGhostButton icon={<Undo2 className="h-4 w-4" />} label="Undo" />
          <ToolbarGhostButton icon={<Redo2 className="h-4 w-4" />} label="Redo" />
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-white/30 text-white hover:bg-white/10"
            onClick={onScrollStart}
          >
            <Play className="h-4 w-4" />
            Play
          </Button>
          <Button
            type="button"
            className="gap-2 bg-white text-black hover:bg-white/90"
            onClick={onExportPdf}
            disabled={exporting === "pdf"}
          >
            {exporting === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export PDF
          </Button>
          <Button
            type="button"
            className="gap-2 bg-[#FF5619] text-white hover:bg-[#e14a12]"
            onClick={onExportPptx}
            disabled={exporting === "pptx"}
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
  );
}

type ToolbarGhostButtonProps = {
  icon: ReactNode;
  label: string;
};

function ToolbarGhostButton({ icon, label }: ToolbarGhostButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-widest text-white/70"
      disabled
    >
      {icon}
      {label}
    </button>
  );
}

type SlideRailProps = {
  deckName: string;
  slides: PitchSlideRecord[];
  activeIndex: number;
  brandColors: BrandColors;
  onSlideSelect: (index: number) => void;
};

function SlideRail({ deckName, slides, activeIndex, brandColors, onSlideSelect }: SlideRailProps) {
  const desktopListRef = useRef<HTMLDivElement | null>(null);
  const mobileListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const desktop = desktopListRef.current;
    const mobile = mobileListRef.current;
    if (desktop) {
      const target = desktop.children[activeIndex] as HTMLElement | undefined;
      if (target) {
        const offset = target.offsetTop - desktop.clientHeight / 2 + target.clientHeight / 2;
        desktop.scrollTo({ top: offset, behavior: "smooth" });
      }
    }
    if (mobile) {
      const target = mobile.children[activeIndex] as HTMLElement | undefined;
      if (target) {
        const offset = target.offsetLeft - mobile.clientWidth / 2 + target.clientWidth / 2;
        mobile.scrollTo({ left: offset, behavior: "smooth" });
      }
    }
  }, [activeIndex, slides.length]);

  const accent = withAlpha(brandColors.title, 0.4);
  const muted = withAlpha(brandColors.note, 0.55);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-white/10 bg-[#070605] lg:flex">
        <div className="border-b border-white/10 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Deck</p>
          <p className="text-base font-semibold text-white">{deckName}</p>
          <p className="text-xs text-white/60">Slide navigator</p>
        </div>
        <div ref={desktopListRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;
            const previewImage = slide.images[0]?.url || DECK_PLACEHOLDER_IMAGE;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => onSlideSelect(index)}
                className="group relative w-full overflow-hidden rounded-2xl border text-left transition-all"
                style={{
                  borderColor: isActive ? accent : withAlpha(brandColors.title, 0.15),
                  boxShadow: isActive ? "0 20px 45px rgba(7,5,4,0.75)" : "none",
                  background: `linear-gradient(130deg, ${withAlpha(brandColors.title, 0.08)}, ${withAlpha(
                    brandColors.note,
                    0.05,
                  )})`,
                }}
              >
                {isActive && (
                  <span className="absolute right-2 top-2 z-10 rounded-full bg-white p-1 text-[#0c0b08]">
                    <CheckCircle className="h-4 w-4" />
                  </span>
                )}
                <div className="flex h-32 w-full overflow-hidden">
                  <div className="w-1/2 overflow-hidden">
                    <img
                      src={previewImage}
                      alt={slide.title || `Slide ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div
                    className="flex flex-1 flex-col justify-center px-3 py-3"
                    style={{ backgroundColor: slide.background || brandColors.background }}
                  >
                    <p className="text-sm font-semibold" style={{ color: brandColors.title }}>
                      {slide.title || `Slide ${index + 1}`}
                    </p>
                    {slide.bullets[0] && (
                      <p className="text-xs" style={{ color: muted }}>
                        {slide.bullets[0]}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      <div className="sticky top-[72px] z-20 bg-gradient-to-b from-[#0f0e0b] to-transparent px-4 py-3 lg:hidden">
        <div ref={mobileListRef} className="flex gap-3 overflow-x-auto">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => onSlideSelect(index)}
              className={`min-w-[140px] rounded-xl border px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide ${
                index === activeIndex
                  ? "border-white bg-white/15 text-white"
                  : "border-white/20 text-white/70"
              }`}
            >
              <span className="block text-[10px] font-normal text-white/60">Slide {index + 1}</span>
              {slide.title || `Slide ${index + 1}`}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

type SlideStackProps = {
  slides: PitchSlideRecord[];
  brandColors: BrandColors;
  activeIndex: number;
  slideRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  onSlideVisible: (index: number) => void;
};

function SlideStack({ slides, brandColors, activeIndex, slideRefs, onSlideVisible }: SlideStackProps) {
  useSlideObserver(slides, slideRefs, onSlideVisible);

  return (
    <div className="space-y-12">
      {slides.map((slide, index) => {
        const tokens = createStageTokens(brandColors, slide.background);
        const isActive = index === activeIndex;
        return (
          <article
            key={slide.id}
            ref={(el: HTMLDivElement | null) => {
              slideRefs.current[index] = el;
            }}
            data-index={index}
            className="overflow-hidden rounded-[36px] border transition-all"
            style={{
              backgroundColor: tokens.surface,
              borderColor: isActive ? tokens.borderStrong : tokens.border,
              boxShadow: isActive ? tokens.glowStrong : tokens.glow,
              backgroundImage: tokens.overlay,
            }}
          >
            <SlideSection slide={slide} index={index} brandColors={brandColors} tokens={tokens} />
          </article>
        );
      })}
    </div>
  );
}

type StageTokens = {
  surface: string;
  border: string;
  borderStrong: string;
  glow: string;
  glowStrong: string;
  panel: string;
  panelAccent: string;
  textSoft: string;
  textMuted: string;
  overlay: string;
};

type SlideSectionProps = {
  slide: PitchSlideRecord;
  index: number;
  brandColors: BrandColors;
  tokens: StageTokens;
};

function SlideSection({ slide, index, brandColors, tokens }: SlideSectionProps) {
  if (slide.slideType === "team") {
    return (
      <TeamSlideSection
        slide={slide}
        index={index}
        brandColors={brandColors}
        tokens={tokens}
      />
    );
  }
  return (
    <StandardSlideSection
      slide={slide}
      index={index}
      brandColors={brandColors}
      tokens={tokens}
    />
  );
}

function StandardSlideSection({ slide, index, brandColors, tokens }: SlideSectionProps) {
  const image = slide.images[0]?.url || DECK_PLACEHOLDER_IMAGE;
  const caption = slide.images[0]?.caption || slide.title;
  const isFlipped = index % 2 === 1;
  const bulletCards = slide.bullets.filter((entry) => entry.trim().length > 0);

  return (
    <div className="grid gap-10 px-6 py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
      <div className={`space-y-8 ${isFlipped ? "lg:order-2" : "lg:order-1"}`}>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.35em]" style={{ color: tokens.textSoft }}>
            <span>Slide {index + 1}</span>
            <span className="h-1 w-10 rounded-full" style={{ backgroundColor: tokens.textSoft }} />
            <span>{slide.subtitle ? "Insight" : "Overview"}</span>
          </div>
          <h2 className="text-4xl font-semibold leading-tight" style={{ color: brandColors.title }}>
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p className="text-lg leading-relaxed" style={{ color: brandColors.note }}>
              {slide.subtitle}
            </p>
          )}
        </div>

        {bulletCards.length > 0 && (
          <div
            className={`grid gap-4 ${
              bulletCards.length > 2 ? "sm:grid-cols-2" : "grid-cols-1"
            }`}
          >
            {bulletCards.slice(0, 4).map((bullet, bulletIndex) => (
              <div
                key={`${slide.id}-card-${bulletIndex}`}
                className="rounded-2xl border px-4 py-4 backdrop-blur"
                style={{
                  backgroundColor: tokens.panel,
                  borderColor: tokens.border,
                }}
              >
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.35em]"
                  style={{ color: tokens.textSoft }}
                >
                  Key insight {bulletIndex + 1}
                </p>
                <p
                  className="mt-2 text-base font-medium leading-relaxed"
                  style={{ color: brandColors.bullets }}
                >
                  {bullet}
                </p>
              </div>
            ))}
          </div>
        )}

        {slide.notes && (
          <div
            className="rounded-2xl border px-5 py-4 text-sm italic"
            style={{
              borderColor: tokens.border,
              backgroundColor: tokens.panelAccent,
              color: tokens.textMuted,
            }}
          >
            {slide.notes}
          </div>
        )}
      </div>

      <div className={`space-y-4 ${isFlipped ? "lg:order-1" : "lg:order-2"}`}>
        <div
          className="relative rounded-[34px] border p-1"
          style={{
            borderColor: tokens.border,
            backgroundImage: `linear-gradient(135deg, ${withAlpha(
              brandColors.title,
              0.12,
            )}, ${withAlpha(brandColors.note, 0.06)})`,
          }}
        >
          <div className="relative overflow-hidden rounded-[30px] bg-black/30">
            <img
              src={image}
              alt={caption}
              className="h-full w-full object-cover"
              style={{ minHeight: 320 }}
            />
            {caption && (
              <span
                className="absolute bottom-4 left-5 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em]"
                style={{
                  backgroundColor: withAlpha("#000000", 0.45),
                  color: "#fff",
                }}
              >
                {caption}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSlideSection({ slide, index: _index, brandColors, tokens }: SlideSectionProps) {
  const members = slide.images.length
    ? slide.images
    : [{ url: DECK_PLACEHOLDER_IMAGE, caption: "Team member" }];

  return (
    <div className="space-y-8 px-6 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <p
            className="text-xs uppercase tracking-[0.4em]"
            style={{ color: tokens.textSoft }}
          >
            Leadership collective
          </p>
          <h2 className="text-4xl font-semibold" style={{ color: brandColors.title }}>
            {slide.title}
          </h2>
          {slide.notes && (
            <p className="text-lg leading-relaxed" style={{ color: brandColors.note }}>
              {slide.notes}
            </p>
          )}
        </div>
        {slide.bullets.length > 0 && (
          <div
            className="rounded-3xl border px-5 py-4 text-sm"
            style={{
              borderColor: tokens.border,
              backgroundColor: tokens.panelAccent,
              color: tokens.textMuted,
            }}
          >
            {slide.bullets.map((bullet, idx) => (
              <p key={`${slide.id}-note-${idx}`} className="mb-2 last:mb-0">
                • {bullet}
              </p>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => (
          <div
            key={`${slide.id}-${index}`}
            className="group rounded-[32px] border p-1"
            style={{
              borderColor: tokens.border,
              backgroundImage: tokens.overlay,
            }}
          >
            <div className="rounded-[28px] bg-black/30 p-4 text-white">
              <div className="mb-4 h-40 overflow-hidden rounded-2xl bg-black/30">
                <img
                  src={member.url || DECK_PLACEHOLDER_IMAGE}
                  alt={member.caption || `Team member ${index + 1}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <p className="text-xl font-semibold" style={{ color: brandColors.title }}>
                {member.caption || `Team member ${index + 1}`}
              </p>
              <p
                className="mt-1 text-sm"
                style={{ color: tokens.textMuted }}
              >
                {slide.subtitle || "Core operator"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function useSlideObserver(
  slides: PitchSlideRecord[],
  slideRefs: MutableRefObject<Array<HTMLDivElement | null>>,
  onSlideVisible: (index: number) => void,
) {
  useEffect(() => {
    if (!slides.length) return;
    const nodes = slideRefs.current
      .slice(0, slides.length)
      .filter((node): node is HTMLDivElement => Boolean(node));
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const index = Number(entry.target.getAttribute("data-index"));
          if (!Number.isNaN(index)) {
            onSlideVisible(index);
          }
        });
      },
      { threshold: 0.6 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => {
      nodes.forEach((node) => observer.unobserve(node));
      observer.disconnect();
    };
  }, [slides, slideRefs, onSlideVisible]);
}

function createStageTokens(colors: BrandColors, background?: string): StageTokens {
  const base = background || colors.background;
  return {
    surface: base,
    border: withAlpha(colors.title, 0.22),
    borderStrong: withAlpha(colors.title, 0.55),
    glow: "0 25px 80px rgba(2,6,23,0.35)",
    glowStrong: "0 35px 120px rgba(2,6,23,0.55)",
    panel: withAlpha(colors.title, 0.08),
    panelAccent: withAlpha(colors.note, 0.12),
    textSoft: withAlpha(colors.title, 0.65),
    textMuted: withAlpha(colors.note, 0.85),
    overlay: `radial-gradient(circle at 20% 20%, ${withAlpha(colors.title, 0.12)}, transparent 60%), radial-gradient(circle at 80% 0%, ${withAlpha(colors.note, 0.06)}, transparent 45%)`,
  };
}
