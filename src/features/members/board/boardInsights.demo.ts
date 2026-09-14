import type { BoardInsightsDTO } from "../api/boardInsights.api";

/**
 * The clock demo mode reads instead of the real one.
 *
 * Every demo board post in `data/members.ts` is dated in the past, so a real
 * `Date.now()` would show the whole demo board as "Expired quietly" and replace
 * the section's main interaction with a wall of terminal states. Pinning the
 * clock keeps the walkthrough showing live posts with days left on them. The
 * live path reads the real clock, where the server enforces expiry anyway.
 *
 * 2026-09-12 puts Inês's `zine-collab` at 5 days left of 30, her
 * `portfolio-reviews` at 43 of 90, and the riso drum already lapsed, which is
 * exactly what the approved design shows.
 */
export const DEMO_BOARD_NOW_MS = new Date("2026-09-12T12:00:00.000Z").getTime();

/** Owner-only figures for the demo profile. */
export const DEMO_BOARD_INSIGHTS: BoardInsightsDTO = {
  hellos: 5,
  replies: 5,
  windowDays: 90,
  matches: {
    "zine-collab": [
      {
        slug: "beatriz",
        first: "Beatriz",
        kind: "offering",
        postSlug: "riso-printing-help",
      },
    ],
    "portfolio-reviews": [
      {
        slug: "carla",
        first: "Carla",
        kind: "looking",
        postSlug: "portfolio-feedback",
      },
    ],
  },
};
