import type { MuteDTO } from "../social/api/social.api";

/**
 * Demo fallback for the "Muted" section of `BlockedUsersPane`. Live mode
 * fetches the real `GET /mutes` instead (see `api/useMutedMembers.ts`), so
 * this mock is the demo branch only. Shaped exactly like the live `MuteDTO`
 * so the rendering code never has to special-case demo vs. live data.
 *
 * Fictional demo members, English in both catalogs (the member-bio
 * convention). A mute carries no reason: it is one-way and silent, and the
 * member who placed it never had to justify it.
 */
export const DEMO_MUTED_MEMBERS: MuteDTO[] = [
  {
    id: "demo-mute-1",
    member: {
      slug: "jonas-almeida",
      firstName: "Jonas",
      lastName: "Almeida",
      avatarUrl: null,
    },
    createdAt: "2026-08-04T18:22:00.000Z",
  },
  {
    id: "demo-mute-2",
    member: {
      slug: "iris-fonseca",
      firstName: "Iris",
      lastName: "Fonseca",
      avatarUrl: null,
    },
    createdAt: "2026-06-11T08:05:00.000Z",
  },
];
