import type { AdminTopicDTO } from "./api/topicsAdmin.api";

/**
 * Demo fixture for the topic directory console. The five topics are the same
 * curated set the backend migration seeds
 * (`queerpulse-backend/src/topics/topics.seed.ts`) and the same set
 * `features/topics/topics.data.tsx` has shown since the prototype, so demo
 * mode and live mode open on the same directory.
 *
 * One row is archived so the archive/restore affordance has something to
 * demonstrate without the reader having to archive a topic first.
 */
export const DEMO_ADMIN_TOPICS: AdminTopicDTO[] = [
  {
    id: "demo-topic-healthcare",
    tag: "healthcare",
    label: "Healthcare",
    description:
      "Conversations, resources, recommendations, and warnings about navigating health systems as a queer person in Lisbon. Curated by Trans Hub and Wellbeing.",
    totalPosts: 347,
    followerCount: 1204,
    isCrisisCard: false,
    isArchived: false,
    archivedAt: null,
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-08-02T09:00:00.000Z",
  },
  {
    id: "demo-topic-trans",
    tag: "trans",
    label: "Trans",
    description:
      "Everything trans and non-binary life in Lisbon touches: legal name changes, hormones, community, joy. Curated by Trans Hub.",
    totalPosts: 512,
    followerCount: 2117,
    isCrisisCard: false,
    isArchived: false,
    archivedAt: null,
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-08-11T09:00:00.000Z",
  },
  {
    id: "demo-topic-mentalhealth",
    tag: "mentalhealth",
    label: "Mental health",
    description:
      "Therapy that gets us, peer support, and the honest conversations in between. Curated by Wellbeing. You are not alone here.",
    totalPosts: 428,
    followerCount: 1633,
    isCrisisCard: true,
    isArchived: false,
    archivedAt: null,
    createdAt: "2026-01-12T09:00:00.000Z",
    updatedAt: "2026-08-14T09:00:00.000Z",
  },
  {
    id: "demo-topic-housing",
    tag: "housing",
    label: "Housing",
    description:
      "Sublets, flatshares, co-ops, and mutual aid for finding somewhere safe to live as a queer person in Lisbon. Real listings, real people, no agencies.",
    totalPosts: 173,
    followerCount: 890,
    isCrisisCard: false,
    isArchived: false,
    archivedAt: null,
    createdAt: "2026-02-03T09:00:00.000Z",
    updatedAt: "2026-08-09T09:00:00.000Z",
  },
  {
    id: "demo-topic-nightlife",
    tag: "nightlife",
    label: "Nightlife",
    description:
      "Where to dance, who's playing, and which rooms actually feel safe after dark. Party listings, venue reviews, and get-home-safe plans, by the people who go.",
    totalPosts: 289,
    followerCount: 1441,
    isCrisisCard: false,
    isArchived: false,
    archivedAt: null,
    createdAt: "2026-02-03T09:00:00.000Z",
    updatedAt: "2026-08-16T09:00:00.000Z",
  },
  {
    id: "demo-topic-pride2025",
    tag: "pride2025",
    label: "Pride 2025",
    description:
      "Everything around the 2025 marches, parties and protests. Kept for its archive, retired now that the year is over.",
    totalPosts: 96,
    followerCount: 402,
    isCrisisCard: false,
    isArchived: true,
    archivedAt: "2026-01-06T09:00:00.000Z",
    createdAt: "2025-04-18T09:00:00.000Z",
    updatedAt: "2026-01-06T09:00:00.000Z",
  },
];
