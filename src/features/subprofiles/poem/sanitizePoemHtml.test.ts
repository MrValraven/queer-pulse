import { describe, expect, it } from "vitest";
import { sanitizePoemHtml } from "./sanitizePoemHtml";

describe("sanitizePoemHtml", () => {
  it("keeps em/strong/br, drops everything else", () => {
    expect(sanitizePoemHtml("<em>a</em><br><strong>b</strong>")).toBe(
      "<em>a</em><br><strong>b</strong>",
    );
  });

  it("unwraps disallowed tags but keeps their text", () => {
    expect(sanitizePoemHtml('<a href="x">link</a>')).toBe("link");
    expect(sanitizePoemHtml("<div><span>hi</span></div>")).toBe("hi");
  });

  it("strips a script tag and its content is unwrapped as inert text", () => {
    const output = sanitizePoemHtml('<img src=x onerror=alert(1)>keep');
    expect(output).toBe("keep");
  });

  it("strips attributes from allowed tags", () => {
    expect(sanitizePoemHtml('<em class="x" onclick="y">t</em>')).toBe(
      "<em>t</em>",
    );
  });
});
