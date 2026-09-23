import type {
  AdminStickerPackResponse,
  AdminStickerResponse,
} from "../../../shared/contracts/contracts";
import { cards as englishCardsCatalog } from "../../../shared/i18n/catalogs/en/cards";
import { cards as portugueseCardsCatalog } from "../../../shared/i18n/catalogs/pt/cards";
import { intlLocale } from "../../../shared/i18n/locale";
import { resolveEntry } from "../../../shared/i18n/translate";
import type { Catalog, Language } from "../../../shared/i18n/types";
import {
  UNO_REVERSE_FLAG_IDS,
  type UnoReverseParams,
} from "../../stickers/templates/unoReverse.params";
import type {
  FlagPackState,
  FlagPlanEntry,
  PublishMode,
} from "./stickerBuilder.types";

const UNO_REVERSE_TEMPLATE_ID = "uno-reverse";
const UNO_REVERSE_SLUG_PREFIX = `${UNO_REVERSE_TEMPLATE_ID}-`;

/** The backend's per-keyword and per-language keyword limits. */
const KEYWORD_MAX_LENGTH = 40;
const KEYWORDS_MAX_COUNT = 24;

/** Every flag the template can paint, canonical order (= UNO_REVERSE_FLAG_IDS). */
export const BUILDER_FLAG_IDS: readonly string[] = UNO_REVERSE_FLAG_IDS;

const CANONICAL_INDEX_BY_FLAG = new Map(
  BUILDER_FLAG_IDS.map((flagId, index) => [flagId, index]),
);

export function stickerSlugForFlag(flagId: string): string {
  return `${UNO_REVERSE_SLUG_PREFIX}${flagId}`;
}

/** The flag a sticker was made from (templateParams.flagId, else slug suffix), or null. */
export function flagIdOfSticker(sticker: AdminStickerResponse): string | null {
  const paramsFlagId = sticker.templateParams.flagId;
  if (typeof paramsFlagId === "string" && paramsFlagId.length > 0) {
    return paramsFlagId;
  }
  if (sticker.slug.startsWith(UNO_REVERSE_SLUG_PREFIX)) {
    const slugSuffix = sticker.slug.slice(UNO_REVERSE_SLUG_PREFIX.length);
    return slugSuffix.length > 0 ? slugSuffix : null;
  }
  return null;
}

/** Sorts any flag id list into canonical order, dropping unknown ids. */
export function sortFlagIds(flagIds: readonly string[]): string[] {
  const knownFlagIds = [...new Set(flagIds)].filter((flagId) =>
    CANONICAL_INDEX_BY_FLAG.has(flagId),
  );
  return knownFlagIds.sort(
    (first, second) =>
      (CANONICAL_INDEX_BY_FLAG.get(first) ?? 0) -
      (CANONICAL_INDEX_BY_FLAG.get(second) ?? 0),
  );
}

/** The first sticker in the pack drawn from each flag, keyed by flag id. */
function stickerByFlagId(
  pack: AdminStickerPackResponse | null,
): Map<string, AdminStickerResponse> {
  const stickersByFlag = new Map<string, AdminStickerResponse>();
  for (const sticker of pack?.stickers ?? []) {
    const flagId = flagIdOfSticker(sticker);
    if (flagId !== null && !stickersByFlag.has(flagId)) {
      stickersByFlag.set(flagId, sticker);
    }
  }
  return stickersByFlag;
}

export function packStateByFlag(
  pack: AdminStickerPackResponse | null,
): Record<string, FlagPackState> {
  const stickersByFlag = stickerByFlagId(pack);
  const stateByFlag: Record<string, FlagPackState> = {};
  for (const flagId of BUILDER_FLAG_IDS) {
    stateByFlag[flagId] = stickersByFlag.has(flagId) ? "in-pack" : "new";
  }
  return stateByFlag;
}

/**
 * What a run will do with each selected flag, in canonical order. A flag the
 * pack lacks is always added; a flag it already holds is redrawn in place
 * under "replace" and skipped under "add-missing".
 */
export function buildFlagPlan(
  selectedFlagIds: readonly string[],
  pack: AdminStickerPackResponse | null,
  mode: PublishMode,
): FlagPlanEntry[] {
  const stickersByFlag = stickerByFlagId(pack);
  return sortFlagIds(selectedFlagIds).map((flagId) => {
    const existingSticker = stickersByFlag.get(flagId) ?? null;
    if (existingSticker === null) {
      return { flagId, action: "add", existingSticker };
    }
    return {
      flagId,
      action: mode === "replace" ? "replace" : "skip",
      existingSticker,
    };
  });
}

/** Unique, lowercased, and cut to the backend's keyword limits. */
function normalizeKeywords(keywords: readonly string[]): string[] {
  const normalized = keywords
    .map((keyword) => keyword.trim().toLowerCase().slice(0, KEYWORD_MAX_LENGTH))
    .filter((keyword) => keyword.length > 0);
  return [...new Set(normalized)].slice(0, KEYWORDS_MAX_COUNT);
}

function flagNameIn(
  catalog: Catalog,
  language: Language,
  flagId: string,
): string | undefined {
  return resolveEntry(catalog, `flag.${flagId}`, intlLocale(language));
}

/**
 * Default search keywords, EN and PT, from both languages' flag names.
 *
 * Reads the `cards` catalogs directly: this runs outside React while a
 * publish loop builds each sticker's body, where there is no hook `t`, and
 * the keywords must hold both languages whatever the admin's own UI language
 * is. A flag missing from a catalog keeps its id and the template words.
 */
export function stickerKeywordsForFlag(flagId: string): {
  en: string[];
  pt: string[];
} {
  const englishName = flagNameIn(englishCardsCatalog, "en", flagId);
  const portugueseName = flagNameIn(portugueseCardsCatalog, "pt", flagId);
  return {
    en: normalizeKeywords([
      ...(englishName ? [englishName] : []),
      flagId,
      "uno",
      "reverse",
    ]),
    pt: normalizeKeywords([
      ...(portugueseName ? [portugueseName] : []),
      flagId,
      "uno",
      "reverso",
    ]),
  };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** The stored params narrowed to the template's style fields, or null when
 *  any field is missing or has the wrong type. */
function parseTemplateStyle(
  templateParams: Record<string, unknown>,
): Omit<UnoReverseParams, "flagId"> | null {
  const {
    frameColor,
    frameWidth,
    ringAngleDeg,
    ringStrokeWidth,
    hasCornerArrows,
    cornerArrowScale,
  } = templateParams;
  if (
    typeof frameColor !== "string" ||
    !isFiniteNumber(frameWidth) ||
    !isFiniteNumber(ringAngleDeg) ||
    !isFiniteNumber(ringStrokeWidth) ||
    typeof hasCornerArrows !== "boolean" ||
    !isFiniteNumber(cornerArrowScale)
  ) {
    return null;
  }
  return {
    frameColor,
    frameWidth,
    ringAngleDeg,
    ringStrokeWidth,
    hasCornerArrows,
    cornerArrowScale,
  };
}

/**
 * The template params a pack's stickers were made with (first sticker with
 * templateId "uno-reverse" whose params parse), minus flagId, or null when
 * there is none. The params arrive from the server as an open record, so each
 * field is checked before the builder loads it into its controls.
 */
export function packTemplateStyle(
  pack: AdminStickerPackResponse | null,
): Omit<UnoReverseParams, "flagId"> | null {
  for (const sticker of pack?.stickers ?? []) {
    if (sticker.templateId !== UNO_REVERSE_TEMPLATE_ID) continue;
    const templateStyle = parseTemplateStyle(sticker.templateParams);
    if (templateStyle !== null) return templateStyle;
  }
  return null;
}
