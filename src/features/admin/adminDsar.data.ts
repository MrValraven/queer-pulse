import type { AdminDsarRequestDTO } from "./api/adminDsar.api";

/** ISO timestamp `days` from now (negative for the past), so the demo queue
 *  always reads coherently against a real clock instead of drifting into a
 *  wall of hardcoded 2026 dates. */
function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

/** The statutory window every DSAR gets, matching the backend's `DSAR_DUE_DAYS`. */
const DSAR_DUE_DAYS = 30;

/** One fabricated queue row, with the countdown fields kept consistent with
 *  its own dates (the live backend computes these server-side). */
function demoRequest(
  request: Omit<
    AdminDsarRequestDTO,
    "submittedAt" | "dueBy" | "daysRemaining" | "isOverdue"
  > & { daysAgo: number },
): AdminDsarRequestDTO {
  const { daysAgo, ...rest } = request;
  const daysRemaining = DSAR_DUE_DAYS - daysAgo;
  const isOpen = rest.status === "received" || rest.status === "in_review";
  return {
    ...rest,
    submittedAt: isoDaysFromNow(-daysAgo),
    dueBy: isoDaysFromNow(daysRemaining),
    daysRemaining,
    isOverdue: isOpen && daysRemaining < 0,
  };
}

/**
 * Demo-mode sample of the data-subject request queue, so `/admin/dsar` renders
 * fully with no backend. Fabricated data: it must never appear as platform
 * truth in live mode (the hook only serves this when `demoMode` is on).
 * Deliberately spans the whole clock, one row past its deadline and one with
 * days to spare, so the overdue treatment is visible in demo.
 */
export const ADMIN_DSAR_REQUESTS: AdminDsarRequestDTO[] = [
  demoRequest({
    id: "dsar_2001",
    reference: "DSAR-4F91A2B0",
    article: 15,
    status: "received",
    scopes: ["messages", "gatherings"],
    details:
      "I would like a copy of every message I sent through the platform last year, plus the RSVPs attached to my account.",
    context: "/account/data",
    member: { slug: "marco", name: "Marco Vieira" },
    respondedAt: null,
    outcomeNote: null,
    daysAgo: 34,
  }),
  demoRequest({
    id: "dsar_2002",
    reference: "DSAR-71C3D0AE",
    article: 16,
    status: "in_review",
    scopes: ["profile"],
    details:
      "My legal name is still attached to two old forum posts. Please correct them to the name on my profile.",
    context: "/account/profile",
    member: { slug: "ines", name: "Inês Marques" },
    respondedAt: null,
    outcomeNote: "Located both posts, confirming with the forum team.",
    daysAgo: 27,
  }),
  demoRequest({
    id: "dsar_2003",
    reference: "DSAR-0B58EE12",
    article: 21,
    status: "received",
    scopes: ["notifications"],
    details:
      "I object to my activity being used to build the recommendations I keep seeing on the feed.",
    context: null,
    member: { slug: "joana", name: "Joana Reis" },
    respondedAt: null,
    outcomeNote: null,
    daysAgo: 6,
  }),
  demoRequest({
    id: "dsar_2004",
    reference: "DSAR-9D22F4C7",
    article: 17,
    status: "resolved",
    scopes: ["listings", "reviews"],
    details:
      "Please erase the two reviews I left on business listings. I no longer want them attached to me.",
    context: "/local/directory",
    member: { slug: "rui", name: "Rui Bettencourt" },
    respondedAt: isoDaysFromNow(-9),
    outcomeNote:
      "Both reviews removed and the cached copies cleared. Confirmed with a follow-up notification.",
    daysAgo: 21,
  }),
  demoRequest({
    id: "dsar_2005",
    reference: "DSAR-3A70B915",
    article: 15,
    status: "rejected",
    scopes: ["messages"],
    details:
      "I want the messages another member sent about me in a group thread.",
    context: null,
    member: { slug: "sofia", name: "Sofia Almeida" },
    respondedAt: isoDaysFromNow(-16),
    outcomeNote:
      "Declined: the request covers another member's own words, which are their personal data, so we cannot hand them over. Explained the appeal route.",
    daysAgo: 24,
  }),
];
