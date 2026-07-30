import { apiGet, apiPut } from "../../../shared/api/client";

/** 1 day before — the server's default when a member has no preference row. */
export const DEFAULT_REMINDER_LEAD_MINUTES = 1440;

/** The three options the UI offers: 1 hour / 1 day / 1 week. */
export const REMINDER_LEAD_OPTIONS = [
  { minutes: 60, labelKey: "myevents:settingsModal.lead.hour" },
  { minutes: 1440, labelKey: "myevents:settingsModal.lead.day" },
  { minutes: 10080, labelKey: "myevents:settingsModal.lead.week" },
] as const;

export interface EventReminderPrefsDTO {
  leadMinutes: number;
}

/** GET /me/event-reminder-preferences — never 404s; returns the default lead. */
export const getEventReminderPrefs = () =>
  apiGet<EventReminderPrefsDTO>("/me/event-reminder-preferences");

/** PUT /me/event-reminder-preferences — upserts and echoes the stored lead. */
export const putEventReminderPrefs = (body: { leadMinutes: number }) =>
  apiPut<EventReminderPrefsDTO>("/me/event-reminder-preferences", body);
