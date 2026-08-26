import type { AdminVolunteerHoursDTO } from "./api/adminVolunteerHours.api";
import { periodFrom, type VolunteerHoursPeriod } from "./volunteerHoursPeriod";

/**
 * Demo fixture for the volunteer-hours report (SUS-05).
 *
 * Deliberately the numbers of a small platform that has been running
 * volunteering for about a year: a few dozen people, a handful of
 * opportunities, three communities. A fixture with impressive figures would
 * make the demo lie about the one thing this page exists to be honest about.
 *
 * Every list here is well under the server's breakdown ceiling, so both
 * `isCapped` flags are false: the demo never shows a truncation notice it has
 * no truncation for.
 */

/** The server caps each breakdown at this many rows (`HOURS_BREAKDOWN_LIMIT`). */
const BREAKDOWN_LIMIT = 100;

interface DemoPeriodShape {
  sessionCount: number;
  hoursContributed: number;
  volunteerCount: number;
  byOpportunity: AdminVolunteerHoursDTO["byOpportunity"];
  byCommunity: AdminVolunteerHoursDTO["byCommunity"];
}

const DEMO_PERIODS: Record<VolunteerHoursPeriod, DemoPeriodShape> = {
  days30: {
    sessionCount: 14,
    hoursContributed: 47.5,
    volunteerCount: 9,
    byOpportunity: [
      {
        opportunitySlug: "friday-kitchen-shift",
        role: "Kitchen shift",
        org: "Casa Arco",
        sessionCount: 8,
        hoursContributed: 28,
      },
      {
        opportunitySlug: "helpline-listener",
        role: "Helpline listener",
        org: "Linha Arco-Íris",
        sessionCount: 4,
        hoursContributed: 14,
      },
      {
        opportunitySlug: "pride-stall-setup",
        role: "Stall setup",
        org: "Lisboa Pride",
        sessionCount: 2,
        hoursContributed: 5.5,
      },
    ],
    byCommunity: [
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000001",
        communitySlug: "trans-and-friends",
        communityName: "Trans & Friends",
        sessionCount: 8,
        hoursContributed: 28,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000002",
        communitySlug: "queer-creatives",
        communityName: "Queer Creatives",
        sessionCount: 2,
        hoursContributed: 5.5,
      },
    ],
  },
  days90: {
    sessionCount: 41,
    hoursContributed: 138,
    volunteerCount: 17,
    byOpportunity: [
      {
        opportunitySlug: "friday-kitchen-shift",
        role: "Kitchen shift",
        org: "Casa Arco",
        sessionCount: 22,
        hoursContributed: 77,
      },
      {
        opportunitySlug: "helpline-listener",
        role: "Helpline listener",
        org: "Linha Arco-Íris",
        sessionCount: 11,
        hoursContributed: 38.5,
      },
      {
        opportunitySlug: "pride-stall-setup",
        role: "Stall setup",
        org: "Lisboa Pride",
        sessionCount: 5,
        hoursContributed: 13,
      },
      {
        opportunitySlug: "archive-scanning",
        role: "Archive scanning",
        org: "Arquivo Queer",
        sessionCount: 3,
        hoursContributed: 9.5,
      },
    ],
    byCommunity: [
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000001",
        communitySlug: "trans-and-friends",
        communityName: "Trans & Friends",
        sessionCount: 22,
        hoursContributed: 77,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000002",
        communitySlug: "queer-creatives",
        communityName: "Queer Creatives",
        sessionCount: 8,
        hoursContributed: 22.5,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000003",
        communitySlug: "lisboa-mutual-aid",
        communityName: "Lisboa Mutual Aid",
        sessionCount: 5,
        hoursContributed: 16,
      },
    ],
  },
  months12: {
    sessionCount: 118,
    hoursContributed: 402.5,
    volunteerCount: 34,
    byOpportunity: [
      {
        opportunitySlug: "friday-kitchen-shift",
        role: "Kitchen shift",
        org: "Casa Arco",
        sessionCount: 61,
        hoursContributed: 213.5,
      },
      {
        opportunitySlug: "helpline-listener",
        role: "Helpline listener",
        org: "Linha Arco-Íris",
        sessionCount: 29,
        hoursContributed: 101.5,
      },
      {
        opportunitySlug: "pride-stall-setup",
        role: "Stall setup",
        org: "Lisboa Pride",
        sessionCount: 16,
        hoursContributed: 52,
      },
      {
        opportunitySlug: "archive-scanning",
        role: "Archive scanning",
        org: "Arquivo Queer",
        sessionCount: 12,
        hoursContributed: 35.5,
      },
    ],
    byCommunity: [
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000001",
        communitySlug: "trans-and-friends",
        communityName: "Trans & Friends",
        sessionCount: 61,
        hoursContributed: 213.5,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000002",
        communitySlug: "queer-creatives",
        communityName: "Queer Creatives",
        sessionCount: 28,
        hoursContributed: 87.5,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000003",
        communitySlug: "lisboa-mutual-aid",
        communityName: "Lisboa Mutual Aid",
        sessionCount: 16,
        hoursContributed: 52,
      },
      {
        // An attribution whose community no longer resolves, so the page's
        // "community no longer on file" branch is visible in the demo too.
        // Its hours stay counted in the total above, which is the point.
        communityId: "8f3d1c2a-0000-4000-8000-000000000009",
        communitySlug: null,
        communityName: null,
        sessionCount: 3,
        hoursContributed: 9.5,
      },
    ],
  },
  all: {
    sessionCount: 131,
    hoursContributed: 447,
    volunteerCount: 38,
    byOpportunity: [
      {
        opportunitySlug: "friday-kitchen-shift",
        role: "Kitchen shift",
        org: "Casa Arco",
        sessionCount: 68,
        hoursContributed: 238,
      },
      {
        opportunitySlug: "helpline-listener",
        role: "Helpline listener",
        org: "Linha Arco-Íris",
        sessionCount: 32,
        hoursContributed: 112,
      },
      {
        opportunitySlug: "pride-stall-setup",
        role: "Stall setup",
        org: "Lisboa Pride",
        sessionCount: 18,
        hoursContributed: 58.5,
      },
      {
        opportunitySlug: "archive-scanning",
        role: "Archive scanning",
        org: "Arquivo Queer",
        sessionCount: 13,
        hoursContributed: 38.5,
      },
    ],
    byCommunity: [
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000001",
        communitySlug: "trans-and-friends",
        communityName: "Trans & Friends",
        sessionCount: 68,
        hoursContributed: 238,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000002",
        communitySlug: "queer-creatives",
        communityName: "Queer Creatives",
        sessionCount: 31,
        hoursContributed: 97,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000003",
        communitySlug: "lisboa-mutual-aid",
        communityName: "Lisboa Mutual Aid",
        sessionCount: 18,
        hoursContributed: 58.5,
      },
      {
        communityId: "8f3d1c2a-0000-4000-8000-000000000009",
        communitySlug: null,
        communityName: null,
        sessionCount: 3,
        hoursContributed: 9.5,
      },
    ],
  },
};

/** The demo report for one period, shaped exactly like the live response so
 *  the page never branches on mode to read it. */
export function adminVolunteerHoursDemo(
  period: VolunteerHoursPeriod,
): AdminVolunteerHoursDTO {
  const shape = DEMO_PERIODS[period];
  return {
    from: periodFrom(period) ?? null,
    to: null,
    sessionCount: shape.sessionCount,
    hoursContributed: shape.hoursContributed,
    volunteerCount: shape.volunteerCount,
    byOpportunity: shape.byOpportunity,
    byCommunity: shape.byCommunity,
    breakdownLimit: BREAKDOWN_LIMIT,
    isOpportunityBreakdownCapped: false,
    isCommunityBreakdownCapped: false,
  };
}
