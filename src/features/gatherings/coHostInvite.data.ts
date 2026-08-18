import type { CohostInviteDetailDTO } from "./api/events.api";

/**
 * Demo-mode fallback for `useCohostInvite`: a fixed pending cohost invite so
 * the `/co-host-invite/:inviteId` page has something to render standalone,
 * with no backend. Replaces the old page-specific hardcoded constants
 * (`INVITE_ID`, `HOST_NAME`, etc.) that lived directly in `CoHostInvitePage.tsx`.
 */
export const DEMO_COHOST_INVITE: CohostInviteDetailDTO = {
  id: "cohost-anika-clinic",
  status: "pending",
  role: "greeter",
  commitment: "light",
  message:
    "I'd love to do this with you. You're calmer than I am about the front-door bit and you know Sandra and Rui.",
  replyByDate: new Date(2026, 5, 10).toISOString(),
  createdAt: new Date(2026, 5, 8).toISOString(),
  event: {
    slug: "open-clinic-night",
    title: "Open clinic night: bring your prescription questions",
    startAt: new Date(2026, 5, 12, 19, 0).toISOString(),
    endAt: new Date(2026, 5, 12, 21, 0).toISOString(),
    timezone: "Europe/Lisbon",
    venue: "the community café",
    isOnline: false,
    goingCount: 22,
    waitlistCount: 14,
  },
  inviter: {
    slug: "anika",
    firstName: "Anika",
    lastName: "Kovač",
    avatarUrl: null,
    hostedEventsCount: 14,
    mutualConnectionsCount: 11,
  },
};
