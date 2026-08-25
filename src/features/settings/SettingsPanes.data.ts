import type { VisibilityMode } from "../../shared/components/ui/VisibilityBadge";

// Stable ids for the visibility radio options — never the translated label.
export const VISIBILITY_OPTIONS: {
  v: VisibilityMode;
  titleKey: string;
  descKey: string;
}[] = [
  {
    v: "open",
    titleKey: "settings:visibility.open.title",
    descKey: "settings:visibility.open.desc",
  },
  {
    v: "network",
    titleKey: "settings:visibility.network.title",
    descKey: "settings:visibility.network.desc",
  },
  {
    v: "private",
    titleKey: "settings:visibility.private.title",
    descKey: "settings:visibility.private.desc",
  },
];

// Stable ids for the (cosmetic, comingSoon) email-delivery select — never the
// translated label. Only "immediately"/"dailyDigest"/"weeklyDigest"/"never"
// are ids here; nothing is persisted since the control is disabled.
export const EMAIL_DELIVERY_OPTIONS = [
  {
    value: "immediately",
    key: "settings:notifications.delivery.email.immediately",
  },
  {
    value: "dailyDigest",
    key: "settings:notifications.delivery.email.dailyDigest",
  },
  {
    value: "weeklyDigest",
    key: "settings:notifications.delivery.email.weeklyDigest",
  },
  { value: "never", key: "settings:notifications.delivery.email.never" },
];

// Quiet-hours time ranges are plain numeric data, not translatable chrome —
// only the "none" option carries a label.
export const QUIET_HOURS_RANGES = [
  "22:00 – 08:00",
  "21:00 – 09:00",
  "20:00 – 10:00",
];
