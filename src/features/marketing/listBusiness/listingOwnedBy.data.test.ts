import { describe, expect, it } from "vitest";
import {
  LISTING_OWNED_BY,
  normalizeOwnedBy,
  OWNED_BY_TAG_KEYS,
  toggleOwnedBy,
} from "./listingOwnedBy.data";

describe("owned-by tags", () => {
  it("offers migrant, last, with its own tag", () => {
    expect(LISTING_OWNED_BY).toEqual([
      "women",
      "trans",
      "nonbinary",
      "bipoc",
      "migrant",
    ]);
    expect(OWNED_BY_TAG_KEYS.migrant).toBe(
      "marketing:directory.ownedBy.migrant",
    );
  });

  it("keeps migrant through the normaliser and the toggle, in canonical order", () => {
    expect(normalizeOwnedBy(["migrant", "women", "bogus"])).toEqual([
      "women",
      "migrant",
    ]);
    expect(toggleOwnedBy(["trans"], "migrant")).toEqual(["trans", "migrant"]);
  });
});
