/**
 * Editor desk demo data — ported verbatim (values unchanged) from the
 * DesignSync prototype's `mag-data.js` + `mag-data2.js`. Titles are stored
 * as plain strings (the design's `<em>` markup is stripped; see
 * `stripEm` in `desk.copy.ts` for any string that still carries markup,
 * such as `Activity.what`).
 */

export type PieceFormat = "article" | "deck";

export type Stage =
  | "Commissioned"
  | "Drafting"
  | "In review"
  | "Edit"
  | "Sensitivity read"
  | "Layout"
  | "Ready";

export type WaitOn = "writer" | "you" | "nobody";

export type SavedViewId = "v-late" | "v-art" | "v-sens" | "v-pay";

export interface Piece {
  id: string;
  title: string;
  format: PieceFormat;
  section: string;
  kind: string;
  byline: string;
  editorId: string;
  stage: Stage;
  due: string;
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
}

export interface Pitch {
  id: string;
  title: string;
  byline: string;
  note: string;
  fresh?: boolean;
  tags: string[];
  suggest?: "deck";
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
  number: string;
  theme: string;
  closes: string;
  publishes: string;
  daysLeft: number;
  filled: number;
  slots: number;
}

export const DEMO_ISSUE: Issue = {
  number: "14",
  theme: "Aftercare",
  closes: "12 Aug",
  publishes: "1 Sep",
  daysLeft: 9,
  filled: 11,
  slots: 15,
};

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
];

export const DEMO_PIECES: Piece[] = [
  {
    id: "p1",
    title: "What we owe old friends",
    format: "article",
    section: "Cover",
    kind: "Long read",
    byline: "Sara Pinheiro",
    editorId: "marta",
    stage: "Edit",
    due: "4 Aug",
    late: true,
    words: 2800,
    art: "in",
    wait: "writer",
    note: "awaiting sign-off on the edit",
  },
  {
    id: "p2",
    title: "The pharmacist who fills every prescription",
    format: "article",
    section: "Features",
    kind: "Profile",
    byline: "Tomás Mendes",
    editorId: "sara",
    stage: "Drafting",
    due: "8 Aug",
    words: 1200,
    art: "brief",
    wait: "writer",
    note: "interviewing Rui this week",
  },
  {
    id: "p3",
    title: "Care work, undercounted",
    format: "deck",
    section: "Reported",
    kind: "Data deck",
    byline: "Catarina Vaz",
    editorId: "sara",
    stage: "In review",
    due: "12 Aug",
    slides: 9,
    art: "none",
    wait: "you",
  },
  {
    id: "p4",
    title: "Dra. Mariza Câmara on the long wait",
    format: "article",
    section: "Interview",
    kind: "Interview",
    byline: "Sara & Sofia",
    editorId: "sara",
    stage: "Edit",
    due: "17 Aug",
    words: 2000,
    art: "brief",
  },
  {
    id: "p5",
    title: "On the bus to Faro",
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
    title: "A reading list, by the therapist who wrote it",
    format: "article",
    section: "Service",
    kind: "Service",
    byline: "Sofia Rocha",
    editorId: "marta",
    stage: "Drafting",
    due: "15 Aug",
    words: 1600,
    art: "na",
    wait: "writer",
    note: "6 of 8 clinicians in",
  },
  {
    id: "p7",
    title: "Quick exit",
    format: "article",
    section: "Column",
    kind: "Column",
    byline: "Trans Hub editors",
    editorId: "marta",
    stage: "Commissioned",
    due: "2 Aug",
    late: true,
    words: 800,
    art: "na",
    wait: "writer",
    note: "monthly column not filed",
  },
  {
    id: "p8",
    title: "Nine rooms in Arroios",
    format: "deck",
    section: "Photo",
    kind: "Photo deck",
    byline: "Pedro Salgado",
    editorId: "marta",
    stage: "In review",
    due: "14 Aug",
    slides: 12,
    art: "in",
    wait: "you",
  },
  {
    id: "p9",
    title: "The chosen-family budget",
    format: "deck",
    section: "Reported",
    kind: "Data deck",
    byline: "Rui Alves",
    editorId: "sara",
    stage: "Sensitivity read",
    due: "9 Aug",
    slides: 7,
    art: "brief",
    wait: "you",
  },
  {
    id: "p10",
    title: "Sick Woman Theory, revisited",
    format: "article",
    section: "Review",
    kind: "Book review",
    byline: "Nadia Belkacem",
    editorId: "marta",
    stage: "Edit",
    due: "11 Aug",
    words: 900,
    art: "in",
  },
  {
    id: "p11",
    title: "Notes from a waiting room",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Yara Mendonça",
    editorId: "sara",
    stage: "Drafting",
    due: "19 Aug",
    words: 1500,
    art: "none",
    fresh: true,
  },
  {
    id: "p12",
    title: "Take care",
    format: "article",
    section: "Last word",
    kind: "Column",
    byline: "Marta Cruz",
    editorId: "marta",
    stage: "Commissioned",
    due: "20 Aug",
    words: 500,
    art: "na",
  },
];

export const DEMO_PITCHES: Pitch[] = [
  {
    id: "q1",
    title: "The lesbian bar that became a bike shop",
    byline: "Inês Faria",
    note: "Oral history of Bar Sétimo, closed 2019. Three former owners already agreed to talk.",
    fresh: true,
    tags: ["History", "Lisbon"],
  },
  {
    id: "q2",
    title: "What HRT costs, month by month",
    byline: "Kai Oliveira",
    note: "A year of receipts, annotated. Would need a data-viz deck rather than prose.",
    suggest: "deck",
    tags: ["Health", "Money"],
  },
  {
    id: "q3",
    title: "My grandmother taught me to hem",
    byline: "Duarte Nogueira",
    note: "Essay on inherited craft and being the only out person at family lunch.",
    fresh: true,
    tags: ["Essay"],
  },
  {
    id: "q4",
    title: "Every queer sports club in the Área Metropolitana",
    byline: "Bea Santoro",
    note: "Service piece. Has a spreadsheet of 34 clubs, needs verification pass.",
    tags: ["Service"],
  },
];

export const DEMO_SECTIONS: Section[] = [
  { name: "Cover", target: 1, note: "One piece, always commissioned first" },
  { name: "Features", target: 2, note: "Reported, 1200–3000 words" },
  { name: "Reported", target: 2, note: "Data-led; deck or prose" },
  { name: "Interview", target: 1, note: "Q&A format" },
  { name: "Essays", target: 3, note: "At least one new voice" },
  { name: "Service", target: 2, note: "Practical, checked twice" },
  { name: "Photo", target: 1, note: "Deck only" },
  { name: "Review", target: 1, note: "Books, film, nightlife" },
  { name: "Column", target: 1, note: "Standing column" },
  { name: "Last word", target: 1, note: "Written last, by an editor" },
];

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
