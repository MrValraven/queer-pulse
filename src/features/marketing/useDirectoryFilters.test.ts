import { describe, expect, it } from "vitest";
import { toOwned } from "./useDirectoryFilters";

describe("toOwned", () => {
  it("reads a stale or hand-edited URL without erroring", () => {
    expect(toOwned("bogus,women,women")).toEqual(["women"]);
  });
  it("returns canonical order", () => {
    expect(toOwned("bipoc,trans")).toEqual(["trans", "bipoc"]);
  });
  it("reads an absent param as none", () => {
    expect(toOwned(null)).toEqual([]);
  });
});
