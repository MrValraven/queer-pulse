import { describe, expect, it } from "vitest";
import { parsePoemHtml } from "./parsePoemHtml";

const plain = (text: string) => [{ text, marks: [] as ("em" | "strong")[] }];

describe("parsePoemHtml", () => {
  it("splits <br> into lines", () => {
    expect(parsePoemHtml("one<br>two")).toEqual([plain("one"), plain("two")]);
  });
  it("splits pasted block wrappers into lines (no merge)", () => {
    expect(parsePoemHtml("<div>one</div><div>two</div>")).toEqual([plain("one"), plain("two")]);
    expect(parsePoemHtml("<p>a</p><p>b</p>")).toEqual([plain("a"), plain("b")]);
  });
  it("keeps em/strong as marks", () => {
    expect(parsePoemHtml("a <em>b</em> <strong>c</strong>")).toEqual([[
      { text: "a ", marks: [] }, { text: "b", marks: ["em"] },
      { text: " ", marks: [] }, { text: "c", marks: ["strong"] },
    ]]);
  });
  it("treats \\n as a line break", () => {
    expect(parsePoemHtml("a\nb")).toEqual([plain("a"), plain("b")]);
  });
  it("maps <b>/<i> to strong/em marks (execCommand + rich-paste output)", () => {
    expect(parsePoemHtml("<b>bold</b> <i>italic</i>")).toEqual([[
      { text: "bold", marks: ["strong"] },
      { text: " ", marks: [] },
      { text: "italic", marks: ["em"] },
    ]]);
  });
  it("drops disallowed tags/attrs, unwraps their text", () => {
    expect(parsePoemHtml('<a href="x">link</a>')).toEqual([plain("link")]);
    expect(parsePoemHtml('<img src=x onerror=alert(1)>keep')).toEqual([plain("keep")]);
  });
  it("returns [] for empty input", () => {
    expect(parsePoemHtml("")).toEqual([]);
  });
});
