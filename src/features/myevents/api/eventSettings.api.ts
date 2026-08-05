import { apiGet, apiPut } from "../../../shared/api/client";

/** The three visibility options a member's own events can default to. */
export const EVENT_VISIBILITY_OPTIONS = [
  { value: "public", labelKey: "myevents:rsvpModal.visibility.everyone" },
  {
    value: "connections",
    labelKey: "myevents:rsvpModal.visibility.connections",
  },
  { value: "private", labelKey: "myevents:rsvpModal.visibility.justMe" },
] as const;

export type EventVisibility = (typeof EVENT_VISIBILITY_OPTIONS)[number]["value"];

/** The server defaults when a member has no settings row — mirrors DEFAULT_PREFS. */
export const DEFAULT_EVENT_VISIBILITY: EventVisibility = "connections";
export const DEFAULT_EVENT_EMAILS_ENABLED = true;

export interface EventSettingsDTO {
  defaultEventVisibility: EventVisibility;
  eventEmailsEnabled: boolean;
}

/** GET /me/event-settings — never 404s; returns the defaults when unset. */
export const getEventSettings = () =>
  apiGet<EventSettingsDTO>("/me/event-settings");

/** PUT /me/event-settings — full replace; echoes the stored settings back. */
export const putEventSettings = (body: EventSettingsDTO) =>
  apiPut<EventSettingsDTO>("/me/event-settings", body);
