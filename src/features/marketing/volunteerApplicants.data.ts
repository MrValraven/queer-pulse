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
  },
];
