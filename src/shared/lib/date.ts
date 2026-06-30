/**
 * Date helpers shared across features. All dates here are ISO `yyyy-mm-dd`
 * strings (what `<input type="date">` produces and consumes).
 */

/** Today as `yyyy-mm-dd`, for seeding date inputs. */
export const todayIso = (): string => new Date().toISOString().slice(0, 10);

/**
 * Format an ISO date (`yyyy-mm-dd`) as a readable date. An empty string stays
 * empty; an unparseable value is returned unchanged.
 */
export function formatDate(
  iso: string,
  locale = "en-GB",
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  },
): string {
  if (!iso) return "";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale, options);
}
