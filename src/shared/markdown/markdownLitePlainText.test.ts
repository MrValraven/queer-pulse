import { describe, expect, it } from "vitest";
import { markdownLitePlainText } from "./markdownLitePlainText";

describe("markdownLitePlainText", () => {
  it("keeps a plain body as written, one line per line", () => {
    expect(markdownLitePlainText("First line\nSecond line")).toBe(
      "First line\nSecond line",
    );
  });

  it("drops the blank lines between paragraphs", () => {
    expect(markdownLitePlainText("One\n\n\nTwo")).toBe("One\nTwo");
  });

  it("strips bold and italic marks and keeps their words", () => {
    expect(markdownLitePlainText("a **bold** and *soft* word")).toBe(
      "a bold and soft word",
    );
  });

  it("strips a heading line down to its words", () => {
    expect(markdownLitePlainText("**Saturday plan**\nMeet at six")).toBe(
      "Saturday plan\nMeet at six",
    );
  });

  it("puts each list item on its own line without its bullet or number", () => {
    expect(
      markdownLitePlainText("- snacks\n* drinks\n1. first\n2. second"),
    ).toBe("snacks\ndrinks\nfirst\nsecond");
  });

  it("strips the quote marker", () => {
    expect(markdownLitePlainText("> said with love")).toBe("said with love");
  });

  it("turns a markdown link into its label", () => {
    expect(
      markdownLitePlainText("read [the guide](https://example.com/guide) now"),
    ).toBe("read the guide now");
  });

  it("keeps a bare URL as the URL", () => {
    expect(markdownLitePlainText("see https://example.com")).toBe(
      "see https://example.com",
    );
  });

  it("keeps mentions and a lone asterisk as written", () => {
    expect(markdownLitePlainText("thanks @sam in c/book-club 5 * 3")).toBe(
      "thanks @sam in c/book-club 5 * 3",
    );
  });

  it("reads Windows line endings as line breaks", () => {
    expect(markdownLitePlainText("One\r\nTwo")).toBe("One\nTwo");
  });

  it("returns an empty string for an empty body", () => {
    expect(markdownLitePlainText("")).toBe("");
  });
});
