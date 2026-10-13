import type {
  CollabDecision,
  EventCommunityInviteDetailDTO,
} from "./api/eventCommunities.api";
import { gatheringDetails, type GatheringDetail } from "./data";

/** The demo gathering the invite is for. Its card reads the detail mock, so
 *  the invite and the page "View gathering" opens agree on the title, the
 *  day and the place. */
const PORTFOLIO_NIGHT = gatheringDetails["portfolio-night"] as GatheringDetail;

/** How long the portfolio night runs, for the invite card's end time. */
const PORTFOLIO_NIGHT_HOURS = 3;

/**
 * Demo-mode fallback for `useCollabInvite`: a pending invite for Queer
 * Runners Lisboa, which the demo viewer moderates, to host Rainbow Arts
 * Collective's portfolio night with it. Backs `/collab-invites/:inviteId`
 * standalone.
 */
export const DEMO_COLLAB_INVITE: EventCommunityInviteDetailDTO = {
  id: "collab-portfolio-night",
  status: "pending",
  createdAt: new Date(2026, 9, 6).toISOString(),
  respondedAt: null,
  respondedByName: null,
  community: {
    slug: "queer-runners",
    name: "Queer Runners Lisboa",
    accessTier: "public",
  },
  leadCommunity: { slug: "rainbow-arts", name: "Rainbow Arts Collective" },
  event: {
    slug: PORTFOLIO_NIGHT.slug,
    title: PORTFOLIO_NIGHT.title,
    startAt: PORTFOLIO_NIGHT.date.toISOString(),
    endAt: new Date(
      PORTFOLIO_NIGHT.date.getTime() + PORTFOLIO_NIGHT_HOURS * 60 * 60 * 1000,
    ).toISOString(),
    timezone: "Europe/Lisbon",
    venue: PORTFOLIO_NIGHT.hood,
    isOnline: false,
    goingCount: 32,
    waitlistCount: 0,
    isCancelled: false,
    isPast: false,
  },
  inviter: {
    slug: "luisa",
    firstName: "Luísa",
    lastName: "Gomes",
    avatarUrl: null,
    hostedEventsCount: 9,
    mutualConnectionsCount: 4,
  },
  canRespond: true,
  canLeave: false,
};

/** The demo invite once the viewer has answered it. */
export function demoAnsweredCollabInvite(
  decision: CollabDecision,
): EventCommunityInviteDetailDTO {
  const isAccepted = decision === "accept";
  return {
    ...DEMO_COLLAB_INVITE,
    status: isAccepted ? "accepted" : "declined",
    respondedAt: new Date().toISOString(),
    respondedByName: null,
    canRespond: false,
    canLeave: isAccepted,
  };
}
