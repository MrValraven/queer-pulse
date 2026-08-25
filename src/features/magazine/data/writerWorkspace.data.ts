/**
 * Writer-workspace demo data — ported verbatim from the DesignSync prototype's
 * `MAG.CONTRIB` (`mag-data2.js`, via scratchpad `mag-design/mag-contrib.jsx`)
 * into the writer-scoped DTO shapes `writerWorkspace.api.ts` mirrors
 * (`WriterAssignmentDto`/`WriterPitchDto`/`WriterPaymentDto`). Distinct from
 * `pieceRecord.data.ts`/`desk.data.ts`, which are the EDITOR's view of the
 * same pieces — the writer never sees editor-only fields (care/audit/other
 * contributors), so this fixture only carries what `magazine-writer-response.ts`
 * actually maps.
 */

import type {
  WriterAssignmentDto,
  WriterPaymentDto,
  WriterPitchDto,
} from "../api/writerWorkspace.api";

/** The house terms every commission carries — mirrors the backend's static
 *  `HOUSE_RIGHTS_TERM`/`HOUSE_EDITS_TERM` (`magazine-writer-response.ts`). */
const HOUSE_RIGHTS_TERM = "First publication, you keep the rest";
const HOUSE_EDITS_TERM = "You see them before they ship";

const ASSIGNMENTS: WriterAssignmentDto[] = [
  {
    id: "a1",
    title: "What we owe old friends",
    section: "Cover",
    due: "4 Aug",
    state: "With your editor",
    stage: "edit",
    words: 3140,
    target: 2800,
    fee: "€420",
    pay: "approved, unpaid",
    note: "Marta left 2 notes. She needs your sign-off on the edit.",
    byline: "Sara Pinheiro",
    // Matches this same piece's `brief.killFee` on `pieceRecord.data.ts` (id "p1").
    terms: { killFee: "€140", rights: HOUSE_RIGHTS_TERM, edits: HOUSE_EDITS_TERM },
    wants: ["Start at the waiting list, not the diagnosis", "At least one friend's voice, not just the clinical view"],
    avoid: "Nothing that reads as a how-to grief guide.",
    rate: "€0.15/word",
    commissionedBy: "Marta Silveira",
    commissionedOn: "12 Jul",
  },
  {
    id: "a2",
    title: "Dra. Mariza Câmara on the long wait",
    section: "Interview",
    due: "17 Aug",
    state: "Drafting",
    stage: "drafting",
    words: 900,
    target: 2000,
    fee: "€300",
    pay: "on filing",
    note: "Transcript attached. Brief says start at the waiting list, not the diagnosis.",
    byline: "Sara Pinheiro",
    terms: { killFee: "€105", rights: HOUSE_RIGHTS_TERM, edits: HOUSE_EDITS_TERM },
    wants: ["Her own words on the waiting list, not a summary of the transcript"],
    avoid: "Any detail that could identify her clinic.",
    rate: "€0.15/word",
    commissionedBy: "Marta Silveira",
    commissionedOn: "3 Jul",
  },
];

const PITCHES: WriterPitchDto[] = [
  {
    id: "wp1",
    title: "The last kiosk in Anjos",
    sent: "12 Jul",
    state: "Maybe: held for issue 15",
    tone: "hold",
  },
  {
    id: "wp2",
    title: "Why we stopped going out",
    sent: "2 Jun",
    state: 'Passed: "not now", Marta replied personally',
    tone: "no",
  },
];

const PAYMENTS: WriterPaymentDto[] = [
  {
    title: "On grief and group chats",
    issue: "12",
    fee: "€380",
    state: "Paid 14 Jun",
  },
  {
    title: "What we owe old friends",
    issue: "14",
    fee: "€420",
    state: "Due 19 Aug",
  },
];

/** Demo-mode fixture for `useWriterWorkspace` — the writer's own work only. */
export const DEMO_WRITER = {
  assignments: ASSIGNMENTS,
  pitches: PITCHES,
  payments: PAYMENTS,
};
