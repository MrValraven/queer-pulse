import { describe, expect, it } from "vitest";
import { DEMO_PIECES, type Piece, type Section } from "../data/desk.data";
import { issueSectionSlots, issueSlotTotals } from "./issueSlots";

function firstDemoPiece(): Piece {
  const [demoPiece] = DEMO_PIECES;
  if (!demoPiece) throw new Error("the demo desk needs at least one piece");
  return demoPiece;
}

const BASE_PIECE = firstDemoPiece();

function pieceIn(section: string, id: string): Piece {
  return { ...BASE_PIECE, id, section };
}

const SECTIONS: Section[] = [
  { name: "Features", target: 2, note: "" },
  { name: "Essays", target: 3, note: "" },
  { name: "Service", target: 1, note: "" },
];

describe("issueSectionSlots", () => {
  it("counts pieces per section against its target, in section order", () => {
    const pieces = [
      pieceIn("Features", "a"),
      pieceIn("Service", "b"),
      pieceIn("Service", "c"),
    ];
    expect(issueSectionSlots(pieces, SECTIONS)).toEqual([
      { name: "Features", filled: 1, target: 2, open: 1 },
      { name: "Essays", filled: 0, target: 3, open: 3 },
      { name: "Service", filled: 2, target: 1, open: 0 },
    ]);
  });
});

describe("issueSlotTotals", () => {
  it("adds up to the same open count the issue plan shows", () => {
    const pieces = [pieceIn("Features", "a"), pieceIn("Essays", "b")];
    expect(issueSlotTotals(pieces, SECTIONS)).toEqual({
      filled: 2,
      slots: 6,
      open: 4,
    });
  });

  it("lets an overfilled section fill only its own slots", () => {
    const pieces = [
      pieceIn("Service", "a"),
      pieceIn("Service", "b"),
      pieceIn("Service", "c"),
    ];
    const totals = issueSlotTotals(pieces, SECTIONS);
    expect(totals).toEqual({ filled: 1, slots: 6, open: 5 });
    expect(totals.filled + totals.open).toBe(totals.slots);
  });

  it("ignores pieces filed under a section the magazine does not have", () => {
    expect(issueSlotTotals([pieceIn("Gone", "a")], SECTIONS)).toEqual({
      filled: 0,
      slots: 6,
      open: 6,
    });
  });

  it("reads zero slots when there are no sections", () => {
    expect(issueSlotTotals([pieceIn("Features", "a")], [])).toEqual({
      filled: 0,
      slots: 0,
      open: 0,
    });
  });
});
