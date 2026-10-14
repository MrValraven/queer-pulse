import type { Formatters } from "../../shared/i18n/format";
import { scheduleReadback } from "./studioSchedule";

/** "Tue, Oct 20" and "18:00" for an upcoming release, in the viewer's own
 *  zone; null without a readable time. */
export function outDateOf(
  publishAt: string | null,
  formatters: Formatters,
): { date: string; time: string } | null {
  if (!publishAt) return null;
  const instant = new Date(publishAt);
  if (Number.isNaN(instant.getTime())) return null;
  return scheduleReadback(instant, formatters);
}
