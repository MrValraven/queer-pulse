import type { TFunction } from "../../../shared/i18n/types";
import type { CalendarEvent } from "../../gatherings/data";
import { cardToCalendarEvent } from "../../gatherings/api/events.adapters";
import type {
  ProfileEventCardDTO,
  ProfileEventRole,
  ProfileEventsDTO,
} from "./profileEvents.api";

/** One row of the profile's Events section: the card and the member's role. */
export interface ProfileEventItem {
  event: CalendarEvent;
  role: ProfileEventRole;
}

export interface ProfileEventsVM {
  upcoming: ProfileEventItem[];
  past: ProfileEventItem[];
}

/** Anything other than an explicit co-host reads as the host, so a card from
 *  an older server with no `role` still renders. */
function toRole(role: unknown): ProfileEventRole {
  return role === "cohost" ? "cohost" : "host";
}

function toItem(card: ProfileEventCardDTO, t: TFunction): ProfileEventItem {
  return { event: cardToCalendarEvent(card, t), role: toRole(card.role) };
}

/**
 * `GET /profiles/:slug/events` → the section's view model. Each card goes
 * through the same `cardToCalendarEvent` the Events Hub uses, so a profile
 * row and a hub card agree. The server's order is kept as sent.
 */
export function toProfileEventsVM(
  dto: ProfileEventsDTO,
  t: TFunction,
): ProfileEventsVM {
  return {
    upcoming: (dto.upcoming ?? []).map((card) => toItem(card, t)),
    past: (dto.past ?? []).map((card) => toItem(card, t)),
  };
}
