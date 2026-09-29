/**
 * Editor desk demo data — ported verbatim (values unchanged) from the
 * DesignSync prototype's `mag-data.js` + `mag-data2.js`. Titles are stored
 * as plain strings (the design's `<em>` markup is stripped; see
 * `stripEm` in `desk.copy.ts` for any string that still carries markup,
 * such as `Activity.what`).
 */

import { DEMO_SECTIONS as CANONICAL_DEMO_SECTIONS } from "../magazineSections.data";

export type PieceFormat = "article" | "deck";

/** The editorial pipeline, in order. `Published` is terminal: a piece reaches
 *  it by being published (from the piece record or by shipping its issue),
 *  never by being dragged there, and leaves it only by being unpublished. */
export type Stage =
  | "Commissioned"
  | "Drafting"
  | "In review"
  | "Edit"
  | "Sensitivity read"
  | "Layout"
  | "Ready"
  | "Published";

export type WaitOn = "writer" | "you" | "nobody";

/** Where a piece's money stands, mirroring backend `PiecePaymentStatus`:
 *  `none` (no payment recorded), `owed` (recorded and still unpaid), `paid`. */
export type PiecePaymentStatus = "none" | "owed" | "paid";

export interface Piece {
  id: string;
  title: string;
  format: PieceFormat;
  section: string;
  kind: string;
  byline: string;
  editorId: string;
  /** The assigned writer's user id, `null` when nobody is assigned. Demo
   *  pieces leave it undefined (their writers are bylines only). */
  writerId?: string | null;
  stage: Stage;
  /** Display text for the due column: a date as the source wrote it, `""`
   *  when none is set, or the `"ready"` sentinel for "nothing left to chase". */
  due: string;
  /** The same due day as an ISO calendar date (`YYYY-MM-DD`), present only
   *  when one is known. `describeDue` (`desk/deskDue.ts`) reads it to say
   *  "in 3 days" or "2 days late". */
  dueDate?: string;
  late?: boolean;
  words?: number;
  slides?: number;
  art: "none" | "brief" | "in" | "na";
  wait?: WaitOn;
  note?: string;
  fresh?: boolean;
  /** The issue-contents blurb written for this piece (Task B2a). Demo pieces
   *  default to "" (none written yet) unless set below. */
  contentsBlurb?: string;
  /** The linked deck for deck-format pieces, so "Edit" opens that deck
   *  instead of a fresh one (mirrors `PieceRecordView.deckId`). Demo pieces
   *  have no draft-deck registry to link to, so this is left undefined —
   *  the desk falls back to opening a fresh deck, same as today. */
  deckId?: string;
  /** Editorial-track linkage (mirrors backend `MagazinePiece.issueId`):
   *  `null` = standalone platform highlight; a value = bound to that issue. */
  issueId: string | null;
  /** ISO instant the piece entered its current stage, so the desk can say
   *  how long it has sat there. */
  stageEnteredAt?: string;
  /** Where the piece's money stands; the "unpaid" focus reads `owed`. */
  paymentStatus?: PiecePaymentStatus;
  /** ISO instant the linked article or deck goes (or went) live, `null` while
   *  a draft. A future value means scheduled (see `desk/pieceSchedule.ts`). */
  publishedAt?: string | null;
}

export interface Pitch {
  id: string;
  title: string;
  byline: string;
  note: string;
  fresh?: boolean;
  tags: string[];
  suggest?: "deck";
  /** ISO instant the pitch arrived, so the inbox can say how long it has
   *  waited for an answer. */
  receivedAt?: string;
  /** The member who submitted the pitch, `null` for a desk-logged pitch. */
  submitterId?: string | null;
}

export interface Editor {
  id: string;
  name: string;
  initials: string;
  tint: "coral" | "jade" | "violet";
  cap: number;
}

export interface Section {
  name: string;
  target: number;
  note: string;
}

export interface Activity {
  who: string;
  what: string;
  when: string;
}

export interface Issue {
  id: string;
  number: string;
  theme: string;
  /** Display text for the day the issue stops taking copy, `""` when unset. */
  closes: string;
  /** Display text for the publish day, `""` while unscheduled. */
  publishes: string;
  /** Whole days from today to `closesOn`, 0 once it has passed or when unset. */
  daysLeft: number;
  filled: number;
  slots: number;
  /** The close day as an ISO calendar date (`YYYY-MM-DD`), or `null` while the
   *  desk has set none. `closes` and `daysLeft` are derived from it. */
  closesOn?: string | null;
  /** The publish day as an ISO calendar date, or `null` while unscheduled. */
  publishedOn?: string | null;
}

/** The August day the demo desk pretends is today. It sits after the two
 *  pieces flagged `late` (2 and 4 Aug) and before the earliest one on time
 *  (8 Aug), so the fixtures' flags and their due strings agree. */
const DEMO_DUE_REFERENCE = Date.UTC(2026, 7, 5);

const HOUR_IN_MS = 60 * 60 * 1000;

/**
 * An ISO due date for a demo piece whose display text says `dayOfAugust` Aug.
 *
 * The fixtures' dates are fixed, the viewer's clock is not, so a literal
 * "2026-08-04" would read "55 days late" by the time anyone opens the demo.
 * Instead each date keeps its distance from `DEMO_DUE_REFERENCE` and is
 * re-anchored on the viewer's own today at load: "2 Aug" is always three
 * days late and "12 Aug" always a week out, whenever the demo runs. A day
 * past 31 rolls into September (32 is 1 Sep).
 */
function demoDueDate(dayOfAugust: number): string {
  const now = new Date();
  const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const offsetMs = Date.UTC(2026, 7, dayOfAugust) - DEMO_DUE_REFERENCE;
  return new Date(todayUtc + offsetMs).toISOString().slice(0, 10);
}

/** An ISO instant `hoursAgo` before the viewer's load time. Demo stage and
 *  pitch timestamps use it so "in edit for 5 days" stays true whenever the
 *  demo runs. */
function demoHoursAgo(hoursAgo: number): string {
  return new Date(Date.now() - hoursAgo * HOUR_IN_MS).toISOString();
}

/** An ISO instant `hoursAhead` after the viewer's load time, so a demo piece
 *  can stay scheduled whenever the demo runs. */
function demoHoursFromNow(hoursAhead: number): string {
  return new Date(Date.now() + hoursAhead * HOUR_IN_MS).toISOString();
}

/**
 * The demo issue. `closes`, `publishes` and `daysLeft` are the prototype's
 * display values; the desk hooks recompute all three from `closesOn` and
 * `publishedOn`, which keep the prototype's spacing (close 9 days out, publish
 * 18 days after that) re-anchored on the viewer's today.
 */
export const DEMO_ISSUE: Issue = {
  id: "demo-issue-14",
  number: "14",
  theme: "Aftercare",
  closes: "12 Aug",
  publishes: "1 Sep",
  daysLeft: 9,
  filled: 11,
  slots: 15,
  closesOn: demoDueDate(14),
  publishedOn: demoDueDate(32),
};

/**
 * One row of the desk's issue switcher. Structurally identical to the
 * backend-mirroring `IssueSummaryDto` (`api/issueProduction.api.ts`), and
 * declared here rather than imported so this demo-data module keeps its
 * no-dependency shape — the two are interchangeable by structural typing.
 *
 * Distinct from `Issue` above: that one carries the desk header's display
 * calendar (`closes`/`publishes`/`daysLeft`), derived from this row's
 * `closesOn`/`publishedOn` on render (`issueCalendarToView`).
 */
export interface IssueSummary {
  id: string;
  number: string;
  title: string;
  theme: string;
  /** `null` while the issue is still unscheduled: the desk opens a number
   *  first and picks the publish date later. */
  publishedOn: string | null;
  /** `YYYY-MM-DD` the issue stops taking copy, or `null` while unset. */
  closesOn: string | null;
  filled: number;
  slots: number;
}

/**
 * The demo magazine's back catalogue for the issue switcher, newest number
 * first (the order `GET /magazine/admin/issues` returns). Issue 14 is
 * `DEMO_ISSUE` — the same id `DEMO_PIECES` reference — so switching to it in
 * demo mode shows real pieces; the earlier issues are shipped and empty.
 *
 * Mutable on purpose: `useCreateIssue` unshifts onto this array in demo mode
 * so a created issue actually appears in the switcher, mirroring how
 * `usePieceMutations` patches `DEMO_PIECES` in place.
 */
export const DEMO_ISSUES: IssueSummary[] = [
  {
    id: DEMO_ISSUE.id,
    number: DEMO_ISSUE.number,
    title: "Aftercare",
    theme: DEMO_ISSUE.theme,
    publishedOn: DEMO_ISSUE.publishedOn ?? null,
    closesOn: DEMO_ISSUE.closesOn ?? null,
    filled: DEMO_ISSUE.filled,
    slots: DEMO_ISSUE.slots,
  },
  {
    id: "demo-issue-13",
    number: "13",
    title: "The long way round",
    theme: "Distance",
    publishedOn: "2026-06-01",
    closesOn: "2026-05-11",
    filled: 14,
    slots: 15,
  },
  {
    id: "demo-issue-12",
    number: "12",
    title: "Small rooms, loud rooms",
    theme: "Nightlife",
    publishedOn: "2026-03-01",
    closesOn: "2026-02-09",
    filled: 15,
    slots: 15,
  },
];

export const DEMO_EDITORS: Editor[] = [
  { id: "marta", name: "Marta Cruz", initials: "MC", tint: "coral", cap: 7 },
  { id: "sara", name: "Sara Pinheiro", initials: "SP", tint: "jade", cap: 7 },
];

export const DEMO_STAGES: Stage[] = [
  "Commissioned",
  "Drafting",
  "In review",
  "Edit",
  "Sensitivity read",
  "Layout",
  "Ready",
  "Published",
];

export const DEMO_PIECES: Piece[] = [
  {
    id: "p1",
    stageEnteredAt: demoHoursAgo(120),
    paymentStatus: "owed",
    title: "What we owe old friends",
    issueId: DEMO_ISSUE.id,
    format: "article",
    section: "Cover",
    kind: "Long read",
    byline: "Sara Pinheiro",
    editorId: "marta",
    stage: "Edit",
    due: "4 Aug",
    dueDate: demoDueDate(4),
    late: true,
    words: 2800,
    art: "in",
    wait: "writer",
    note: "awaiting sign-off on the edit",
  },
  {
    id: "p2",
    stageEnteredAt: demoHoursAgo(190),
    paymentStatus: "none",
    title: "The pharmacist who fills every prescription",
    issueId: DEMO_ISSUE.id,
    format: "article",
    section: "Features",
    kind: "Profile",
    byline: "Tomás Mendes",
    editorId: "sara",
    stage: "Drafting",
    due: "8 Aug",
    dueDate: demoDueDate(8),
    words: 1200,
    art: "brief",
    wait: "writer",
    note: "interviewing Rui this week",
  },
  {
    id: "p3",
    stageEnteredAt: demoHoursAgo(40),
    paymentStatus: "none",
    title: "Care work, undercounted",
    issueId: DEMO_ISSUE.id,
    format: "deck",
    section: "Reported",
    kind: "Data deck",
    byline: "Catarina Vaz",
    editorId: "sara",
    stage: "In review",
    due: "12 Aug",
    dueDate: demoDueDate(12),
    slides: 9,
    art: "none",
    wait: "you",
  },
  {
    id: "p4",
    stageEnteredAt: demoHoursAgo(90),
    paymentStatus: "owed",
    title: "Dra. Mariza Câmara on the long wait",
    issueId: DEMO_ISSUE.id,
    format: "article",
    section: "Interview",
    kind: "Interview",
    byline: "Sara & Sofia",
    editorId: "sara",
    stage: "Edit",
    due: "17 Aug",
    dueDate: demoDueDate(17),
    words: 2000,
    art: "brief",
  },
  {
    id: "p5",
    stageEnteredAt: demoHoursAgo(30),
    paymentStatus: "owed",
    title: "On the bus to Faro",
    // Scheduled: the desk shows this row with no Publish action and the
    // peek says when it goes live.
    issueId: DEMO_ISSUE.id,
    publishedAt: demoHoursFromNow(40),
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Anika Kovač",
    editorId: "marta",
    stage: "Ready",
    due: "ready",
    words: 1800,
    art: "in",
    fresh: true,
  },
  {
    id: "p6",
    stageEnteredAt: demoHoursAgo(160),
    paymentStatus: "none",
    title: "A reading list, by the therapist who wrote it",
    issueId: DEMO_ISSUE.id,
    format: "article",
    section: "Service",
    kind: "Service",
    byline: "Sofia Rocha",
    editorId: "marta",
    stage: "Drafting",
    due: "15 Aug",
    dueDate: demoDueDate(15),
    words: 1600,
    art: "na",
    wait: "writer",
    note: "6 of 8 clinicians in",
  },
  {
    id: "p7",
    stageEnteredAt: demoHoursAgo(400),
    paymentStatus: "none",
    title: "Quick exit",
    issueId: DEMO_ISSUE.id,
    format: "article",
    section: "Column",
    kind: "Column",
    byline: "Trans Hub editors",
    editorId: "marta",
    stage: "Commissioned",
    due: "2 Aug",
    dueDate: demoDueDate(2),
    late: true,
    words: 800,
    art: "na",
    wait: "writer",
    note: "monthly column not filed",
  },
  {
    id: "p8",
    stageEnteredAt: demoHoursAgo(20),
    paymentStatus: "owed",
    title: "Nine rooms in Arroios",
    issueId: DEMO_ISSUE.id,
    format: "deck",
    section: "Photo",
    kind: "Photo deck",
    byline: "Pedro Salgado",
    editorId: "marta",
    stage: "In review",
    due: "14 Aug",
    dueDate: demoDueDate(14),
    slides: 12,
    art: "in",
    wait: "you",
  },
  {
    id: "p9",
    // 18 minutes ago: the move `DEMO_ACTIVITY` opens with.
    stageEnteredAt: demoHoursAgo(0.3),
    paymentStatus: "none",
    title: "The chosen-family budget",
    issueId: DEMO_ISSUE.id,
    format: "deck",
    section: "Reported",
    kind: "Data deck",
    byline: "Rui Alves",
    editorId: "sara",
    stage: "Sensitivity read",
    due: "9 Aug",
    dueDate: demoDueDate(9),
    slides: 7,
    art: "brief",
    wait: "you",
  },
  {
    id: "p10",
    stageEnteredAt: demoHoursAgo(72),
    paymentStatus: "paid",
    title: "Sick Woman Theory, revisited",
    issueId: null,
    format: "article",
    section: "Review",
    kind: "Book review",
    byline: "Nadia Belkacem",
    editorId: "marta",
    stage: "Edit",
    due: "11 Aug",
    dueDate: demoDueDate(11),
    words: 900,
    art: "in",
  },
  {
    id: "p11",
    stageEnteredAt: demoHoursAgo(200),
    paymentStatus: "none",
    title: "Notes from a waiting room",
    issueId: null,
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Yara Mendonça",
    editorId: "sara",
    stage: "Drafting",
    due: "19 Aug",
    dueDate: demoDueDate(19),
    words: 1500,
    art: "none",
    fresh: true,
    // A named writer drafting it: the desk waits on her, and chases her.
    wait: "writer",
  },
  {
    id: "p12",
    stageEnteredAt: demoHoursAgo(300),
    paymentStatus: "none",
    title: "Take care",
    issueId: DEMO_ISSUE.id,
    format: "article",
    section: "Last word",
    kind: "Column",
    // Commissioned with no writer yet: the one demo piece whose next action
    // is Hand off, with "No writer yet" in its meta line.
    byline: "",
    editorId: "marta",
    stage: "Commissioned",
    due: "20 Aug",
    dueDate: demoDueDate(20),
    words: 500,
    art: "na",
  },
  {
    // Ready with no publish date and no issue yet: the desk leads this row
    // with "Add to issue", next to p5's scheduled one.
    id: "p14",
    stageEnteredAt: demoHoursAgo(20),
    paymentStatus: "none",
    title: "Last orders on a Bairro Alto night",
    issueId: null,
    format: "article",
    section: "Review",
    kind: "Review",
    byline: "Tomás Reis",
    editorId: "marta",
    stage: "Ready",
    due: "ready",
    words: 1100,
    art: "in",
  },
  {
    // Published last week as a platform highlight. The fee is still owed,
    // which is exactly the case the "unpaid" focus exists to catch.
    id: "p13",
    stageEnteredAt: demoHoursAgo(150),
    paymentStatus: "owed",
    title: "The last queer bookshop in Porto",
    issueId: null,
    format: "article",
    section: "Features",
    kind: "Report",
    byline: "Leonor Batista",
    editorId: "sara",
    stage: "Published",
    due: "ready",
    words: 1400,
    art: "in",
  },
];

export const DEMO_PITCHES: Pitch[] = [
  {
    id: "q1",
    receivedAt: demoHoursAgo(5),
    title: "The lesbian bar that became a bike shop",
    byline: "Inês Faria",
    note: "Oral history of Bar Sétimo, closed 2019. Three former owners already agreed to talk.",
    fresh: true,
    tags: ["History", "Lisbon"],
  },
  {
    id: "q2",
    receivedAt: demoHoursAgo(50),
    title: "What HRT costs, month by month",
    byline: "Kai Oliveira",
    note: "A year of receipts, annotated. Would need a data-viz deck rather than prose.",
    suggest: "deck",
    tags: ["Health", "Money"],
  },
  {
    id: "q3",
    receivedAt: demoHoursAgo(26),
    title: "My grandmother taught me to hem",
    byline: "Duarte Nogueira",
    note: "Essay on inherited craft and being the only out person at family lunch.",
    fresh: true,
    tags: ["Essay"],
  },
  {
    id: "q4",
    receivedAt: demoHoursAgo(170),
    title: "Every queer sports club in the Área Metropolitana",
    byline: "Bea Santoro",
    note: "Service piece. Has a spreadsheet of 34 clubs, needs verification pass.",
    tags: ["Service"],
  },
];

/**
 * PRD-130 — the desk's section list, re-exported from the canonical demo
 * taxonomy rather than restated here. It used to be a second hand-curated
 * copy of `magazineSections.data.ts`, which is the shape of drift that hides
 * until an editor commissions into a section the seeded rows do not have.
 * The values are identical; only the single source of truth moved.
 *
 * This stays DEMO-ONLY data. Live surfaces read the seeded rows through
 * `useMagazineSections` (`GET /magazine/sections`), which returns the same
 * `name`/`target`/`note` fields, so both modes hand consumers a `Section`.
 */
export const DEMO_SECTIONS: Section[] = CANONICAL_DEMO_SECTIONS;

export const DEMO_ACTIVITY: Activity[] = [
  {
    who: "Sara",
    what: "moved <b>The chosen-family budget</b> to sensitivity read",
    when: "18m",
  },
  {
    who: "Ana",
    what: "left 2 notes on <b>What we owe old friends</b>",
    when: "1h",
  },
  {
    who: "You",
    what: "scheduled <b>The chosen-family budget</b> for 1 Sep",
    when: "3h",
  },
  {
    who: "Pedro",
    what: "uploaded 12 photos to <b>Nine rooms in Arroios</b>",
    when: "Yesterday",
  },
];
