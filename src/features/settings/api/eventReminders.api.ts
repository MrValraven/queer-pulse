import { apiGet, apiPut } from "../../../shared/api/client";

/**
 * How long before a gathering the member's reminder fires.
 *
 * The backend has shipped `/me/event-reminder-preferences` since reminders
 * were built, and no frontend code ever read or wrote it: settings offered
 * only an on/off "event reminders" switch, so every member was stuck on the
 * default lead and the "an hour before vs a day before" choice the server
 * already stored was unreachable (PRD-186).
 *
 * The sibling `/me/event-settings` endpoint is deliberately NOT wired: its two
 * fields are a default event visibility (which the create wizard asks per
 * gathering, where the answer actually belongs) and an email-notifications
 * toggle. QueerPulse sends no email and never will, so exposing a switch that
 * governs a channel that does not exist would be a promise the platform cannot
 * keep.
 */
export interface EventReminderPreferencesDTO {
  /** Minutes before the start. One of `REMINDER_LEAD_OPTIONS`. */
  leadMinutes: number;
}

/** The closed set the backend's DTO whitelists (`ALLOWED_REMINDER_LEAD_MINUTES`):
 *  an hour, a day, a week. Anything else 400s, because the reminder cron does
 *  `startAt − leadMinutes` arithmetic with the stored value. */
export const REMINDER_LEAD_OPTIONS = [60, 1440, 10080] as const;

/** Matches the backend's `DEFAULT_REMINDER_LEAD_MINUTES` — one day, the fixed
 *  behaviour every member had before the preference existed. A member with no
 *  stored row genuinely gets this, so it is the honest thing to render while
 *  loading and in demo mode. */
export const DEFAULT_REMINDER_LEAD_MINUTES = 1440;

/** Catalog key for one lead option's label. Stable numeric ids round-trip
 *  through the select, never a translated string. */
export function reminderLeadLabelKey(leadMinutes: number): string {
  return `settings:notifications.reminderLead.option.${leadMinutes}`;
}

export const getEventReminderPreferences = () =>
  apiGet<EventReminderPreferencesDTO>("/me/event-reminder-preferences");

export const putEventReminderPreferences = (
  body: EventReminderPreferencesDTO,
) =>
  apiPut<EventReminderPreferencesDTO>("/me/event-reminder-preferences", body);
