import type { NowInsights } from "../api/nowInsights.api";

/** Demo-mode figures for the profile Now card, keyed by member slug. Only
 *  members whose card is worth showing need an entry; the rest render the card
 *  without figures, which is also what a fresh live profile does.
 *
 * `tiago` is the demo-mode signed-in identity (`currentUserSlug` in
 * `data/demoCurrentUser.ts`), so this is the ONLY entry `useNowInsights`
 * actually reaches for the owner path in demo mode: the hook is
 * `enabled: isSelf`, and `isSelf` is only ever true while viewing your own
 * profile, which in demo mode is always `tiago`. His `openTo`
 * (`data/members.ts`'s `MEMBERS.tiago`) is `[collaborating, "Community
 * events", mentoring]`; the `mentoring` door is DELIBERATELY left out of
 * `perChip` below, its reasons built through `reasonValue()` to match the
 * profile's doors byte for byte, so `NowOpenToChips`'s fallback for a door
 * absent from `perChip` (a real door nobody has ever used, which the
 * backend's `GROUP BY` never emits a row for) has somewhere to render in
 * demo mode too. */
export const DEMO_NOW_INSIGHTS: Record<string, NowInsights> = {
  tiago: {
    windowDays: 90,
    hellos: 5,
    replies: 4,
    perChip: [
      {
        reason: "open:collaborating",
        count: 5,
        lastHelloAt: "2026-09-05T10:00:00.000Z",
      },
      {
        reason: "custom:Community events",
        count: 0,
        lastHelloAt: "2026-03-01T09:00:00.000Z",
      },
      // "open:mentoring" has no entry here on purpose: see the file comment.
    ],
    nowUpdatedAt: "2026-09-08T09:00:00.000Z",
    history: [
      {
        text: "Wrapping up a run of poetry readings around Anjos.",
        startedAt: "2026-06-15T09:00:00.000Z",
        endedAt: "2026-09-08T09:00:00.000Z",
      },
      {
        text: "Heads-down shipping the connect flow rewrite.",
        startedAt: "2026-03-20T09:00:00.000Z",
        endedAt: "2026-06-15T09:00:00.000Z",
      },
    ],
  },
  ines: {
    windowDays: 90,
    hellos: 7,
    replies: 6,
    perChip: [
      {
        reason: "open:collaborating",
        count: 4,
        lastHelloAt: "2026-08-29T10:12:00.000Z",
      },
      {
        reason: "open:mentoring",
        count: 2,
        lastHelloAt: "2026-08-14T17:40:00.000Z",
      },
      {
        reason: "open:casualMeetups",
        count: 0,
        lastHelloAt: "2026-05-02T09:05:00.000Z",
      },
      {
        reason: "custom:a riso afternoon",
        count: 1,
        lastHelloAt: "2026-09-01T14:20:00.000Z",
      },
    ],
    nowUpdatedAt: "2026-09-09T08:30:00.000Z",
    history: [
      {
        text: "Printing a run of risograph posters for the Anjos street party.",
        startedAt: "2026-06-02T09:00:00.000Z",
        endedAt: "2026-09-09T08:30:00.000Z",
      },
      {
        text: "Teaching an evening type class at the co-op.",
        startedAt: "2026-03-11T09:00:00.000Z",
        endedAt: "2026-06-02T09:00:00.000Z",
      },
    ],
  },
};
