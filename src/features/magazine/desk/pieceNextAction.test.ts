import { describe, expect, it } from "vitest";
import type { Piece } from "../data/desk.data";
import {
  pieceNextAction,
  pieceNextActionShortLabelKey,
} from "./pieceNextAction";

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

describe("pieceNextAction", () => {
  it.each([
    ["Commissioned", "chase"],
    ["Drafting", "chase"],
    ["In review", "chase"],
  ] as const)("a %s piece its writer holds leads with %s", (stage, kind) => {
    expect(
      pieceNextAction(makePiece({ stage, wait: "writer" }), "unassigned")?.kind,
    ).toBe(kind);
  });

  it.each([
    ["Commissioned", "edit"],
    ["Drafting", "edit"],
    ["In review", "edit"],
    ["Edit", "edit"],
    ["Sensitivity read", "chase-reader"],
    ["Layout", "lay-out"],
  ] as const)(
    "a %s piece back with its editor leads with %s",
    (stage, kind) => {
      expect(
        pieceNextAction(makePiece({ stage, wait: "you" }), "unassigned")?.kind,
      ).toBe(kind);
    },
  );

  it("hands off a commission with no writer at all", () => {
    for (const stage of ["Commissioned", "Drafting"] as const) {
      for (const wait of ["you", "nobody", undefined] as const) {
        expect(
          pieceNextAction(makePiece({ stage, wait, byline: "  " }), "issue")
            ?.kind,
        ).toBe("hand-off");
      }
    }
  });

  it("edits a commission whose byline names a writer nobody is chasing", () => {
    for (const stage of ["Commissioned", "Drafting"] as const) {
      expect(
        pieceNextAction(makePiece({ stage, byline: "Marta Cruz" }), "issue")
          ?.kind,
      ).toBe("edit");
    }
  });

  it("carries the Hand off label key", () => {
    expect(
      pieceNextAction(
        makePiece({ stage: "Drafting", wait: "you", byline: "" }),
        "issue",
      ),
    ).toEqual({
      kind: "hand-off",
      labelKey: "magazine:desk.nextAction.handOff",
    });
  });

  it("chases the reader at Sensitivity read unless the writer holds it", () => {
    expect(
      pieceNextAction(makePiece({ stage: "Sensitivity read" }), "issue")?.kind,
    ).toBe("chase-reader");
    expect(
      pieceNextAction(
        makePiece({ stage: "Sensitivity read", wait: "writer" }),
        "issue",
      )?.kind,
    ).toBe("chase");
  });

  it("a Ready piece is added to an issue when unfiled, published when filed", () => {
    expect(
      pieceNextAction(makePiece({ stage: "Ready" }), "unassigned")?.kind,
    ).toBe("add-to-issue");
    expect(
      pieceNextAction(
        makePiece({ stage: "Ready", issueId: "issue-14" }),
        "issue",
      )?.kind,
    ).toBe("publish");
  });

  it("under everything, the piece's own issue decides the Ready action", () => {
    expect(
      pieceNextAction(
        makePiece({ stage: "Ready", issueId: "issue-13" }),
        "everything",
      )?.kind,
    ).toBe("publish");
  });

  it("a scheduled Ready piece has no next action, on an issue or off one", () => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    expect(
      pieceNextAction(
        makePiece({
          stage: "Ready",
          issueId: "issue-14",
          publishedAt: tomorrow,
        }),
        "issue",
      ),
    ).toBeNull();
    expect(
      pieceNextAction(
        makePiece({ stage: "Ready", publishedAt: tomorrow }),
        "unassigned",
      ),
    ).toBeNull();
  });

  it("still offers Publish on a Ready piece whose date has already passed", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(
      pieceNextAction(
        makePiece({
          stage: "Ready",
          issueId: "issue-14",
          publishedAt: yesterday,
        }),
        "issue",
      )?.kind,
    ).toBe("publish");
  });

  it("still offers Publish on a live standalone Ready piece with no issue", () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    expect(
      pieceNextAction(
        makePiece({ stage: "Ready", issueId: null, publishedAt: yesterday }),
        "unassigned",
      )?.kind,
    ).toBe("publish");
  });

  it("a published piece has no next action", () => {
    expect(
      pieceNextAction(makePiece({ stage: "Published" }), "issue"),
    ).toBeNull();
  });

  it("prefers chase while the writer holds a pre-Ready piece", () => {
    expect(
      pieceNextAction(makePiece({ stage: "Edit", wait: "writer" }), "issue")
        ?.kind,
    ).toBe("chase");
    expect(
      pieceNextAction(makePiece({ stage: "Layout", wait: "writer" }), "issue")
        ?.kind,
    ).toBe("chase");
    expect(
      pieceNextAction(makePiece({ stage: "Ready", wait: "writer" }), "issue")
        ?.kind,
    ).toBe("add-to-issue");
  });

  it("carries a nextAction label key", () => {
    expect(
      pieceNextAction(makePiece({ stage: "Sensitivity read" }), "issue"),
    ).toEqual({
      kind: "chase-reader",
      labelKey: "magazine:desk.nextAction.chaseReader",
    });
  });

  it("gives the reader chase a short row label and keeps the rest", () => {
    const chaseReader = pieceNextAction(
      makePiece({ stage: "Sensitivity read" }),
      "issue",
    )!;
    const edit = pieceNextAction(makePiece({ stage: "Edit" }), "issue")!;

    expect(pieceNextActionShortLabelKey(chaseReader)).toBe(
      "magazine:desk.nextAction.chaseReaderShort",
    );
    expect(pieceNextActionShortLabelKey(edit)).toBe(edit.labelKey);
  });
});
