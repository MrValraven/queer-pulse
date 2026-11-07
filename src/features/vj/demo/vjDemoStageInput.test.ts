import { describe, expect, it } from "vitest";
import { VJ_LIMITS } from "../../../shared/contracts/vj";
import { readVjCountdownLabel } from "./vjDemoStageInput";

describe("readVjCountdownLabel", () => {
  it("refuses a control character at either end before trimming", () => {
    for (const label of ["\nDoors", "Doors\n", "\tDoors", " Doors"]) {
      expect(readVjCountdownLabel(label)).toEqual({
        error: "vj_countdown_label_invalid",
      });
    }
  });

  it("refuses a control character inside the label and a label that is no string", () => {
    expect(readVjCountdownLabel("Doors\nopen")).toEqual({
      error: "vj_countdown_label_invalid",
    });
    expect(readVjCountdownLabel(null)).toEqual({
      error: "vj_countdown_label_invalid",
    });
  });

  it("trims spaces and checks the trimmed length", () => {
    expect(readVjCountdownLabel("  Doors open  ")).toBe("Doors open");
    expect(
      readVjCountdownLabel(` ${"x".repeat(VJ_LIMITS.countdownLabelMax)} `),
    ).toBe("x".repeat(VJ_LIMITS.countdownLabelMax));
    expect(
      readVjCountdownLabel("x".repeat(VJ_LIMITS.countdownLabelMax + 1)),
    ).toEqual({ error: "vj_countdown_label_too_long" });
  });
});
