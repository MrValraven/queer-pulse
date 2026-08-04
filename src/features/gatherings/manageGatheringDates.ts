import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";

/** Plain helper (not a component/hook) so calling `Date.now()` here doesn't
 *  trip the render-purity lint that applies to component/hook bodies. */
export function daysSince(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 86_400_000);
}

/** "just now" for a message sent this session, else a day-level relative time. */
export function messageRelativeTime(
  sentAt: Date,
  t: TFunction,
  fmt: Formatters,
): string {
  const diffMinutes = Math.round((sentAt.getTime() - Date.now()) / 60_000);
  if (Math.abs(diffMinutes) < 1) return t("gatherings:manage.messages.justNow");
  const diffDays = Math.round((sentAt.getTime() - Date.now()) / 86_400_000);
  return fmt.relativeTime(diffDays, "day");
}
