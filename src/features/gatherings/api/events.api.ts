import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Shapes the NestJS events domain returns. Only the fields the prototype pages
// actually render are typed richly; everything else is optional and defaulted
// gracefully in the adapters.

export type EventVisibility = "open" | "network" | "private";
export type EventStatus = "draft" | "published" | "cancelled";
export type RsvpStatus = "going" | "maybe" | "waitlisted" | "invited";

/** The filters the Events / My-Events tabs map onto GET /events?filter=… */
export type EventFilter =
  "upcoming" | "going" | "hosting" | "waitlisted" | "past" | "saved";

export interface EventHostDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
}

/** A card as returned by GET /events (list) — the thin listing shape. */
export interface EventCardDTO {
  slug: string;
  title: string;
  /** ISO 8601 start timestamp. */
  startAt: string;
  endAt?: string;
  timezone?: string;
  venue?: string;
  neighbourhood?: string;
  isOnline?: boolean;
  onlineUrl?: string;
  visibility?: EventVisibility;
  status?: EventStatus;
  coverImageUrl?: string | null;
  /** Org / category label shown on the card ("QueerPulse", "Community", …). */
  org?: string;
  /** Event type label ("Supper Club", "Mixer", …). */
  type?: string;
  host?: EventHostDTO;
  capacity?: number;
  goingCount?: number;
  waitlistCount?: number;
  spotsLeft?: number;
  ticketed?: boolean;
  price?: string;
  /** The viewer's own RSVP state on this event, if any. */
  myRsvp?: RsvpStatus | null;
}

export interface EventsPage {
  items: EventCardDTO[];
  total: number;
  page: number;
  pageSize: number;
}

/** Full event detail from GET /events/:slug. */
export interface EventDetailDTO extends EventCardDTO {
  description?: string;
  accessibility?: string[];
  language?: string;
  guidelines?: string;
  /** Sliding-scale / ticket tiers, if the event is ticketed. */
  tiers?: { name: string; desc?: string; price: string }[];
}

export interface AttendeeDTO {
  slug: string;
  firstName: string;
  lastName: string;
  pronouns?: string;
  avatarUrl?: string | null;
  status: RsvpStatus;
  /** ISO 8601 timestamp the RSVP / waitlist join happened. */
  rsvpAt?: string;
  /** Waitlist rank, when status is "waitlisted". */
  waitlistPosition?: number;
}

export interface AttendeesResponse {
  going: AttendeeDTO[];
  waitlist: AttendeeDTO[];
  goingCount: number;
  waitlistCount: number;
  capacity?: number;
}

// ── Create / update payloads ────────────────────────────────────────────────

export interface CreateEventDto {
  title: string;
  description: string;
  /** ISO 8601. */
  startAt: string;
  endAt?: string;
  timezone: string;
  venue?: string;
  isOnline?: boolean;
  onlineUrl?: string;
  capacity?: number;
  visibility?: EventVisibility;
  status?: EventStatus;
  coverImageUrl?: string;
}

/** PATCH /events/:slug — every field optional. */
export type UpdateEventDto = Partial<CreateEventDto>;

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export async function getEvents(
  params: { filter?: EventFilter; page?: number } = {},
): Promise<EventsPage> {
  const q = new URLSearchParams();
  if (params.filter) q.set("filter", params.filter);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const res = await apiGet<EventCardDTO[] | EventsPage>(
    `/events${qs ? `?${qs}` : ""}`,
  );
  return toItemsPage(res);
}

export const getEvent = (slug: string) =>
  apiGet<EventDetailDTO>(`/events/${slug}`);

export const createEvent = (dto: CreateEventDto) =>
  apiPost<EventDetailDTO>("/events", dto);

export const updateEvent = (slug: string, dto: UpdateEventDto) =>
  apiPatch<EventDetailDTO>(`/events/${slug}`, dto);

export const cancelEvent = (slug: string) =>
  apiPost<{ ok: true }>(`/events/${slug}/cancel`);

export const getAttendees = (slug: string) =>
  apiGet<AttendeesResponse>(`/events/${slug}/attendees`);

export const rsvpEvent = (slug: string, status: "going" | "maybe") =>
  apiPost<{ status: RsvpStatus }>(`/events/${slug}/rsvp`, { status });

export const unrsvpEvent = (slug: string) =>
  apiDelete<{ ok: true }>(`/events/${slug}/rsvp`);

export const addCohost = (slug: string, cohostSlug: string) =>
  apiPost<{ ok: true }>(`/events/${slug}/cohosts`, { slug: cohostSlug });

export const removeCohost = (slug: string, cohostSlug: string) =>
  apiDelete<{ ok: true }>(`/events/${slug}/cohosts/${cohostSlug}`);

/** Invite members to an event. `slugs` is capped at 100 by the backend. */
export const inviteToEvent = (slug: string, slugs: string[]) =>
  apiPost<{ invited: number }>(`/events/${slug}/invites`, {
    slugs: slugs.slice(0, 100),
  });

export const respondInvite = (id: string, action: "accept" | "decline") =>
  apiPatch<{ status: RsvpStatus }>(`/event-invites/${id}`, { action });

export type EventInviteStatus = "pending" | "accepted" | "declined";

/** The lean event summary GET /event-invites nests per row — the invitee
 *  decides accept/decline from this, then opens GET /events/:slug to see more. */
export interface InvitedEventDTO {
  slug: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  timezone?: string;
  venue?: string | null;
  isOnline?: boolean;
  coverImageUrl?: string | null;
}

/** One row of GET /event-invites — matches the backend's `PendingEventInviteView`. */
export interface EventInviteDTO {
  id: string;
  status: EventInviteStatus;
  /** ISO 8601 — when the invite was sent. */
  createdAt: string;
  event: InvitedEventDTO | null;
  inviter: EventHostDTO | null;
}

/** GET /event-invites — the caller's own pending event invitations. */
export const getEventInvites = () => apiGet<EventInviteDTO[]>("/event-invites");
