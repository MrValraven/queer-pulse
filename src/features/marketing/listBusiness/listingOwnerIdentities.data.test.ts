import { describe, expect, it } from "vitest";
import { normalizeOwnerIdentities } from "./listingOwnerIdentities.data";

describe("normalizeOwnerIdentities", () => {
  it("keeps known tags in canonical order, once each", () => {
    expect(normalizeOwnerIdentities(["bipoc", "women", "bipoc"])).toEqual([
      "women",
      "bipoc",
    ]);
  });

  it("drops unknown entries and non-strings", () => {
    expect(normalizeOwnerIdentities(["queer", 3, "trans"])).toEqual(["trans"]);
  });

  it("reads a missing value as no tags", () => {
    expect(normalizeOwnerIdentities(undefined)).toEqual([]);
  });
});
