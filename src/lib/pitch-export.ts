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

const BULLET_CARD_LIMIT = 4;

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

    const [baseR, baseG, baseB] = hexToRgbTuple(palette.base);
    doc.setFillColor(baseR, baseG, baseB);
    doc.rect(0, 0, SLIDE_BASE_WIDTH, SLIDE_BASE_HEIGHT, "F");

    if (slide.slideType === "team") {
      await renderPdfTeamSlide(doc, slide, palette, deck);
      continue;
    }

    const textPanel = { x: 70, y: 80, width: 650, height: 520 };
    const imagePanel = { x: 760, y: 110, width: 420, height: 420 };
    const panelFill = lightenHex(palette.base, 0.08);
    const panelStroke = lightenHex(palette.contrast, 0.35);
    const cardFill = lightenHex(palette.base, 0.16);
    const cardStroke = lightenHex(palette.contrast, 0.2);
    const [panelR, panelG, panelB] = hexToRgbTuple(panelFill);
    const [panelStrokeR, panelStrokeG, panelStrokeB] = hexToRgbTuple(panelStroke);

    doc.setFillColor(panelR, panelG, panelB);
    doc.setDrawColor(panelStrokeR, panelStrokeG, panelStrokeB);
    doc.roundedRect(
      textPanel.x - 20,
      textPanel.y - 35,
      textPanel.width + 40,
      textPanel.height + 70,
      32,
      32,
      "FD",
    );

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

    const bulletCards = slide.bullets.filter((entry) => entry.trim().length > 0);
    const cardsToRender = bulletCards.slice(0, BULLET_CARD_LIMIT);
    const columns = cardsToRender.length > 2 ? 2 : 1;
    const cardWidth = columns === 2 ? (textPanel.width - 80) / 2 : textPanel.width - 60;
    let cardAreaBottom = cursorY;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgbTuple(bulletColor));

    cardsToRender.forEach((bullet, idx) => {
      const lines = Math.max(1, Math.ceil(bullet.length / 60));
      const cardHeight = 70 + lines * 18;
      const column = columns === 2 ? idx % 2 : 0;
      const row = columns === 2 ? Math.floor(idx / 2) : idx;
      const cardX = textPanel.x + column * (cardWidth + 40);
      const cardY = cursorY + row * (cardHeight + 20);
      const [cardR, cardG, cardB] = hexToRgbTuple(cardFill);
      const [cardStrokeR, cardStrokeG, cardStrokeB] = hexToRgbTuple(cardStroke);
      doc.setFillColor(cardR, cardG, cardB);
      doc.setDrawColor(cardStrokeR, cardStrokeG, cardStrokeB);
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 20, 20, "FD");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...hexToRgbTuple(subtitleColor));
      doc.text(`KEY INSIGHT ${idx + 1}`, cardX + 20, cardY + 28);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(bulletSize);
      doc.setTextColor(...hexToRgbTuple(bulletColor));
      doc.text(bullet, cardX + 20, cardY + 48, {
        maxWidth: cardWidth - 40,
      });
      cardAreaBottom = Math.max(cardAreaBottom, cardY + cardHeight);
    });

    if (bulletCards.length > BULLET_CARD_LIMIT) {
      doc.setFontSize(bulletSize - 2);
      doc.setTextColor(...hexToRgbTuple(subtitleColor));
      doc.text(
        bulletCards.slice(BULLET_CARD_LIMIT).map((entry) => `• ${entry}`).join("\n"),
        textPanel.x,
        cardAreaBottom + 24,
        {
          maxWidth: textPanel.width - 60,
        },
      );
      cardAreaBottom += 80;
    }

    if (slide.notes) {
      const noteY = Math.max(cardAreaBottom + 30, textPanel.y + textPanel.height - 80);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(noteSize);
      doc.setTextColor(...hexToRgbTuple(noteColor));
      doc.text(slide.notes, textPanel.x, noteY, {
        maxWidth: textPanel.width - 60,
      });
    }

    const [imagePanelR, imagePanelG, imagePanelB] = hexToRgbTuple(lightenHex(palette.base, 0.18));
    doc.setFillColor(imagePanelR, imagePanelG, imagePanelB);
    doc.setDrawColor(panelStrokeR, panelStrokeG, panelStrokeB);
    doc.roundedRect(imagePanel.x, imagePanel.y, imagePanel.width, imagePanel.height, 40, 40, "FD");

    const imageData = await resolveImageData(resolveHeroSource(slide));
    if (imageData) {
      const format = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";
      const properties = doc.getImageProperties(imageData);
      const maxWidth = imagePanel.width - 80;
      const maxHeight = imagePanel.height - 140;
      const scale = Math.min(maxWidth / properties.width, maxHeight / properties.height);
      const imageWidth = properties.width * scale;
      const imageHeight = properties.height * scale;
      const imageX = imagePanel.x + (imagePanel.width - imageWidth) / 2;
      const imageY = imagePanel.y + 30;
      doc.addImage(imageData, format, imageX, imageY, imageWidth, imageHeight);
    }

    if (caption) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(...hexToRgbTuple(palette.contrast));
      doc.text(caption, imagePanel.x + 30, imagePanel.y + imagePanel.height - 40, {
        maxWidth: imagePanel.width - 60,
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
    const caption = slide.images[0]?.caption || slide.title;
    pptSlide.background = { color: slideTheme.background };

    if (slide.slideType === "team") {
      await renderPptTeamSlide(pptSlide, slide, palette, deck);
      continue;
    }

    const textPanel = { x: 0.5, y: 0.4, w: 6.6, h: 5.2 };
    const imagePanel = { x: 7.4, y: 0.6, w: 4.5, h: 5.3 };
    const panelFill = lightenHex(palette.base, 0.05);
    const panelStroke = lightenHex(palette.contrast, 0.3);
    const cardFill = lightenHex(palette.base, 0.15);
    const cardStroke = lightenHex(palette.contrast, 0.2);

    pptSlide.addShape("roundRect", {
      x: textPanel.x - 0.1,
      y: textPanel.y - 0.25,
      w: textPanel.w + 0.2,
      h: textPanel.h + 0.35,
      fill: { color: panelFill },
      line: { color: panelStroke, width: 1.6 },
      shadow: { type: "outer", blur: 15, color: lightenHex(palette.contrast, 0.2) },
    });

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

    const bulletCards = slide.bullets.filter((entry) => entry.trim().length > 0);
    const cardsToRender = bulletCards.slice(0, BULLET_CARD_LIMIT);
    const columns = cardsToRender.length > 2 ? 2 : 1;
    const cardWidth = columns === 2 ? (textPanel.w - 0.6) / 2 - 0.15 : textPanel.w - 0.4;
    let cardsBottom = blockY;

    cardsToRender.forEach((bullet, idx) => {
      const lines = Math.max(1, Math.ceil(bullet.length / 55));
      const cardHeight = 0.95 + lines * 0.35;
      const column = columns === 2 ? idx % 2 : 0;
      const row = columns === 2 ? Math.floor(idx / 2) : idx;
      const cardX = textPanel.x + column * (cardWidth + 0.25);
      const cardY = blockY + row * (cardHeight + 0.3);
      pptSlide.addShape("roundRect", {
        x: cardX,
        y: cardY,
        w: cardWidth,
        h: cardHeight,
        fill: { color: cardFill },
        line: { color: cardStroke, width: 1.2 },
        shadow: { type: "outer", blur: 8, color: lightenHex(palette.contrast, 0.15) },
      });
      pptSlide.addText(`Key insight ${idx + 1}`.toUpperCase(), {
        x: cardX + 0.2,
        y: cardY + 0.15,
        w: cardWidth - 0.4,
        fontSize: 12,
        bold: true,
        color: subtitleColor,
        fontFace: "Helvetica",
      });
      pptSlide.addText(bullet, {
        x: cardX + 0.2,
        y: cardY + 0.45,
        w: cardWidth - 0.4,
        fontSize: bulletSize,
        color: bulletColor,
        lineSpacing: 20,
        fontFace: "Helvetica",
      });
      cardsBottom = Math.max(cardsBottom, cardY + cardHeight);
    });

    if (bulletCards.length > BULLET_CARD_LIMIT) {
      pptSlide.addText(bulletCards.slice(BULLET_CARD_LIMIT).join(" • "), {
        x: textPanel.x,
        y: cardsBottom + 0.3,
        w: textPanel.w - 0.4,
        fontSize: bulletSize - 2,
        color: subtitleColor,
        fontFace: "Helvetica",
      });
      cardsBottom += 0.6;
    }

    if (slide.notes) {
      const noteY = Math.max(cardsBottom + 0.4, textPanel.y + textPanel.h - 0.8);
      pptSlide.addText(slide.notes, {
        x: textPanel.x,
        y: noteY,
        w: textPanel.w - 0.4,
        fontSize: noteSize,
        color: noteColor,
        italic: true,
        fontFace: "Helvetica",
      });
    }

    pptSlide.addShape("roundRect", {
      x: imagePanel.x,
      y: imagePanel.y,
      w: imagePanel.w,
      h: imagePanel.h,
      fill: { color: lightenHex(palette.base, 0.2) },
      line: { color: panelStroke, width: 1.8 },
      shadow: { type: "outer", blur: 18, color: lightenHex(palette.contrast, 0.25) },
    });

    const imageData = await resolveImageData(resolveHeroSource(slide));
    if (imageData) {
      pptSlide.addImage({
        data: imageData,
        x: imagePanel.x + 0.2,
        y: imagePanel.y + 0.2,
        w: imagePanel.w - 0.4,
        h: imagePanel.h - 1,
        sizing: {
          type: "contain",
          w: imagePanel.w - 0.4,
          h: imagePanel.h - 1,
        },
      });
    }

    pptSlide.addText(caption, {
      x: imagePanel.x + 0.3,
      y: imagePanel.y + imagePanel.h - 0.65,
      w: imagePanel.w - 0.6,
      fontSize: 14,
      color: palette.contrast,
      bold: true,
      fontFace: "Helvetica",
    });
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
