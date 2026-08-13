import type { AdminConcernDTO } from "./api/adminConcerns.api";

/**
 * Demo fixture for the admin concerns dashboard. Fabricated submissions that
 * stand in for the public "Submit a concern" form so the prototype's admin page
 * renders standalone. Never surfaces in live mode — the hook only reads this
 * when `demoMode` is on (the live endpoint is admin-scoped and 403s otherwise).
 *
 * Spread across categories and triage states so every filter tab and status
 * chip has something to show. Logged-out submissions carry an `email`; the
 * signed-in ones resolve to a `submitter` (name/avatar/slug) — a member is
 * reached through their account, not an email.
 */
export const ADMIN_CONCERNS: AdminConcernDTO[] = [
  {
    id: "concern-demo-1",
    category: "member",
    description:
      "Someone in the Trans & Friends community keeps DMing me after I asked them to stop. I'd rather not name them publicly but it's making me not want to log in.",
    email: null,
    submitter: { slug: "avery-santos", name: "Avery Santos", avatarUrl: null },
    status: "new",
    createdAt: "2026-08-13T08:12:00.000Z",
  },
  {
    id: "concern-demo-2",
    category: "content",
    description:
      "The housing listing on Rua do Norte has a photo that doesn't match the address in the description. Might be a duplicate or a mistake.",
    email: "jules@example.com",
    submitter: null,
    status: "reviewing",
    createdAt: "2026-08-12T19:40:00.000Z",
  },
  {
    id: "concern-demo-3",
    category: "appeal",
    description:
      "My comment was removed from the community pulse and I don't think it broke any rule. Can someone take another look at the decision?",
    email: null,
    submitter: { slug: "sam-oliveira", name: "Sam Oliveira", avatarUrl: null },
    status: "reviewing",
    createdAt: "2026-08-12T11:05:00.000Z",
  },
  {
    id: "concern-demo-4",
    category: "gathering",
    description:
      "The venue listed for Thursday's meetup isn't step-free despite being tagged accessible. Worth double-checking with the host before more people RSVP.",
    email: "kai@example.com",
    submitter: null,
    status: "resolved",
    createdAt: "2026-08-10T15:22:00.000Z",
  },
  {
    id: "concern-demo-5",
    category: "other",
    description:
      "Just wanted to flag that the quarterly finances page had a broken link to the reserve breakdown last week. Might already be fixed.",
    email: null,
    submitter: { slug: "robin-costa", name: "Robin Costa", avatarUrl: null },
    status: "dismissed",
    createdAt: "2026-08-08T09:48:00.000Z",
  },
];
