import { apiGet, apiPost } from "../../../shared/api/client";
import { eventApiPath, type EventApiTarget } from "./eventApiTarget";
import type { EventHostDTO, EventInviteStatus } from "./events.api";

/**
 * Member invites sent from an RSVP, and the organiser's approval queue for
 * them on invite-only events. Mirrors the backend's `InviterInviteView`,
 * `InviteRequestView` and `CreateMemberInvitesResult`, with every Date as an
 * ISO 8601 string.
 */

/** What the inviter may know about an invite they sent. The server works it
 *  out, so a decline and a `justMe` attendee both read `answered`. */
export type InviterInviteStatus =
  | "invited"
  | "awaiting_host"
  | "host_declined"
  | "going"
  | "waitlisted"
  | "answered";

/** One row of GET /events/:slug/rsvp/invites. */
export interface RsvpInviteDTO {
  id: string;
  invitee: EventHostDTO | null;
  status: InviterInviteStatus;
  /** ISO 8601, when the invite was sent. */
  createdAt: string;
  canWithdraw: boolean;
}

/** One row of GET /events/:slug/invite-requests. ORGANISERS ONLY. */
export interface InviteRequestDTO {
  id: string;
  inviter: EventHostDTO | null;
  invitee: EventHostDTO | null;
  /** ISO 8601, when the request was made. */
  createdAt: string;
}

/** Why the server turned one picked member down. `not_invitable` covers every
 *  private reason alike, so it reveals nothing about that member. */
export type RsvpInviteRefusalReason = "already_invited" | "not_invitable";

/** POST /events/:slug/rsvp/invites result. */
export interface CreateRsvpInvitesResultDTO {
  invites: RsvpInviteDTO[];
  refused: { slug: string; reason: RsvpInviteRefusalReason }[];
}

/** The answer to withdraw, approve and decline-request. */
export interface EventInviteStatusResultDTO {
  id: string;
  status: EventInviteStatus;
}

/** GET /events/:slug/rsvp/invites, the invites the caller sent from their
 *  RSVP to this event. */
export const getRsvpInvites = (slug: string) =>
  apiGet<RsvpInviteDTO[]>(`/events/${slug}/rsvp/invites`);

/** POST /events/:slug/rsvp/invites, invite connections from the caller's
 *  RSVP. The server holds the guest cap. */
export const sendRsvpInvites = (slug: string, slugs: string[]) =>
  apiPost<CreateRsvpInvitesResultDTO>(`/events/${slug}/rsvp/invites`, {
    slugs,
  });

/** POST /event-invites/:id/withdraw, the inviter takes back an open invite. */
export const withdrawEventInvite = (id: string) =>
  apiPost<EventInviteStatusResultDTO>(`/event-invites/${id}/withdraw`);

/** GET /events/:slug/invite-requests, member invites waiting for an
 *  organiser on an invite-only event. */
export const getInviteRequests = (
  slug: string,
  target: EventApiTarget = "member",
) => apiGet<InviteRequestDTO[]>(eventApiPath(target, slug, "/invite-requests"));

/** The path an organiser answers an invite request on. The member target uses
 *  the global `/event-invites/:id/...` route; the music admin target answers
 *  on the event's own route, which cannot be built without the event slug. */
function inviteRequestAnswerPath(
  id: string,
  target: EventApiTarget,
  eventSlug: string | undefined,
  memberAction: "approve" | "decline-request",
  adminAction: "approve" | "decline",
): string {
  if (target === "member") return `/event-invites/${id}/${memberAction}`;
  if (!eventSlug) {
    throw new Error(
      "Answering an invite request on the music admin route needs the event slug, and none was given",
    );
  }
  return eventApiPath(
    target,
    eventSlug,
    `/invite-requests/${id}/${adminAction}`,
  );
}

/** POST /event-invites/:id/approve, an organiser lets the request through.
 *  The music admin target posts to the event's own invite-requests route, so
 *  it requires the event slug. */
export const approveInviteRequest = (
  id: string,
  target: EventApiTarget = "member",
  eventSlug?: string,
) =>
  apiPost<EventInviteStatusResultDTO>(
    inviteRequestAnswerPath(id, target, eventSlug, "approve", "approve"),
  );

/** POST /event-invites/:id/decline-request, an organiser refuses it. The
 *  music admin target requires the event slug, as approve does. */
export const declineInviteRequest = (
  id: string,
  target: EventApiTarget = "member",
  eventSlug?: string,
) =>
  apiPost<EventInviteStatusResultDTO>(
    inviteRequestAnswerPath(
      id,
      target,
      eventSlug,
      "decline-request",
      "decline",
    ),
  );
