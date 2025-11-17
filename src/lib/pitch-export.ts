import { jsPDF } from "jspdf";
import PptxGenJS from "pptxgenjs";
import type {
  PitchDeckRecord,
  PitchSlideRecord,
  SlideTextStyles,
} from "@/types/pitch";
import {
  buildSlidePalette,
  hexToRgbTuple,
  SLIDE_BASE_HEIGHT,
  SLIDE_BASE_WIDTH,
  type ThemeTokens,
} from "@/lib/pitch-theme";
import { DECK_PLACEHOLDER_IMAGE } from "@/lib/pitch-constants";

function buildDeckTheme(deck: PitchDeckRecord): ThemeTokens {
  return {
    background: deck.brandKit.background || deck.brandColor || "#111827",
    title: deck.brandKit.title || "#FFFFFF",
    bullets: deck.brandKit.bullets || "#E5E7EB",
    note: deck.brandKit.note || "#9CA3AF",
  };
}

const SLIDE_FONT_KEYS = {
  title: "titleSize",
  subtitle: "subtitleSize",
  bullet: "bulletSize",
  note: "noteSize",
  caption: "captionSize",
} as const satisfies Record<string, keyof SlideTextStyles>;

const PDF_FONT_DEFAULTS = {
  title: 42,
  subtitle: 22,
  bullet: 20,
  note: 16,
  caption: 14,
} as const;

const PPT_FONT_DEFAULTS = {
  title: 36,
  subtitle: 18,
  bullet: 20,
  note: 14,
  caption: 12,
} as const;

function resolveHeroSource(slide: PitchSlideRecord) {
  const url = slide.images[0]?.url?.trim();
  return url ? url : DECK_PLACEHOLDER_IMAGE;
}

function resolveSlideTheme(theme: ThemeTokens, slide: PitchSlideRecord): ThemeTokens {
  return {
    background: slide.background || theme.background,
    title: slide.textStyles?.titleColor || theme.title,
    bullets: slide.textStyles?.bulletColor || theme.bullets,
    note: slide.textStyles?.noteColor || theme.note,
  };
}

function resolveFontSize(
  styles: SlideTextStyles | undefined,
  key: keyof typeof SLIDE_FONT_KEYS,
  fallback: number,
) {
  const styleKey = SLIDE_FONT_KEYS[key];
  const value = styles?.[styleKey];
  return typeof value === "number" ? value : fallback;
}

const imageCache = new Map<string, string>();

type TeamCard = {
  title: string;
  role: string;
  image: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rgbChannelToHex(value: number) {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
}

function rgbToHexString(r: number, g: number, b: number) {
  return `#${rgbChannelToHex(r)}${rgbChannelToHex(g)}${rgbChannelToHex(b)}`;
}

function lightenHex(hex: string, intensity: number) {
  const [r, g, b] = hexToRgbTuple(hex);
  const ratio = clamp(intensity, 0, 1);
  return rgbToHexString(
    r + (255 - r) * ratio,
    g + (255 - g) * ratio,
    b + (255 - b) * ratio,
  );
}

function buildTeamCards(slide: PitchSlideRecord, deck: PitchDeckRecord): TeamCard[] {
  if (slide.images.length) {
    return slide.images.map((member, index) => ({
      title: member.caption || `Team member ${index + 1}`,
      role: slide.bullets[index] || "Core operator",
      image: member.url || DECK_PLACEHOLDER_IMAGE,
    }));
  }
  if (deck.team?.length) {
    return deck.team.map((member, index) => ({
      title: member.name || `Team member ${index + 1}`,
      role: member.role || member.expertise || "Operator",
      image: DECK_PLACEHOLDER_IMAGE,
    }));
  }
  return [
    {
      title: "Team member",
      role: "Lead",
      image: DECK_PLACEHOLDER_IMAGE,
    },
  ];
}

async function resolveImageData(url?: string) {
  if (!url) return null;
  if (url.startsWith("data:")) return url;
  if (imageCache.has(url)) return imageCache.get(url) ?? null;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(typeof reader.result === "string" ? reader.result : "");
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    imageCache.set(url, dataUrl);
    return dataUrl;
  } catch {
    return null;
  }
}

export async function exportDeckAsPdf(deck: PitchDeckRecord, slides: PitchSlideRecord[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [SLIDE_BASE_WIDTH, SLIDE_BASE_HEIGHT],
    compress: true,
  });
  const baseTheme = buildDeckTheme(deck);

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index]!;
    if (index > 0) {
      doc.addPage([SLIDE_BASE_WIDTH, SLIDE_BASE_HEIGHT], "landscape");
    }

    const slideTheme = resolveSlideTheme(baseTheme, slide);
    const palette = buildSlidePalette(slideTheme);
    const caption = slide.images[0]?.caption || slide.title;
    const subtitleColor = slide.textStyles?.subtitleColor || palette.muted;
    const bulletColor = slide.textStyles?.bulletColor || palette.contrast;
    const noteColor = slide.textStyles?.noteColor || palette.muted;
    const titleSize = resolveFontSize(slide.textStyles, "title", PDF_FONT_DEFAULTS.title);
    const subtitleSize = resolveFontSize(
      slide.textStyles,
      "subtitle",
      PDF_FONT_DEFAULTS.subtitle,
    );
    const bulletSize = resolveFontSize(slide.textStyles, "bullet", PDF_FONT_DEFAULTS.bullet);
    const noteSize = resolveFontSize(slide.textStyles, "note", PDF_FONT_DEFAULTS.note);
    const captionSize = resolveFontSize(slide.textStyles, "caption", PDF_FONT_DEFAULTS.caption);

    const [baseR, baseG, baseB] = hexToRgbTuple(palette.base);
    doc.setFillColor(baseR, baseG, baseB);
    doc.rect(0, 0, SLIDE_BASE_WIDTH, SLIDE_BASE_HEIGHT, "F");

    if (slide.slideType === "team") {
      await renderPdfTeamSlide(doc, slide, palette, deck);
      continue;
    }

    const horizontalPadding = 70;
    const verticalPadding = 90;
    const gutter = 60;
    const availableWidth = SLIDE_BASE_WIDTH - horizontalPadding * 2;
    const availableHeight = SLIDE_BASE_HEIGHT - verticalPadding * 2;
    let textWidth = availableWidth * 0.56;
    if (availableWidth - textWidth - gutter < 280) {
      textWidth = availableWidth - gutter - 280;
    }
    const textPanel = {
      x: horizontalPadding,
      y: verticalPadding,
      width: textWidth,
      height: availableHeight,
    };
    const imagePanel = {
      x: textPanel.x + textPanel.width + gutter,
      y: verticalPadding,
      width: availableWidth - textWidth - gutter,
      height: availableHeight,
    };

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgbTuple(palette.contrast));
    doc.setFontSize(titleSize);
    doc.text(slide.title, textPanel.x, textPanel.y + 50, {
      maxWidth: textPanel.width - 60,
    });

    let cursorY = textPanel.y + 50 + titleSize + 24;

    if (slide.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(subtitleSize);
      doc.setTextColor(...hexToRgbTuple(subtitleColor));
      doc.text(slide.subtitle, textPanel.x, cursorY, {
        maxWidth: textPanel.width - 60,
      });
      cursorY += subtitleSize + 20;
    }

    const bulletEntries = slide.bullets
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const [bulletR, bulletG, bulletB] = hexToRgbTuple(bulletColor);
    let bulletCursor = cursorY;
    let bulletAreaBottom = cursorY;

    if (bulletEntries.length) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bulletSize);
      doc.setTextColor(bulletR, bulletG, bulletB);
      const bulletIndent = 30;
      bulletEntries.forEach((bullet) => {
        const lines = doc.splitTextToSize(bullet, textPanel.width - bulletIndent - 20);
        doc.text("•", textPanel.x, bulletCursor, { baseline: "top" });
        doc.text(lines, textPanel.x + bulletIndent, bulletCursor, {
          maxWidth: textPanel.width - bulletIndent,
          lineHeightFactor: 1.4,
          baseline: "top",
        });
        const blockHeight = lines.length * bulletSize * 0.9 + bulletSize;
        bulletCursor += blockHeight + 18;
        bulletAreaBottom = bulletCursor;
      });
    }

    if (slide.notes) {
      const noteY = Math.min(
        textPanel.y + textPanel.height - noteSize - 12,
        bulletAreaBottom + 20,
      );
      doc.setFont("helvetica", "italic");
      doc.setFontSize(noteSize);
      doc.setTextColor(...hexToRgbTuple(noteColor));
      doc.text(slide.notes, textPanel.x, noteY, {
        maxWidth: textPanel.width - 20,
        lineHeightFactor: 1.4,
      });
    }

    const imageData = await resolveImageData(resolveHeroSource(slide));
    if (imageData) {
      const format = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";
      const properties = doc.getImageProperties(imageData);
      const captionReserve = caption ? 70 : 0;
      const maxWidth = imagePanel.width;
      const maxHeight = imagePanel.height - captionReserve;
      const scale = Math.min(maxWidth / properties.width, maxHeight / properties.height, 1);
      const imageWidth = properties.width * scale;
      const imageHeight = properties.height * scale;
      const imageX = imagePanel.x + (maxWidth - imageWidth) / 2;
      const imageY = imagePanel.y + (maxHeight - imageHeight) / 2;
      doc.addImage(imageData, format, imageX, imageY, imageWidth, imageHeight);
    }

    if (caption) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(captionSize);
      doc.setTextColor(...hexToRgbTuple(palette.contrast));
      doc.text(caption, imagePanel.x, imagePanel.y + imagePanel.height - 30, {
        maxWidth: imagePanel.width,
      });
    }
  }
  doc.save(`${deck.startupName}-deck.pdf`);
}

async function renderPdfTeamSlide(
  doc: jsPDF,
  slide: PitchSlideRecord,
  palette: ReturnType<typeof buildSlidePalette>,
  deck: PitchDeckRecord,
) {
  const cards = buildTeamCards(slide, deck).slice(0, 6);
  const headerX = 70;
  const headerY = 110;
  const [panelR, panelG, panelB] = hexToRgbTuple(lightenHex(palette.base, 0.08));
  const [strokeR, strokeG, strokeB] = hexToRgbTuple(lightenHex(palette.contrast, 0.35));
  doc.setFillColor(panelR, panelG, panelB);
  doc.setDrawColor(strokeR, strokeG, strokeB);
  doc.roundedRect(50, 70, SLIDE_BASE_WIDTH - 100, SLIDE_BASE_HEIGHT - 140, 40, 40, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(...hexToRgbTuple(palette.contrast));
  doc.text(slide.title, headerX, headerY);

  if (slide.notes) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    doc.setTextColor(...hexToRgbTuple(palette.muted));
    doc.text(slide.notes, headerX, headerY + 30, {
      maxWidth: SLIDE_BASE_WIDTH - 140,
    });
  }

  const columns = 3;
  const gap = 30;
  const cardWidth = (SLIDE_BASE_WIDTH - 2 * headerX - gap * (columns - 1)) / columns;
  const cardHeight = 240;
  const imageHeight = 130;
  const startY = 220;

  for (let idx = 0; idx < cards.length; idx += 1) {
    const card = cards[idx]!;
    const column = idx % columns;
    const row = Math.floor(idx / columns);
    const cardX = headerX + column * (cardWidth + gap);
    const cardY = startY + row * (cardHeight + 30);
    doc.setFillColor(panelR, panelG, panelB);
    doc.setDrawColor(strokeR, strokeG, strokeB);
    doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 24, 24, "FD");

    const imageData = await resolveImageData(card.image);
    if (imageData) {
      const format = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";
      const props = doc.getImageProperties(imageData);
      const scale = Math.min((cardWidth - 40) / props.width, imageHeight / props.height);
      const width = props.width * scale;
      const height = props.height * scale;
      const imageX = cardX + (cardWidth - width) / 2;
      const imageY = cardY + 20;
      doc.addImage(imageData, format, imageX, imageY, width, height);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...hexToRgbTuple(palette.contrast));
    doc.text(card.title, cardX + 24, cardY + imageHeight + 60, {
      maxWidth: cardWidth - 48,
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.setTextColor(...hexToRgbTuple(palette.muted));
    doc.text(card.role, cardX + 24, cardY + imageHeight + 90, {
      maxWidth: cardWidth - 48,
    });
  }
}

export async function exportDeckAsPptx(
  deck: PitchDeckRecord,
  slides: PitchSlideRecord[],
) {
  const pptx = new PptxGenJS();
  const baseTheme = buildDeckTheme(deck);
  const slideWidth = pptx.presLayout.width;
  const slideHeight = pptx.presLayout.height;
  const horizontalPadding = Math.max(slideWidth * 0.05, 0.4);
  const verticalPadding = Math.max(slideHeight * 0.08, 0.4);
  const gutter = 0.4;

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index]!;
    const pptSlide = pptx.addSlide();
    const slideTheme = resolveSlideTheme(baseTheme, slide);
    const palette = buildSlidePalette(slideTheme);
    const subtitleColor = slide.textStyles?.subtitleColor || palette.muted;
    const bulletColor = slide.textStyles?.bulletColor || palette.contrast;
    const noteColor = slide.textStyles?.noteColor || palette.muted;
    const titleSize = resolveFontSize(slide.textStyles, "title", PPT_FONT_DEFAULTS.title);
    const subtitleSize = resolveFontSize(
      slide.textStyles,
      "subtitle",
      PPT_FONT_DEFAULTS.subtitle,
    );
    const bulletSize = resolveFontSize(slide.textStyles, "bullet", PPT_FONT_DEFAULTS.bullet);
    const noteSize = resolveFontSize(slide.textStyles, "note", PPT_FONT_DEFAULTS.note);
    const captionSize = resolveFontSize(
      slide.textStyles,
      "caption",
      PPT_FONT_DEFAULTS.caption,
    );
    const caption = slide.images[0]?.caption || slide.title;
    pptSlide.background = { color: slideTheme.background };

    if (slide.slideType === "team") {
      await renderPptTeamSlide(pptSlide, slide, palette, deck);
      continue;
    }

    const innerWidth = slideWidth - horizontalPadding * 2;
    const innerHeight = slideHeight - verticalPadding * 2;
    let textWidth = innerWidth * 0.56;
    let imageWidth = innerWidth - textWidth - gutter;
    if (imageWidth < innerWidth * 0.32) {
      imageWidth = innerWidth * 0.32;
      textWidth = innerWidth - imageWidth - gutter;
    }
    const textPanel = {
      x: horizontalPadding,
      y: verticalPadding,
      w: textWidth,
      h: innerHeight,
    };
    const imagePanel = {
      x: textPanel.x + textPanel.w + gutter,
      y: verticalPadding,
      w: innerWidth - textWidth - gutter,
      h: innerHeight,
    };

    pptSlide.addText(slide.title, {
      x: textPanel.x,
      y: textPanel.y,
      w: textPanel.w - 0.4,
      fontSize: titleSize,
      bold: true,
      color: palette.contrast,
      fontFace: "Helvetica",
    });

    let blockY = textPanel.y + 0.9;

    if (slide.subtitle) {
      pptSlide.addText(slide.subtitle, {
        x: textPanel.x,
        y: blockY,
        w: textPanel.w - 0.4,
        fontSize: subtitleSize,
        color: subtitleColor,
        fontFace: "Helvetica",
      });
      blockY += subtitleSize / 72 + 0.4;
    }

    const bulletEntries = slide.bullets
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    const noteSlotHeight = slide.notes ? Math.min(1.1, textPanel.h * 0.25) : 0;
    const bulletAreaHeight = Math.max(
      textPanel.h - (blockY - textPanel.y) - noteSlotHeight,
      0.1,
    );

    if (bulletEntries.length && bulletAreaHeight > 0.1) {
      const bulletRuns = bulletEntries.map((entry) => ({
        text: entry,
        options: {
          bullet: true,
          color: bulletColor,
          fontFace: "Helvetica",
          fontSize: bulletSize,
          paraSpaceAfter: 6,
        },
      }));

      pptSlide.addText(bulletRuns, {
        x: textPanel.x,
        y: blockY,
        w: textPanel.w,
        h: bulletAreaHeight,
        fit: "shrink",
        margin: 0,
      });
    }

    if (slide.notes) {
      const noteY = textPanel.y + textPanel.h - noteSlotHeight;
      pptSlide.addText(slide.notes, {
        x: textPanel.x,
        y: noteY,
        w: textPanel.w,
        h: Math.max(noteSlotHeight - 0.1, 0.6),
        fontSize: noteSize,
        color: noteColor,
        italic: true,
        fontFace: "Helvetica",
      });
    }

    const imageData = await resolveImageData(resolveHeroSource(slide));
    const captionReserve = caption ? Math.min(0.5, imagePanel.h * 0.18) : 0;
    const heroHeight = imagePanel.h - captionReserve;
    if (imageData) {
      pptSlide.addImage({
        data: imageData,
        x: imagePanel.x,
        y: imagePanel.y,
        w: imagePanel.w,
        h: heroHeight,
        sizing: {
          type: "contain",
          w: imagePanel.w,
          h: heroHeight,
        },
      });
    }

    if (caption) {
      pptSlide.addText(caption, {
        x: imagePanel.x,
        y: imagePanel.y + heroHeight + 0.1,
        w: imagePanel.w,
        fontSize: captionSize,
        color: palette.contrast,
        bold: true,
        fontFace: "Helvetica",
      });
    }
  }

  await pptx.writeFile({ fileName: `${deck.startupName}-deck.pptx` });
}

async function renderPptTeamSlide(
  pptSlide: PptxGenJS.Slide,
  slide: PitchSlideRecord,
  palette: ReturnType<typeof buildSlidePalette>,
  deck: PitchDeckRecord,
) {
  pptSlide.addShape("roundRect", {
    x: 0.4,
    y: 0.4,
    w: 12.4,
    h: 6,
    fill: { color: lightenHex(palette.base, 0.05) },
    line: { color: lightenHex(palette.contrast, 0.25), width: 1.8 },
    shadow: { type: "outer", blur: 18, color: lightenHex(palette.contrast, 0.2) },
  });

  pptSlide.addText(slide.title, {
    x: 0.8,
    y: 0.6,
    w: 8,
    fontSize: 40,
    bold: true,
    color: palette.contrast,
    fontFace: "Helvetica",
  });

  if (slide.notes) {
    pptSlide.addText(slide.notes, {
      x: 0.8,
      y: 1.2,
      w: 8,
      fontSize: 20,
      color: palette.muted,
      fontFace: "Helvetica",
    });
  }

  const cards = buildTeamCards(slide, deck).slice(0, 6);
  const columns = 3;
  const gap = 0.4;
  const cardWidth = (12 - gap * (columns - 1)) / columns;
  const cardHeight = 2.3;
  const startX = 0.8;
  const startY = 2;

  for (let idx = 0; idx < cards.length; idx += 1) {
    const card = cards[idx]!;
    const column = idx % columns;
    const row = Math.floor(idx / columns);
    const x = startX + column * (cardWidth + gap);
    const y = startY + row * (cardHeight + 0.3);
    pptSlide.addShape("roundRect", {
      x,
      y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: lightenHex(palette.base, 0.12) },
      line: { color: lightenHex(palette.contrast, 0.2), width: 1.2 },
      shadow: { type: "outer", blur: 10, color: lightenHex(palette.contrast, 0.15) },
    });

    const imageData = await resolveImageData(card.image);
    if (imageData) {
      pptSlide.addImage({
        data: imageData,
        x: x + 0.2,
        y: y + 0.2,
        w: cardWidth - 0.4,
        h: 1.2,
        sizing: { type: "contain", w: cardWidth - 0.4, h: 1.2 },
      });
    }

    pptSlide.addText(card.title, {
      x: x + 0.2,
      y: y + 1.5,
      w: cardWidth - 0.4,
      fontSize: 18,
      bold: true,
      color: palette.contrast,
      fontFace: "Helvetica",
    });
    pptSlide.addText(card.role, {
      x: x + 0.2,
      y: y + 1.85,
      w: cardWidth - 0.4,
      fontSize: 14,
      color: palette.muted,
      fontFace: "Helvetica",
    });
  }
}

export function getDeckTheme(deck: PitchDeckRecord): ThemeTokens {
  return buildDeckTheme(deck);
}
