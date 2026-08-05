import type { AdminReadingGroupProposalDTO } from "./api/adminReadingGroupProposals.api";

/**
 * Demo-mode sample of platform-wide reading-group proposals for the admin
 * oversight page, so it renders fully with no backend. Fabricated data — it must
 * never appear as platform truth in live mode (the hook only serves this when
 * `demoMode` is on). Mirrors {@link AdminReadingGroupProposalDTO}.
 */
export const ADMIN_READING_GROUP_PROPOSALS: AdminReadingGroupProposalDTO[] = [
  {
    id: "rgp_4001",
    member: { slug: "joana", name: "Joana Reis" },
    book: "Giovanni's Room — James Baldwin",
    why: "A cornerstone of queer literature I'd love to read slowly together.",
    format: "In-person",
    maxPeople: 6,
    createdAt: "2026-07-24T11:00:00.000Z",
    status: "pending",
    decidedAt: null,
    decisionNote: null,
  },
  {
    id: "rgp_4002",
    member: { slug: "marco", name: "Marco Vieira" },
    book: "Stone Butch Blues — Leslie Feinberg",
    why: null,
    format: "Online",
    maxPeople: 8,
    createdAt: "2026-07-20T19:30:00.000Z",
    status: "approved",
    decidedAt: "2026-07-21T09:00:00.000Z",
    decisionNote: null,
  },
  {
    id: "rgp_4003",
    member: { slug: "sofia", name: "Sofia Antunes" },
    book: "Paul Takes the Form of a Mortal Girl — Andrea Lawlor",
    why: "Perfect for a lighter summer read.",
    format: "Either",
    maxPeople: 4,
    createdAt: "2026-07-16T08:20:00.000Z",
    status: "pending",
    decidedAt: null,
    decisionNote: null,
  },
];
