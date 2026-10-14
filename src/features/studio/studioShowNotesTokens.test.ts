import { describe, expect, it } from "vitest";
import { secondsOfTimestamp, tokenizeShowNotes } from "./studioShowNotesTokens";

describe("secondsOfTimestamp", () => {
  it("reads m:ss and h:mm:ss", () => {
    expect(secondsOfTimestamp("4:10")).toBe(250);
    expect(secondsOfTimestamp("00:00")).toBe(0);
    expect(secondsOfTimestamp("1:02:30")).toBe(3750);
  });

  it("refuses impossible times", () => {
    expect(secondsOfTimestamp("4:70")).toBeNull();
    expect(secondsOfTimestamp("1:75:00")).toBeNull();
  });
});

describe("tokenizeShowNotes", () => {
  it("splits paragraphs and lines and finds links and times", () => {
    const paragraphs = tokenizeShowNotes(
      "Hello there.\n04:10 Why now\n\nSee https://example.org/help.",
      2400,
    );
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toEqual([
      { kind: "text", text: "Hello there." },
      { kind: "break" },
      { kind: "time", text: "04:10", seconds: 250 },
      { kind: "text", text: " Why now" },
    ]);
    expect(paragraphs[1]).toEqual([
      { kind: "text", text: "See " },
      {
        kind: "link",
        text: "https://example.org/help",
        href: "https://example.org/help",
      },
      { kind: "text", text: "." },
    ]);
  });

  it("leaves a time past the end, and digits inside numbers, as text", () => {
    const [paragraph] = tokenizeShowNotes(
      "At 59:00 and 12:345 and 3:15:00",
      1800,
    );
    expect(paragraph?.filter((token) => token.kind === "time")).toEqual([]);
  });

  it("keeps a closing bracket inside an address that opened one", () => {
    const [paragraph] = tokenizeShowNotes(
      "Read https://en.wikipedia.org/wiki/Foo_(bar). Or (see https://example.org/a)",
      null,
    );
    expect(paragraph?.filter((token) => token.kind === "link")).toEqual([
      {
        kind: "link",
        text: "https://en.wikipedia.org/wiki/Foo_(bar)",
        href: "https://en.wikipedia.org/wiki/Foo_(bar)",
      },
      {
        kind: "link",
        text: "https://example.org/a",
        href: "https://example.org/a",
      },
    ]);
    expect(paragraph?.at(-1)).toEqual({ kind: "text", text: ")" });
  });

  it("links http and https only", () => {
    const [paragraph] = tokenizeShowNotes(
      "javascript:alert(1) ftp://x.org",
      null,
    );
    expect(paragraph?.some((token) => token.kind === "link")).toBe(false);
  });
});
