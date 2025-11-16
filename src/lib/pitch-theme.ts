import type { PitchSlideRecord } from "@/types/pitch";

export type ThemeTokens = {
  background: string;
  title: string;
  bullets: string;
  note: string;
};

export type SlideVariant = "hero" | "spotlight" | "columns" | "statement" | "team";

export type SlidePalette = {
  base: string;
  contrast: string;
  muted: string;
  accent: string;
  accentSoft: string;
  glow: string;
  strong: string;
};

const VARIANT_KEYWORDS: { pattern: RegExp; variant: SlideVariant }[] = [
  { pattern: /(vision|intro|solution|mission|product)/i, variant: "hero" },
  { pattern: /(market|traction|metrics|analysis)/i, variant: "columns" },
  { pattern: /(roadmap|execution|timeline|funding|plan)/i, variant: "spotlight" },
  { pattern: /(problem|risk|challenge|impact|ask)/i, variant: "statement" },
];

export const SLIDE_BASE_WIDTH = 1280;
export const SLIDE_BASE_HEIGHT = 720;

export function determineVariant(slide: PitchSlideRecord, index: number): SlideVariant {
  if (slide.slideType === "team") return "team";
  for (const entry of VARIANT_KEYWORDS) {
    if (
      entry.pattern.test(slide.title) ||
      (slide.subtitle && entry.pattern.test(slide.subtitle))
    ) {
      return entry.variant;
    }
  }
  const fallback: SlideVariant[] = ["hero", "spotlight", "columns", "statement"];
  return fallback[index % fallback.length];
}

export function buildSlidePalette(theme: ThemeTokens): SlidePalette {
  const base = normalizeHex(theme.background, "#111827");
  const contrast = normalizeHex(theme.title, "#ffffff");
  const muted = normalizeHex(theme.note, "#d1d5db");
  const accent = adjustColor(base, 0.15);
  const strong = adjustColor(base, -0.1);
  return {
    base,
    contrast,
    muted,
    accent,
    accentSoft: withAlpha(accent, 0.18),
    glow: withAlpha(contrast, 0.08),
    strong,
  };
}

export function normalizeHex(color: string | undefined, fallback: string) {
  if (!color) return fallback;
  const trimmed = color.trim();
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/i);
  if (!hexMatch) {
    return fallback;
  }
  let hex = hexMatch[1];
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  } else if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }
  return `#${hex.toLowerCase()}`;
}

type RGB = { r: number; g: number; b: number };

function hexToRgb(hex: string): RGB | null {
  const match = hex.replace("#", "");
  if (match.length !== 6) return null;
  const num = Number.parseInt(match, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number) {
  const toHex = (value: number) =>
    value.toString(16).padStart(2, "0").toLowerCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl({ r, g, b }: RGB) {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}

function hslToRgb(h: number, s: number, l: number): RGB {
  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function adjustColor(hex: string, delta: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const hsl = rgbToHsl(rgb);
  const adjusted = hslToRgb(hsl.h, hsl.s, clamp01(hsl.l + delta));
  return rgbToHex(adjusted.r, adjusted.g, adjusted.b);
}

export function withAlpha(hex: string, alpha: number) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function hexToRgbTuple(hex: string): [number, number, number] {
  const rgb = hexToRgb(hex);
  return rgb ? [rgb.r, rgb.g, rgb.b] : [255, 255, 255];
}
