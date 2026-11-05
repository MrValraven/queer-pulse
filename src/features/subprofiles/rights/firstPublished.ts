import type { PublicSubprofileView } from "../api/subprofiles.adapters";

/** Every valid `createdAt` time across the persona's featured item and every
 *  section item, in milliseconds. Unparseable dates are skipped. */
function publishedTimes(persona: PublicSubprofileView): number[] {
  const candidates = [
    persona.featured,
    ...persona.sections.flatMap((section) => section.items),
  ];
  const times: number[] = [];
  for (const item of candidates) {
    if (!item?.createdAt) continue;
    const time = new Date(item.createdAt).getTime();
    if (!Number.isNaN(time)) times.push(time);
  }
  return times;
}

/** The earliest valid `createdAt` across the persona's featured item and every
 *  section item, as an ISO string — the date the persona's body of work first
 *  appeared on QueerPulse, and the date the page's single `PersonaRightsFooter`
 *  prints. `null` when the persona has no dated item yet. */
export function firstPublishedISO(
  persona: PublicSubprofileView,
): string | null {
  const times = publishedTimes(persona);
  return times.length === 0 ? null : new Date(Math.min(...times)).toISOString();
}

/** The latest valid `createdAt` across the same items, as an ISO string: the
 *  closing year of the page colophon's copyright range. `null` when the
 *  persona has no dated item yet. */
export function latestPublishedISO(
  persona: PublicSubprofileView,
): string | null {
  const times = publishedTimes(persona);
  return times.length === 0 ? null : new Date(Math.max(...times)).toISOString();
}

/** The copyright years for a body of work: "2024–2026" (en dash) when it
 *  spans more than one year, or the single year when it does not. */
export function publishedYearRange(
  firstISO: string,
  latestISO: string,
): string {
  const firstYear = new Date(firstISO).getFullYear();
  const latestYear = new Date(latestISO).getFullYear();
  return latestYear > firstYear
    ? `${firstYear}–${latestYear}`
    : String(firstYear);
}
