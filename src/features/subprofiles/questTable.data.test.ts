import { describe, expect, it } from "vitest";
import {
  knownOptions,
  toCardTableSummary,
  TABLE_VIBES,
} from "./questTable.data";

describe("toCardTableSummary", () => {
  it("keeps known values in canonical order", () => {
    expect(
      toCardTableSummary("game_master", {
        format: "both",
        vibe: ["beginner_friendly", "queer_led", "queer_led", "cool"],
      }),
    ).toEqual({ format: "both", vibe: ["queer_led", "beginner_friendly"] });
  });

  it("drops junk and empty blocks", () => {
    expect(
      toCardTableSummary("game_master", { format: "zoom", vibe: "queer_led" }),
    ).toBeUndefined();
    expect(toCardTableSummary("game_master", undefined)).toBeUndefined();
    expect(
      toCardTableSummary("cosplayer", { where: "Lisboa" }),
    ).toBeUndefined();
  });

  it("is undefined outside the quest family", () => {
    expect(toCardTableSummary("poet", { format: "online" })).toBeUndefined();
  });
});

describe("knownOptions", () => {
  it("filters to allowed values in allowed order", () => {
    expect(knownOptions(["adults_only", 3, "queer_led"], TABLE_VIBES)).toEqual([
      "queer_led",
      "adults_only",
    ]);
    expect(knownOptions("queer_led", TABLE_VIBES)).toEqual([]);
  });
});
