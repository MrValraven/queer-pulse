import { describe, expect, it } from "vitest";
import type { Piece, Stage } from "../data/desk.data";
import { isFreshInStage, stageAge } from "./deskStageAge";

const TODAY = new Date(2026, 7, 10, 12, 0, 0);
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(days: number): string {
  return new Date(TODAY.getTime() - days * DAY_IN_MS).toISOString();
}

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

describe("stageAge", () => {
  it("returns null with no stage-entry timestamp", () => {
    expect(stageAge(makePiece(), TODAY)).toBeNull();
  });

  it("returns null once a piece is Published, even with a timestamp", () => {
    expect(
      stageAge(
        makePiece({ stage: "Published", stageEnteredAt: isoDaysAgo(30) }),
        TODAY,
      ),
    ).toBeNull();
  });

  it("counts whole days since the stage started", () => {
    expect(
      stageAge(makePiece({ stageEnteredAt: isoDaysAgo(2) }), TODAY)?.days,
    ).toBe(2);
    expect(
      stageAge(makePiece({ stageEnteredAt: isoDaysAgo(0) }), TODAY)?.days,
    ).toBe(0);
  });

  it("flags stalled starting exactly at Edit's own threshold", () => {
    expect(
      stageAge(
        makePiece({ stage: "Edit", stageEnteredAt: isoDaysAgo(4) }),
        TODAY,
      )?.isStalled,
    ).toBe(false);
    expect(
      stageAge(
        makePiece({ stage: "Edit", stageEnteredAt: isoDaysAgo(5) }),
        TODAY,
      )?.isStalled,
    ).toBe(true);
  });

  it("uses each stage's own threshold", () => {
    const thresholdByStage: Array<[Stage, number]> = [
      ["Commissioned", 7],
      ["Drafting", 14],
      ["In review", 5],
      ["Edit", 5],
      ["Sensitivity read", 7],
      ["Layout", 3],
      ["Ready", 7],
    ];
    for (const [stage, threshold] of thresholdByStage) {
      expect(
        stageAge(
          makePiece({ stage, stageEnteredAt: isoDaysAgo(threshold - 1) }),
          TODAY,
        )?.isStalled,
      ).toBe(false);
      expect(
        stageAge(
          makePiece({ stage, stageEnteredAt: isoDaysAgo(threshold) }),
          TODAY,
        )?.isStalled,
      ).toBe(true);
    }
  });
});

describe("isFreshInStage", () => {
  it("is true only for a piece's first day in its stage", () => {
    const hoursAgo = (hours: number) =>
      new Date(TODAY.getTime() - hours * 60 * 60 * 1000).toISOString();
    const ageAfter = (hours: number) =>
      stageAge(makePiece({ stageEnteredAt: hoursAgo(hours) }), TODAY)!;

    expect(isFreshInStage(ageAfter(1))).toBe(true);
    expect(isFreshInStage(ageAfter(23))).toBe(true);
    expect(isFreshInStage(ageAfter(25))).toBe(false);
  });
});
