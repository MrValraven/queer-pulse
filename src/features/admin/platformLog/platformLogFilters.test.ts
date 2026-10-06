import { describe, expect, it } from "vitest";
import {
  readPlatformLogFilters,
  writePlatformLogFilters,
} from "./platformLogFilters";

const MEMBER_ID = "5b0c3a52-1d7e-4f43-9a35-2f6d0b7e1a01";

describe("platform log filters", () => {
  it("reads defaults from an empty query", () => {
    expect(readPlatformLogFilters(new URLSearchParams(), true)).toEqual({
      categories: [],
      range: "all",
      memberId: null,
    });
  });

  it("keeps valid values and drops unknown ones", () => {
    const search = new URLSearchParams(
      `category=staff,bogus,staff,moderation&range=century&member=${MEMBER_ID}`,
    );
    expect(readPlatformLogFilters(search, true)).toEqual({
      categories: ["staff", "moderation"],
      range: "all",
      memberId: MEMBER_ID,
    });
  });

  it("ignores a member value that is not a uuid", () => {
    const search = new URLSearchParams("member=../../etc");
    expect(readPlatformLogFilters(search, true).memberId).toBeNull();
  });

  it("drops the members category for a moderator", () => {
    const search = new URLSearchParams("category=members,staff");
    expect(readPlatformLogFilters(search, false).categories).toEqual(["staff"]);
  });

  it("writes only non-default values", () => {
    expect(
      writePlatformLogFilters({
        categories: [],
        range: "all",
        memberId: null,
      }).toString(),
    ).toBe("");
    expect(
      writePlatformLogFilters({
        categories: ["moderation", "reviews"],
        range: "week",
        memberId: MEMBER_ID,
      }).toString(),
    ).toBe(`category=moderation%2Creviews&range=week&member=${MEMBER_ID}`);
  });
});
