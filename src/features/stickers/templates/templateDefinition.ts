import type { Primitive } from "./primitives";

export type StickerTemplateId = "uno-reverse" | "blip" | "tea-slang";

export type TemplateStyleValue = string | number | boolean | null;

/** A template's style knobs. Type aliases (never interfaces) so each concrete
 *  style is assignable to this record. */
export type TemplateStyle = Readonly<Record<string, TemplateStyleValue>>;

export interface StickerTemplateItem {
  id: string;
  label: { en: string; pt: string };
  keywords: { en: string[]; pt: string[] };
}

/** One template as the registry, the builder and the demo generator see it. */
export interface StickerTemplate {
  id: StickerTemplateId;
  /** "uno-reverse-", "blip-", "tea-". */
  slugPrefix: string;
  items: readonly StickerTemplateItem[];
  coverItemId: string;
  defaultStyle: TemplateStyle;
  parseStyle(params: Readonly<Record<string, unknown>>): TemplateStyle | null;
  itemIdOfParams(params: Readonly<Record<string, unknown>>): string | null;
  toParams(style: TemplateStyle, itemId: string): Record<string, unknown>;
  /** Fitted to the 512 canvas. Throws on an unknown item id. */
  geometry(style: TemplateStyle, itemId: string): Primitive[];
  slugFor(itemId: string): string;
}

export interface TypedStickerTemplate<Style extends TemplateStyle> {
  id: StickerTemplateId;
  slugPrefix: string;
  items: readonly StickerTemplateItem[];
  coverItemId: string;
  defaultStyle: Style;
  parseStyle(params: Readonly<Record<string, unknown>>): Style | null;
  itemIdOfParams(params: Readonly<Record<string, unknown>>): string | null;
  toParams(style: Style, itemId: string): Record<string, unknown>;
  geometry(style: Style, itemId: string): Primitive[];
}

/** Erase a template's style type for the registry. The casts are safe: the
 *  builder only ever hands a template a style it parsed or defaulted itself. */
export function defineStickerTemplate<Style extends TemplateStyle>(
  template: TypedStickerTemplate<Style>,
): StickerTemplate {
  return {
    ...template,
    toParams: (style, itemId) => template.toParams(style as Style, itemId),
    geometry: (style, itemId) => template.geometry(style as Style, itemId),
    slugFor: (itemId) => `${template.slugPrefix}${itemId}`,
  };
}

/** Shared parse helpers for every template's parseStyle. */
export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** The backend's per-keyword and per-language keyword limits. */
const KEYWORD_MAX_LENGTH = 40;
const KEYWORDS_MAX_COUNT = 24;

/** Lowercase, trimmed, unique, at most 40 chars each and 24 in total (the
 *  backend's limits). */
export function normalizeKeywords(keywords: readonly string[]): string[] {
  const normalizedKeywords = keywords
    .map((keyword) => keyword.trim().toLowerCase().slice(0, KEYWORD_MAX_LENGTH))
    .filter((keyword) => keyword.length > 0);
  return [...new Set(normalizedKeywords)].slice(0, KEYWORDS_MAX_COUNT);
}
