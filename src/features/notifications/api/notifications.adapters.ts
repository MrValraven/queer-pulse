import type { IconType } from "react-icons";
import { FiBell, FiCalendar, FiMessageCircle, FiUsers } from "react-icons/fi";
import type { TFunction } from "../../../shared/i18n/types";
import type { Formatters } from "../../../shared/i18n/format";
import type { Notification, NotifType } from "../notifications.types";
import { formatNotification } from "./formatNotification";
import type { NotificationDTO } from "./notifications.api";

/** Each notification kind → the icon its row renders with (no avatar from the API). */
const KIND_ICONS: Record<NotifType, IconType> = {
  messages: FiMessageCircle,
  events: FiCalendar,
  community: FiUsers,
  platform: FiBell,
};

/** Subtle tinted background behind each kind's icon, matching the mock palette. */
const KIND_ICON_BG: Record<NotifType, string> = {
  messages: "rgba(74,140,111,.1)",
  events: "rgba(232,119,90,.1)",
  community: "rgba(45,27,61,.07)",
  platform: "rgba(45,27,61,.07)",
};

/**
 * Map a backend notification to the prototype's rich Notification view-model,
 * defaulting the prototype-only fields (avatars, action buttons) gracefully.
 *
 * The API serves no display text — only `type` + structured `payload` — so the
 * row's text and sub-line are rendered here through i18n, in the caller's
 * active language. Interactive actions stay a mock-only affordance for now.
 */
export function notificationDtoToView(
  dto: NotificationDTO,
  t: TFunction,
  fmt: Formatters,
): Notification {
  const { text, meta, category } = formatNotification(dto.type, dto.payload, t);
  return {
    // Backend ids are uuids — pass through as-is. Coercing with Number() would
    // yield NaN for every row (duplicate React keys, un-markable rows).
    id: dto.id,
    type: category,
    // The backend sends `read`; the view-model is phrased the other way round.
    // Missing/!boolean degrades to unread so a row is never silently swallowed.
    unread: dto.read !== true,
    icon: { Glyph: KIND_ICONS[category] ?? FiBell, bg: KIND_ICON_BG[category] },
    text,
    meta,
    time: formatTime(dto.createdAt, fmt),
  };
}

/**
 * Format an ISO timestamp to a short date label; "" when absent. Goes through
 * `useFormat()`'s locale-bound `Intl.DateTimeFormat` (via the `fmt` passed
 * in) rather than `toLocaleDateString(undefined, …)` — the previous version
 * always rendered in the browser's system locale, ignoring the member's
 * chosen app language entirely.
 */
function formatTime(iso: string | undefined, fmt: Formatters): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return fmt.date(date, { month: "short", day: "numeric" });
}
