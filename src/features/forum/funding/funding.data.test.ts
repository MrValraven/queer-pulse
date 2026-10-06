import { describe, expect, it } from "vitest";
import {
  FUNDING_OPEN_CALLS_HREF,
  parseEligibility,
  parseFundingListView,
  parseScope,
} from "./funding.data";

describe("funding.data parsers", () => {
  it("falls back to All for an unknown view", () => {
    expect(parseFundingListView("bogus")).toBe("all");
    expect(parseFundingListView(null)).toBe("all");
    expect(parseFundingListView("closing")).toBe("closing");
  });

  it("keeps known eligibility values once, in vocabulary order", () => {
    expect(
      parseEligibility(["students", "aliens", "students", "individuals"]),
    ).toEqual(["individuals", "students"]);
  });

  it("drops an unknown scope", () => {
    expect(parseScope("mars")).toBeNull();
    expect(parseScope("eu")).toBe("eu");
  });

  it("points the old grants board at Open calls", () => {
    expect(FUNDING_OPEN_CALLS_HREF).toBe(
      "/forum?category=funding&fundingView=open",
    );
  });
});
