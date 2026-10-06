import { describe, expect, it } from "vitest";
import { toOwnerIdentities } from "./useDirectoryFilters";

describe("toOwnerIdentities", () => {
  it("reads a stale or hand-edited URL without erroring", () => {
    expect(toOwnerIdentities("bogus,women,women")).toEqual(["women"]);
  });
  it("returns canonical order", () => {
    expect(toOwnerIdentities("bipoc,trans")).toEqual(["trans", "bipoc"]);
  });
  it("reads an absent param as none", () => {
    expect(toOwnerIdentities(null)).toEqual([]);
  });
});
