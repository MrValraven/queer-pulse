import { describe, expect, it } from "vitest";
import { parseStartSeconds, trackLinkAt } from "./studioTimestampLink";

describe("trackLinkAt", () => {
  it("appends whole seconds to the track link", () => {
    expect(trackLinkAt("/studio/track?id=t1", 83.9)).toBe(
      "/studio/track?id=t1&t=83",
    );
  });

  it("replaces an earlier time and keeps the id as written", () => {
    expect(trackLinkAt("/studio/track?id=a%20b&t=5", 12)).toBe(
      "/studio/track?id=a%20b&t=12",
    );
    expect(trackLinkAt("/studio/track?id=t1#lyrics", -4)).toBe(
      "/studio/track?id=t1&t=0#lyrics",
    );
  });
});

describe("parseStartSeconds", () => {
  const read = (query: string, duration: number | null) =>
    parseStartSeconds(new URLSearchParams(query), duration);

  it("reads whole seconds from 1 up", () => {
    expect(read("id=t1&t=83", 258)).toBe(83);
    expect(read("t=1", null)).toBe(1);
  });

  it("clamps to one second before the end", () => {
    expect(read("t=999", 258)).toBe(257);
    expect(read("t=999", 258.7)).toBe(257);
  });

  it("is null for anything else", () => {
    expect(read("id=t1", 258)).toBeNull();
    expect(read("t=0", 258)).toBeNull();
    expect(read("t=-5", 258)).toBeNull();
    expect(read("t=1.5", 258)).toBeNull();
    expect(read("t=1m", 258)).toBeNull();
    expect(read("t=99999999", null)).toBeNull();
    expect(read("t=5", 1)).toBeNull();
  });
});
