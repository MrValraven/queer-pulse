import { describe, expect, it } from "vitest";
import { ANCHOR } from "../listBusiness.data";
import {
  LISTING_EDIT_PUBLIC_MISSING_CODES,
  listingEditMissingCodes,
} from "./listingEditMissingCodes";

describe("listing edit missing codes", () => {
  it("turns public anchors into their ANCHOR keys in page order", () => {
    expect(
      listingEditMissingCodes([
        { labelKey: "x", anchor: ANCHOR.name },
        { labelKey: "y", anchor: ANCHOR.hours },
      ]),
    ).toEqual(["name", "hours"]);
  });

  it("drops every personal or consent field and repeats", () => {
    expect(
      listingEditMissingCodes([
        { labelKey: "a", anchor: ANCHOR.consent },
        { labelKey: "b", anchor: ANCHOR.rel },
        { labelKey: "c", anchor: ANCHOR.ownerBio },
        { labelKey: "d", anchor: ANCHOR.photos },
        { labelKey: "e", anchor: ANCHOR.photos },
      ]),
    ).toEqual(["photos"]);
  });

  it("drops an anchor that names no ANCHOR key", () => {
    expect(
      listingEditMissingCodes([
        { labelKey: "a", anchor: "lb-something-else" },
        { labelKey: "b", anchor: ANCHOR.cover },
      ]),
    ).toEqual(["cover"]);
  });

  it("keeps every allowed code within the server's code length", () => {
    for (const code of LISTING_EDIT_PUBLIC_MISSING_CODES) {
      expect(code.length).toBeLessThanOrEqual(64);
      expect(Object.keys(ANCHOR)).toContain(code);
    }
  });
});
