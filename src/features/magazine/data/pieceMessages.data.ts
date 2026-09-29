/**
 * Demo-mode fixture for the editor↔writer per-piece message thread (Phase 7
 * Wave F), keyed by piece id. Every peek used to show the SAME thread on
 * every piece: opening "Quick exit" showed a conversation actually about
 * "What we owe old friends" (Marta chasing Sara for sign-off), because the
 * old fixture was one flat array with no id of its own. Each
 * piece below now gets its own thread, or an empty one (the thread's own
 * "no messages yet" state) when nobody has messaged about it in the demo.
 *
 * The desk peek reads this by piece id; the writer workspace
 * (`EditorMessageCard.tsx`, `MessageEditorModal.tsx`, both via `PieceThread`)
 * reads the SAME fixture by ASSIGNMENT id instead, so the two demo
 * assignment ids are aliased here to their piece's own thread (re-keying by
 * piece id alone emptied "From your editor" on
 * the writer workspace, since `usePieceMessages` was never asked for `p1`
 * there, only `a1`).
 *
 * Each row keeps its own `authorRole` instead of a hardcoded `fromMe`:
 * `usePieceMessages` derives `fromMe` by comparing `authorRole` to whichever
 * `side` ("editor" or "writer") is asking, exactly like the live server
 * computes `fromMe: message.authorId === requestingUserId` per requester.
 * Timestamps are relative to the viewer's own load time (`demoMessageAgo`,
 * the same pattern `desk.data.ts`'s `demoHoursAgo` uses), so "on it, reading
 * through now" keeps reading as a same-day reply for as long as the demo
 * stays up, instead of drifting into the past the way a fixed ISO date would.
 */

const MINUTE_IN_MS = 60 * 1000;

/** An ISO instant `minutesAgo` before the viewer's own load time. */
function demoMessageAgo(minutesAgo: number): string {
  return new Date(Date.now() - minutesAgo * MINUTE_IN_MS).toISOString();
}

export interface DemoPieceMessageSeed {
  id: string;
  authorRole: "editor" | "writer";
  authorName: string;
  body: string;
  /** ISO timestamp: the list must stay createdAt ASC (oldest first, chat order). */
  createdAt: string;
}

// "What we owe old friends": editor Marta Cruz chasing writer Sara Pinheiro
// for sign-off on the edit (matches the "awaiting sign-off on the edit"
// note already on this piece). 52 days ago, so it reads as an older,
// already-settled exchange.
const P1_THREAD: DemoPieceMessageSeed[] = [
  {
    id: "pm1",
    authorRole: "editor",
    authorName: "Marta Cruz",
    body: 'Hey Sara, I left two notes on the edit for "What we owe old friends". No rush, but I’d love your take before Friday.',
    createdAt: demoMessageAgo(52 * 24 * 60),
  },
  {
    id: "pm2",
    authorRole: "writer",
    authorName: "Sara Pinheiro",
    body: "On it. Reading through now, I'll reply properly this afternoon.",
    createdAt: demoMessageAgo(52 * 24 * 60 - 47),
  },
  {
    id: "pm3",
    authorRole: "editor",
    authorName: "Marta Cruz",
    body: "No stress at all, thank you.",
    createdAt: demoMessageAgo(52 * 24 * 60 - 50),
  },
];

// "Quick exit": editor Marta Cruz chasing the Trans Hub editors for the
// monthly column, already late (matches "monthly column not filed").
const P7_THREAD: DemoPieceMessageSeed[] = [
  {
    id: "pm4",
    authorRole: "editor",
    authorName: "Marta Cruz",
    body: "Hey, the column hasn't come in yet and we're a few days past. Can you give me a date?",
    createdAt: demoMessageAgo(9 * 24 * 60),
  },
  {
    id: "pm5",
    authorRole: "writer",
    authorName: "Trans Hub editors",
    body: "Sorry for the quiet, this cycle's been a lot. We can have it to you by Thursday.",
    createdAt: demoMessageAgo(9 * 24 * 60 - 95),
  },
];

// "The chosen-family budget": editor Sara Pinheiro relaying the sensitivity
// reader's note to writer Rui Alves.
const P9_THREAD: DemoPieceMessageSeed[] = [
  {
    id: "pm6",
    authorRole: "editor",
    authorName: "Sara Pinheiro",
    body: "The sensitivity reader flagged one spot: can you add a source for the next-of-kin refusal-rate figure?",
    createdAt: demoMessageAgo(4 * 24 * 60),
  },
  {
    id: "pm7",
    authorRole: "writer",
    authorName: "Rui Alves",
    body: "That's from the Aliança LGBT survey, adding the citation to the slide now.",
    createdAt: demoMessageAgo(4 * 24 * 60 - 150),
  },
];

export const DEMO_PIECE_MESSAGES: Record<string, DemoPieceMessageSeed[]> = {
  p1: P1_THREAD,
  p7: P7_THREAD,
  p9: P9_THREAD,
  // The writer workspace's demo assignments (`writerWorkspace.data.ts`) read
  // this fixture by their own assignment id: `a1` is "What we owe old
  // friends" (`p1`), `a2` is "Dra. Mariza Câmara on the long wait" (`p4`,
  // which has no seeded thread of its own, so its alias is simply empty,
  // the same "no messages yet" state any other unseeded piece gets).
  a1: P1_THREAD,
  a2: [],
};
