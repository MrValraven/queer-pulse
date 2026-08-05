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

function hostName(dto?: EventCardDTO["host"], org?: string): string {
  if (dto) return `${dto.firstName} ${dto.lastName}`.trim();
  return org ?? "QueerPulse";
}

/** The "spots" line as a catalog key + its interpolation values. */
function spotsLabel(dto: EventCardDTO): SpotsLabel {
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

/** GET /events card → the Events Hub / calendar `CalendarEvent` shape. */
export function cardToCalendarEvent(dto: EventCardDTO): CalendarEvent {
  const org = dto.org ?? (dto.host ? "Community" : "QueerPulse");
  return {
    date: new Date(dto.startAt),
    org,
    orgColor: orgColorFor(org),
    title: dto.title,
    hood: dto.neighbourhood ?? dto.venue ?? (dto.isOnline ? "Online" : ""),
    to: gatheringPath(dto.slug),
    kind: dto.host ? "gathering" : "event",
    ticketed: dto.ticketed,
    ...priceRange(dto.price),
    ...(dto.coverImageUrl ? { coverImageUrl: dto.coverImageUrl } : {}),
    ...(typeof dto.goingCount === "number"
      ? { attendeeCount: dto.goingCount }
      : {}),
  };
}

/** GET /events/:slug → the GatheringPage `GatheringDetail` view-model. */
export function detailToGathering(dto: EventDetailDTO): GatheringDetail {
  return {
    slug: dto.slug,
    type: dto.type ?? "Gathering",
    date: new Date(dto.startAt),
    title: dto.title,
    hood: dto.neighbourhood ?? dto.venue ?? (dto.isOnline ? "Online" : ""),
    host: hostName(dto.host, dto.org),
    hostSlug: dto.host?.slug ?? "",
    hostFirst: dto.host?.firstName,
    hostLast: dto.host?.lastName,
    hostAvatarUrl: dto.host?.avatarUrl ?? null,
    spots: spotsLabel(dto),
    ctaKey: "gatherings:cta.rsvp",
    body: dto.description ?? "",
    viewerIsOrganizer: dto.isOrganizer ?? false,
  };
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

/** Map the create-gathering wizard form state onto the CreateEventDto the
 *  backend accepts. Prototype-only fields (access tags, tiers, notes) aren't
 *  part of the endpoint and are dropped — a documented known gap. */
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
    isOnline,
    capacity: Number.isFinite(capacity) ? capacity : undefined,
    // The wizard has no public/private control; gatherings default to
    // members-only (visible to the network), the backend's "members" value.
    visibility: "members",
    status: "published",
    // Only sent when the organiser picked one of their communities — omitted
    // keeps the gathering public, exactly as before this field existed.
    ...(form.communitySlug ? { communitySlug: form.communitySlug } : {}),
  };
}
