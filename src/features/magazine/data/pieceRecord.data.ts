/**
 * Piece-record demo data — ported verbatim (values unchanged, `<em>` stripped
 * from the title) from the DesignSync prototype's `MAG.RECORD` (`mag-data2.js`).
 * Mirrors the shape `usePieceRecord` returns in live mode
 * (`GET /magazine/admin/pieces/:id`), plus the FE-only `similar` list the
 * backend doesn't model (see `PieceRecordView` below).
 *
 * This is the SAME piece as `DEMO_PIECES` id `"p1"` in `desk.data.ts` — same
 * title/section/kind/byline/editor/stage/due/words — with the full
 * brief/care/payment/audit/letters/corrections detail the desk list doesn't
 * carry. `usePieceRecord` ignores the `:id` param in demo mode and always
 * returns this record (Phase 1/2 limitation, same as other demo detail hooks).
 */

import type {
  CorrectionDto,
  LetterDto,
  PaymentDto,
  PieceBrief,
  PieceCare,
  PieceEventEntryDto,
  PieceRecordDto,
  PublishGateItemDto,
} from "../api/pieces.api";

/** One row of the "we have run this before" list on the Brief tab. FE-only —
 *  the backend has no similar-pieces endpoint yet. */
export interface SimilarPieceDto {
  title: string;
  issue: number;
  when: string;
  by: string;
  why: string;
}

/** The full record view Tasks 7–10's `PieceRecordPage` and its tabs render. */
export interface PieceRecordView extends PieceRecordDto {
  similar: SimilarPieceDto[];
}

const BRIEF: PieceBrief = {
  angle:
    "Six people who met at a Wednesday meeting in Anjos in 2003 are now each other's ageing plan. Not a policy piece: one kitchen table, said out loud.",
  wants: [
    "Reported, not personal essay",
    "At least three of the six on the record",
    "One number that lands: next-of-kin refusal rates",
    "No coming-out backstory. Start at fifty",
  ],
  avoid:
    "Do not name the clinic. Do not use 'chosen family' in the headline. We have used it twice this year.",
  wordCount: 2800,
  filedWords: 3140,
  rate: "€420",
  killFee: "€140",
  commissionedBy: "Marta",
  commissionedOn: "2 Jul",
  art: "Portrait sitting at the table, photographer booked (Pedro), 5 Aug.",
};

const CARE: PieceCare = {
  subjects: [
    {
      name: "Teresa M.",
      named: true,
      out: true,
      consent: "given",
      reply: "sent",
      note: "Happy to be named and photographed. Wants to read her quotes back.",
    },
    {
      name: "Rui S.",
      named: false,
      out: false,
      consent: "pseudonym",
      reply: "n/a",
      note: "Not out at work. Pseudonym agreed, no photograph, city named but not neighbourhood.",
    },
    {
      name: "Dra. Câmara",
      named: true,
      out: null,
      consent: "pending",
      reply: "waiting",
      note: "Quoted in a professional capacity. Needs sign-off from the clinic press office.",
    },
  ],
  contentNotes: ["Illness and hospital settings", "Death of a friend (brief, section 3)"],
  flags: [
    { key: "Names a venue", on: true, note: "Bar Sétimo: closed, safe to name." },
    { key: "Legal risk", on: false, note: "No allegations against a named person." },
    {
      key: "Names a health provider",
      on: true,
      note: "Second reader required before publish.",
    },
  ],
  read: {
    reader: "Ana Duarte",
    role: "Community sensitivity reader",
    status: "in progress",
    askedOn: "3 Aug",
    dueOn: "9 Aug",
    checks: [
      { label: "Nobody is outed by detail or jigsaw identification", done: true },
      { label: "Pseudonyms hold across the whole piece", done: true },
      { label: "Language matches the subjects' own words", done: false },
      { label: "Trans and non-binary subjects described as they asked", done: true },
      { label: "Second reader for the health-provider mention", done: false },
    ],
  },
};

const PAYMENT: PaymentDto = {
  fee: "€420",
  expenses: "€18 travel",
  invoice: "INV-2026-084",
  filedOn: "29 Jul",
  terms: "21 days",
  dueOn: "19 Aug",
  status: "approved_unpaid",
  paidOn: null,
};

// `when` is display copy here rather than an ISO timestamp — `HistoryTab`
// falls back to printing it verbatim when it can't parse a date, which is
// what keeps this hand-written fixture readable.
const AUDIT: PieceEventEntryDto[] = [
  {
    id: "demo-audit-1",
    actorId: "editor-marta",
    isSystem: false,
    who: "Marta",
    what: "commissioned this piece",
    when: "2 Jul, 10:12",
  },
  {
    id: "demo-audit-2",
    actorId: "writer-sara",
    isSystem: false,
    who: "Sara Pinheiro",
    what: "filed a draft of this piece: 3,140 words, 340 over",
    when: "29 Jul, 22:03",
  },
  {
    id: "demo-audit-3",
    actorId: "editor-marta",
    isSystem: false,
    who: "Marta",
    what: "moved this piece to first edit",
    when: "2 Aug, 11:15",
  },
  {
    id: "demo-audit-4",
    actorId: "editor-marta",
    isSystem: false,
    who: "Marta",
    what: "asked Ana for a sensitivity read on this piece",
    when: "3 Aug, 09:40",
  },
  {
    id: "demo-audit-5",
    actorId: "editor-ana",
    isSystem: false,
    who: "Ana Duarte",
    what: "opened the read on this piece",
    when: "4 Aug, 14:02",
  },
  {
    id: "demo-audit-6",
    actorId: null,
    isSystem: true,
    who: "System",
    what: "flagged this piece: names a health provider, second reader required",
    when: "4 Aug, 14:02",
  },
];

const LETTERS: LetterDto[] = [
  {
    id: "letter-1",
    who: "Cláudia, 58",
    body: "I read this twice and then I called the person I would have written down. Thank you for not making it sad.",
    runInLetters: false,
    createdAt: "2 days ago",
  },
  {
    id: "letter-2",
    who: "Anonymous",
    body: "The next-of-kin number is worse than you printed. I was refused twice at the same hospital.",
    runInLetters: false,
    createdAt: "4 days ago",
  },
];

const CORRECTIONS: CorrectionDto[] = [];

const SIMILAR: SimilarPieceDto[] = [
  {
    title: "The friends who became a household",
    issue: 9,
    when: "Mar 2026",
    by: "Marta Cruz",
    why: "Same subject, different angle: read before filing",
  },
  {
    title: "Who signs the form",
    issue: 4,
    when: "Sep 2025",
    by: "Rui Alves",
    why: "Uses the same ILGA next-of-kin data",
  },
];

/**
 * The publish gate, hand-derived from `CARE` to match the backend's
 * `computePublishGate` exactly (per-subject consent rows, then sensitivity
 * read checks, then a content-notes row). The backend only blocks a subject
 * row when `consent === 'pending'` — both `'given'` and `'pseudonym'` count
 * as settled — so this demo marks an agreed pseudonym as done too, and only
 * the still-`'pending'` Dra. Câmara row is an open consent blocker. Net
 * effect: 3 open items overall — 1 consent (Dra. Câmara) + 2 unchecked
 * sensitivity-read items — with content notes already written.
 */
const PUBLISH_GATE: PublishGateItemDto[] = [
  { label: "Consent: Teresa M.", done: true },
  { label: "Consent: Rui S.", done: true },
  { label: "Consent: Dra. Câmara", done: false },
  {
    label: "Sensitivity read: Nobody is outed by detail or jigsaw identification",
    done: true,
  },
  { label: "Sensitivity read: Pseudonyms hold across the whole piece", done: true },
  { label: "Sensitivity read: Language matches the subjects' own words", done: false },
  {
    label: "Sensitivity read: Trans and non-binary subjects described as they asked",
    done: true,
  },
  { label: "Sensitivity read: Second reader for the health-provider mention", done: false },
  { label: "Content notes written", done: true },
];

export const DEMO_RECORD: PieceRecordView = {
  id: "p1",
  format: "article",
  title: "What we owe old friends",
  section: "Cover",
  kind: "Long read",
  byline: "Sara Pinheiro",
  editorId: "marta",
  writerId: null,
  stage: "edit",
  due: "4 Aug",
  late: true,
  waitingOn: "writer",
  words: 2800,
  slides: null,
  art: "in",
  fresh: false,
  issueId: null,
  articleId: null,
  deckId: null,
  contentsBlurb: "",
  brief: BRIEF,
  care: CARE,
  audit: AUDIT,
  payment: PAYMENT,
  letters: LETTERS,
  corrections: CORRECTIONS,
  publishGate: PUBLISH_GATE,
  similar: SIMILAR,
};
