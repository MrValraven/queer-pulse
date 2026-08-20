import {
  apiGet,
  apiPost,
  apiPatch,
  apiPut,
  apiDelete,
} from "../../../shared/api/client";
import { toItemsPage } from "../../../shared/api/pagination";

// ── Backend DTOs ───────────────────────────────────────────────────────────
// Shapes the NestJS events domain returns. Only the fields the prototype pages
// actually render are typed richly; everything else is optional and defaulted
// gracefully in the adapters.

// Must mirror the backend `EventVisibility` enum exactly — the create/update
// endpoints validate `@IsEnum(EventVisibility)` with `forbidNonWhitelisted`, so
// any value outside this set is a 400. (The earlier "open"|"network"|"private"
// labels matched nothing on the server and silently failed every create.)
//
// The wizard's audience-scope control offers five of these (`members` through
// `invite_only`); `public` (logged-out/anonymous) stays backend-only — the
// wizard never sets it. See docs/superpowers/specs/2026-08-13-gathering-audience-scope-design.md.
export type EventVisibility =
  | "public"
  | "members"
  | "extended_network"
  | "network"
  | "community"
  | "invite_only";
export type EventStatus = "draft" | "published" | "cancelled";
export type RsvpStatus = "going" | "maybe" | "waitlisted" | "invited";

/** The filters the Events / My-Events tabs map onto GET /events?filter=… */
export type EventFilter =
  "upcoming" | "going" | "hosting" | "waitlisted" | "past" | "saved";

// ── Recurring series (MSG-10) ───────────────────────────────────────────────
// A deliberately minimal repeat rule — no RFC5545/RRULE engine. The backend
// generates one independent, fully RSVPable/editable/cancelable `Event` row
// per occurrence up front (capped at 52) rather than lazily via a generation
// job — see `EventSeries` (backend) and `RecurrenceStep` (FE).

export type RecurrenceCadence = "weekly" | "biweekly" | "monthly";
export type RecurrenceEndType = "count" | "date";

/** The repeat rule sent on create — mirrors the backend's `RecurrenceDto`. */
export interface RecurrenceInput {
  cadence: RecurrenceCadence;
  endType: RecurrenceEndType;
  /** Required when `endType === "count"`. */
  endCount?: number;
  /** Required when `endType === "date"`. ISO 8601. */
  endUntil?: string;
}

/** One event's own position + cadence within its series — rides on every
 *  card/detail the backend returns (`EventSummary.series`, backend). */
export interface EventSeriesDTO {
  id: string;
  cadence: RecurrenceCadence;
  /** This event's own 0-based position within the series. */
  index: number;
  /** The series' TOTAL generated occurrences (not "remaining"). */
  occurrenceCount: number;
}

/** Edit/cancel/RSVP-cancel scope for a recurring occurrence — `"this"` (the
 *  default, omitted from the query string) touches only this occurrence;
 *  `"future"` also applies to every later occurrence in its series. See
 *  `SeriesScopeQuery` (backend). */
export type SeriesScope = "this" | "future";

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
  /** Whether the viewer has bookmarked ("saved") this event. Present on every
   *  summary/detail the backend returns (batch-computed server-side). */
  isBookmarked?: boolean;
  /** The recurring series this event belongs to, or `null`/absent for a
   *  standalone event. Rides on every summary/card (MSG-10), not just the
   *  detail view. */
  series?: EventSeriesDTO | null;
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
  /** True when the viewer is the host or a cohost (organizer-only actions). */
  isOrganizer?: boolean;
  /** The viewer's own RSVP standing on this event, so the in-event RSVP control
   *  can render "you're going" on load. `null` (or a `cancelled` row) means no
   *  active RSVP. Backend `EventDetail.myRsvpStatus`. */
  myRsvpStatus?: "going" | "maybe" | "waitlisted" | "cancelled" | null;
  /** The viewer's place in the waitlist queue, when they're waitlisted.
   *  Backend `EventDetail.myWaitlistPosition`. */
  myWaitlistPosition?: number | null;
  /** True when the event is at capacity — drives the "Join the waitlist"
   *  affordance. Backend `EventSummary.isFull`. */
  isFull?: boolean;
  /** The community this gathering is filed to, or `null` for a
   *  public/network-scoped gathering with no community. Settable at creation
   *  and changeable afterwards via the edit modal's community picker (PATCH
   *  `/events/:slug` with `communitySlug`, see `UpdateEventDto` below) — the
   *  edit modal also uses this to decide whether the "Community members"
   *  audience-scope tier stays offered. */
  communityId?: string | null;
  /** Slug counterpart of `communityId`. */
  communitySlug?: string | null;
  /** The directory listing this gathering's venue is linked to, or `null`/
   *  absent for a free-text venue. Settable via the venue picker (PATCH
   *  `/events/:slug` with `listingId`, see `UpdateEventDto` below). */
  listingId?: string | null;
  /** The linked listing's display name + public slug, when `listingId` is
   *  set and the listing is still live. `null` otherwise. The frontend builds
   *  the `/local/directory/:slug` link itself via `businessPath()`. */
  venueListing?: { slug: string; name: string } | null;
  /** The event's accepted co-hosts (never pending invites — those live under
   *  `event-cohost-invites`). Rides free on `GET /events/:slug` (backend
   *  `EventDetail.cohosts`), so the manage dashboard's cohost roster never
   *  needs a second request. */
  cohosts?: EventHostDTO[];
  /** The viewer's own RSVP details ("Anything we should know?"), or `null`
   *  when they have no active RSVP. Backend `EventDetail.myRsvpDetails`. */
  myRsvpDetails?: RsvpDetailsDTO | null;
  /** Manage-dashboard "Show attendee count" toggle. Detail-only — see
   *  `detailToGathering`'s use of it to hide the numeric "spots" copy from a
   *  non-organizer viewer. */
  showAttendeeCount?: boolean;
  /** Manage-dashboard "Allow waitlist" toggle. Detail-only — read by
   *  `SettingsTab` to seed the toggle's starting state. */
  allowWaitlist?: boolean;
  /** MSG-12 — a small pre-RSVP "who else is going" preview (backend
   *  `EventDetail.goingAttendeesPreview`), earliest RSVP first, capped at 8.
   *  Empty when the host has `showAttendeeCount` off and the viewer isn't the
   *  organizer, or nobody's going yet — never a client-side-only filter, the
   *  backend already excludes blocked members in either direction. */
  goingAttendeesPreview?: EventHostDTO[];
  /** The filtered total behind `goingAttendeesPreview` — NOT `goingCount`
   *  (that's the raw, unfiltered "N going" spots number). Drives the FE's
   *  "+N more" line. Backend `EventDetail.goingAttendeesPreviewTotal`. */
  goingAttendeesPreviewTotal?: number;
}

/** Who can see an attendee's own RSVP details — the same three ids
 *  `RsvpDetailsModal` (myevents) already used as local-only state. */
export type RsvpDetailsVisibility = "everyone" | "connections" | "justMe";

/** The self-service fields `RsvpDetailsModal` reads/writes. */
export interface RsvpDetailsDTO {
  guestCount: number;
  accessNeeds: string | null;
  dietaryNeeds: string | null;
  visibility: RsvpDetailsVisibility | null;
}

/** PATCH /events/:slug/rsvp/details — every field optional (partial edit). */
export type UpdateRsvpDetailsDto = Partial<RsvpDetailsDTO>;

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

/** GET /events/:slug/attendees?status=&page= — one RSVP status's own
 *  paginated page. `total` is that status's own count (going-count or
 *  waitlist-count, depending on `status`); `capacity` rides along so the
 *  manage dashboard's "N of capacity spots filled" bar needs no second call. */
export interface AttendeesPageDTO {
  items: AttendeeDTO[];
  total: number;
  page: number;
  pageSize: number;
  capacity?: number | null;
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
  /** Attach the gathering to one of the organiser's communities. Omitted (or
   *  undefined) keeps it a public/global gathering, as before. */
  communitySlug?: string;
  /** Link the venue to a real directory listing (its uuid). Omitted keeps a
   *  plain free-text `venue`, as before. */
  listingId?: string;
  /** Manage-dashboard "Options" toggles (`SettingsTab`). Omitted keeps the
   *  backend default (`true` — unlimited waitlist, counts shown). */
  allowWaitlist?: boolean;
  showAttendeeCount?: boolean;
  /** Optional repeat rule (MSG-10) — see `RecurrenceInput`'s doc. CREATE-only:
   *  `UpdateEventDto` never carries this (converting an existing standalone
   *  gathering into a series after the fact is out of scope). */
  recurrence?: RecurrenceInput;
}

/** PATCH /events/:slug — every field optional. `communitySlug`/`listingId`
 *  additionally accept `null` (on top of `CreateEventDto`'s
 *  string-or-omitted), so the edit modal can explicitly CLEAR a gathering's
 *  community / unlink its venue from a listing — create-time has no such
 *  concept; omitting the field there just means "none". */
export type UpdateEventDto = Partial<
  Omit<CreateEventDto, "communitySlug" | "listingId" | "recurrence">
> & {
  communitySlug?: string | null;
  listingId?: string | null;
};

// ── Raw calls (one per endpoint) ────────────────────────────────────────────

export async function getEvents(
  params: {
    filter?: EventFilter;
    page?: number;
    /** Narrows `filter: "upcoming"` to one host's other gatherings —
     *  `GatheringRecapPage`'s "more from this host" CTA. Ignored by every
     *  other filter (see `ListEventsQuery`, backend). */
    hostSlug?: string;
    /** Pairs with `hostSlug` — drops one event out of its own results. */
    excludeSlug?: string;
  } = {},
): Promise<EventsPage> {
  const q = new URLSearchParams();
  if (params.filter) q.set("filter", params.filter);
  if (params.page) q.set("page", String(params.page));
  if (params.hostSlug) q.set("hostSlug", params.hostSlug);
  if (params.excludeSlug) q.set("excludeSlug", params.excludeSlug);
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

/** `scope` (MSG-10) — `"future"` also applies to every later occurrence in
 *  this event's series (never its own `startAt`/`endAt`); omitted (or
 *  `"this"`) touches only this occurrence. See `SeriesScope`'s doc. */
export const updateEvent = (
  slug: string,
  dto: UpdateEventDto,
  scope?: SeriesScope,
) =>
  apiPatch<EventDetailDTO>(
    `/events/${slug}${scope ? `?scope=${scope}` : ""}`,
    dto,
  );

/** `scope` (MSG-10) — `"future"` also cancels every later, not-yet-cancelled
 *  occurrence in this event's series; omitted (or `"this"`) cancels only
 *  this occurrence. See `SeriesScope`'s doc. */
export const cancelEvent = (slug: string, scope?: SeriesScope) =>
  apiPost<{ ok: true }>(
    `/events/${slug}/cancel${scope ? `?scope=${scope}` : ""}`,
  );

export const getAttendees = (
  slug: string,
  status: "going" | "waitlisted",
  page?: number,
) => {
  const q = new URLSearchParams({ status });
  if (page) q.set("page", String(page));
  return apiGet<AttendeesPageDTO>(`/events/${slug}/attendees?${q.toString()}`);
};

export const rsvpEvent = (slug: string, status: "going" | "maybe") =>
  apiPost<{ status: RsvpStatus }>(`/events/${slug}/rsvp`, { status });

/** `scope` (MSG-10) — `"future"` also cancels the caller's own RSVP on every
 *  later occurrence in this event's series; omitted (or `"this"`) cancels
 *  only this occurrence's RSVP. See `SeriesScope`'s doc. */
export const unrsvpEvent = (slug: string, scope?: SeriesScope) =>
  apiDelete<{ ok: true }>(
    `/events/${slug}/rsvp${scope ? `?scope=${scope}` : ""}`,
  );

/** PATCH /events/:slug/rsvp/details — the caller's own RSVP ("Anything we
 *  should know?"). 404s when the caller has no active RSVP to the event. */
export const updateRsvpDetails = (
  slug: string,
  dto: UpdateRsvpDetailsDto,
) => apiPatch<RsvpDetailsDTO>(`/events/${slug}/rsvp/details`, dto);

/** POST /events/:slug/bookmark — save the event (idempotent). */
export const bookmarkEvent = (slug: string) =>
  apiPost<{ bookmarked: true }>(`/events/${slug}/bookmark`);

/** DELETE /events/:slug/bookmark — remove the bookmark (idempotent). */
export const unbookmarkEvent = (slug: string) =>
  apiDelete<{ bookmarked: false }>(`/events/${slug}/bookmark`);

export const removeCohost = (slug: string, cohostSlug: string) =>
  apiDelete<{ ok: true }>(`/events/${slug}/cohosts/${cohostSlug}`);

/** DELETE /events/:slug/attendees/:memberSlug — host/co-host removes a
 *  going/maybe/waitlisted attendee. Idempotent. */
export const removeAttendee = (slug: string, memberSlug: string) =>
  apiDelete<{ ok: true }>(`/events/${slug}/attendees/${memberSlug}`);

/** POST /events/:slug/waitlist/:memberSlug/promote — host/co-host manually
 *  promotes one waitlisted member to going, out of FIFO order. */
export const promoteAttendee = (slug: string, memberSlug: string) =>
  apiPost<{ ok: true }>(`/events/${slug}/waitlist/${memberSlug}/promote`);

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

// ── Event photos (gathering album) ──────────────────────────────────────────
// Backend `EventPhotoView`. `url` is a short-lived presigned GET the browser
// renders directly; `uploader` reuses the member-ref shape (`EventHostDTO`).

/** One photo from GET /events/:slug/photos. */
export interface EventPhotoDTO {
  id: string;
  url: string;
  uploader: EventHostDTO | null;
  caption: string | null;
  /** ISO 8601 — when the photo was attached. */
  createdAt: string;
}

/** GET /events/:slug/photos — participants only (host/cohosts/going). */
export const getEventPhotos = (slug: string) =>
  apiGet<{ photos: EventPhotoDTO[] }>(`/events/${slug}/photos`);

/** POST /events/:slug/photos — organizers only. `key` is a presigned-upload key. */
export const attachEventPhoto = (
  slug: string,
  body: { key: string; caption?: string },
) => apiPost<EventPhotoDTO>(`/events/${slug}/photos`, body);

// ── Event lineup ("who performed") ──────────────────────────────────────────
// Backend `EventLineupEntryView`/`EventLineupDTO` (Personas Phase 5, Moment 5).

/** One resolved row of an event's lineup. */
export interface EventLineupEntryDTO {
  slug: string;
  name: string;
  avatarUrl: string | null;
  /** Free-ish craft/role label the host assigned — not backend-enum-
   *  constrained, see `PutLineupDto`. The FE only ever writes one of
   *  `LINEUP_ROLES` (`eventLineup.data.ts`). */
  role: string;
}

/** GET/PUT `/events/:slug/lineup` response. `viewerEntry` is the caller's
 *  own row, or `null` if they're not on the bill. */
export interface EventLineupDTO {
  entries: EventLineupEntryDTO[];
  viewerEntry: EventLineupEntryDTO | null;
}

export interface LineupEntryInput {
  memberSlug: string;
  role: string;
}

/** GET /events/:slug/lineup — participant/organizer visibility (mirrors
 *  attendee visibility; 404s for a non-visible event). */
export const getEventLineup = (slug: string) =>
  apiGet<EventLineupDTO>(`/events/${slug}/lineup`);

/** PUT /events/:slug/lineup — host/co-host only, replace-all. */
export const replaceEventLineup = (slug: string, entries: LineupEntryInput[]) =>
  apiPut<EventLineupDTO>(`/events/${slug}/lineup`, { entries });

// ── Cohost invites (real invite → accept/decline lifecycle) ────────────────
// Backend `CohostInviteDetailView` / `EventCohostInvitesService`.

export type CohostInviteStatus = "pending" | "accepted" | "declined";

export interface CohostInviteEventSummaryDTO {
  slug: string;
  title: string;
  startAt: string;
  endAt: string | null;
  timezone: string;
  venue: string | null;
  isOnline: boolean;
  goingCount: number;
  waitlistCount: number;
}

export interface CohostInviteInviterDTO {
  slug: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  hostedEventsCount: number;
  mutualConnectionsCount: number;
}

/** GET /event-cohost-invites/:id response. */
export interface CohostInviteDetailDTO {
  id: string;
  status: CohostInviteStatus;
  role: string;
  commitment: string;
  message: string | null;
  replyByDate: string | null;
  createdAt: string;
  event: CohostInviteEventSummaryDTO;
  inviter: CohostInviteInviterDTO;
}

export const getCohostInvite = (id: string) =>
  apiGet<CohostInviteDetailDTO>(`/event-cohost-invites/${id}`);

export interface CreateCohostInviteDto {
  inviteeSlug: string;
  role: string;
  commitment: string;
  message?: string;
  replyByDate?: string;
}

/** POST /events/:slug/cohost-invites — host/co-host sends a cohost invite. */
export const createCohostInvite = (slug: string, dto: CreateCohostInviteDto) =>
  apiPost<{ id: string; status: CohostInviteStatus }>(
    `/events/${slug}/cohost-invites`,
    dto,
  );

/** PATCH /event-cohost-invites/:id — the invitee accepts or declines. */
export const respondCohostInvite = (id: string, action: "accept" | "decline") =>
  apiPatch<{ id: string; status: CohostInviteStatus }>(
    `/event-cohost-invites/${id}`,
    { action },
  );

