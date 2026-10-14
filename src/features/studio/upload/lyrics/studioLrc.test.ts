import { describe, expect, it } from "vitest";
import {
  doTimingsMatchLyrics,
  formatLrcTime,
  lyricsFromTimedLines,
  parseLrc,
  toLrc,
} from "./studioLrc";

describe("parseLrc", () => {
  it("reads every stamp format and sorts the lines", () => {
    const result = parseLrc(
      [
        "[00:12.5]third",
        "[00:01]first",
        "[00:05.25]second",
        "[01:02.345]fourth",
      ].join("\n"),
    );
    expect(result.lines).toEqual([
      { ms: 1000, text: "first" },
      { ms: 5250, text: "second" },
      { ms: 12500, text: "third" },
      { ms: 62345, text: "fourth" },
    ]);
    expect(result.problems).toEqual([]);
  });

  it("repeats a line once per stamp", () => {
    expect(parseLrc("[00:10.00][01:10.00]chorus").lines).toEqual([
      { ms: 10000, text: "chorus" },
      { ms: 70000, text: "chorus" },
    ]);
  });

  it("skips ID tags and applies the offset to every line", () => {
    const result = parseLrc(
      ["[ar:Someone]", "[ti:A song]", "[00:02.00]line", "[offset:+500]"].join(
        "\r\n",
      ),
    );
    expect(result.lines).toEqual([{ ms: 1500, text: "line" }]);
    expect(result.problems).toEqual([]);
  });

  it("never moves a line before zero", () => {
    expect(parseLrc("[offset:2000]\n[00:01.00]early").lines[0]?.ms).toBe(0);
  });

  it("lists malformed lines with their line numbers", () => {
    const result = parseLrc(
      [
        "[1:2]bad seconds",
        "[00:75.00]too many seconds",
        "no stamp here",
        "",
        "[00:03.00]good",
      ].join("\n"),
    );
    expect(result.lines).toEqual([{ ms: 3000, text: "good" }]);
    expect(result.problems).toEqual([
      { lineNumber: 1, text: "[1:2]bad seconds", reason: "noStamp" },
      { lineNumber: 2, text: "[00:75.00]too many seconds", reason: "noStamp" },
      { lineNumber: 3, text: "no stamp here", reason: "noStamp" },
    ]);
  });

  it("removes word stamps and keeps an empty line as a gap", () => {
    expect(
      parseLrc("[00:01.00]<00:01.00>hello <00:01.50>world\n[00:04.00]").lines,
    ).toEqual([
      { ms: 1000, text: "hello world" },
      { ms: 4000, text: "" },
    ]);
  });

  it("refuses a line longer than 300 characters", () => {
    const result = parseLrc(`[00:01.00]${"a".repeat(301)}`);
    expect(result.lines).toEqual([]);
    expect(result.problems[0]?.reason).toBe("tooLong");
  });

  it("flags more than 500 timed lines", () => {
    const source = Array.from(
      { length: 501 },
      (_line, index) => `[00:${String(index % 60).padStart(2, "0")}.00]x`,
    ).join("\n");
    expect(parseLrc(source).isOverLimit).toBe(true);
  });
});

describe("LRC helpers", () => {
  it("formats and round-trips", () => {
    expect(formatLrcTime(62345)).toBe("01:02.35");
    const lines = [
      { ms: 1000, text: "one" },
      { ms: 2500, text: "two" },
    ];
    expect(parseLrc(toLrc(lines)).lines).toEqual(lines);
  });

  it("compares timed lines with the plain lyrics, ignoring blank lines", () => {
    const lines = [
      { ms: 0, text: "one" },
      { ms: 1, text: "" },
      { ms: 2, text: "two" },
    ];
    expect(doTimingsMatchLyrics(lines, "one\n\n  two  ")).toBe(true);
    expect(doTimingsMatchLyrics(lines, "one\nthree")).toBe(false);
    expect(lyricsFromTimedLines(lines)).toBe("one\ntwo");
  });
});

describe("parseLrc offsets and line breaks", () => {
  it("keeps milliseconds whole with a fractional offset", () => {
    expect(parseLrc("[offset:+0.5]\n[00:02.00]line").lines).toEqual([
      { ms: 2000, text: "line" },
    ]);
    expect(parseLrc("[offset:1e2]\n[00:02.00]line").lines[0]?.ms).toBe(2000);
  });

  it("ignores a junk offset", () => {
    expect(parseLrc("[offset:500ms]\n[00:02.00]line").lines[0]?.ms).toBe(2000);
  });

  it("treats a lone carriage return as a line break", () => {
    expect(parseLrc("[00:01.00]one\r[00:02.00]two").lines).toHaveLength(2);
  });
});
