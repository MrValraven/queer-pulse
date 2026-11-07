/**
 * The short label a dock pad shows on its face. Each pad reads its own
 * catalog key (`vj:effects.padLabel.<padId>`, and `vj:pads.allEffectsShort`
 * for the All effects pad); the full effect name stays the pad's accessible
 * name. A short key missing in the site language falls back to the full name
 * in that language, so a pad never shows a raw key or borrows English.
 */
import type { TranslateInFunction } from "../../../../app/providers/i18nContext";
import type { Language } from "../../../../shared/i18n/types";
import { useTranslation } from "../../../../shared/i18n/useTranslation";

export const VJ_ALL_EFFECTS_SHORT_KEY = "vj:pads.allEffectsShort";

/** The catalog key of a pad's short label. */
export function vjPadLabelKey(padId: string): string {
  return `vj:effects.padLabel.${padId}`;
}

/**
 * The short label under `key` in `language`, or `fullLabel` when the key is
 * absent there (or its namespace is still loading). `translateIn` answers
 * `undefined` for a missing key; `t()` would log it and echo the key back.
 */
export function vjShortLabelOf(
  translateIn: TranslateInFunction,
  language: Language,
  key: string,
  fullLabel: string,
): string {
  const shortLabel = translateIn(language, key);
  return shortLabel === undefined || shortLabel === "" ? fullLabel : shortLabel;
}

/** The short label for `key` in the site language, falling back to `fullLabel`. */
export function useVjShortLabel(key: string, fullLabel: string): string {
  const { language, translateIn } = useTranslation();
  return vjShortLabelOf(translateIn, language, key, fullLabel);
}
