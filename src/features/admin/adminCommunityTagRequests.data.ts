import type { AdminCommunityTagRequestDTO } from "./api/communityTagRequests.api";

/**
 * Demo-mode sample of platform-wide community tag requests for the admin
 * review queue, so it renders fully with no backend. Mirrors
 * `adminResourceSuggestions.data.ts`: these are already, inherently,
 * unverified owner/mod submissions, so populating the fixture is fine.
 */
export const ADMIN_COMMUNITY_TAG_REQUESTS: AdminCommunityTagRequestDTO[] = [
  {
    id: "ctr_9001",
    communitySlug: "trans-and-friends",
    communityName: "Trans & Friends",
    label: "Chosen Family",
    note: "We keep seeing members describe their group this way, feels missing from the list.",
    status: "pending",
    requestedBy: { slug: "maya", firstName: "Maya", lastName: "Ferreira" },
    createdAt: "2026-08-18T14:20:00.000Z",
    resolvedAt: null,
  },
  {
    id: "ctr_9002",
    communitySlug: "queer-creatives",
    communityName: "Queer Creatives",
    label: "Ballroom",
    note: null,
    status: "resolved",
    requestedBy: { slug: "tomas", firstName: "Tomás", lastName: "Aguiar" },
    createdAt: "2026-08-09T09:00:00.000Z",
    resolvedAt: "2026-08-10T11:00:00.000Z",
  },
];
