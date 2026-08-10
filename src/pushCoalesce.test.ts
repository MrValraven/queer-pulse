import { describe, expect, it } from "vitest";
import { decideCoalesce } from "./pushCoalesce";

describe("decideCoalesce", () => {
  it("returns count 1 and coalesced=false when there is no existing notification", () => {
    expect(decideCoalesce([])).toEqual({ count: 1, coalesced: false });
  });

  it("increments from an existing notification's stored count", () => {
    expect(decideCoalesce([{ data: { count: 2 } }])).toEqual({
      count: 3,
      coalesced: true,
    });
  });

  it("treats an existing notification with no stored count as count 1 (increments to 2)", () => {
    expect(decideCoalesce([{ data: {} }])).toEqual({ count: 2, coalesced: true });
    expect(decideCoalesce([{ data: null }])).toEqual({ count: 2, coalesced: true });
    expect(decideCoalesce([{}])).toEqual({ count: 2, coalesced: true });
  });

  it("ignores a malformed stored count (non-number, negative, non-finite)", () => {
    expect(decideCoalesce([{ data: { count: "3" } }])).toEqual({
      count: 2,
      coalesced: true,
    });
    expect(decideCoalesce([{ data: { count: -1 } }])).toEqual({
      count: 2,
      coalesced: true,
    });
    expect(decideCoalesce([{ data: { count: NaN } }])).toEqual({
      count: 2,
      coalesced: true,
    });
  });

  it("only reads the first existing notification (tag lookup normally returns at most one)", () => {
    expect(
      decideCoalesce([{ data: { count: 5 } }, { data: { count: 99 } }]),
    ).toEqual({ count: 6, coalesced: true });
  });
});
