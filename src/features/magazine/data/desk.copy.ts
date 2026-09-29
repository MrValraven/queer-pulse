/**
 * Editor desk copy helpers: a first-name helper, and the plain-text sanitizer
 * for `Activity.what`-style strings that still carry inline HTML markup from
 * the design. Stage and format LABELS live as i18n keys elsewhere:
 * `desk/stageLabels.ts` and `desk/FormatBadge.tsx`. The desk's own filter
 * chips live in `desk/deskFocus.ts`.
 */

/** Strip HTML tags from a markup string, returning plain text only. */
export function stripEm(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/** First name out of a full byline, for friendlier direct address ("Chase {name}"). */
export function firstName(byline: string): string {
  return byline.trim().split(/\s+/)[0] ?? byline;
}
