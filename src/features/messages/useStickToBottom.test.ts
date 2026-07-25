import { describe, expect, it } from "vitest";
import { isNearBottom } from "./useStickToBottom";

function fakeEl(scrollHeight: number, scrollTop: number, clientHeight: number) {
  return { scrollHeight, scrollTop, clientHeight } as HTMLElement;
}

describe("isNearBottom", () => {
  it("is true at the bottom", () => {
    expect(isNearBottom(fakeEl(1000, 600, 400))).toBe(true);
  });
  it("is false when scrolled well up", () => {
    expect(isNearBottom(fakeEl(1000, 100, 400))).toBe(false);
  });
  it("respects the threshold", () => {
    expect(isNearBottom(fakeEl(1000, 540, 400), 80)).toBe(true);
    expect(isNearBottom(fakeEl(1000, 500, 400), 80)).toBe(false);
  });
});
