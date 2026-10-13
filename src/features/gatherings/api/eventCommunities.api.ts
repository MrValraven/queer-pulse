import { apiDelete, apiGet, apiPost } from "../../../shared/api/client";
import type { AccessTier } from "../../communities/membership.types";
import type {
  CohostInviteEventSummaryDTO,
  CohostInviteInviterDTO,
} from "./events.api";

/**
 * Guest communities on a gathering (spec 2026-10-08). The gathering's own
 * community stays the lead; a guest is another community invited to host
 * with it. Any owner, co-owner or mod of the guest accepts or declines, and
 * only an accepted guest is named on the gathering, listed on its page and
 * admitted to "Community members" visibility.
 */

export type EventCommunityStatus = "pending" | "accepted" | "declined";

/** A guest community's display fields. */
export interface EventGuestCommunityCommunityDTO {
  slug: string;
  name: string;
  accessTier: AccessTier;
}

/** One guest row as the organisers see it (`GET /events/:slug/communities`),
 *  every status included. */
export interface EventGuestCommunityView {
  /** `event_communities.id`. */
  id: string;
  status: EventCommunityStatus;
  community: EventGuestCommunityCommunityDTO;
}

/**
 * An accepted guest on the gathering detail (`EventDetail.guestCommunities`).
 * A private guest is left out for a viewer outside its roster who is not an
 * organiser, the rule the lead `community` already follows.
 */
export interface EventGuestCommunityDTO {
  /** `event_communities.id`, the row "Remove our community" deletes. */
  id: string;
  slug: string;
  name: string;
  accessTier: AccessTier;
  /** The viewer is an owner, co-owner or mod of this community. */
  viewerManages: boolean;
  /** Resolved avatar URL, null when the community has none. Absent from an
   *  older server; either way the row falls back to the community icon. */
  avatarImageUrl?: string | null;
}

/** An accepted guest on the gathering view model: the wire entry with the
 *  avatar normalised to a URL or null. */
export interface GatheringGuestCommunity extends Omit<
  EventGuestCommunityDTO,
  "avatarImageUrl"
> {
  avatarImageUrl: string | null;
}

/** `GET /event-communities/:id`: the invite as the guest community's team
 *  (or an organiser) reads it. */
export interface EventCommunityInviteDetailDTO {
  id: string;
  status: EventCommunityStatus;
  createdAt: string;
  respondedAt: string | null;
  /** The display name of the owner, co-owner or mod who answered. */
  respondedByName: string | null;
  /** The guest community. */
  community: EventGuestCommunityCommunityDTO;
  /** Null when the gathering has no lead, or the lead is private and the
   *  viewer is off its roster. */
  leadCommunity: { slug: string; name: string } | null;
  event: CohostInviteEventSummaryDTO & {
    isCancelled: boolean;
    isPast: boolean;
  };
  inviter: CohostInviteInviterDTO | null;
  /** The viewer runs the guest community, the row is pending, the gathering
   *  is ahead and live, and the community is not frozen. */
  canRespond: boolean;
  /** The viewer runs the guest community and the row is accepted. */
  canLeave: boolean;
}

/** A guest row in an editor: a saved row with the status the server holds,
 *  or a row added in this edit that has not gone out yet (`"unsent"`). */
export type GuestCommunityDraftStatus = EventCommunityStatus | "unsent";

export interface GuestCommunityDraftEntry {
  slug: string;
  name: string;
  accessTier: AccessTier;
  status: GuestCommunityDraftStatus;
}

/** What one save sends: the communities to invite and the slugs to remove. */
export interface GuestCommunityChanges {
  invites: GuestCommunityDraftEntry[];
  removeSlugs: string[];
}

export type CollabDecision = "accept" | "decline";

/** GET /events/:slug/communities (organisers only). */
export const listEventGuestCommunities = (slug: string) =>
  apiGet<EventGuestCommunityView[]>(`/events/${slug}/communities`);

/** POST /events/:slug/communities. Accepted on the spot when the caller runs
 *  that community; pending otherwise. */
export const inviteGuestCommunity = (slug: string, communitySlug: string) =>
  apiPost<EventGuestCommunityView>(`/events/${slug}/communities`, {
    communitySlug,
  });

/** DELETE /events/:slug/communities/:communitySlug, any status, silent. */
export const removeGuestCommunity = (slug: string, communitySlug: string) =>
  apiDelete<void>(
    `/events/${slug}/communities/${encodeURIComponent(communitySlug)}`,
  );

/** GET /event-communities/:id. */
export const getCollabInvite = (id: string) =>
  apiGet<EventCommunityInviteDetailDTO>(`/event-communities/${id}`);

/** POST /event-communities/:id/respond. */
export const respondCollabInvite = (id: string, decision: CollabDecision) =>
  apiPost<EventCommunityInviteDetailDTO>(`/event-communities/${id}/respond`, {
    decision,
  });

/** DELETE /event-communities/:id: the guest community leaves an accepted
 *  collab, silently. */
export const leaveCollab = (id: string) =>
  apiDelete<void>(`/event-communities/${id}`);
