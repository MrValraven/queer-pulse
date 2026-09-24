import { describe, expect, it } from "vitest";
import { htmlToPlainText } from "./htmlToPlainText";

describe("htmlToPlainText", () => {
  it("keeps link addresses, line breaks and paragraph gaps, and drops styles", () => {
    const text = htmlToPlainText(
      '<style>p{color:red}</style><p>Hello<br>there</p><p><a href="https://x.test/a">Join</a></p><img alt="Logo">',
    );
    expect(text).toBe("Hello\nthere\n\nJoin (https://x.test/a)\n\nLogo");
  });

  it("does not repeat a link whose label is its address", () => {
    expect(htmlToPlainText('<a href="https://x.test">https://x.test</a>')).toBe(
      "https://x.test",
    );
  });
});
