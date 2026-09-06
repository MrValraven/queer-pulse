import type { TFunction } from "../../shared/i18n/types";
import { formatDate } from "../../shared/lib/date";

/**
 * Shared chrome-phrase composers for the Magazine feature. Several mock data
 * files bake a platform-authored phrase together with a datum (a read-time in
 * minutes, a word count, a weekly-reads tally, an issue number) — the classic
 * "fused mock string" the i18n extraction brief calls out. These helpers hold
 * the catalog key + interpolation in one place so every data file composes
 * the same way; the live-mode adapter (`api/magazine.adapters.tsx`) uses them
 * too, so demo and live render identical phrasing.
 *
 * "min" itself doesn't inflect in English or pt-PT, so no `_one`/`_other`
 * pair is needed for read-time; the values below always pass through
 * `Intl.PluralRules` only for `format.articleCount`, where pt-PT genuinely
 * distinguishes singular from plural ("artigo" / "artigos").
 */

/** "{count} min read" */
export function minReadText(minutes: number, t: TFunction): string {
  return t("magazine:format.minRead", { count: minutes });
}

/** "~ {count} min read" — used where the read time is an estimate. */
export function minReadApproxText(minutes: number, t: TFunction): string {
  return t("magazine:format.minReadApprox", { count: minutes });
}

/** "{count} word" / "{count} words" */
export function wordsText(words: number, t: TFunction): string {
  return t("magazine:format.words", { count: words });
}

/**
 * "{reads} reads this week" — `reads` is passed as already-formatted text
 * (mock data uses compact forms like "1.2k") so it is interpolated as an
 * opaque `reads` token rather than pluralized (hence not `count`, which
 * drives CLDR plural-category selection and is typed `number`-only).
 */
export function readsThisWeekText(
  reads: string | number,
  t: TFunction,
): string {
  return t("magazine:format.readsThisWeek", { reads });
}

/** "Published {date}" */
export function publishedText(dateLabel: string, t: TFunction): string {
  return t("magazine:format.published", { date: dateLabel });
}

/** "Issue {issue} · {count} article(s)" */
export function issueArticlesText(
  issueNumber: number,
  articleCount: number,
  t: TFunction,
): string {
  return t("magazine:format.issueArticles", {
    issue: issueNumber,
    count: articleCount,
  });
}

/**
 * "Issue {number}" on its own (masthead, toolbars). Takes a string too: the
 * backend's issue `number` is the zero-padded DISPLAY number ("09"), and
 * coercing it to `9` would print a label the issue page never uses.
 */
export function issueLabelText(
  issueNumber: number | string,
  t: TFunction,
): string {
  return t("magazine:format.issueLabel", { number: issueNumber });
}

/**
 * The desk's short absolute date, "29 Aug". One helper because the writer
 * workspace shows the same kind of date in four places (the header's "next
 * due", an assignment's due date, a pitch's sent date, a brief's commissioned
 * date) and they have to agree.
 *
 * Live values are machine values off Postgres: `magazine_piece.due_on` is a
 * `date` ("2026-09-12") and a pitch's `sent` is a full ISO timestamp. Neither
 * belongs on screen, which is what a writer used to read. `formatDate` returns
 * an unparseable value unchanged, so the demo fixture's already-human "4 Aug"
 * passes straight through instead of becoming "Invalid Date".
 */
export function deskDateText(value: string, language: string): string {
  return formatDate(value, language, { day: "numeric", month: "short" });
}
