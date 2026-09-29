import { describe, expect, it } from "vitest";
import type { Editor, Piece } from "../data/desk.data";
import { matchesAllFocus } from "./deskFocus";
import {
  describeWaitingOn,
  isWaitingOnViewer,
  pieceHolder,
  waitingOnLabel,
} from "./deskWaitingOn";
import { pieceNextAction } from "./pieceNextAction";

const editors: Editor[] = [
  { id: "marta", name: "Marta Cruz", initials: "MC", tint: "coral", cap: 7 },
  { id: "sara", name: "Sara Pinheiro", initials: "SP", tint: "jade", cap: 7 },
];

function makePiece(overrides: Partial<Piece> = {}): Piece {
  return {
    id: "piece-1",
    title: "A piece",
    format: "article",
    section: "Essays",
    kind: "Essay",
    byline: "Someone",
    editorId: "marta",
    stage: "Edit",
    due: "",
    art: "in",
    issueId: null,
    ...overrides,
  };
}

describe("describeWaitingOn", () => {
  it("says You in the plum tone only for the viewer's own piece", () => {
    expect(
      describeWaitingOn(makePiece({ wait: "you" }), "marta", editors),
    ).toEqual({
      tone: "you",
      labelKey: "magazine:desk.pieceRow.you",
      name: null,
    });
  });

  it("names the other editor in the neutral tone", () => {
    expect(
      describeWaitingOn(
        makePiece({ wait: "you", editorId: "sara" }),
        "marta",
        editors,
      ),
    ).toEqual({ tone: "neutral", labelKey: null, name: "Sara" });
  });

  it("reads Editor when the directory has no name for them", () => {
    expect(
      describeWaitingOn(
        makePiece({ wait: "you", editorId: "unknown" }),
        "marta",
        editors,
      ),
    ).toEqual({
      tone: "neutral",
      labelKey: "magazine:desk.pieceRow.editor",
      name: null,
    });
  });

  it("reads Editor while the viewer is still unknown", () => {
    expect(
      describeWaitingOn(makePiece({ wait: "you" }), "", editors).labelKey,
    ).toBe("magazine:desk.pieceRow.editor");
  });

  it("puts a Sensitivity read piece with its reader, in the writer tone", () => {
    expect(
      describeWaitingOn(
        makePiece({ stage: "Sensitivity read", wait: "you" }),
        "marta",
        editors,
      ),
    ).toEqual({
      tone: "writer",
      labelKey: "magazine:desk.pieceRow.reader",
      name: null,
    });
  });

  it("keeps the writer and nobody as the data says", () => {
    expect(
      describeWaitingOn(makePiece({ wait: "writer" }), "marta", editors).tone,
    ).toBe("writer");
    expect(describeWaitingOn(makePiece(), "marta", editors).labelKey).toBe(
      "magazine:desk.pieceRow.nobody",
    );
  });
});

describe("waitingOnLabel", () => {
  it("prefers the name, and translates a key otherwise", () => {
    const translate = (key: string) => `t(${key})`;
    expect(
      waitingOnLabel(
        { tone: "neutral", labelKey: null, name: "Sara" },
        translate,
      ),
    ).toBe("Sara");
    expect(
      waitingOnLabel(
        { tone: "you", labelKey: "magazine:desk.pieceRow.you", name: null },
        translate,
      ),
    ).toBe("t(magazine:desk.pieceRow.you)");
  });
});

describe("the waiting party and the next action agree", () => {
  const stages = [
    "Commissioned",
    "Drafting",
    "In review",
    "Edit",
    "Sensitivity read",
    "Layout",
  ] as const;
  const waits = ["writer", "you", "nobody", undefined] as const;

  it.each(stages)("at %s, Chase goes with the writer only", (stage) => {
    for (const wait of waits) {
      const piece = makePiece({ stage, wait });
      const kind = pieceNextAction(piece, "issue")?.kind;
      const holder = pieceHolder(piece);
      expect(kind === "chase").toBe(holder === "writer");
      expect(kind === "chase-reader").toBe(holder === "reader");
    }
  });
});

describe("isWaitingOnViewer", () => {
  it("is the viewer's own piece back with them", () => {
    expect(isWaitingOnViewer(makePiece({ wait: "you" }), "marta")).toBe(true);
    expect(
      isWaitingOnViewer(makePiece({ wait: "you", editorId: "sara" }), "marta"),
    ).toBe(false);
    expect(isWaitingOnViewer(makePiece({ wait: "you" }), "")).toBe(false);
  });

  it("leaves out a piece out with the sensitivity reader", () => {
    expect(
      isWaitingOnViewer(
        makePiece({ stage: "Sensitivity read", wait: "you" }),
        "marta",
      ),
    ).toBe(false);
  });

  it("agrees with the You label and the your-turn chip at every stage", () => {
    const stages = [
      "Commissioned",
      "Drafting",
      "In review",
      "Edit",
      "Sensitivity read",
      "Layout",
      "Ready",
      "Published",
    ] as const;
    for (const stage of stages) {
      for (const wait of ["writer", "you", "nobody", undefined] as const) {
        const piece = makePiece({ stage, wait });
        const isViewersTurn = isWaitingOnViewer(piece, "marta");
        expect(describeWaitingOn(piece, "marta", editors).tone === "you").toBe(
          isViewersTurn,
        );
        expect(matchesAllFocus(piece, "marta", ["your-turn"])).toBe(
          isViewersTurn,
        );
      }
    }
  });
});
