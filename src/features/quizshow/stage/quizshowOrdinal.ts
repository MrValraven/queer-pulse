import type { QuizshowLanguage } from "../../../shared/contracts/quizshow";
import type { TFunction } from "../../../shared/i18n/types";

const ENGLISH_ORDINAL_RULES = new Intl.PluralRules("en", { type: "ordinal" });

const ENGLISH_ORDINAL_SUFFIXES: Record<Intl.LDMLPluralRule, string> = {
  zero: "th",
  one: "st",
  two: "nd",
  few: "rd",
  many: "th",
  other: "th",
};

/**
 * A place as an ordinal in the given language (item 44): EN "1st", "2nd",
 * "3rd", "11th" through the plural rules; PT "3.º", since `Intl.PluralRules`
 * holds no Portuguese ordinal suffix.
 */
export function quizshowOrdinal(
  place: number,
  language: QuizshowLanguage,
): string {
  if (language === "pt") {
    return `${place}.º`;
  }
  return `${place}${ENGLISH_ORDINAL_SUFFIXES[ENGLISH_ORDINAL_RULES.select(place)]}`;
}

/**
 * "3rd of 12" / "3.º de 12" (item 44). The ordinal comes from
 * `quizshowOrdinal`; the joining word from `quizshow:stage.placeOf`
 * ("{place} of {total}" / "{place} de {total}").
 *
 * The call: it takes the `t` to read that key with, so a caller passes the
 * translator of the scope whose language is `language` (on the TV, the screen
 * language scope's `t`; on a phone, the app's `t`). The key and the ordinal
 * then always agree on one language.
 */
export function quizshowPlaceOf(
  place: number,
  total: number,
  language: QuizshowLanguage,
  t: TFunction,
): string {
  return t("quizshow:stage.placeOf", {
    place: quizshowOrdinal(place, language),
    total,
  });
}
