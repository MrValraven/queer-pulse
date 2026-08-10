import type {
  EventCardDTO,
  EventFilter,
  EventInviteDTO,
} from "../../gatherings/api/events.api";
import { formatNotification } from "../../notifications/api/formatNotification";
import type { NotificationDTO } from "../../notifications/api/notifications.api";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import type { EventCategory, MyEvent, Notif } from "../myEvents.types";

// Map each backend DTO onto the EXISTING mock view-model type (`MyEvent`) the
// dashboard already renders and mutates locally. Fields the prototype invents
// (avatar stacks, series/day-of detail, access chips) have no backend contract
// yet and are simply left undefined — every consumer already treats them as
// optional, so nothing renders blank or throws.

/**
 * The dashboard's `category` buckets map 1:1 onto the backend's `EventFilter`
 * dimension (GET /events?filter=…) — "going"/"hosting"/"waitlisted"/"past"/
 * "saved" mean the same thing on both sides. "upcoming" is a client-derived
 * pill (see `inPill`), never a `category` value, so it's excluded here.
 */
const FILTER_TO_CATEGORY: Partial<Record<EventFilter, EventCategory>> = {
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
    category: FILTER_TO_CATEGORY[filter] ?? "going",
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
    timezone: dto.timezone,
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

/**
 * Backend notification kinds that belong in the My Events "What's changed"
 * panel — a material change to an event the member has a stake in. Mirrors the
 * `notifications_type_enum` values the backend fans out on an organizer edit
 * (`event_updated`), a cancellation (`event_cancelled`), and a waitlist
 * promotion (`waitlist_promoted`). Every other notification kind stays in the
 * main notifications centre only. Verified against `formatNotification`'s
 * `NotificationKind` union (the frontend mirror of the backend enum).
 */
export const EVENT_PANEL_NOTIF_KINDS = new Set<string>([
  "event_updated",
  "event_cancelled",
  "waitlist_promoted",
]);

/**
 * A GET /notifications row → the panel's local `Notif` shape. The API serves no
 * display text, so the copy is rendered here through the shared
 * `formatNotification` (the same i18n keys the main notifications centre uses)
 * and dropped whole into `bold`: the backend payload carries no separate
 * event-name field to isolate as the demo mock does, so the full translated
 * sentence is the notification's primary content.
 *
 * `eventId` powers the panel deep-link (`notifGo` → `goToEvent` scrolls + flashes
 * the matching card). It reads the payload's event reference defensively,
 * preferring the `eventSlug` (which matches `MyEvent.id` for filter-fetched
 * events) and falling back to the raw `eventId`. The `event_updated`,
 * `event_cancelled`, and `waitlist_promoted` payloads all carry `eventSlug`, so
 * the deep-link resolves to the card. If a reference is ever missing it no-ops
 * gracefully (`goToEvent` returns when no card matches) while the row still
 * marks read + dismisses.
 */
export function eventNotificationToNotif(
  dto: NotificationDTO,
  t: TFunction,
  fmt: Formatters,
): Notif {
  const { text } = formatNotification(dto.type, dto.payload, t);
  return {
    id: dto.id,
    bold: text,
    time: formatNotifTime(dto.createdAt, fmt),
    eventId: eventReferenceFromPayload(dto.payload),
    // The backend sends `read`; the panel is phrased the other way round.
    // Anything but an explicit `true` degrades to unread so a row is never
    // silently swallowed.
    unread: dto.read !== true,
  };
}

/**
 * The event a notification points at, for the panel deep-link. `payload` is
 * server-trusted but untyped on this side, so every field is read defensively.
 * Returns "" when neither reference is present — `goToEvent` treats that as a
 * no-op rather than scrolling to nothing.
 */
function eventReferenceFromPayload(payload: unknown): string {
  if (typeof payload !== "object" || payload === null) return "";
  const record = payload as Record<string, unknown>;
  const eventSlug = record.eventSlug;
  if (typeof eventSlug === "string" && eventSlug) return eventSlug;
  const eventId = record.eventId;
  if (typeof eventId === "string" && eventId) return eventId;
  return "";
}

/**
 * Short localized date label for a notification's timestamp; "" when absent or
 * unparseable. Mirrors the main feed's `formatTime` (notifications.adapters) so
 * the two surfaces read the same, and goes through the locale-bound `fmt` rather
 * than the browser's system locale.
 */
function formatNotifTime(iso: string | undefined, fmt: Formatters): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return fmt.date(date, { month: "short", day: "numeric" });
}

/** GET /event-invites entry → `MyEvent` (the "invite" category, under the Saved pill).
 *  The backend's invite row nests a lean event summary (no attendee counts /
 *  org label yet — those are fetched via GET /events/:slug once opened), so
 *  those fields are left undefined rather than faked. */
export function eventInviteToMyEvent(dto: EventInviteDTO): MyEvent {
  const ev = dto.event;
  const { date, time } = splitIso(ev?.startAt);
  return {
    id: dto.id,
    category: "invite",
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
