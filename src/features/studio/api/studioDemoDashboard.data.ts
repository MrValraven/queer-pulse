import type { StudioSupporterIdentityDTO } from "./studioListening.types";
import type {
  StudioMilestoneKind,
  StudioReleaseHealthKey,
} from "./studioDashboard.types";
import {
  DEMO_DRAFT_RELEASE_ID,
  DEMO_SCHEDULED_RELEASE_ID,
} from "./studioDemo.data";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
  DEMO_ARTIST_NIGHTFORM,
  DEMO_DEFAULT_RELEASE_ID,
  DEMO_DEFAULT_TRACK_ID,
} from "./studioDemoMe.data";
import { DEMO_ARTIST_VANDA_DIESEL } from "./studioDemoFormats.data";

/** Placements per page in the demo, small enough to show Show more. */
export const DEMO_PLACEMENTS_PAGE_SIZE = 2;

/** New followers per week, oldest first, per owned persona. A week of 3 and
 *  one of 4 show that follower growth has no floor. Each series sums to at
 *  most the persona's follower total (Mariana 1204, Late Bloomers 41). */
export const DEMO_FOLLOWER_GROWTH_BY_PERSONA: Readonly<
  Record<string, readonly number[]>
> = {
  [DEMO_ARTIST_MARIANA.id]: [4, 7, 3, 9, 12, 6, 8, 15, 11, 14, 19, 5],
  // Sums to 38; the other 3 of the 41 followers arrived before these weeks.
  [DEMO_ARTIST_LATE_BLOOMERS.id]: [0, 1, 2, 2, 3, 4, 3, 5, 4, 6, 3, 5],
};

/** Open checklist items per release; any other release has every item done. */
export const DEMO_RELEASE_HEALTH_GAPS: Readonly<
  Record<string, readonly StudioReleaseHealthKey[]>
> = {
  [DEMO_DEFAULT_RELEASE_ID]: ["lyrics"],
  [DEMO_SCHEDULED_RELEASE_ID]: ["description", "creditsOnEveryTrack"],
  [DEMO_DRAFT_RELEASE_ID]: ["genreAndMood", "buyLink"],
};

export const DEMO_MILESTONE_FOLLOWERS_1000_ID =
  "demo-milestone-mariana-followers-1000";

const milestoneIdOf = (
  personaSlug: string,
  kind: StudioMilestoneKind,
  threshold: number,
) => `demo-milestone-${personaSlug}-${kind.replaceAll("_", "-")}-${threshold}`;

const seedOf = (
  kind: StudioMilestoneKind,
  threshold: number,
  daysAgo: number,
  persona = DEMO_ARTIST_MARIANA,
  personaSlug = "mariana",
  trackId?: string,
) => ({
  id: milestoneIdOf(personaSlug, kind, threshold),
  subprofileId: persona.id,
  kind,
  threshold,
  daysAgo,
  ...(trackId ? { trackId } : {}),
});

/** Milestones per persona, newest first. Late Bloomers (a podcaster) reached
 *  10 followers in the week of its 5th (about 44 days ago) and 25 in the week
 *  of its 9th (about 18 days ago), both past the New tag's 7 days. */
export const DEMO_MILESTONE_SEEDS: readonly {
  id: string;
  subprofileId: string;
  kind: StudioMilestoneKind;
  threshold: number;
  daysAgo: number;
  trackId?: string;
}[] = [
  seedOf("followers", 1000, 3),
  seedOf("artist_plays", 1000, 10),
  seedOf(
    "track_plays",
    100,
    30,
    DEMO_ARTIST_MARIANA,
    "mariana",
    DEMO_DEFAULT_TRACK_ID,
  ),
  seedOf("followers", 500, 40),
  seedOf("followers", 250, 75),
  seedOf("first_placement", 1, 90),
  seedOf("followers", 100, 120),
  seedOf("followers", 50, 160),
  seedOf("followers", 25, 200),
  seedOf("followers", 10, 240),
  seedOf("followers", 25, 18, DEMO_ARTIST_LATE_BLOOMERS, "late-bloomers"),
  seedOf("followers", 10, 44, DEMO_ARTIST_LATE_BLOOMERS, "late-bloomers"),
];

/** Mariana's plays per day, oldest first, today last. 3, 2, 4 and 1 sit
 *  under the floor of 5; the 0s are real zeros. Sums to 333. */
export const DEMO_DAILY_PLAYS: readonly number[] = [
  12, 9, 0, 3, 14, 22, 18, 7, 0, 2, 11, 16, 25, 19, 8, 4, 0, 13, 21, 30, 27, 15,
  9, 1, 0, 17, 24, 6,
];

/** All-time plays per published track of Mariana, summing to 1284. Cidade
 *  dos santos 06 leads with 412, 12 sits under the floor and 11 and the
 *  fifth single have none. Late Bloomers, a podcast, has no entries. */
export const DEMO_TRACK_PLAYS: Readonly<Record<string, number>> = {
  "demo-track-cidade-dos-santos-01": 120,
  "demo-track-cidade-dos-santos-02": 96,
  "demo-track-cidade-dos-santos-03": 88,
  "demo-track-cidade-dos-santos-04": 74,
  "demo-track-cidade-dos-santos-05": 61,
  [DEMO_DEFAULT_TRACK_ID]: 412,
  "demo-track-cidade-dos-santos-07": 45,
  "demo-track-cidade-dos-santos-08": 37,
  "demo-track-cidade-dos-santos-09": 52,
  "demo-track-cidade-dos-santos-10": 29,
  "demo-track-cidade-dos-santos-11": 0,
  "demo-track-cidade-dos-santos-12": 3,
  "demo-track-mariana-2-01": 58,
  "demo-track-mariana-2-02": 31,
  "demo-track-mariana-2-03": 14,
  "demo-track-mariana-3-01": 41,
  "demo-track-mariana-3-02": 22,
  "demo-track-mariana-3-03": 9,
  "demo-track-mariana-single-1-01": 38,
  "demo-track-mariana-single-2-01": 27,
  "demo-track-mariana-single-3-01": 16,
  "demo-track-mariana-single-4-01": 11,
  "demo-track-mariana-single-5-01": 0,
};

/** Mariana's top supporters, ranked. The last is a persona that can no
 *  longer be listened to, so the unlinked row can be reviewed. */
export const DEMO_TOP_SUPPORTERS: readonly StudioSupporterIdentityDTO[] = [
  {
    kind: "persona",
    persona: {
      id: DEMO_ARTIST_VANDA_DIESEL.id,
      handle: "vanda-diesel",
      name: "Vanda Diesel",
      kind: "drag",
      avatarUrl: DEMO_ARTIST_VANDA_DIESEL.avatarUrl,
      isLinkable: true,
    },
  },
  {
    kind: "account",
    member: { slug: "anika", displayName: "Anika Kovač", avatarUrl: null },
  },
  {
    kind: "account",
    member: { slug: "rita", displayName: "Rita Varela", avatarUrl: null },
  },
  {
    kind: "persona",
    persona: {
      id: DEMO_ARTIST_NIGHTFORM.id,
      handle: "nightform",
      name: "NIGHTFORM",
      kind: "musician",
      avatarUrl: DEMO_ARTIST_NIGHTFORM.avatarUrl,
      isLinkable: true,
    },
  },
  {
    kind: "persona",
    persona: {
      id: "demo-persona-patio-coletivo",
      handle: "patio-coletivo",
      name: "Pátio Coletivo",
      kind: "collective",
      avatarUrl: null,
      isLinkable: false,
    },
  },
];

export const DEMO_OPTED_IN_SUPPORTERS = 7;
