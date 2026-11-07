import { describe, expect, it } from "vitest";
import { vjCenteredScrollLeft, vjHiddenEdgesOf } from "./vjPackTabsScroll";

describe("vjCenteredScrollLeft", () => {
  it("puts the chip's centre on the scroller's centre", () => {
    expect(
      vjCenteredScrollLeft(
        { scrollLeft: 0, scrollWidth: 800, clientWidth: 200 },
        { offsetLeft: 400, offsetWidth: 100 },
      ),
    ).toBe(350);
  });

  it("stops at the start, so the favorites star stays in view for the first pack", () => {
    expect(
      vjCenteredScrollLeft(
        { scrollLeft: 120, scrollWidth: 800, clientWidth: 200 },
        { offsetLeft: 48, offsetWidth: 80 },
      ),
    ).toBe(0);
  });

  it("stops at the end of the scroll range", () => {
    expect(
      vjCenteredScrollLeft(
        { scrollLeft: 0, scrollWidth: 800, clientWidth: 200 },
        { offsetLeft: 740, offsetWidth: 60 },
      ),
    ).toBe(600);
  });

  it("answers null when the chip is already centred", () => {
    expect(
      vjCenteredScrollLeft(
        { scrollLeft: 350, scrollWidth: 800, clientWidth: 200 },
        { offsetLeft: 400, offsetWidth: 100 },
      ),
    ).toBeNull();
  });
});

describe("vjHiddenEdgesOf", () => {
  it("fades no edge when every chip fits", () => {
    expect(
      vjHiddenEdgesOf({ scrollLeft: 0, scrollWidth: 200, clientWidth: 200 }),
    ).toEqual({ hasHiddenStart: false, hasHiddenEnd: false });
  });

  it("fades the end edge at the start of a long row", () => {
    expect(
      vjHiddenEdgesOf({ scrollLeft: 0, scrollWidth: 500, clientWidth: 200 }),
    ).toEqual({ hasHiddenStart: false, hasHiddenEnd: true });
  });

  it("fades both edges in the middle of a long row", () => {
    expect(
      vjHiddenEdgesOf({ scrollLeft: 150, scrollWidth: 500, clientWidth: 200 }),
    ).toEqual({ hasHiddenStart: true, hasHiddenEnd: true });
  });

  it("fades the start edge at the end, right-to-left scroll offsets included", () => {
    expect(
      vjHiddenEdgesOf({ scrollLeft: -300, scrollWidth: 500, clientWidth: 200 }),
    ).toEqual({ hasHiddenStart: true, hasHiddenEnd: false });
  });
});
