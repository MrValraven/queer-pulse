import {
  gatheringPath,
  orgColors,
  type CalendarEvent,
  type GatheringDetail,
} from "../data";
import type { GatheringForm } from "../useGatheringForm";
import type {
  AttendeeDTO,
  CreateEventDto,
  EventCardDTO,
  EventDetailDTO,
} from "./events.api";

// Map each backend DTO onto the EXISTING mock view-model types the pages
// already render. Fields the prototype invents (colours, day/month strings,
// spot copy) are derived from the DTO or defaulted so nothing renders blank.

const MSHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** Pick a category dot colour from the org label, matching the mock palette. */
function orgColorFor(org?: string): string {
  const o = (org ?? "").toLowerCase();
  if (o.includes("queerpulse")) return orgColors.queerpulse;
  if (o.includes("ilga")) return orgColors.ilga;
  if (o.includes("community")) return orgColors.community;
  return orgColors.partner;
}

/** Format an ISO timestamp to the "7:30pm" style the cards use. */
function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "pm" : "am";
  h = h % 12 || 12;
  return m === 0
    ? `${h}${ampm}`
    : `${h}:${m.toString().padStart(2, "0")}${ampm}`;
}

/** Two-digit day-of-month string ("06") the date chips render. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.getDate().toString().padStart(2, "0");
}

function monthLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : MSHORT[d.getMonth()]!;
}

function hostName(dto?: EventCardDTO["host"], org?: string): string {
  if (dto) return `${dto.firstName} ${dto.lastName}`.trim();
  return org ?? "QueerPulse";
}

/** Human "spots" copy the detail sidebars show. */
function spotsLabel(dto: EventCardDTO): string {
  if (typeof dto.spotsLeft === "number") return `${dto.spotsLeft} spots left`;
  if (typeof dto.goingCount === "number") return `${dto.goingCount} going`;
  return "Open to all";
}

/** GET /events card → the EventsPage / calendar `CalendarEvent` shape. */
export function cardToCalendarEvent(dto: EventCardDTO): CalendarEvent {
  const org = dto.org ?? (dto.host ? "Community" : "QueerPulse");
  return {
    date: new Date(dto.startAt),
    org,
    orgColor: orgColorFor(org),
    title: dto.title,
    hood: dto.neighbourhood ?? dto.venue ?? (dto.isOnline ? "Online" : ""),
    time: timeLabel(dto.startAt),
    to: gatheringPath(dto.slug),
    kind: dto.host ? "gathering" : "event",
    ticketed: dto.ticketed,
    price: dto.price,
  };
}

/** GET /events/:slug → the GatheringPage `GatheringDetail` view-model. */
export function detailToGathering(dto: EventDetailDTO): GatheringDetail {
  return {
    slug: dto.slug,
    type: dto.type ?? "Gathering",
    day: dayLabel(dto.startAt),
    month: monthLabel(dto.startAt),
    title: dto.title,
    hood: dto.neighbourhood ?? dto.venue ?? (dto.isOnline ? "Online" : ""),
    host: hostName(dto.host, dto.org),
    hostSlug: dto.host?.slug ?? "",
    spots: spotsLabel(dto),
    cta: "RSVP",
    body: dto.description ?? "",
  };
}

// ── Attendee view-model (manage / dashboard rows) ───────────────────────────

const AV_TINTS = [
  { bg: "rgba(74,140,111,.12)", color: "var(--jade)" },
  { bg: "rgba(232,119,90,.12)", color: "var(--accent-ink)" },
  { bg: "rgba(45,27,61,.1)", color: "var(--plum)" },
];

export interface AttendeeRow {
  id: string;
  slug: string;
  initials: string;
  bg: string;
  color: string;
  name: string;
  meta: string;
}

function initialsOf(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

/** DTO → the row shape ManageGatheringTabs / dashboard lists render. */
export function attendeeToRow(dto: AttendeeDTO, index: number): AttendeeRow {
  const tint = AV_TINTS[index % AV_TINTS.length]!;
  const name = `${dto.firstName} ${dto.lastName}`.trim();
  const when = dto.rsvpAt
    ? new Date(dto.rsvpAt).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
      })
    : "";
  const metaBits = [dto.pronouns, when && `RSVP'd ${when}`].filter(Boolean);
  return {
    id: `att-${dto.slug}`,
    slug: dto.slug,
    initials: initialsOf(dto.firstName, dto.lastName),
    bg: tint.bg,
    color: tint.color,
    name,
    meta: metaBits.join(" · "),
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
    description: form.desc.trim(),
    startAt: combineDateTime(form.date, form.time),
    endAt: form.endTime ? combineDateTime(form.date, form.endTime) : undefined,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "Europe/Lisbon",
    venue: isOnline ? undefined : form.venue.trim() || form.hood || undefined,
    isOnline,
    capacity: Number.isFinite(capacity) ? capacity : undefined,
    visibility: "network",
    status: "published",
  };
}
