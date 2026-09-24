import type { TFunction } from "../../../../shared/i18n/types";
import type { SkinSelectOption } from "../../skinBlockFields.data";

/**
 * The fixed choices behind the therapist's "Lived experience" and "Languages"
 * multi-selects. Each picked choice is stored by its id; the editor and the
 * public page both translate it through the same label key. Anything else in
 * the stored list is the therapist's own words (or an answer saved before the
 * list existed) and shows exactly as stored.
 */

const LIVED_IDS = [
  "trans",
  "nonBinary",
  "lesbian",
  "gay",
  "bisexual",
  "queer",
  "aceAro",
  "intersex",
  "migrant",
  "racialised",
  "neurodivergent",
  "disabled",
  "chronicIllness",
  "sexWork",
  "nonMonogamy",
  "recovery",
  "comingOutLater",
  "parenting",
];

const LANGUAGE_IDS = [
  "pt",
  "en",
  "es",
  "fr",
  "de",
  "it",
  "nl",
  "ca",
  "ro",
  "pl",
  "uk",
  "ru",
  "ar",
  "fa",
  "tr",
  "el",
  "hi",
  "ne",
  "bn",
  "zh",
  "ja",
  "ko",
  "kea",
  "sv",
  "lgp",
];

export const LIVED_OPTIONS: SkinSelectOption[] = LIVED_IDS.map((id) => ({
  value: id,
  labelKey: `subprofiles:therapist.livedOption.${id}`,
}));

export const LANGUAGE_OPTIONS: SkinSelectOption[] = LANGUAGE_IDS.map((id) => ({
  value: id,
  labelKey: `subprofiles:therapist.languageOption.${id}`,
}));

/** The label key of a stored entry when it is one of `options`' ids, or
 *  `undefined` when it is the therapist's own text. */
export function pickLabelKey(
  options: SkinSelectOption[],
  stored: string,
): string | undefined {
  return options.find((option) => option.value === stored)?.labelKey;
}

/** A stored entry as the page shows it: the translated label when it is one
 *  of `options`' ids, and the therapist's own text as stored otherwise. */
export function pickDisplayText(
  options: SkinSelectOption[],
  stored: string,
  translate: TFunction,
): string {
  const labelKey = pickLabelKey(options, stored);
  return labelKey ? translate(labelKey) : stored;
}
