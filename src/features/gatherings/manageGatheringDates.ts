import type { TFunction } from "../../shared/i18n/types";
import type { Formatters } from "../../shared/i18n/format";

/** Plain helper (not a component/hook) so calling `Date.now()` here doesn't
 *  trip the render-purity lint that applies to component/hook bodies. */
export function daysSince(date: Date): number {
  return Math.round((date.getTime() - Date.now()) / 86_400_000);
}

/** Whole days from now until `date`, floored at 0 (for "N days to go"). */
export function daysUntil(date: Date): number {
  return Math.max(0, Math.ceil((date.getTime() - Date.now()) / 86_400_000));
}

/** Format a `Date` as the local `"yyyy-mm-ddThh:mm"` wire value `DatePicker`'s
 *  `datetime` mode reads/writes — the inverse of `new Date(value)`, which
 *  parses that same shape as local time (no trailing "Z"), matching how the
 *  create-gathering wizard already combines its date/time fields. */
export function dateToDatetimeValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hour}:${minute}`;
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
