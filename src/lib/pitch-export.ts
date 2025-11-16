import { jsPDF } from "jspdf";
import PptxGenJS from "pptxgenjs";
import type {
  PitchDeckRecord,
  PitchSlideRecord,
  PitchTeamMember,
} from "@/types/pitch";
import {
  buildSlidePalette,
  determineVariant,
  hexToRgbTuple,
  SLIDE_BASE_HEIGHT,
  SLIDE_BASE_WIDTH,
  type ThemeTokens,
} from "@/lib/pitch-theme";

function buildDeckTheme(deck: PitchDeckRecord): ThemeTokens {
  return {
    background: deck.brandKit.background || deck.brandColor || "#111827",
    title: deck.brandKit.title || "#FFFFFF",
    bullets: deck.brandKit.bullets || "#E5E7EB",
    note: deck.brandKit.note || "#9CA3AF",
  };
}

const imageCache = new Map<string, string>();

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
  const theme = buildDeckTheme(deck);

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index]!;
    if (index > 0) {
      doc.addPage([SLIDE_BASE_WIDTH, SLIDE_BASE_HEIGHT], "landscape");
    }
    const palette = buildSlidePalette(theme);
    const [r, g, b] = hexToRgbTuple(palette.base);
    doc.setFillColor(r, g, b);
    doc.rect(0, 0, SLIDE_BASE_WIDTH, SLIDE_BASE_HEIGHT, "F");
    doc.setTextColor(...hexToRgbTuple(palette.contrast));
    doc.setFont("helvetica", "bold");
    doc.setFontSize(42);
    doc.text(slide.title, 80, 120, { maxWidth: SLIDE_BASE_WIDTH - 420 });

    if (slide.subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(22);
      doc.setTextColor(...hexToRgbTuple(palette.muted));
      doc.text(slide.subtitle, 80, 170, {
        maxWidth: SLIDE_BASE_WIDTH - 420,
      });
    }

    doc.setFont("helvetica", "normal");
    doc.setFontSize(20);
    const bullets = slide.bullets.slice(0, 6);
    let currentY = 230;
    bullets.forEach((bullet) => {
      doc.setTextColor(...hexToRgbTuple(palette.contrast));
      doc.text(`• ${bullet}`, 90, currentY, {
        maxWidth: SLIDE_BASE_WIDTH - 420,
      });
      currentY += 36;
    });

    if (slide.notes) {
      doc.setFontSize(16);
      doc.setTextColor(...hexToRgbTuple(palette.muted));
      doc.text(slide.notes, 80, SLIDE_BASE_HEIGHT - 80, {
        maxWidth: SLIDE_BASE_WIDTH - 420,
      });
    }

    if (slide.slideType === "team") {
      renderPdfTeamMembers(doc, deck.team ?? [], palette);
    } else {
      const imageData = await resolveImageData(slide.images[0]?.url);
      if (imageData) {
        const imageWidth = 380;
        const imageHeight = 380;
        const format = imageData.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(
          imageData,
          format,
          SLIDE_BASE_WIDTH - imageWidth - 80,
          180,
          imageWidth,
          imageHeight,
        );
      }
    }
  }
  doc.save(`${deck.startupName}-deck.pdf`);
}

function renderPdfTeamMembers(
  doc: jsPDF,
  team: PitchTeamMember[],
  palette: ReturnType<typeof buildSlidePalette>,
) {
  const [borderR, borderG, borderB] = hexToRgbTuple(palette.muted);
  doc.setDrawColor(borderR, borderG, borderB);
  doc.setFillColor(...hexToRgbTuple(palette.accentSoft));
  doc.setTextColor(...hexToRgbTuple(palette.contrast));
  const cardWidth = (SLIDE_BASE_WIDTH - 200) / 3;
  const cardHeight = 200;
  team.forEach((member, idx) => {
    const column = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 80 + column * (cardWidth + 10);
    const y = 260 + row * (cardHeight + 20);
    doc.roundedRect(x, y, cardWidth, cardHeight, 12, 12, "FD");
    doc.setFontSize(20);
    doc.text(member.name || `Member ${idx + 1}`, x + 16, y + 40);
    doc.setFontSize(14);
    doc.setTextColor(...hexToRgbTuple(palette.muted));
    doc.text(member.role ?? "Role", x + 16, y + 70, { maxWidth: cardWidth - 32 });
    doc.setFontSize(12);
    doc.setTextColor(...hexToRgbTuple(palette.contrast));
    doc.text(member.expertise ?? "", x + 16, y + 100, {
      maxWidth: cardWidth - 32,
    });
  });
}

export async function exportDeckAsPptx(
  deck: PitchDeckRecord,
  slides: PitchSlideRecord[],
) {
  const pptx = new PptxGenJS();
  const theme = buildDeckTheme(deck);

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index]!;
    const pptSlide = pptx.addSlide();
    const palette = buildSlidePalette(theme);
    pptSlide.background = { color: palette.base };

    pptSlide.addText(slide.title, {
      x: 0.5,
      y: 0.4,
      w: 6.5,
      fontSize: 36,
      bold: true,
      color: palette.contrast,
      fontFace: "Helvetica",
    });

    if (slide.subtitle) {
      pptSlide.addText(slide.subtitle, {
        x: 0.5,
        y: 1.2,
        w: 6.5,
        fontSize: 18,
        color: palette.muted,
        fontFace: "Helvetica",
      });
    }

    if (slide.slideType === "team") {
      renderPptTeamMembers(pptSlide, deck.team ?? [], palette);
    } else {
      if (slide.bullets.length) {
        pptSlide.addText(slide.bullets.join("\n"), {
          x: 0.6,
          y: 1.8,
          w: 6.2,
          fontSize: 20,
          color: palette.contrast,
          bullet: true,
          lineSpacingMultiple: 1.2,
        });
      }
      if (slide.notes) {
        pptSlide.addText(slide.notes, {
          x: 0.6,
          y: 5.2,
          w: 6.2,
          fontSize: 14,
          color: palette.muted,
          italic: true,
        });
      }
      const imageData = await resolveImageData(slide.images[0]?.url);
      if (imageData) {
        pptSlide.addImage({
          data: imageData,
          x: 7.2,
          y: 1,
          w: 4,
          h: 4.5,
        });
      }
    }
  }

  await pptx.writeFile({ fileName: `${deck.startupName}-deck.pptx` });
}

function renderPptTeamMembers(
  pptSlide: PptxGenJS.Slide,
  team: PitchTeamMember[],
  palette: ReturnType<typeof buildSlidePalette>,
) {
  const cardsPerRow = 3;
  const cardWidth = 3.1;
  const cardHeight = 1.8;
  team.forEach((member, idx) => {
    const column = idx % cardsPerRow;
    const row = Math.floor(idx / cardsPerRow);
    const x = 0.5 + column * (cardWidth + 0.2);
    const y = 2 + row * (cardHeight + 0.2);
    pptSlide.addShape(PptxGenJS.ShapeType.rect, {
      x,
      y,
      w: cardWidth,
      h: cardHeight,
      fill: { color: palette.accentSoft },
      line: { color: palette.muted, width: 1 },
    });
    pptSlide.addText(member.name, {
      x: x + 0.2,
      y: y + 0.2,
      w: cardWidth - 0.4,
      h: 0.6,
      fontSize: 18,
      bold: true,
      color: palette.contrast,
    });
    pptSlide.addText(member.role, {
      x: x + 0.2,
      y: y + 0.8,
      w: cardWidth - 0.4,
      h: 0.5,
      fontSize: 14,
      color: palette.muted,
    });
    pptSlide.addText(member.expertise, {
      x: x + 0.2,
      y: y + 1.15,
      w: cardWidth - 0.4,
      h: 0.7,
      fontSize: 12,
      color: palette.contrast,
    });
  });
}

export function getDeckTheme(deck: PitchDeckRecord): ThemeTokens {
  return buildDeckTheme(deck);
}
