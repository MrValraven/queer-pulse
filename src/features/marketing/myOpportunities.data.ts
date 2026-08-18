import type { MyOpportunitySummaryDTO } from "./api/volunteering.api";
import { DEMO_POSTER_OPPORTUNITY_SLUG } from "./volunteerDemoPoster";
import { VOLUNTEER_APPLICANTS_DEMO } from "./volunteerApplicants.data";

const pendingCount = VOLUNTEER_APPLICANTS_DEMO.filter(
  (s) => s.status === "pending",
).length;
const acceptedCount = VOLUNTEER_APPLICANTS_DEMO.filter(
  (s) => s.status === "accepted",
).length;

/** The demo viewer's single posted opportunity, for the manage-applicants
 *  dashboard's opportunity list. Role/org match the real
 *  `VOLUNTEER_OPPORTUNITIES` entry for `DEMO_POSTER_OPPORTUNITY_SLUG`. */
export const MY_OPPORTUNITIES_DEMO: MyOpportunitySummaryDTO[] = [
  {
    slug: DEMO_POSTER_OPPORTUNITY_SLUG,
    role: "Community Outreach Volunteer",
    org: "A national LGBTQ+ rights organisation",
    status: "open",
    pendingCount,
    acceptedCount,
    spotsTotal: 5,
    createdAt: "2026-07-20T09:00:00.000Z",
  },
];
