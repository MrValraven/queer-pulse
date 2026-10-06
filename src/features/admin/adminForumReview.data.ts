import type { AdminForumReviewThread } from "./api/adminForumReview.api";

/**
 * Demo-mode sample of the forum review queue, so the staff page renders fully
 * with no backend. Invented data: `useAdminForumReview` serves it only while
 * `demoMode` is on. Each row is the moderator view of a held thread, so the
 * anonymous one still carries its real author.
 *
 * The slugs are the forum demo fixture's thread ids (`THREADS` in
 * `features/forum/forum.data.ts`), and the titles and excerpts match those
 * threads, so the row's title link opens the same thread in demo.
 */

const HOUR_IN_MS = 60 * 60 * 1000;

/** An instant this many hours from the moment the module loads, so "Sent 3
 *  hours ago" and "Goes live on Friday" read true whenever the demo runs. */
function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * HOUR_IN_MS).toISOString();
}

/** The fields every held thread shares: nobody has replied, voted or pinned
 *  anything, and nothing is published yet. */
function heldThread(
  overrides: Pick<
    AdminForumReviewThread,
    | "id"
    | "slug"
    | "title"
    | "author"
    | "category"
    | "createdAt"
    | "publishedAt"
    | "excerpt"
    | "kind"
    | "contentWarnings"
    | "isAnonymous"
    | "community"
    | "funding"
    | "fundingReview"
  >,
): AdminForumReviewThread {
  return {
    isPinned: false,
    isLocked: false,
    lockReason: null,
    replyCount: 0,
    lastActivityAt: overrides.createdAt,
    canEdit: false,
    canDelete: true,
    canRestore: false,
    canViewHistory: true,
    canLock: true,
    canPin: true,
    opPostId: `${overrides.id}_op`,
    opVoteCount: 0,
    myVote: 0,
    tags: [],
    isSubscribed: false,
    acceptedPostId: null,
    canAcceptAnswer: false,
    canEditTags: true,
    isDeleted: false,
    unreadReplyCount: null,
    coAuthor: null,
    reviewState: "pending",
    isPublished: false,
    crossPosted: false,
    neighbourhood: null,
    closesAt: null,
    language: "pt",
    isClosed: false,
    poll: null,
    opPhotos: [],
    ...overrides,
  };
}

const firstCreatedAt = hoursFromNow(-3);
const secondCreatedAt = hoursFromNow(-26);
const thirdCreatedAt = hoursFromNow(-50);
const fourthCreatedAt = hoursFromNow(-6);

export const ADMIN_FORUM_REVIEW_THREADS: AdminForumReviewThread[] = [
  heldThread({
    id: "frv_5001",
    slug: "21",
    title:
      "Asking without my name on it: coming out to a GP who knows my family",
    author: {
      handle: "ines",
      displayName: "Inês Tavares",
      avatarUrl: null,
    },
    category: "health",
    createdAt: firstCreatedAt,
    publishedAt: firstCreatedAt,
    excerpt:
      "My family doctor has looked after my parents for twenty years. I need to talk to someone about hormones and I do not know how to start.",
    kind: "question",
    contentWarnings: ["medical", "family-rejection"],
    isAnonymous: true,
    community: null,
  }),
  heldThread({
    id: "frv_5002",
    slug: "16",
    title: "Trans healthcare in Portugal 2026: the complete SNS guide",
    author: {
      handle: "jonas",
      displayName: "Jonas Ferreira",
      avatarUrl: null,
    },
    category: "trans",
    createdAt: secondCreatedAt,
    publishedAt: hoursFromNow(72),
    excerpt:
      "How the SNS pathway works, which gender clinics in Lisbon are actually welcoming, and what to do when the system pushes back.",
    kind: "guide",
    contentWarnings: ["medical"],
    isAnonymous: false,
    community: { slug: "trans-lisboa", name: "Trans Lisboa" },
  }),
  heldThread({
    id: "frv_5003",
    slug: "8",
    title: "Honest guide to finding a flat in Lisbon as a newcomer",
    author: {
      handle: "carla",
      displayName: "Carla Nogueira",
      avatarUrl: null,
    },
    category: "housing",
    createdAt: thirdCreatedAt,
    publishedAt: thirdCreatedAt,
    excerpt:
      "Carla wrote this after three weeks on the rental market. Not encouraging. But useful, and more honest than anything you'll find on a portal.",
    kind: null,
    contentWarnings: [],
    isAnonymous: false,
    community: null,
  }),
  heldThread({
    id: "frv_5004",
    slug: "35",
    title: "Help Rui cover his top surgery recovery",
    author: { handle: "ines", displayName: "Inês Tavares", avatarUrl: null },
    category: "funding",
    createdAt: fourthCreatedAt,
    publishedAt: fourthCreatedAt,
    excerpt:
      "Rui needs six weeks off work after surgery in November. The fundraiser covers rent and food for that time.",
    kind: "ask",
    contentWarnings: [],
    isAnonymous: false,
    community: null,
    funding: {
      linkUrl: "https://www.gofundme.com/f/rui-recovery-lisbon",
      linkHost: "gofundme.com",
      funderName: null,
      amountMin: null,
      amountMax: null,
      deadline: null,
      eligibility: [],
      scope: null,
      callState: null,
      goalAmount: 2400,
      askPurpose: "healthcare",
      beneficiary: "someone_i_know",
      endsAt: null,
      endedAt: null,
      endedReason: null,
      approvedAt: null,
      askState: "pending",
      updatedAt: fourthCreatedAt,
    },
    fundingReview: {
      linkHost: "gofundme.com",
      posterVerificationLevel: "phone",
      posterAccountAgeDays: 400,
    },
  }),
];
