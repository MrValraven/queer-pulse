import type { AdminCommunitySpaceRequestDTO } from "./api/adminCommunitySpaceRequests.api";

/**
 * Demo-mode sample of "Request spaces" submissions for the admin review
 * queue, so it renders fully with no backend. Mirrors
 * `adminCommunityTagRequests.data.ts`: these are already, inherently,
 * unverified owner/co-owner submissions, so populating the fixture is fine.
 */
export const ADMIN_COMMUNITY_SPACE_REQUESTS: AdminCommunitySpaceRequestDTO[] = [
  {
    id: "csr_9001",
    community: {
      slug: "coletivo-gula",
      name: "Coletivo Gula",
      accessTier: "request",
      avatarUrl: null,
    },
    requestedBy: { slug: "maya", name: "Maya Ferreira", avatarUrl: null },
    note: "A space for parents and one for people new to the city.",
    status: "open",
    createdAt: "2026-09-12T10:15:00.000Z",
    decidedAt: null,
    declineReason: null,
  },
  {
    id: "csr_9002",
    community: {
      slug: "queer-creatives",
      name: "Queer Creatives",
      accessTier: "public",
      avatarUrl: null,
    },
    requestedBy: { slug: "tomas", name: "Tomás Aguiar", avatarUrl: null },
    note: null,
    status: "approved",
    createdAt: "2026-09-05T09:00:00.000Z",
    decidedAt: "2026-09-06T11:00:00.000Z",
    declineReason: null,
  },
  {
    id: "csr_9003",
    community: {
      slug: "trans-and-friends",
      name: "Trans & Friends",
      accessTier: "invite",
      avatarUrl: null,
    },
    requestedBy: { slug: "beatriz", name: "Beatriz Nunes", avatarUrl: null },
    note: "Our reading group keeps splitting off into side chats.",
    status: "declined",
    createdAt: "2026-09-02T14:40:00.000Z",
    decidedAt: "2026-09-03T08:30:00.000Z",
    declineReason:
      "Let's revisit once the community has a few more active moderators.",
  },
];
