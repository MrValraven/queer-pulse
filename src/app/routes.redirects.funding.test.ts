import { describe, expect, it } from "vitest";
import { LEGACY_REDIRECTS } from "./routes.redirects.data";

describe("the retired grants board", () => {
  it("sends both old paths to the Open calls view", () => {
    const targets = new Map(LEGACY_REDIRECTS);
    expect(targets.get("/work/grants")).toBe(
      "/forum?category=funding&fundingView=open",
    );
    expect(targets.get("/grants")).toBe(
      "/forum?category=funding&fundingView=open",
    );
  });
});
