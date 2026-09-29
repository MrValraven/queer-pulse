import { cards as englishCardsCatalog } from "../../../shared/i18n/catalogs/en/cards";
import { cards as portugueseCardsCatalog } from "../../../shared/i18n/catalogs/pt/cards";
import { intlLocale } from "../../../shared/i18n/locale";
import { resolveEntry } from "../../../shared/i18n/translate";
import {
  defineStickerTemplate,
  isFiniteNumber,
  normalizeKeywords,
  type StickerTemplate,
} from "./templateDefinition";
import { unoReverseGeometry } from "./unoReverse.geometry";
import {
  UNO_REVERSE_DEFAULTS,
  UNO_REVERSE_FLAG_IDS,
  type UnoReverseParams,
} from "./unoReverse.params";

export type UnoReverseStyle = {
  frameColor: string;
  frameWidth: number;
  ringAngleDeg: number;
  ringStrokeWidth: number;
  hasCornerArrows: boolean;
  cornerArrowScale: number;
};

/** `flag.<flagId>` in the EN and PT `cards` catalogs, falling back to the
 *  flag id when a catalog lacks the key. */
function flagLabels(flagId: string): { en: string; pt: string } {
  return {
    en:
      resolveEntry(englishCardsCatalog, `flag.${flagId}`, intlLocale("en")) ??
      flagId,
    pt:
      resolveEntry(
        portugueseCardsCatalog,
        `flag.${flagId}`,
        intlLocale("pt"),
      ) ?? flagId,
  };
}

/** Default search keywords, EN and PT, from both languages' flag names. A
 *  flag missing from a catalog keeps its id and the template words. */
function flagKeywords(flagId: string): { en: string[]; pt: string[] } {
  const englishName = resolveEntry(
    englishCardsCatalog,
    `flag.${flagId}`,
    intlLocale("en"),
  );
  const portugueseName = resolveEntry(
    portugueseCardsCatalog,
    `flag.${flagId}`,
    intlLocale("pt"),
  );
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

/** The stored params narrowed to the template's style fields, or null when
 *  any field is missing or has the wrong type. */
function parseUnoReverseStyle(
  params: Readonly<Record<string, unknown>>,
): UnoReverseStyle | null {
  const {
    frameColor,
    frameWidth,
    ringAngleDeg,
    ringStrokeWidth,
    hasCornerArrows,
    cornerArrowScale,
  } = params;
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

const UNO_REVERSE_DEFAULT_STYLE: UnoReverseStyle = {
  frameColor: UNO_REVERSE_DEFAULTS.frameColor,
  frameWidth: UNO_REVERSE_DEFAULTS.frameWidth,
  ringAngleDeg: UNO_REVERSE_DEFAULTS.ringAngleDeg,
  ringStrokeWidth: UNO_REVERSE_DEFAULTS.ringStrokeWidth,
  hasCornerArrows: UNO_REVERSE_DEFAULTS.hasCornerArrows,
  cornerArrowScale: UNO_REVERSE_DEFAULTS.cornerArrowScale,
};

function unoReverseParamsOf(
  style: UnoReverseStyle,
  itemId: string,
): UnoReverseParams {
  return { ...style, flagId: itemId };
}

/** Uno's SVG output must stay byte-identical, so its geometry is NOT fitted:
 *  the card layout is fixed and this calls `unoReverseGeometry` directly. */
export const UNO_REVERSE_TEMPLATE: StickerTemplate =
  defineStickerTemplate<UnoReverseStyle>({
    id: "uno-reverse",
    slugPrefix: "uno-reverse-",
    coverItemId: "rainbow",
    items: UNO_REVERSE_FLAG_IDS.map((flagId) => ({
      id: flagId,
      label: flagLabels(flagId),
      keywords: flagKeywords(flagId),
    })),
    defaultStyle: UNO_REVERSE_DEFAULT_STYLE,
    parseStyle: parseUnoReverseStyle,
    itemIdOfParams: (params) =>
      typeof params.flagId === "string" && params.flagId.length > 0
        ? params.flagId
        : null,
    toParams: (style, itemId) => ({ ...unoReverseParamsOf(style, itemId) }),
    geometry: (style, itemId) =>
      unoReverseGeometry(unoReverseParamsOf(style, itemId)),
  });
