import { describe, expect, it } from "vitest";
import { isTierSelectable, TIER_ORDER } from "./spaceTierOptions";

describe("isTierSelectable", () => {
  it("refuses a tier more open than the parent", () => {
    expect(isTierSelectable("public", "request")).toBe(false);
  });

  it("allows a tier stricter than the parent", () => {
    expect(isTierSelectable("invite", "request")).toBe(true);
  });

  it("allows the same tier as the parent", () => {
    expect(isTierSelectable("request", "request")).toBe(true);
  });

  it("orders every tier from loosest to strictest", () => {
    expect(TIER_ORDER).toEqual(["public", "request", "invite", "private"]);
  });
});
