import { describe, expect, it } from "vitest";
import {
  RING_BASE_RADII,
  RING_MIN_GAP,
  RING_NODE_SPACING,
  SECOND_HOP_OFFSET,
  computeRingTargets,
  type RingSlot,
} from "./vouchRingLayout";

const FOCUS_ID = "focus";

function radiusOf(point: { x: number; y: number }): number {
  return Math.hypot(point.x, point.y);
}

function buildTargets(
  slotById: Record<string, RingSlot>,
  parentById: Record<string, string> = {},
) {
  return computeRingTargets({
    focusId: FOCUS_ID,
    nodeIds: [FOCUS_ID, ...Object.keys(slotById)],
    slotFor: (id) => slotById[id]!,
    parentFor: (id) => parentById[id] ?? null,
    nameFor: (id) => id,
  });
}

function mutualSlots(count: number): Record<string, RingSlot> {
  const slots: Record<string, RingSlot> = {};
  for (let memberIndex = 0; memberIndex < count; memberIndex++) {
    slots[`member-${String(memberIndex).padStart(2, "0")}`] = "mutual";
  }
  return slots;
}

describe("computeRingTargets", () => {
  it("places the focus at the origin", () => {
    const targets = buildTargets({ ana: "mutual" });
    expect(targets.get(FOCUS_ID)).toEqual({ x: 0, y: 0 });
  });

  it("puts every mutual on the base inner radius when there are 14 or fewer", () => {
    const targets = buildTargets(mutualSlots(14));
    for (const [id, point] of targets) {
      if (id === FOCUS_ID) continue;
      expect(radiusOf(point)).toBeCloseTo(RING_BASE_RADII.inner, 6);
    }
  });

  it("grows the inner radius to fit 30 mutuals", () => {
    const targets = buildTargets(mutualSlots(30));
    const expectedRadius = (30 * RING_NODE_SPACING) / (2 * Math.PI);
    expect(expectedRadius).toBeGreaterThan(RING_BASE_RADII.inner);
    for (const [id, point] of targets) {
      if (id === FOCUS_ID) continue;
      expect(radiusOf(point)).toBeCloseTo(expectedRadius, 6);
    }
  });

  it("keeps the next ring at least one gap outside a grown ring", () => {
    const slots = { ...mutualSlots(30), voucher: "vouchedBy" as const };
    const targets = buildTargets(slots);
    const innerRadius = (30 * RING_NODE_SPACING) / (2 * Math.PI);
    expect(radiusOf(targets.get("voucher")!)).toBeCloseTo(
      innerRadius + RING_MIN_GAP,
      6,
    );
  });

  it("sorts members alphabetically, starting at the top", () => {
    const targets = buildTargets({
      Zoe: "mutual",
      ana: "mutual",
      Bea: "mutual",
      carla: "mutual",
    });
    const angleOf = (id: string) => {
      const point = targets.get(id)!;
      const angle = Math.atan2(point.y, point.x);
      // measure clockwise on screen from the top (-π/2)
      return (angle + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    };
    expect(angleOf("ana")).toBeCloseTo(0, 6);
    const orderedIds = ["ana", "Bea", "carla", "Zoe"];
    for (let orderIndex = 1; orderIndex < orderedIds.length; orderIndex++) {
      expect(angleOf(orderedIds[orderIndex]!)).toBeGreaterThan(
        angleOf(orderedIds[orderIndex - 1]!),
      );
    }
  });

  it("places invites and bubbles on the outer ring and withdrawn-only on ring four", () => {
    const targets = buildTargets({
      invitee: "invited",
      vouchee: "vouchedFor",
      "bubble:focus": "bubble",
      lapsed: "withdrawnOnly",
    });
    expect(radiusOf(targets.get("invitee")!)).toBeCloseTo(
      RING_BASE_RADII.outer,
      6,
    );
    expect(radiusOf(targets.get("bubble:focus")!)).toBeCloseTo(
      RING_BASE_RADII.outer,
      6,
    );
    // ring four sits one gap outside the outer ring (330 + 90 beats its 410 base)
    expect(radiusOf(targets.get("lapsed")!)).toBeCloseTo(
      Math.max(RING_BASE_RADII.withdrawn, RING_BASE_RADII.outer + RING_MIN_GAP),
      6,
    );
  });

  it("fans second-hop members out from their parent's angle", () => {
    const targets = buildTargets(
      { ana: "mutual", far1: "secondHop", far2: "secondHop" },
      { far1: "ana", far2: "ana" },
    );
    const secondHopRadius = RING_BASE_RADII.inner + SECOND_HOP_OFFSET;
    expect(radiusOf(targets.get("far1")!)).toBeCloseTo(secondHopRadius, 6);
    const parentAngle = Math.atan2(
      targets.get("ana")!.y,
      targets.get("ana")!.x,
    );
    const firstAngle = Math.atan2(
      targets.get("far1")!.y,
      targets.get("far1")!.x,
    );
    const secondAngle = Math.atan2(
      targets.get("far2")!.y,
      targets.get("far2")!.x,
    );
    expect((firstAngle + secondAngle) / 2).toBeCloseTo(parentAngle, 6);
    expect(secondAngle - firstAngle).toBeCloseTo(0.12, 6);
  });
});
