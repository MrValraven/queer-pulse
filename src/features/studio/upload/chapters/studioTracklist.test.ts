import { describe, expect, it } from "vitest";
import { parseTracklist } from "./studioTracklist";

const shape = (source: string) =>
  parseTracklist(source).rows.map(({ time, title, artist }) => ({
    time,
    title,
    artist,
  }));

describe("parseTracklist", () => {
  it("reads artist and title around a spaced hyphen", () => {
    expect(
      shape("00:00 Linn da Quebrada - Bixa Preta\n1:02:30 Closing"),
    ).toEqual([
      { time: "0:00", title: "Bixa Preta", artist: "Linn da Quebrada" },
      { time: "1:02:30", title: "Closing", artist: "" },
    ]);
  });

  it("accepts numbering, brackets, a separator after the time and en dashes", () => {
    expect(shape("01. [03:15] - Someone \u2013 Song - Remix")).toEqual([
      { time: "3:15", title: "Song - Remix", artist: "Someone" },
    ]);
  });

  it("lists lines it cannot read", () => {
    const result = parseTracklist("Intro\n1:75 Bad\n\n2:00 Good");
    expect(result.rows).toHaveLength(1);
    expect(result.problems).toEqual([
      { lineNumber: 1, text: "Intro" },
      { lineNumber: 2, text: "1:75 Bad" },
    ]);
  });

  it("gives every row its own id", () => {
    const ids = parseTracklist("0:00 A\n1:00 B").rows.map((row) => row.id);
    expect(new Set(ids).size).toBe(2);
  });
});

describe("parseTracklist boundaries", () => {
  it("does not read 1:234 as 1:23 followed by text", () => {
    const result = parseTracklist("1:234 foo");
    expect(result.rows).toEqual([]);
    expect(result.problems).toEqual([{ lineNumber: 1, text: "1:234 foo" }]);
  });

  it("treats a lone carriage return as a line break", () => {
    expect(parseTracklist("0:00 A\r1:00 B").rows).toHaveLength(2);
  });
});
