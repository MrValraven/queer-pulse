/* ===========================================================
   Editor dashboard — mock data + pure selectors.
   Ported from the design prototype (qp-editor-dashboard.js).
   All data is static; "today" is pinned so due-date math is
   deterministic. No component may store derived data — the
   selectors below recompute it from the (mutable) pieces list.

   i18n: piece/pitch/activity RECORDS (titles, notes, names) are
   editorial-database content and stay English mock data. The
   composed UI phrases below (dueInfo, blockedLine, sort/stage
   labels) are platform chrome — they take a `t` (TFunction) and
   return an already-translated string, same idiom as
   `magazineFormat.ts`. Stage/SortKey themselves stay their
   canonical English ids (label-key indirection): components
   resolve display text via `t(STAGE_LABEL_KEY[stage])` /
   `t(SORT_LABEL_KEY[sort])` rather than storing translated text.
   =========================================================== */

import type { TFunction } from "../../shared/i18n/types";

export type Stage =
  | "Commissioned"
  | "Drafting"
  | "In review"
  | "First edit"
  | "Copyedit"
  | "Fact-check"
  | "Sensitivity read"
  | "Ready";

export type Editor = "Marta" | "Sara";
export type ArtState = "in" | "brief" | "none" | "na";
export type PitchTint = "coral" | "jade" | "plum";
export type ActivityTint = "coral" | "jade" | "plum";

export interface Art {
  state: ArtState;
  label: string;
}

export interface Piece {
  id: string;
  title: string; // may contain <em>…</em> for coral emphasis
  section: string;
  kind: string;
  author: string;
  words: number;
  editor: Editor;
  stage: Stage;
  blocked: "writer" | "editor" | null;
  blockedNote: string;
  due: Date | "ready";
  art: Art;
  newVoice: boolean;
  pct?: number;
}

export interface Pitch {
  id: string;
  name: string;
  title: string;
  kind: string;
  when: string;
  tint: PitchTint;
  newVoice: boolean;
}

export interface Section {
  name: string;
  planned: number;
  filled: number;
}

export interface ActivityItem {
  who: string;
  act: string;
  obj: string;
  when: string;
  tint: ActivityTint;
}

/* ── Clock ──────────────────────────────────────────── */
/** Pinned "now" so the mock's due-date math never drifts. */
export const TODAY = new Date(2026, 6, 3); // 3 July 2026
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
/** Build a 2026 date from 1-based month + day. */
function d(month: number, day: number): Date {
  return new Date(2026, month - 1, day);
}
function fmtAbs(dt: Date): string {
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
}
export function firstName(name: string): string {
  return name.split(" ")[0] ?? name;
}
/** Strip <em> tags for contexts that show the plain title. */
export function stripEm(title: string): string {
  return title.replace(/<\/?em>/g, "");
}

/* ── Pipeline ───────────────────────────────────────── */
/** Ordered editorial stages. "Sensitivity read" is a
    QueerPulse-specific community pass. */
export const PIPELINE: Stage[] = [
  "Commissioned",
  "Drafting",
  "In review",
  "First edit",
  "Copyedit",
  "Fact-check",
  "Sensitivity read",
  "Ready",
];

export const EDITORS: Editor[] = ["Marta", "Sara"];
export const ME: Editor = "Marta"; // current user

/** Stage id → catalog key. The Stage id itself is the stored/compared value. */
export const STAGE_LABEL_KEY: Record<Stage, string> = {
  Commissioned: "magazine:editor.stage.commissioned",
  Drafting: "magazine:editor.stage.drafting",
  "In review": "magazine:editor.stage.inReview",
  "First edit": "magazine:editor.stage.firstEdit",
  Copyedit: "magazine:editor.stage.copyedit",
  "Fact-check": "magazine:editor.stage.factCheck",
  "Sensitivity read": "magazine:editor.stage.sensitivityRead",
  Ready: "magazine:editor.stage.ready",
};

/**
 * The current in-production issue's own metadata — a specific issue record
 * (number, theme, dates, assigned editors), so in live mode this would be
 * fetched, not authored chrome. Dates are real `Date`s so the header can
 * format them through `useFormat()` instead of a hardcoded English string.
 */
export const CURRENT_ISSUE = {
  number: 10,
  theme: "“On Care.”",
  closesDate: new Date(2026, 6, 14),
  publishesDate: new Date(2026, 8, 1),
  editorsLabel: "Marta & Sara",
};

/* ── Pieces ─────────────────────────────────────────── */
export const PIECES: Piece[] = [
  {
    id: "p1",
    title: "What we owe <em>old friends</em>",
    section: "Cover",
    kind: "Long read",
    author: "Sara Pinheiro",
    words: 2800,
    editor: "Marta",
    stage: "Copyedit",
    blocked: "writer",
    blockedNote: "awaiting author sign-off on edits",
    due: d(7, 1),
    art: { state: "in", label: "Photographed" },
    newVoice: false,
  },
  {
    id: "p2",
    title: "The pharmacist who fills every prescription",
    section: "Features",
    kind: "Profile",
    author: "Tomás Mendes",
    words: 1200,
    editor: "Sara",
    stage: "Drafting",
    blocked: "writer",
    blockedNote: "interviewing Rui this week",
    due: d(7, 8),
    art: { state: "brief", label: "Brief sent" },
    newVoice: false,
    pct: 60,
  },
  {
    id: "p3",
    title: "Care work, undercounted",
    section: "Reported",
    kind: "Reported essay",
    author: "Catarina Vaz",
    words: 3400,
    editor: "Sara",
    stage: "In review",
    blocked: "editor",
    blockedNote: "",
    due: d(7, 12),
    art: { state: "none", label: "No art yet" },
    newVoice: false,
  },
  {
    id: "p4",
    title: "Interview · Dra. Mariza Câmara",
    section: "Interview",
    kind: "Interview",
    author: "Sara & Sofia",
    words: 2000,
    editor: "Sara",
    stage: "First edit",
    blocked: null,
    blockedNote: "",
    due: d(7, 17),
    art: { state: "brief", label: "Portrait scheduled" },
    newVoice: false,
  },
  {
    id: "p5",
    title: "On the bus to Faro",
    section: "Essays",
    kind: "Essay",
    author: "Anika Kovač",
    words: 1800,
    editor: "Marta",
    stage: "Ready",
    blocked: null,
    blockedNote: "",
    due: "ready",
    art: { state: "in", label: "Illustration in" },
    newVoice: true,
  },
  {
    id: "p6",
    title: "Service · reading list (by therapist)",
    section: "Service",
    kind: "Service",
    author: "Sofia",
    words: 1600,
    editor: "Marta",
    stage: "Drafting",
    blocked: "writer",
    blockedNote: "6 of 8 clinicians in",
    due: d(7, 15),
    art: { state: "na", label: "No art" },
    newVoice: false,
    pct: 75,
  },
  {
    id: "p7",
    title: "Column · “Quick exit”",
    section: "Column",
    kind: "Column",
    author: "Trans Hub editors",
    words: 800,
    editor: "Marta",
    stage: "Commissioned",
    blocked: "writer",
    blockedNote: "monthly column not filed",
    due: d(7, 2),
    art: { state: "na", label: "No art" },
    newVoice: false,
  },
  {
    id: "p8",
    title: "Last word · “Take care”",
    section: "Last word",
    kind: "Column",
    author: "Marta",
    words: 500,
    editor: "Marta",
    stage: "Commissioned",
    blocked: null,
    blockedNote: "written last",
    due: d(7, 7),
    art: { state: "na", label: "No art" },
    newVoice: false,
  },
  {
    id: "p9",
    title: "The chosen-family budget",
    section: "Reported",
    kind: "Reported",
    author: "Rui Alves",
    words: 2200,
    editor: "Sara",
    stage: "Sensitivity read",
    blocked: "editor",
    blockedNote: "",
    due: d(7, 9),
    art: { state: "brief", label: "Data viz briefed" },
    newVoice: false,
  },
  {
    id: "p10",
    title: "Review · <em>Sick Woman Theory</em>, revisited",
    section: "Review",
    kind: "Book review",
    author: "Nadia Belkacem",
    words: 900,
    editor: "Marta",
    stage: "Copyedit",
    blocked: null,
    blockedNote: "",
    due: d(7, 11),
    art: { state: "in", label: "Cover art in" },
    newVoice: false,
  },
  {
    id: "p11",
    title: "Notes from a waiting room",
    section: "Essays",
    kind: "Essay",
    author: "Yara Mendonça",
    words: 1500,
    editor: "Sara",
    stage: "Drafting",
    blocked: "writer",
    blockedNote: "first draft due Fri",
    due: d(7, 19),
    art: { state: "none", label: "No art yet" },
    newVoice: true,
    pct: 35,
  },
  {
    id: "p12",
    title: "Hands that hold",
    section: "Photo essay",
    kind: "Photo essay",
    author: "Pedro Salgado",
    words: 600,
    editor: "Marta",
    stage: "In review",
    blocked: "editor",
    blockedNote: "",
    due: d(7, 14),
    art: { state: "in", label: "14 images in" },
    newVoice: true,
  },
];

/* ── Pitches (34 total; 6 in view) ──────────────────── */
export const PITCHES: Pitch[] = [
  {
    id: "q1",
    name: "Emília Marques",
    title: "A trans archive in Faro",
    kind: "Photo essay · 12 images",
    when: "2 hours ago",
    tint: "coral",
    newVoice: true,
  },
  {
    id: "q2",
    name: "Daniel Reis",
    title: "What I learned from my grandmother’s nursing book",
    kind: "Personal essay · 1,800 words",
    when: "yesterday",
    tint: "jade",
    newVoice: true,
  },
  {
    id: "q3",
    name: "Mira Martín",
    title: "Madrid to Anjos · a care comparison",
    kind: "Reported · 2,500 words",
    when: "3 days ago",
    tint: "plum",
    newVoice: false,
  },
  {
    id: "q4",
    name: "Filipa Lopes",
    title: "Caring for the printer · a riso elegy",
    kind: "Profile · 1,400 words",
    when: "last week",
    tint: "coral",
    newVoice: false,
  },
  {
    id: "q5",
    name: "Kwame Osei",
    title: "The night pharmacy on Rua do Salitre",
    kind: "Reported · 2,000 words",
    when: "last week",
    tint: "jade",
    newVoice: true,
  },
  {
    id: "q6",
    name: "Bea Fonseca",
    title: "My physio taught me to rest",
    kind: "Essay · 1,100 words",
    when: "2 weeks ago",
    tint: "plum",
    newVoice: false,
  },
];

export const PITCH_TOTAL = 34;

/* ── Sections budget ────────────────────────────────── */
export const SECTIONS: Section[] = [
  { name: "Cover story", planned: 1, filled: 1 },
  { name: "Features", planned: 3, filled: 2 },
  { name: "Essays", planned: 3, filled: 3 },
  { name: "Interview", planned: 1, filled: 1 },
  { name: "Reported", planned: 2, filled: 2 },
  { name: "Service", planned: 2, filled: 1 },
  { name: "Column", planned: 1, filled: 1 },
  { name: "Review", planned: 1, filled: 1 },
  { name: "Photo essay", planned: 1, filled: 1 },
  { name: "Last word", planned: 1, filled: 1 },
];

/* ── Activity feed ──────────────────────────────────── */
export const ACTIVITY: ActivityItem[] = [
  {
    who: "Sara",
    act: "left a note on",
    obj: "Care work, undercounted",
    when: "2h",
    tint: "jade",
  },
  {
    who: "Emília Marques",
    act: "pitched",
    obj: "A trans archive in Faro",
    when: "2h",
    tint: "coral",
  },
  {
    who: "Tomás",
    act: "submitted a draft of",
    obj: "The pharmacist…",
    when: "4h",
    tint: "plum",
  },
  {
    who: "Marta",
    act: "took over",
    obj: "Hands that hold",
    when: "yesterday",
    tint: "coral",
  },
  {
    who: "Anika",
    act: "marked Ready",
    obj: "On the bus to Faro",
    when: "yesterday",
    tint: "jade",
  },
  {
    who: "Sofia",
    act: "added 2 clinicians to",
    obj: "reading list",
    when: "2d",
    tint: "plum",
  },
];

export const WORD_TARGET = 32000;

/* ═══════════════ Filters ══════════════════════════════ */
export type SortKey = "due" | "status" | "editor" | "section" | "words";
export type TriageVerdict = "yes" | "maybe" | "no";

export interface Filters {
  q: string;
  fEditor: string; // "all" | Editor
  fStatus: string; // "all" | "late" | "blocked" | "ready"
  fSection: string; // "all" | section first word
  sort: SortKey;
  myQueue: boolean;
  me: Editor;
}

/** SortKey → catalog key (mirrors `editor.toolbar.sort.*`, reused for the count line). */
export const SORT_LABEL_KEY: Record<SortKey, string> = {
  due: "magazine:editor.toolbar.sort.due",
  status: "magazine:editor.toolbar.sort.status",
  editor: "magazine:editor.toolbar.sort.editor",
  section: "magazine:editor.toolbar.sort.section",
  words: "magazine:editor.toolbar.sort.words",
};

/* ═══════════════ Due formatting ═══════════════════════ */
export interface DueInfo {
  label: string;
  cls: "ready" | "late" | "soon" | "normal";
  diff: number;
  abs?: string;
}

export function dueInfo(due: Date | "ready", t: TFunction): DueInfo {
  if (due === "ready")
    return { label: t("magazine:editor.due.ready"), cls: "ready", diff: 9999 };
  const diff = Math.round((due.getTime() - TODAY.getTime()) / 86400000);
  if (diff < 0)
    return {
      label: t("magazine:editor.due.late", { days: -diff }),
      cls: "late",
      diff,
      abs: fmtAbs(due),
    };
  if (diff === 0)
    return {
      label: t("magazine:editor.due.today"),
      cls: "soon",
      diff: 0,
      abs: fmtAbs(due),
    };
  if (diff <= 3)
    return {
      label: t("magazine:editor.due.inDays", { days: diff }),
      cls: "soon",
      diff,
      abs: fmtAbs(due),
    };
  return {
    label: t("magazine:editor.due.inDays", { days: diff }),
    cls: "normal",
    diff,
    abs: fmtAbs(due),
  };
}

/** `dueInfo`'s day-diff without needing a `t` — used by pure filters/sorts. */
function dueDiff(due: Date | "ready"): number {
  if (due === "ready") return 9999;
  return Math.round((due.getTime() - TODAY.getTime()) / 86400000);
}

/** `dueInfo`'s classification without needing a `t` — used by pure filters/sorts. */
function dueClass(due: Date | "ready"): DueInfo["cls"] {
  if (due === "ready") return "ready";
  const diff = dueDiff(due);
  if (diff < 0) return "late";
  if (diff <= 3) return "soon";
  return "normal";
}

export function isLate(p: Piece): boolean {
  return p.due !== "ready" && dueClass(p.due) === "late" && p.stage !== "Ready";
}

export function stageProgress(stage: Stage): number {
  return Math.round((PIPELINE.indexOf(stage) / (PIPELINE.length - 1)) * 100);
}

/* ═══════════════ Blocked-on rendering ═════════════════ */
export interface BlockedLine {
  text: string;
  cls: "court" | "other" | "writer" | "note";
}

export function blockedLine(
  p: Piece,
  me: Editor,
  t: TFunction,
): BlockedLine | null {
  if (p.stage === "Ready") return null;
  if (p.blocked === "editor") {
    const mine = p.editor === me;
    return {
      text: mine
        ? t("magazine:editor.blocked.inYourCourt")
        : t("magazine:editor.blocked.inEditorsCourt", { editor: p.editor }),
      cls: mine ? "court" : "other",
    };
  }
  if (p.blocked === "writer") {
    const note = p.blockedNote ? ` · ${p.blockedNote}` : "";
    return {
      text: `${t("magazine:editor.blocked.waitingOnWriter", { name: firstName(p.author) })}${note}`,
      cls: "writer",
    };
  }
  return p.blockedNote ? { text: p.blockedNote, cls: "note" } : null;
}

/* ═══════════════ Filtering + sorting ══════════════════ */
export function visiblePieces(pieces: Piece[], f: Filters): Piece[] {
  const q = f.q.toLowerCase();
  const list = pieces.filter((p) => {
    if (f.myQueue && p.editor !== f.me) return false;
    if (f.fEditor !== "all" && p.editor !== f.fEditor) return false;
    if (f.fStatus === "late" && !isLate(p)) return false;
    if (f.fStatus === "ready" && p.stage !== "Ready") return false;
    if (f.fStatus === "blocked" && p.blocked !== "editor") return false;
    if (f.fSection !== "all" && p.section !== f.fSection) return false;
    if (q) {
      const hay = `${p.title} ${p.author} ${p.section} ${p.kind}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  list.sort((a, b) => {
    if (f.sort === "due") {
      const la = isLate(a);
      const lb = isLate(b);
      if (la !== lb) return la ? -1 : 1;
      return dueDiff(a.due) - dueDiff(b.due);
    }
    if (f.sort === "status")
      return PIPELINE.indexOf(a.stage) - PIPELINE.indexOf(b.stage);
    if (f.sort === "editor")
      return (
        a.editor.localeCompare(b.editor) || dueDiff(a.due) - dueDiff(b.due)
      );
    if (f.sort === "section") return a.section.localeCompare(b.section);
    if (f.sort === "words") return b.words - a.words;
    return 0;
  });
  return list;
}

export function filterPitches(pitches: Pitch[], q: string): Pitch[] {
  const query = q.toLowerCase();
  if (!query) return pitches;
  return pitches.filter((p) =>
    `${p.name} ${p.title} ${p.kind}`.toLowerCase().includes(query),
  );
}

/* ═══════════════ "Needs you now" ══════════════════════ */
export function needsYouNow(pieces: Piece[], me: Editor): Piece[] {
  return pieces
    .filter((p) => isLate(p) || (p.blocked === "editor" && p.editor === me))
    .sort((a, b) => dueDiff(a.due) - dueDiff(b.due));
}

/* ═══════════════ Editor load ══════════════════════════ */
export interface LoadRow {
  editor: Editor;
  count: number;
  words: number;
  late: number;
  mine: boolean;
}

export function editorLoad(pieces: Piece[], me: Editor): LoadRow[] {
  return EDITORS.map((ed) => {
    const ps = pieces.filter((p) => p.editor === ed);
    return {
      editor: ed,
      count: ps.length,
      words: ps.reduce((a, p) => a + p.words, 0),
      late: ps.filter(isLate).length,
      mine: ed === me,
    };
  });
}

/** Word gap the busier editor is carrying (Sara − Marta). */
export function loadGap(pieces: Piece[]): number {
  const w = (ed: Editor) =>
    pieces.filter((p) => p.editor === ed).reduce((a, p) => a + p.words, 0);
  return w("Sara") - w("Marta");
}

/* ═══════════════ Issue progress ═══════════════════════ */
export interface IssueProgress {
  ready: number;
  total: number;
  readyPct: number;
  words: number;
  wordPct: number;
}

export function issueProgress(pieces: Piece[]): IssueProgress {
  const ready = pieces.filter((p) => p.stage === "Ready").length;
  const words = pieces.reduce(
    (a, p) =>
      a +
      (p.stage === "Ready"
        ? p.words
        : Math.round(p.words * ((p.pct ?? stageProgress(p.stage)) / 100))),
    0,
  );
  return {
    ready,
    total: pieces.length,
    readyPct: (ready / pieces.length) * 100,
    words,
    wordPct: Math.min(100, (words / WORD_TARGET) * 100),
  };
}
