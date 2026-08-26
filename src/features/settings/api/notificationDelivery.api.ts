import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * The member's quiet-hours window: when their phone may buzz, as opposed to
 * `notificationPreferences.api.ts`, which is about WHICH notifications exist at
 * all.
 *
 * Quiet hours gate the PUSH channel only. The in-app row is always written, so
 * a member inside their window loses nothing: the notification is waiting in the
 * bell when they wake up. The settings copy says exactly this, because the old
 * control persisted nothing and a member who set it and then got a 3am push had
 * been misled.
 */
export interface NotificationDeliveryDTO {
  isQuietHoursEnabled: boolean;
  /** Minute-of-day the window opens, 0..1439. */
  quietHoursStartMinute: number;
  /** Minute-of-day the window closes, 0..1439. */
  quietHoursEndMinute: number;
  /** IANA zone the two minutes above are read in, e.g. "Europe/Lisbon". */
  timeZone: string;
}

/** Matches the backend's `DEFAULT_QUIET_HOURS`: off, 22:00 to 08:00, UTC. */
export const DEFAULT_NOTIFICATION_DELIVERY: NotificationDeliveryDTO = {
  isQuietHoursEnabled: false,
  quietHoursStartMinute: 22 * 60,
  quietHoursEndMinute: 8 * 60,
  timeZone: "UTC",
};

/**
 * The windows offered in the picker, as minute-of-day pairs. Stable numeric ids
 * rather than the rendered "22:00 - 08:00" label, so the stored value never
 * depends on how a locale formats a clock.
 */
export const QUIET_HOURS_WINDOWS: {
  startMinute: number;
  endMinute: number;
}[] = [
  { startMinute: 22 * 60, endMinute: 8 * 60 },
  { startMinute: 21 * 60, endMinute: 9 * 60 },
  { startMinute: 20 * 60, endMinute: 10 * 60 },
  { startMinute: 23 * 60, endMinute: 7 * 60 },
  { startMinute: 0, endMinute: 8 * 60 },
];

/** `"22:00"` from a minute-of-day. Zero-padded 24-hour, never locale-dependent. */
export function formatMinuteOfDay(minuteOfDay: number): string {
  const hour = Math.floor(minuteOfDay / 60);
  const minute = minuteOfDay % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** The stable option id a window round-trips through the select as. */
export function windowOptionValue(
  startMinute: number,
  endMinute: number,
): string {
  return `${startMinute}-${endMinute}`;
}

/**
 * The browser's own IANA zone, which is what the member's clock actually reads.
 * Falls back to UTC where `Intl` cannot resolve one, so a write never sends a
 * zone the backend will reject.
 */
export function detectTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** GET /me/notification-delivery. Never 404s; defaults have quiet hours off. */
export const getNotificationDelivery = () =>
  apiGet<NotificationDeliveryDTO>("/me/notification-delivery");

/** PUT /me/notification-delivery. Replaces the window, echoes it back. */
export const putNotificationDelivery = (body: NotificationDeliveryDTO) =>
  apiPut<NotificationDeliveryDTO>("/me/notification-delivery", body);
