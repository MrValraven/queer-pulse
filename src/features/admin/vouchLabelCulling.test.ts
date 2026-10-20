import { describe, expect, it } from "vitest";
import {
  LABEL_TOP_COUNT,
  selectVisibleLabels,
  type LabelSelectionInput,
} from "./vouchLabelCulling";

const STAGE = { width: 800, height: 600 };

function buildInput(
  positions: Record<string, { x: number; y: number }>,
  overrides: Partial<LabelSelectionInput> = {},
): LabelSelectionInput {
  return {
    nodeIds: Object.keys(positions),
    pinnedIds: [],
    weightFor: () => 1,
    nameFor: (id) => id,
    screenPositionFor: (id) => positions[id] ?? null,
    radiusFor: () => 10,
    zoom: 1,
    stageSize: STAGE,
    isCompactViewport: false,
    ...overrides,
  };
}

describe("selectVisibleLabels", () => {
  it("drops the lower-priority of two overlapping labels", () => {
    const input = buildInput(
      { heavy: { x: 200, y: 200 }, light: { x: 210, y: 202 } },
      { weightFor: (id) => (id === "heavy" ? 5 : 1) },
    );
    expect([...selectVisibleLabels(input)]).toEqual(["heavy"]);
  });

  it("keeps both labels when the boxes are apart", () => {
    const input = buildInput({
      first: { x: 100, y: 100 },
      second: { x: 400, y: 400 },
    });
    expect(selectVisibleLabels(input)).toEqual(new Set(["first", "second"]));
  });

  it("keeps focus and selected even when they overlap", () => {
    const input = buildInput(
      {
        focus: { x: 300, y: 300 },
        selected: { x: 302, y: 301 },
        heavy: { x: 304, y: 300 },
      },
      {
        pinnedIds: ["focus", "selected"],
        weightFor: (id) => (id === "heavy" ? 99 : 0),
      },
    );
    expect(selectVisibleLabels(input)).toEqual(new Set(["focus", "selected"]));
  });

  it("keeps focus and selected off stage", () => {
    const input = buildInput(
      { focus: { x: -500, y: -500 }, selected: { x: 2000, y: 2000 } },
      { pinnedIds: ["focus", "selected"] },
    );
    expect(selectVisibleLabels(input)).toEqual(new Set(["focus", "selected"]));
  });

  it("drops other candidates that fall off stage", () => {
    const input = buildInput({ outside: { x: -200, y: 100 } });
    expect(selectVisibleLabels(input).size).toBe(0);
  });

  it("labels only the top weighted members below the zoom threshold", () => {
    const positions: Record<string, { x: number; y: number }> = {};
    for (let memberIndex = 0; memberIndex < 30; memberIndex++) {
      positions[`m${memberIndex}`] = {
        x: 40 + (memberIndex % 6) * 130,
        y: 40 + Math.floor(memberIndex / 6) * 110,
      };
    }
    const input = buildInput(positions, {
      weightFor: (id) => Number(id.slice(1)),
    });
    const visibleIds = selectVisibleLabels(input);
    expect(visibleIds.size).toBe(LABEL_TOP_COUNT);
    expect(visibleIds.has("m29")).toBe(true);
    expect(visibleIds.has("m0")).toBe(false);
    const zoomedIn = selectVisibleLabels({ ...input, zoom: 1.2 });
    expect(zoomedIn.size).toBeGreaterThan(LABEL_TOP_COUNT);
  });

  it("shows only pinned labels on a compact viewport until zoom 1.6", () => {
    const input = buildInput(
      { focus: { x: 100, y: 100 }, other: { x: 400, y: 400 } },
      { pinnedIds: ["focus"], isCompactViewport: true, zoom: 1.5 },
    );
    expect(selectVisibleLabels(input)).toEqual(new Set(["focus"]));
    expect(selectVisibleLabels({ ...input, zoom: 1.6 })).toEqual(
      new Set(["focus", "other"]),
    );
  });
});
