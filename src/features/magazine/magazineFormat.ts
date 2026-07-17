import type { TFunction } from "../../shared/i18n/types";

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

/** "Issue {number}" on its own (masthead, toolbars). */
export function issueLabelText(issueNumber: number, t: TFunction): string {
  return t("magazine:format.issueLabel", { number: issueNumber });
}
