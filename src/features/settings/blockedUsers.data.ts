import type { BlockDTO } from "../social/api/social.api";

/**
 * Demo fallback for `BlockedUsersPane`. Live mode fetches the real
 * `GET /blocks` instead (see `api/useBlockedUsers.ts`) — this mock is the demo
 * branch only, shaped exactly like the live `BlockDTO` so the pane's rendering
 * code never has to special-case demo vs. live data.
 */
export const DEMO_BLOCKED_USERS: BlockDTO[] = [
  {
    id: "demo-block-1",
    member: {
      slug: "marcus-webb",
      firstName: "Marcus",
      lastName: "Webb",
      avatarUrl: null,
    },
    createdAt: "2026-07-02T10:15:00.000Z",
    reason: "Repeated unwanted messages after I asked them to stop.",
  },
  {
    id: "demo-block-2",
    member: {
      slug: "priya-shah",
      firstName: "Priya",
      lastName: "Shah",
      avatarUrl: null,
    },
    createdAt: "2026-05-18T09:40:00.000Z",
  },
];
