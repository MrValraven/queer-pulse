import { describe, expect, it } from "vitest";
import { isBlipFaceHardToRead } from "./blipContrast";

describe("isBlipFaceHardToRead", () => {
  it("flags a near-black body, where the ink face disappears", () => {
    expect(isBlipFaceHardToRead("#1b1b1b")).toBe(true);
    expect(isBlipFaceHardToRead("#202020")).toBe(true);
  });

  it("stays quiet on the coral default and on cream", () => {
    expect(isBlipFaceHardToRead("#e8775a")).toBe(false);
    expect(isBlipFaceHardToRead("#f7f3ee")).toBe(false);
  });
});
