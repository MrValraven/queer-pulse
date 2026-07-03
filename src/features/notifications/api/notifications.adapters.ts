import type { IconType } from "react-icons";
import { FiBell, FiCalendar, FiMessageCircle, FiUsers } from "react-icons/fi";
import type { Notification, NotifType } from "../notifications.types";
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
 * The live API serves plain text + a kind, so every row renders with the
 * kind's icon; interactive actions stay a mock-only affordance for now.
 */
export function notificationDtoToView(dto: NotificationDTO): Notification {
  const kind: NotifType = dto.type ?? "platform";
  return {
    id: Number(dto.id),
    type: kind,
    unread: dto.unread,
    icon: { Glyph: KIND_ICONS[kind] ?? FiBell, bg: KIND_ICON_BG[kind] },
    text: dto.text,
    meta: dto.meta ?? "",
    time: dto.time ?? formatTime(dto.createdAt),
  };
}

/** Format an ISO timestamp to a short relative-ish label; "" when absent. */
function formatTime(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
