import type { VolunteerSignupDTO } from "./api/volunteering.api";

/**
 * Demo-only applicant roster for the designated demo-poster opportunity (see
 * `volunteerDemoPoster.ts`). Spans all three statuses so the roster card, the
 * manage-applicants dashboard, and the accept/decline UI all have something
 * to show standalone. Never surfaces in live mode.
 */
export const VOLUNTEER_APPLICANTS_DEMO: VolunteerSignupDTO[] = [
  {
    id: "demo-signup-1",
    member: {
      slug: "jules-almeida",
      firstName: "Jules",
      lastName: "Almeida",
      avatarUrl: null,
    },
    note: "I table at markets most weekends already and would love to bring that energy here.",
    status: "pending",
    decidedAt: null,
    createdAt: "2026-08-16T10:00:00.000Z",
    attended: null,
    hoursContributed: null,
    completedAt: null,
  },
  {
    id: "demo-signup-2",
    member: {
      slug: "rowan-silva",
      firstName: "Rowan",
      lastName: "Silva",
      avatarUrl: null,
    },
    note: "Bilingual (PT/EN) and free most weekday evenings.",
    status: "accepted",
    decidedAt: "2026-08-14T09:00:00.000Z",
    createdAt: "2026-08-12T15:30:00.000Z",
    // Accepted and NOT yet confirmed, so the demo roster always has a row the
    // completion control appears on.
    attended: null,
    hoursContributed: null,
    completedAt: null,
  },
  {
    id: "demo-signup-3",
    member: {
      slug: "noa-ferreira",
      firstName: "Noa",
      lastName: "Ferreira",
      avatarUrl: null,
    },
    note: "New to volunteering but eager to learn.",
    status: "declined",
    decidedAt: "2026-08-11T09:00:00.000Z",
    createdAt: "2026-08-10T08:00:00.000Z",
    attended: null,
    hoursContributed: null,
    completedAt: null,
  },
  {
    id: "demo-signup-4",
    member: {
      slug: "kai-monteiro",
      firstName: "Kai",
      lastName: "Monteiro",
      avatarUrl: null,
    },
    note: "Did the June market with you.",
    status: "accepted",
    decidedAt: "2026-07-02T09:00:00.000Z",
    createdAt: "2026-07-01T08:00:00.000Z",
    // Already confirmed, so the roster shows the settled state next to the
    // row that still needs confirming.
    attended: true,
    hoursContributed: 4.5,
    completedAt: "2026-07-20T18:00:00.000Z",
  },
];

/**
 * Demo-only stand-in for `GET /volunteering/me/contribution`. Never read in a
 * live path: `useMyContribution` branches on `demoMode` before touching it.
 */
export const VOLUNTEER_CONTRIBUTION_DEMO = {
  sessionCount: 6,
  hoursContributed: 23.5,
  lastCompletedAt: "2026-08-15T18:00:00.000Z",
  awaitingConfirmationCount: 1,
};
