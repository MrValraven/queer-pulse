import type {
  EventCardDTO,
  EventFilter,
  EventInviteDTO,
} from "../../gatherings/api/events.api";
import type { EventCat, MyEvent } from "../myEvents.types";

// Map each backend DTO onto the EXISTING mock view-model type (`MyEvent`) the
// dashboard already renders and mutates locally. Fields the prototype invents
// (avatar stacks, series/day-of detail, access chips) have no backend contract
// yet and are simply left undefined — every consumer already treats them as
// optional, so nothing renders blank or throws.

/**
 * The dashboard's `cat` buckets map 1:1 onto the backend's `EventFilter`
 * dimension (GET /events?filter=…) — "going"/"hosting"/"waitlisted"/"past"/
 * "saved" mean the same thing on both sides. "upcoming" is a client-derived
 * pill (see `inPill`), never a `cat` value, so it's excluded here.
 */
const FILTER_TO_CAT: Partial<Record<EventFilter, EventCat>> = {
  going: "going",
  hosting: "hosting",
  waitlisted: "waitlisted",
  past: "past",
  saved: "saved",
};

/** Split an ISO timestamp into the `YYYY-MM-DD` date + `HH:MM` time strings
 *  `MyEvent` stores separately. */
function splitIso(iso: string | undefined): { date: string; time: string } {
  const d = iso ? new Date(iso) : null;
  if (!d || Number.isNaN(d.getTime())) return { date: "", time: "" };
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return { date, time };
}

/** GET /events card (already bucketed server-side by `filter`) → `MyEvent`. */
export function eventCardToMyEvent(
  dto: EventCardDTO,
  filter: EventFilter,
): MyEvent {
  const { date, time } = splitIso(dto.startAt);
  const end = dto.endAt ? splitIso(dto.endAt).time : undefined;
  return {
    id: dto.slug,
    cat: FILTER_TO_CAT[filter] ?? "going",
    slug: dto.slug,
    title: dto.title,
    date,
    start: time,
    end,
    venue: dto.isOnline ? "Online" : (dto.venue ?? dto.neighbourhood ?? ""),
    community: dto.org,
    going: dto.goingCount ?? 0,
    waitlist: dto.waitlistCount,
    online: dto.isOnline,
    tz: dto.timezone,
    ticket: dto.ticketed,
    paid: dto.price,
    spotsLeft: dto.spotsLeft,
    soldOut:
      typeof dto.capacity === "number" && typeof dto.goingCount === "number"
        ? dto.goingCount >= dto.capacity
        : undefined,
    maybe: dto.myRsvp === "maybe",
  };
}

/** GET /event-invites entry → `MyEvent` (the "invite" cat, under the Saved pill).
 *  The backend's invite row nests a lean event summary (no attendee counts /
 *  org label yet — those are fetched via GET /events/:slug once opened), so
 *  those fields are left undefined rather than faked. */
export function eventInviteToMyEvent(dto: EventInviteDTO): MyEvent {
  const ev = dto.event;
  const { date, time } = splitIso(ev?.startAt);
  return {
    id: dto.id,
    cat: "invite",
    slug: ev?.slug,
    title: ev?.title ?? "Event invitation",
    date,
    start: time,
    venue: ev?.isOnline ? "Online" : (ev?.venue ?? ""),
    going: 0,
    online: ev?.isOnline,
    from: dto.inviter
      ? `${dto.inviter.firstName} ${dto.inviter.lastName}`.trim()
      : undefined,
  };
}
