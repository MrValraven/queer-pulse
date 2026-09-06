import type {
  EventCardDTO,
  EventFilter,
  EventInviteDTO,
  EventSeriesDTO,
  RecurrenceCadence,
} from "../../gatherings/api/events.api";
import type { TFunction } from "../../../shared/i18n/types";
import type { EventCategory, EventSeries, MyEvent } from "../myEvents.types";

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

/**
 * When a member is both hosting an event and RSVP'd to it, the same event
 * slug comes back under more than one `LIVE_FILTERS` bucket (e.g. "going"
 * AND "hosting"), which would otherwise render as two duplicate cards. This
 * ranks the buckets so the more privileged relationship wins the merge —
 * hosting a still-open RSVP the member also holds.
 */
const CATEGORY_MERGE_PRIORITY: EventFilter[] = [
  "hosting",
  "going",
  "waitlisted",
  "past",
  "saved",
];

/** Merge one `GET /events?filter=…` page per `LIVE_FILTERS` entry into a single
 *  `MyEvent[]`, collapsing any event slug that appears under more than one
 *  filter down to its highest-priority category (see `CATEGORY_MERGE_PRIORITY`).
 *  `t` renders each card's recurring-series line (MSG-16) — see
 *  `toMyEventSeries` below. */
export function mergeEventPages(
  pages: { items: EventCardDTO[] }[],
  filters: EventFilter[],
  t: TFunction,
): MyEvent[] {
  const byId = new Map<string, MyEvent>();
  pages.forEach((page, filterIndex) => {
    const filter = filters[filterIndex]!;
    for (const dto of page.items) {
      const event = eventCardToMyEvent(dto, filter, t);
      const existing = byId.get(event.id);
      if (
        !existing ||
        CATEGORY_MERGE_PRIORITY.indexOf(filter) <
          CATEGORY_MERGE_PRIORITY.indexOf(existing.category as EventFilter)
      ) {
        byId.set(event.id, event);
      }
    }
  });
  return [...byId.values()];
}

// MSG-16 — cadence → the `SeriesLine`/`SeriesScopeModal` label (myevents),
// live counterpart of the demo mock's hand-authored `EventSeries.label`.
const CADENCE_LABEL_KEYS: Record<RecurrenceCadence, string> = {
  weekly: "myevents:series.cadenceWeekly",
  biweekly: "myevents:series.cadenceBiweekly",
  monthly: "myevents:series.cadenceMonthly",
};

/**
 * A live event's `EventSummary.series` (backend) → the dashboard's existing
 * `MyEvent.series` view-model (MSG-16) — the same shape the demo mock always
 * used (`myEvents.mock.ts`), now populated for real instead of only in demo.
 * `dates` (a formatted upcoming-dates list) stays demo-only: the card DTO
 * carries only this event's own position/cadence, not its siblings'
 * schedules, so `SeriesLine`'s click-toast falls back to the position
 * summary (`more`) in live mode — see `EventCardExtras.tsx`.
 */
function toMyEventSeries(
  series: EventSeriesDTO | null | undefined,
  t: TFunction,
): EventSeries | undefined {
  if (!series) return undefined;
  return {
    label: t(CADENCE_LABEL_KEYS[series.cadence]),
    more: t("myevents:series.position", {
      position: series.index + 1,
      total: series.occurrenceCount,
    }),
  };
}

/** GET /events card (already bucketed server-side by `filter`) → `MyEvent`. */
export function eventCardToMyEvent(
  dto: EventCardDTO,
  filter: EventFilter,
  t: TFunction,
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
    // The raw instants ride along for the .ics exporter, which must not export
    // the browser-local rendering above as a floating time (FE-MSG-09).
    startAtIso: dto.startAt,
    endAtIso: dto.endAt,
    venue: dto.isOnline
      ? t("myevents:card.online")
      : (dto.venue ?? dto.neighbourhood ?? ""),
    community: dto.org,
    hostSlug: dto.host?.slug,
    hostName: dto.host
      ? `${dto.host.firstName} ${dto.host.lastName}`.trim()
      : undefined,
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
    // The gathering has been called off (PRD-181). The card already knows how
    // to render this — a cancelled badge, a struck-through row, no day-of
    // actions — and nothing was ever setting it in live mode, so a cancelled
    // gathering sat in "Going" looking exactly like one that was still on.
    cancelled: dto.status === "cancelled",
    series: toMyEventSeries(dto.series, t),
  };
}

/** GET /event-invites entry → `MyEvent` (the "invite" category, under the Saved pill).
 *  The backend's invite row nests a lean event summary (no attendee counts /
 *  org label yet — those are fetched via GET /events/:slug once opened), so
 *  those fields are left undefined rather than faked. `t` covers the two spots
 *  where the row carries a flag rather than authored text: an online
 *  gathering's missing venue string, and an invite whose event summary the API
 *  left out entirely. */
export function eventInviteToMyEvent(
  dto: EventInviteDTO,
  t: TFunction,
): MyEvent {
  const ev = dto.event;
  const { date, time } = splitIso(ev?.startAt);
  return {
    id: dto.id,
    category: "invite",
    slug: ev?.slug,
    title: ev?.title ?? t("myevents:invite.defaultTitle"),
    date,
    start: time,
    startAtIso: ev?.startAt,
    endAtIso: ev?.endAt ?? undefined,
    venue: ev?.isOnline ? t("myevents:card.online") : (ev?.venue ?? ""),
    going: 0,
    online: ev?.isOnline,
    from: dto.inviter
      ? `${dto.inviter.firstName} ${dto.inviter.lastName}`.trim()
      : undefined,
  };
}
