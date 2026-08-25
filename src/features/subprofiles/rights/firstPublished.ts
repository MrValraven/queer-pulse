import type { PublicSubprofileView } from "../api/subprofiles.adapters";

/** The earliest valid `createdAt` across the persona's featured item and every
 *  section item, as an ISO string — the date the persona's body of work first
 *  appeared on QueerPulse, and the date the page's single `PersonaRightsFooter`
 *  prints. `null` when the persona has no dated item yet. */
export function firstPublishedISO(
  persona: PublicSubprofileView,
): string | null {
  const candidates = [
    persona.featured,
    ...persona.sections.flatMap((section) => section.items),
  ];
  let earliest: number | null = null;
  for (const item of candidates) {
    if (!item?.createdAt) continue;
    const time = new Date(item.createdAt).getTime();
    if (Number.isNaN(time)) continue;
    if (earliest === null || time < earliest) earliest = time;
  }
  return earliest === null ? null : new Date(earliest).toISOString();
}
