/**
 * Demo-mode fixture for the editor↔writer per-piece message thread (Phase 7
 * Wave F). The SAME three-message thread is shown on both surfaces — the
 * editor desk's Chase modal and the writer workspace's "Message editor"
 * thread / "From your editor" summary — so each row is tagged with
 * `authorRole` rather than a hardcoded `fromMe`: `usePieceMessages` derives
 * `fromMe` by comparing `authorRole` to whichever `side` ("editor" or
 * "writer") is asking, exactly like the live server computes
 * `fromMe: message.authorId === requestingUserId` per requester. Loosely
 * follows on from the "Marta left 2 notes" note already on the demo
 * assignment `a1` / piece `p1` ("What we owe old friends").
 */

export interface DemoPieceMessageSeed {
  id: string;
  authorRole: "editor" | "writer";
  authorName: string;
  body: string;
  /** ISO timestamp — the list must stay createdAt ASC (oldest first, chat order). */
  createdAt: string;
}

export const DEMO_PIECE_MESSAGES: DemoPieceMessageSeed[] = [
  {
    id: "pm1",
    authorRole: "editor",
    authorName: "Marta Cruz",
    body: 'Hey Sara, I left two notes on the edit for "What we owe old friends". No rush, but I’d love your take before Friday.',
    createdAt: "2026-08-08T09:15:00.000Z",
  },
  {
    id: "pm2",
    authorRole: "writer",
    authorName: "Sara Pinheiro",
    body: "On it. Reading through now, I'll reply properly this afternoon.",
    createdAt: "2026-08-08T10:02:00.000Z",
  },
  {
    id: "pm3",
    authorRole: "editor",
    authorName: "Marta Cruz",
    body: "No stress at all, thank you.",
    createdAt: "2026-08-08T10:05:00.000Z",
  },
];
