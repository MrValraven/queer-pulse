import type { ReactNode } from "react";
import { routes } from "../../app/routeMap";

export type PitchStatus =
  "review" | "editing" | "commissioned" | "published" | "rejected";

export type StageState = "done" | "active" | "upcoming" | "rejected";
/** `labelKey` — catalog key, resolved via `t()` in `PitchStages.tsx`. Shared
 * vocabulary (see `magazine:pitchTracker.stage.*`) so both the mock `PITCHES`
 * and the live `submissionToPitch` adapter emit the same stable keys. */
export type PitchStage = { labelKey: string; state: StageState };

export type PitchAction = {
  label: string;
  primary?: boolean;
  to?: string;
  withdraw?: boolean;
};

export type Pitch = {
  id: string;
  title: ReactNode;
  status: PitchStatus;
  /** Catalog key — resolved via `t()` in `PitchCard.tsx`. */
  statusLabelKey: string;
  type: string;
  meta: string[];
  stages: PitchStage[];
  note?: { author: string; body: ReactNode };
  outline?: ReactNode;
  actions: PitchAction[];
  href?: string;
  dimmed?: boolean;
};

export type PitchTab = {
  key: string;
  /** Catalog key — tab chrome, label-key indirection (see PitchTabs.tsx). */
  labelKey: string;
  match: (p: Pitch) => boolean;
};

// Shorthand stage builders keep the data terse and consistent. `labelKey`
// is a `magazine:pitchTracker.stage.*` catalog key (label-key indirection).
const done = (labelKey: string): PitchStage => ({ labelKey, state: "done" });
const active = (labelKey: string): PitchStage => ({
  labelKey,
  state: "active",
});
const next = (labelKey: string): PitchStage => ({
  labelKey,
  state: "upcoming",
});

const STAGE = {
  pitched: "magazine:pitchTracker.stage.pitched",
  accepted: "magazine:pitchTracker.stage.accepted",
  firstDraft: "magazine:pitchTracker.stage.firstDraft",
  firstEdit: "magazine:pitchTracker.stage.firstEdit",
  layOut: "magazine:pitchTracker.stage.layOut",
  published: "magazine:pitchTracker.stage.published",
  inReview: "magazine:pitchTracker.stage.inReview",
  decision: "magazine:pitchTracker.stage.decision",
  draft: "magazine:pitchTracker.stage.draft",
  edit: "magazine:pitchTracker.stage.edit",
  out: "magazine:pitchTracker.stage.out",
  reviewed: "magazine:pitchTracker.stage.reviewed",
  closed: "magazine:pitchTracker.stage.closed",
} as const;

export const PITCHES: Pitch[] = [
  {
    id: "pharmacist",
    title: (
      <>
        &ldquo;The pharmacist who fills <em>every prescription</em>&rdquo;
      </>
    ),
    status: "editing",
    statusLabelKey: "magazine:pitchTracker.pitch.pharmacist.statusLabel",
    type: "Profile",
    meta: ["1,200 words", "Issue 10 · On Care", "Due 22 Jun"],
    stages: [
      done(STAGE.pitched),
      done(STAGE.accepted),
      done(STAGE.firstDraft),
      active(STAGE.firstEdit),
      next(STAGE.layOut),
      next(STAGE.published),
    ],
    note: {
      author: "Marta",
      body: (
        <>
          Love the structure. The Rui quote in §3 needs more setup. Can you
          give me 80 words of context before it? Otherwise we&rsquo;re nearly
          there.
        </>
      ),
    },
    actions: [
      { label: "Open in editor", primary: true, to: routes.submitStory },
      { label: "Message Marta", to: routes.messages },
      { label: "View Marta's edits" },
    ],
  },
  {
    id: "four-day-week",
    title: (
      <>
        &ldquo;Six months on a four-day week · <em>the sequel</em>&rdquo;
      </>
    ),
    status: "review",
    statusLabelKey: "magazine:pitchTracker.pitch.fourDayWeek.statusLabel",
    type: "Long read",
    meta: ["~ 2,500 words", "For Issue 11", "Sent 11 days ago"],
    stages: [
      done(STAGE.pitched),
      active(STAGE.inReview),
      next(STAGE.decision),
      next(STAGE.draft),
      next(STAGE.edit),
      next(STAGE.out),
    ],
    outline: (
      <>
        A follow-up to my Issue 5 long-read. Atelier Pulso a year on.{" "}
        <em>What&rsquo;s working, what isn&rsquo;t, what they&rsquo;d undo.</em>{" "}
        I want to talk to the two new hires especially. They joined after the
        change.
      </>
    ),
    actions: [
      { label: "View pitch", primary: true },
      { label: "Nudge editorial", to: routes.messages },
      { label: "Withdraw", withdraw: true },
    ],
  },
  {
    id: "commissioned-map",
    title: (
      <>
        &ldquo;Mapping the city&rsquo;s <em>queer third places</em>&rdquo;
      </>
    ),
    status: "commissioned",
    statusLabelKey: "magazine:pitchTracker.pitch.commissionedMap.statusLabel",
    type: "Service",
    meta: ["~ 1,600 words", "Issue 11 · On Place", "Draft due 4 Aug"],
    stages: [
      done(STAGE.pitched),
      done(STAGE.accepted),
      active(STAGE.draft),
      next(STAGE.edit),
      next(STAGE.layOut),
      next(STAGE.published),
    ],
    note: {
      author: "Marta",
      body: (
        <>
          Commissioned! Take the space you need on the draft. <em>4 August</em>{" "}
          is soft. Shout if you want a reporting stipend for the venue visits.
        </>
      ),
    },
    actions: [
      { label: "Start draft", primary: true, to: routes.submitStory },
      { label: "Message Marta", to: routes.messages },
    ],
  },
  {
    id: "hosting-badly",
    title: (
      <>
        &ldquo;On hosting badly, <em>then better</em>&rdquo;
      </>
    ),
    status: "published",
    statusLabelKey: "magazine:pitchTracker.pitch.hostingBadly.statusLabel",
    type: "Essay",
    href: routes.article,
    meta: ["1,800 words", "Issue 03 · Dec 2024", "312 reads all-time"],
    stages: [
      done(STAGE.pitched),
      done(STAGE.accepted),
      done(STAGE.draft),
      done(STAGE.edit),
      done(STAGE.layOut),
      done(STAGE.published),
    ],
    actions: [
      { label: "Read live", primary: true, to: routes.article },
      { label: "14 comments", to: routes.article },
      { label: "Payment receipt" },
    ],
  },
  {
    id: "riso-printing",
    title: <>&ldquo;A guide to riso printing in Lisbon&rdquo;</>,
    status: "published",
    statusLabelKey: "magazine:pitchTracker.pitch.risoPrinting.statusLabel",
    type: "Service",
    href: routes.article,
    meta: [
      "1,400 words",
      "Issue 01 · Jun 2024",
      "584 reads · most-saved Issue 01 piece",
    ],
    stages: [
      done(STAGE.pitched),
      done(STAGE.accepted),
      done(STAGE.draft),
      done(STAGE.edit),
      done(STAGE.layOut),
      done(STAGE.published),
    ],
    actions: [
      { label: "Read live", primary: true, to: routes.article },
      { label: "22 comments", to: routes.article },
    ],
  },
  {
    id: "owe-our-exes",
    title: <>&ldquo;What we owe our exes&rdquo;</>,
    status: "rejected",
    statusLabelKey: "magazine:pitchTracker.pitch.oweOurExes.statusLabel",
    type: "Essay",
    dimmed: true,
    meta: ["1,500 words", "Pitched Aug 2025 · rejected with note"],
    stages: [
      done(STAGE.pitched),
      { labelKey: STAGE.reviewed, state: "rejected" },
      { labelKey: STAGE.closed, state: "rejected" },
    ],
    note: {
      author: "Marta",
      body: (
        <>
          Beautifully argued and a piece we&rsquo;d want to publish, but we ran
          Catarina&rsquo;s piece on chosen family this issue and it covers half
          this ground. <em>Re-pitch in 6 months?</em> The terrain will have
          shifted by then.
        </>
      ),
    },
    actions: [
      { label: "Re-submit", primary: true, to: routes.submitStory },
      { label: "View original pitch" },
    ],
  },
];

export const PITCH_TABS: PitchTab[] = [
  { key: "all", labelKey: "magazine:pitchTracker.tabs.all", match: () => true },
  {
    key: "review",
    labelKey: "magazine:pitchTracker.tabs.review",
    match: (p) => p.status === "review",
  },
  {
    key: "commissioned",
    labelKey: "magazine:pitchTracker.tabs.commissioned",
    match: (p) => p.status === "commissioned" || p.status === "editing",
  },
  {
    key: "published",
    labelKey: "magazine:pitchTracker.tabs.published",
    match: (p) => p.status === "published",
  },
  {
    key: "closed",
    labelKey: "magazine:pitchTracker.tabs.closed",
    match: (p) => p.status === "rejected",
  },
];

export function countByTab(pitches: Pitch[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const tab of PITCH_TABS) {
    counts[tab.key] = pitches.filter(tab.match).length;
  }
  return counts;
}

export function selectPitches(pitches: Pitch[], tab: string): Pitch[] {
  const def = PITCH_TABS.find((t) => t.key === tab) ?? PITCH_TABS[0]!;
  return pitches.filter(def.match);
}
