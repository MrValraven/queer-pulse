import {
  currentUserSlug,
  memberAvatar,
  memberName,
} from "../../members/data/members";
import type {
  EventLineupDTO,
  EventLineupEntryDTO,
  LineupEntryStatus,
} from "./events.api";

/** The demo gathering the viewer is invited to the lineup of. */
export const DEMO_INVITED_GATHERING_SLUG = "trans-hub-meetup";

/** Id of that invite, shared by the invite page and the lineup banner. */
export const DEMO_LINEUP_INVITE_ID = "demo-lineup-tiago";

/**
 * Demo gatherings the viewer already plays as an accepted DJ. The ended
 * warehouse party gives `GatheringPerformerNudge` its demo, and the upcoming
 * karaoke night shows "You're on the lineup" with Leave. The demo viewer
 * hosts neither.
 */
const DEMO_ACCEPTED_GATHERING_SLUGS = new Set([
  "trans-djs-warehouse",
  "queer-karaoke-night",
]);

/**
 * Demo answers to lineup invites, kept for the session and keyed by gathering
 * slug, since every demo invite id resolves to the one invite on
 * `DEMO_INVITED_GATHERING_SLUG`. The invite page and the gathering banner
 * both read it, so an answer given on one surface holds on the other even
 * when that surface's cache was never loaded.
 */
const demoInviteAnswers = new Map<string, LineupEntryStatus>();

/** Remember the demo viewer's answer to their invite on `gatheringSlug`. */
export function recordDemoInviteAnswer(
  gatheringSlug: string,
  status: LineupEntryStatus,
): void {
  demoInviteAnswers.set(gatheringSlug, status);
}

/** The demo status of the viewer's invite on `gatheringSlug`: their answer,
 *  or pending until they give one. */
export function demoInviteStatus(gatheringSlug: string): LineupEntryStatus {
  return demoInviteAnswers.get(gatheringSlug) ?? "pending";
}

function demoEntry(
  slug: string,
  role: string,
  status: LineupEntryStatus,
): EventLineupEntryDTO {
  return {
    id: `demo-lineup-${slug}`,
    slug,
    name: memberName(slug),
    avatarUrl: memberAvatar(slug)?.photo ?? null,
    role,
    status,
  };
}

/** The viewer's own demo row on `slug`, or null when they are not listed. */
function demoViewerEntry(slug: string | undefined): EventLineupEntryDTO | null {
  if (slug === DEMO_INVITED_GATHERING_SLUG) {
    return {
      ...demoEntry(currentUserSlug, "dj", demoInviteStatus(slug)),
      id: DEMO_LINEUP_INVITE_ID,
    };
  }
  if (slug && DEMO_ACCEPTED_GATHERING_SLUGS.has(slug)) {
    return demoEntry(currentUserSlug, "dj", "accepted");
  }
  return null;
}

/**
 * Demo-mode lineup. On `DEMO_INVITED_GATHERING_SLUG` the signed-in member
 * holds the DJ invite `demoLineupInvite` describes, in whatever status they
 * answered; on `DEMO_ACCEPTED_GATHERING_SLUGS` they are an accepted DJ; on
 * every other gathering they are off the lineup. Every lineup carries one
 * confirmed performer, one open invite and one decline, so the host editor
 * shows every status. Network-free and imported only by the lineup hooks.
 */
export function demoEventLineup(slug: string | undefined): EventLineupDTO {
  const viewerEntry = demoViewerEntry(slug);
  return {
    entries: [
      ...(viewerEntry ? [viewerEntry] : []),
      demoEntry("ines", "drag", "accepted"),
      demoEntry("rui", "musician", "pending"),
      demoEntry("sofia", "dancer", "declined"),
    ],
    viewerEntry,
  };
}
