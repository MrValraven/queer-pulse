import type { AdminResourceSuggestionDTO } from "./api/adminResourceSuggestions.api";

/**
 * Demo-mode sample of platform-wide resource suggestions for the admin
 * review queue, so it renders fully with no backend. Unlike
 * `adminResourceListings.data.ts` (deliberately empty — those rows would
 * masquerade as real vetted organisations), populating THIS fixture is fine:
 * suggestions are already, inherently, unverified member submissions, not
 * claims of real vetted content. Mirrors `adminReadingGroupProposals.data.ts`.
 */
export const ADMIN_RESOURCE_SUGGESTIONS: AdminResourceSuggestionDTO[] = [
  {
    id: "rs_5001",
    member: { slug: "beatriz", name: "Beatriz Nunes" },
    category: "sexual_health_testing",
    name: "Trans-friendly testing van (Almada)",
    description: "Free anonymous rapid testing every Thursday evening.",
    phone: null,
    email: "testingvan@example.org",
    website: null,
    createdAt: "2026-08-15T18:30:00.000Z",
    status: "pending",
    decidedAt: null,
    decisionNote: null,
    createdListingId: null,
  },
  {
    id: "rs_5002",
    member: { slug: "tomas", name: "Tomás Aguiar" },
    category: "legal_aid",
    name: "Porto Queer Legal Clinic",
    description: "Pro-bono workplace discrimination cases, walk-in Wednesdays.",
    phone: "+351 220 000 000",
    email: null,
    website: "portoqueerlegal.pt",
    createdAt: "2026-08-10T09:00:00.000Z",
    status: "approved",
    decidedAt: "2026-08-11T10:00:00.000Z",
    decisionNote: "Verified with the clinic directly.",
    // Approved BEFORE approval published anything (PRD-269), which is exactly
    // the state the defect left rows in: told "accepted", nothing in the
    // directory. Kept as the fixture's second row so the console's handling of
    // a pre-transition approval is visible in demo mode.
    createdListingId: null,
  },
];
