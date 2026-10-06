import {
  DEMO_INVITED_GATHERING_SLUG,
  demoInviteStatus,
} from "./eventLineup.mock";
import type { LineupInviteDTO } from "./events.api";

/** Local clock time on a day `dayOffset` from today, as an ISO string. */
function demoIso(dayOffset: number, hour: number, minute: number): string {
  const day = new Date();
  day.setDate(day.getDate() + dayOffset);
  day.setHours(hour, minute, 0, 0);
  return day.toISOString();
}

/**
 * Demo-mode lineup invite for `LineupInvitePage`: an invite to play as DJ,
 * from the demo host, pending until the viewer answers it on either surface
 * (`recordDemoInviteAnswer`). Any id resolves to it, as with the co-host
 * invite demo.
 */
export function demoLineupInvite(entryId: string): LineupInviteDTO {
  return {
    id: entryId,
    status: demoInviteStatus(DEMO_INVITED_GATHERING_SLUG),
    role: "dj",
    createdAt: "2026-10-06T10:00:00.000Z",
    event: {
      slug: DEMO_INVITED_GATHERING_SLUG,
      title: "Trans & NB Hub: Monthly Meetup",
      startAt: demoIso(4, 18, 30),
      endAt: demoIso(4, 20, 30),
      timezone: "Europe/Lisbon",
      venue: "Arroios",
      isOnline: false,
      goingCount: null,
      waitlistCount: null,
    },
    inviter: {
      slug: "ines",
      firstName: "Inês",
      lastName: "Tavares",
      avatarUrl: null,
      hostedEventsCount: 12,
      mutualConnectionsCount: 4,
    },
  };
}
