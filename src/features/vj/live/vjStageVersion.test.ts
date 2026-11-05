import { describe, expect, it } from "vitest";
import { shouldApplyVjStageState, vjVersionOf } from "./vjStageVersion";

describe("vjStageVersion", () => {
  it("applies the first frame", () => {
    expect(
      shouldApplyVjStageState(null, { stageEpoch: "epoch-a", revision: 0 }),
    ).toBe(true);
  });

  it("drops a frame at or below the applied revision", () => {
    const applied = { stageEpoch: "epoch-a", revision: 5 };
    expect(
      shouldApplyVjStageState(applied, { stageEpoch: "epoch-a", revision: 5 }),
    ).toBe(false);
    expect(
      shouldApplyVjStageState(applied, { stageEpoch: "epoch-a", revision: 2 }),
    ).toBe(false);
  });

  it("applies a higher revision", () => {
    const applied = { stageEpoch: "epoch-a", revision: 5 };
    expect(
      shouldApplyVjStageState(applied, { stageEpoch: "epoch-a", revision: 6 }),
    ).toBe(true);
  });

  it("adopts a new stage epoch even at a lower revision", () => {
    const applied = { stageEpoch: "epoch-a", revision: 40 };
    expect(
      shouldApplyVjStageState(applied, { stageEpoch: "epoch-b", revision: 0 }),
    ).toBe(true);
  });

  it("keeps only the epoch and revision of a state", () => {
    expect(vjVersionOf({ stageEpoch: "epoch-c", revision: 9 })).toEqual({
      stageEpoch: "epoch-c",
      revision: 9,
    });
  });
});
