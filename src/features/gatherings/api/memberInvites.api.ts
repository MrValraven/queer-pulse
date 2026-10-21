import { apiGet, apiPost } from "../../../shared/api/client";
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
export const getInviteRequests = (slug: string) =>
  apiGet<InviteRequestDTO[]>(`/events/${slug}/invite-requests`);

/** POST /event-invites/:id/approve, an organiser lets the request through. */
export const approveInviteRequest = (id: string) =>
  apiPost<EventInviteStatusResultDTO>(`/event-invites/${id}/approve`);

/** POST /event-invites/:id/decline-request, an organiser refuses it. */
export const declineInviteRequest = (id: string) =>
  apiPost<EventInviteStatusResultDTO>(`/event-invites/${id}/decline-request`);
