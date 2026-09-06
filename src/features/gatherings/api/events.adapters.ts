import {
  gatheringPath,
  orgColors,
  type CalendarEvent,
  type GatheringDetail,
  type SpotsLabel,
} from "../data";
import type { GatheringForm } from "../useGatheringForm";
import { initialsFromParts } from "../../../shared/lib/initials";
import type { Formatters } from "../../../shared/i18n/format";
import type { TFunction } from "../../../shared/i18n/types";
import { normalizeAccessibilityAnswers } from "../../marketing/listBusiness/listingAccessibility.data";
import type {
  AttendeeDTO,
  CreateEventDto,
  EventCardDTO,
  EventDetailDTO,
} from "./events.api";

// Map each backend DTO onto the EXISTING mock view-model types the pages
// already render. Fields the prototype invents (colours, spot copy) are derived
// from the DTO or defaulted so nothing renders blank.
//
// i18n note: this adapter deliberately emits *catalog keys + values*, never
// composed English. Dates stay as `Date`; the pages format them through
// `useFormat()`. That keeps the live path and the demo `data.ts` registry on one
// shape, so a language switch translates both identically.

/**
 * Pick a category dot colour from the org label, matching the mock palette.
 * QueerPulse only distinguishes gatherings it hosts from everything else
 * (community-run), so anything that isn't QueerPulse maps to the community dot.
 */
function orgColorFor(org?: string): string {
  const organiser = (org ?? "").toLowerCase();
  if (organiser.includes("queerpulse")) return orgColors.queerpulse;
  return orgColors.community;
}

/**
 * The "Hosted by" name.
 *
 * `host` became nullable when erasure stopped cascading gatherings away with
 * their host, so a past gathering can outlive the member who ran it. A
 * QueerPulse-run gathering always carries an `org` AND a staff host, so no host
 * and no org means exactly one thing: the host erased their account. It used to
 * fall through to "QueerPulse", which credited the platform for a member's
 * event.
 *
 * `t` is resolved here rather than at render because `host` is a plain string
 * every consumer prints directly. The cost is that this one fallback sits in
 * the query cache in the language it was fetched in, so it trails a language
 * switch until the next refetch. Real host names, which is nearly every
 * gathering, are unaffected.
 */
function hostName(
  dto: EventCardDTO["host"] | undefined,
  org: string | undefined,
  t: TFunction,
): string {
  if (dto) return `${dto.firstName} ${dto.lastName}`.trim();
  return org ?? t("gatherings:common.hostRemoved");
}

/**
 * The "spots" line as a catalog key + its interpolation values.
 *
 * Spots left is derived from `seatsTaken`, never from the row count (LOC-07):
 * a going member who declared two guests occupies three seats, so a 20-seat
 * gathering where ten people each bring a plus-one has nothing left, however
 * many rows the attendee table holds.
 */
function spotsLabel(dto: EventCardDTO): SpotsLabel {
  const seatsTaken = dto.seatsTaken ?? dto.goingCount;
  if (typeof dto.capacity === "number" && typeof seatsTaken === "number") {
    return {
      key: "gatherings:spots.spotsLeft",
      values: { count: Math.max(0, dto.capacity - seatsTaken) },
    };
  }
  if (typeof dto.spotsLeft === "number")
    return {
      key: "gatherings:spots.spotsLeft",
      values: { count: dto.spotsLeft },
    };
  if (typeof dto.goingCount === "number")
    return { key: "gatherings:spots.going", values: { count: dto.goingCount } };
  return { key: "gatherings:spots.openToAll" };
}

/** Split a `"€6–18"` / `"€10"` price string from the API into euro numbers. */
function priceRange(price?: string): { priceMin?: number; priceMax?: number } {
  if (!price) return {};
  const nums = price.match(/\d+(?:[.,]\d+)?/g);
  if (!nums?.length) return {};
  const [min, max] = nums;
  return {
    priceMin: Number(min.replace(",", ".")),
    ...(max ? { priceMax: Number(max.replace(",", ".")) } : {}),
  };
}

/**
 * GET /events card → the Events Hub / calendar `CalendarEvent` shape.
 *
 * `t` renders the one label this shape carries that is chrome rather than
 * content: the "Online" neighbourhood, which stood as a hardcoded English
 * literal here while the My Events adapter translated the identical label
 * (DES-130). Same language-trail cost as `hostName` below: the resolved string
 * sits in the query cache in the language it was fetched in.
 */
export function cardToCalendarEvent(
  dto: EventCardDTO,
  t: TFunction,
): CalendarEvent {
  // A QueerPulse-run gathering always sets `org`, so an absent one is
  // community-run whether or not its host row survived erasure. This used to
  // read a missing host as "QueerPulse" and byline the platform for a member's
  // gathering once that member erased their account.
  const org = dto.org ?? "Community";
  return {
    date: new Date(dto.startAt),
    // Only carried when the API actually knows the host's zone — absent leaves
    // every card formatting in the reader's own zone, exactly as before.
    ...(dto.timezone ? { timezone: dto.timezone } : {}),
    org,
    orgColor: orgColorFor(org),
    title: dto.title,
    hood: onlineAwareHood(dto, t),
    to: gatheringPath(dto.slug),
    kind: dto.host ? "gathering" : "event",
    // Discovery lists never carry a cancelled row, but the member's own
    // "going"/"saved"/"hosting" lists do, and the card knows how to render
    // the state (PRD-181). Carrying it is what stops a called-off gathering
    // from sitting in My Events looking exactly like a live one.
    ...(dto.status === "cancelled" ? { cancelled: true } : {}),
    // The wizard's own gathering type, when the host picked one (LOC-04).
    ...(dto.eventType ? { eventType: dto.eventType } : {}),
    // LOC-18 — the host's own words about what it costs, plus the server's
    // own "does this read as free" verdict. DISPLAY ONLY: there is no payment
    // anywhere behind this, so no card may offer to take one.
    ...(dto.cost ? { cost: dto.cost } : {}),
    ...(dto.isFree !== undefined ? { isFree: dto.isFree } : {}),
    ticketed: dto.ticketed,
    ...priceRange(dto.price),
    ...(dto.coverImageUrl ? { coverImageUrl: dto.coverImageUrl } : {}),
    ...(typeof dto.goingCount === "number"
      ? { attendeeCount: dto.goingCount }
      : {}),
  };
}

/** GET /events/:slug → the GatheringPage `GatheringDetail` view-model. */
export function detailToGathering(
  dto: EventDetailDTO,
  t: TFunction,
): GatheringDetail {
  // The host turned off "Show attendee count" (`SettingsTab`) — a
  // non-organizer viewer sees the generic "open to all" copy instead of a
  // real headcount. Organizers always see the real number (their own
  // dashboard, not the public-facing card). `undefined` (an older/absent
  // field) defaults to "show", matching the backend column's own default.
  const hideCount = dto.isOrganizer !== true && dto.showAttendeeCount === false;
  return {
    slug: dto.slug,
    // The wizard's own gathering type is the real answer here (LOC-04). The
    // backend never sent a `type`, so this row read the literal word
    // "Gathering" on every live event, whatever the host had chosen.
    type: dto.eventType ?? dto.type ?? "Gathering",
    date: new Date(dto.startAt),
    // The zone the host scheduled in, when the API carries one. See
    // `eventZoneFormat` — absent falls back to the reader's own zone.
    ...(dto.timezone ? { timezone: dto.timezone } : {}),
    title: dto.title,
    hood: onlineAwareHood(dto, t),
    host: hostName(dto.host, dto.org, t),
    hostSlug: dto.host?.slug ?? "",
    hostFirst: dto.host?.firstName,
    hostLast: dto.host?.lastName,
    hostAvatarUrl: dto.host?.avatarUrl ?? null,
    spots: hideCount ? { key: "gatherings:spots.openToAll" } : spotsLabel(dto),
    ctaKey: "gatherings:cta.rsvp",
    body: dto.description ?? "",
    viewerIsOrganizer: dto.isOrganizer ?? false,
    bookmarked: dto.isBookmarked ?? false,
    endAt: dto.endAt ? new Date(dto.endAt) : undefined,
    myRsvpStatus: activeRsvpStatus(dto.myRsvpStatus),
    isFull: dto.isFull ?? false,
    capacity: dto.capacity ?? null,
    waitlistPosition: dto.myWaitlistPosition ?? null,
    // Falls back to "members" (Public) — the wizard's own default — for an
    // event the API returns with no `visibility`, so the edit modal never
    // pre-populates a blank/invalid audience-scope selection.
    visibility: dto.visibility ?? "members",
    // `null` (no community) and `undefined` (field absent) both collapse to
    // undefined here, matching GatheringDetail's "unset" representation.
    communitySlug: dto.communitySlug ?? undefined,
    venueListingId: dto.listingId ?? null,
    venueListing: dto.venueListing ?? null,
    cohosts: dto.cohosts,
    myRsvpDetails: dto.myRsvpDetails ?? null,
    showAttendeeCount: dto.showAttendeeCount,
    allowWaitlist: dto.allowWaitlist,
    series: dto.series ?? null,
    goingAttendeesPreview: dto.goingAttendeesPreview ?? [],
    goingAttendeesPreviewTotal: dto.goingAttendeesPreviewTotal ?? 0,
    coverImageUrl: dto.coverImageUrl ?? null,
    // ── Where it actually is (LOC-04) ────────────────────────────────────
    // `address` and `arrivalNotes` arrive as `null` for a viewer who has not
    // RSVP'd. That absence is a fact the page states plainly ("the exact
    // address is shared with the people who are going"), never an empty line.
    address: dto.address ?? null,
    arrivalNotes: dto.arrivalNotes ?? null,
    locationPrecision: dto.locationPrecision ?? "venue",
    neighbourhood: dto.neighbourhood ?? null,
    venue: dto.venue ?? null,
    language: dto.language ?? null,
    accessibilityAnswers: normalizeAccessibilityAnswers(
      dto.accessibilityAnswers,
    ),
    accessibilityNote: dto.accessibilityNote ?? "",
    // LOC-18 — display only.
    cost: dto.cost ?? null,
    isFree: dto.isFree ?? true,
    announcements: dto.announcements ?? [],
    seatsTaken: dto.seatsTaken ?? dto.goingCount ?? 0,
    // Withheld under the same `hideCount` rule as the `spots` line above
    // (ENG-140), so no consumer of this view-model can render a head count the
    // host has chosen to keep private — the wire still carries `goingCount`
    // on the summary, and this is where that stops mattering to the UI.
    goingCount: hideCount ? undefined : (dto.goingCount ?? 0),
    // The gathering has been called off (PRD-181). Without this the detail
    // page rendered a live-looking RSVP button that the server answered 400.
    ...(dto.status === "cancelled" ? { cancelled: true } : {}),
    // ── Online gatherings (PRD-182) ──────────────────────────────────────
    // `isOnline` comes off the DTO rather than being inferred from the `hood`
    // string, which is now a translated label. `onlineUrl` is gated by the
    // server exactly like `address`, so an absent one on an online gathering
    // is the same "not yours yet" fact the Where panel already states.
    isOnline: dto.isOnline ?? false,
    onlineUrl: dto.onlineUrl ?? null,
    ...(dto.updatedAt ? { updatedAt: new Date(dto.updatedAt) } : {}),
  };
}

/**
 * The neighbourhood line, with "Online" translated (DES-130).
 *
 * An online gathering has no neighbourhood and usually no venue, so the label
 * IS the answer to "where is this". It used to be the English literal
 * `"Online"` on both the card and the detail while the My Events adapter
 * rendered `myevents:card.online` for the same fact, so the same gathering
 * read in two languages on two screens.
 */
function onlineAwareHood(dto: EventCardDTO, t: TFunction): string {
  if (dto.neighbourhood) return dto.neighbourhood;
  if (dto.isOnline) return t("gatherings:common.online");
  return dto.venue ?? "";
}

/**
 * Normalize the DTO's RSVP status onto the three "active" states the in-event
 * RSVP control cares about. A `cancelled` row (or an absent status) reads as
 * `null` — "no active RSVP" — so a member who cancelled sees the plain RSVP
 * action again rather than a stale confirmed state.
 */
function activeRsvpStatus(
  status: EventDetailDTO["myRsvpStatus"],
): "going" | "maybe" | "waitlisted" | null {
  if (status === "going" || status === "maybe" || status === "waitlisted") {
    return status;
  }
  return null;
}

// ── Attendee view-model (manage / dashboard rows) ───────────────────────────

const AV_TINTS = [
  { background: "rgba(74,140,111,.12)", color: "var(--jade)" },
  { background: "rgba(232,119,90,.12)", color: "var(--accent-ink)" },
  { background: "rgba(45,27,61,.1)", color: "var(--plum)" },
];

export interface AttendeeRow {
  id: string;
  slug: string;
  initials: string;
  background: string;
  color: string;
  name: string;
  /** The person's own pronouns — content, never translated. */
  pronouns?: string;
  /** When they RSVP'd. Formatted at render via `useFormat()`. */
  rsvpAt?: Date;
  /** When they joined the waitlist, and their place in the queue. */
  waitlistedAt?: Date;
  waitlistPosition?: number;
  /** When a host or co-host marked them as arrived, or `null` (LOC-03).
   *  Organiser-only server-side; every other reader gets `null`. */
  checkedInAt?: Date | null;
  /** ── The attendee's own answers, organisers only (LOC-07) ─────────────
   *  `undefined` = the viewer is not an organiser and was never sent these.
   *  A `null` free text = the attendee wrote nothing, or chose "just me". */
  guestCount?: number;
  accessNeeds?: string | null;
  dietaryNeeds?: string | null;
  /** Their own "who can see this" choice, so the host's list can say why a
   *  needs line is absent rather than implying nobody has any. */
  detailsVisibility?: string | null;
}

/**
 * Compose an attendee's meta line — "she/her · RSVP'd 2 Jun".
 *
 * The pronouns are the person's own words and pass through untouched; the
 * "RSVP'd"/"On waitlist since" phrasing is chrome and the date is locale
 * formatted, so both go through `t` / `fmt` here rather than being baked into
 * the row. One composition point keeps every list rendering it identically.
 */
export function attendeeMeta(
  row: AttendeeRow,
  t: TFunction,
  fmt: Formatters,
): string {
  const shortDate = (d: Date) =>
    fmt.date(d, { day: "numeric", month: "short" });
  return [
    row.pronouns,
    row.rsvpAt &&
      t("gatherings:attendee.rsvpdOn", { date: shortDate(row.rsvpAt) }),
    row.waitlistedAt &&
      t("gatherings:attendee.waitlistedSince", {
        date: shortDate(row.waitlistedAt),
      }),
    row.waitlistPosition !== undefined &&
      t("gatherings:attendee.waitlistPosition", {
        position: row.waitlistPosition,
      }),
  ]
    .filter(Boolean)
    .join(" · ");
}

/** DTO → the row shape ManageGatheringTabs / dashboard lists render. */
export function attendeeToRow(dto: AttendeeDTO, index: number): AttendeeRow {
  const tint = AV_TINTS[index % AV_TINTS.length]!;
  return {
    id: `att-${dto.slug}`,
    slug: dto.slug,
    initials: initialsFromParts(dto.firstName, dto.lastName),
    background: tint.background,
    color: tint.color,
    name: `${dto.firstName} ${dto.lastName}`.trim(),
    pronouns: dto.pronouns,
    ...(dto.rsvpAt ? { rsvpAt: new Date(dto.rsvpAt) } : {}),
    ...(typeof dto.waitlistPosition === "number"
      ? { waitlistPosition: dto.waitlistPosition }
      : {}),
    checkedInAt: dto.checkedInAt ? new Date(dto.checkedInAt) : null,
    // Organiser-only fields (LOC-07). `undefined` here means "the viewer is
    // not an organiser", which is a different fact from a `null` free-text
    // answer ("the attendee withheld it, or wrote nothing").
    guestCount: dto.guestCount,
    accessNeeds: dto.accessNeeds,
    dietaryNeeds: dto.dietaryNeeds,
    detailsVisibility: dto.detailsVisibility ?? null,
  };
}

// ── Create-gathering wizard → CreateEventDto ────────────────────────────────

/** Combine a `YYYY-MM-DD` date + `HH:MM` time into an ISO timestamp.
 *  Empty inputs fall back so the payload stays well-formed. */
function combineDateTime(date: string, time: string): string {
  if (!date) return new Date().toISOString();
  const iso = new Date(`${date}T${time || "19:00"}`);
  return Number.isNaN(iso.getTime())
    ? new Date().toISOString()
    : iso.toISOString();
}

/**
 * Map the create-gathering wizard form state onto the CreateEventDto.
 *
 * Everything the wizard asks for is sent (LOC-04/LOC-18). It used to send the
 * title, description, schedule, venue and capacity and silently drop the
 * street address, arrival directions, neighbourhood, language, gathering type
 * and every accessibility answer — while still making the host tick "the
 * accessibility information I have given is accurate" before publishing. The
 * platform was extracting a truthfulness pledge about data it deleted.
 */
export function formToCreateEventDto(form: GatheringForm): CreateEventDto {
  const isOnline = form.hood === "Online";
  const capacity = Number.parseInt(form.cap, 10);
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    startAt: combineDateTime(form.date, form.time),
    endAt: form.endTime ? combineDateTime(form.date, form.endTime) : undefined,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "Europe/Lisbon",
    venue: isOnline ? undefined : form.venue.trim() || form.hood || undefined,
    // The join link, for an online gathering only (PRD-182). The column, the
    // URL validation and the DTO field all already existed server-side and
    // nothing ever sent one, so a host had no way to give attendees the video
    // link through the platform at all. Sent only when the gathering IS
    // online: a physical gathering has a door, not a link.
    ...(isOnline && form.onlineUrl.trim()
      ? { onlineUrl: form.onlineUrl.trim() }
      : {}),
    // Only carried when the organiser actually picked a directory listing
    // (never for an online gathering, which has no physical venue at all).
    ...(!isOnline && form.venueListingId
      ? { listingId: form.venueListingId }
      : {}),
    isOnline,
    // Where it actually is. An online gathering has no door, so neither the
    // address nor the arrival notes are sent for one.
    ...(!isOnline && form.address.trim()
      ? { address: form.address.trim() }
      : {}),
    ...(!isOnline && form.directions.trim()
      ? { arrivalNotes: form.directions.trim() }
      : {}),
    ...(!isOnline && form.hood ? { neighbourhood: form.hood } : {}),
    ...(form.lang ? { language: form.lang } : {}),
    ...(form.type ? { eventType: form.type } : {}),
    // The six three-valued answers plus the host's note. Sent on every create,
    // including one where the host answered nothing: a complete map of
    // `unknown` is the honest starting state, and it is what the accuracy
    // pledge on the review step is now a pledge about.
    accessibility: {
      answers: form.accessibilityAnswers,
      ...(form.accessNotes.trim() ? { note: form.accessNotes.trim() } : {}),
    },
    // LOC-18 — free text, display only. Nothing here takes a payment.
    ...(form.cost.trim() ? { cost: form.cost.trim() } : {}),
    capacity: Number.isFinite(capacity) ? capacity : undefined,
    // The host's audience-scope pick from the wizard (default "members" —
    // Public). See docs/superpowers/specs/2026-08-13-gathering-audience-scope-design.md.
    visibility: form.audienceScope,
    status: "published",
    // Only sent when the organiser picked one of their communities — omitted
    // keeps the gathering public, exactly as before this field existed.
    ...(form.communitySlug ? { communitySlug: form.communitySlug } : {}),
    // MSG-10 — only sent when the host actually switched "repeats" on; a
    // normal one-off gathering (the common case) omits it entirely, exactly
    // as before this field existed.
    ...(form.repeats
      ? {
          recurrence: {
            cadence: form.cadence,
            endType: form.endType,
            ...(form.endType === "count"
              ? { endCount: Number.parseInt(form.endCount, 10) }
              : { endUntil: combineDateTime(form.endUntil, "23:59") }),
          },
        }
      : {}),
  };
}
