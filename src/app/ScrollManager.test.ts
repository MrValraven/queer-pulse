import { describe, expect, it } from "vitest";
import { scrollKeyForPath } from "./ScrollManager";

describe("scrollKeyForPath", () => {
  it("keys a tab root itself on its own path, shared across visits", () => {
    // "/members" IS the members tab's root (MEMBER_TABS matchPrefixes), so
    // every visit to the tab root reads/writes the same shared slot.
    expect(scrollKeyForPath("/members", "k1")).toBe("/members");
  });

  it("keeps a detail page under a tab root on its own history key", () => {
    // "/members/42" is one level under the tab root, not the root itself —
    // it must NOT collapse into "/members", or the detail's scroll offset
    // would clobber the roster's remembered offset when navigating back.
    expect(scrollKeyForPath("/members/42", "k1")).toBe("k1");
  });

  it("falls back to the per-history-entry key outside any tab", () => {
    // "/settings/theme" matches no bottom-tab prefix, so each visit keeps
    // its own remembered offset instead of sharing one.
    expect(scrollKeyForPath("/settings/theme", "k9")).toBe("k9");
  });
});
