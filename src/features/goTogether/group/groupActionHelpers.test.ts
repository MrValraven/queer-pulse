import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  groupBlockTiming,
  isGroupNotFoundError,
  memberActionErrorKey,
} from "./groupActionHelpers";

const START_AT = "2026-10-10T16:00:00.000Z";
const START_MS = Date.parse(START_AT);
const HOUR_MS = 60 * 60 * 1000;

describe("groupBlockTiming", () => {
  it("is beforeStart until the gathering starts", () => {
    expect(groupBlockTiming(false, START_AT, START_MS - 1)).toBe("beforeStart");
  });

  it("reads the start time when the group was read just before the start", () => {
    expect(groupBlockTiming(false, START_AT, START_MS)).toBe("afterStart");
    expect(groupBlockTiming(false, START_AT, START_MS + 20 * HOUR_MS)).toBe(
      "late",
    );
  });

  it("is afterStart from the start up to 12 hours after it", () => {
    expect(groupBlockTiming(true, START_AT, START_MS)).toBe("afterStart");
    expect(groupBlockTiming(true, START_AT, START_MS + 12 * HOUR_MS)).toBe(
      "afterStart",
    );
  });

  it("is late more than 12 hours after the start", () => {
    expect(groupBlockTiming(true, START_AT, START_MS + 12 * HOUR_MS + 1)).toBe(
      "late",
    );
  });

  it("stays afterStart when the start time cannot be read", () => {
    expect(groupBlockTiming(true, "not a date", START_MS)).toBe("afterStart");
  });
});

describe("isGroupNotFoundError", () => {
  it("is true only for a 404 from the API", () => {
    expect(isGroupNotFoundError(new ApiError(404, "Not found"))).toBe(true);
    expect(isGroupNotFoundError(new ApiError(500, "Server error"))).toBe(false);
    expect(isGroupNotFoundError(new Error("offline"))).toBe(false);
    expect(isGroupNotFoundError(null)).toBe(false);
  });
});

describe("memberActionErrorKey", () => {
  it("says the member is gone on a 404 and falls back to the group copy", () => {
    expect(memberActionErrorKey(new ApiError(404, "Not found"))).toBe(
      "goTogether:group.member.gone",
    );
    expect(memberActionErrorKey(new Error("offline"))).toBe(
      "goTogether:group.error.generic",
    );
  });
});
