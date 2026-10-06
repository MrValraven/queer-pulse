import type { Formatters } from "../../shared/i18n/format";
import type { TFunction } from "../../shared/i18n/types";
import { weekStartKey } from "./groupNewMembers";

/** A "YYYY-MM-DD" week key as local midnight on that day. Built from its
 *  parts because `new Date("YYYY-MM-DD")` reads the string as UTC midnight,
 *  which is the evening before west of Greenwich. */
function localDateFromKey(dayKey: string): Date {
  const [year = Number.NaN, month = Number.NaN, day = Number.NaN] = dayKey
    .split("-")
    .map(Number);
  return new Date(year, month - 1, day);
}

/** A hyphen inside a word ("juntaram-se") as NON-BREAKING HYPHEN, which
 *  Fraunces draws exactly like the plain one: the balanced title then wraps
 *  only at the spaces between words, keeping "juntaram-se" whole. */
function keepHyphenatedWordsWhole(title: string): string {
  return title.replace(/(\p{L})-(\p{L})/gu, "$1\u2011$2");
}

/**
 * The title of one week's "people joined" card: "This week" or "Last week"
 * for the two most recent weeks, and "The week of 28 Sep" further back, with
 * the year only when it is not the current one. Both reference weeks come
 * from local calendar dates (seven days back is the same weekday, whatever a
 * clock change did in between), keyed by the same `weekStartKey` the grouping
 * uses, so a card's week and its title always agree.
 */
export function newMembersWeekTitle(
  weekStart: string,
  count: number,
  now: Date,
  t: TFunction,
  fmt: Formatters,
): string {
  return keepHyphenatedWordsWhole(weekTitleText(weekStart, count, now, t, fmt));
}

/** The title's words, picked by week as described above. */
function weekTitleText(
  weekStart: string,
  count: number,
  now: Date,
  t: TFunction,
  fmt: Formatters,
): string {
  if (weekStart === weekStartKey(now)) {
    return t("feed:memberCard.group.thisWeek", { count });
  }
  const sameDayLastWeek = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 7,
  );
  if (weekStart === weekStartKey(sameDayLastWeek)) {
    return t("feed:memberCard.group.lastWeek", { count });
  }
  const weekStartDate = localDateFromKey(weekStart);
  // `Intl` throws on an invalid date, so a malformed key keeps the card up
  // under the plain "this week" title.
  if (Number.isNaN(weekStartDate.getTime())) {
    return t("feed:memberCard.group.thisWeek", { count });
  }
  const isOtherYear = weekStartDate.getFullYear() !== now.getFullYear();
  // No-break spaces keep the date in one piece, so a narrow card never
  // strands the day ("21") on a line of its own.
  const date = fmt
    .date(weekStartDate, {
      day: "numeric",
      month: "short",
      ...(isOtherYear && { year: "numeric" }),
    })
    .replace(/\s/g, "\u00a0");
  return t("feed:memberCard.group.weekOf", { count, date });
}
