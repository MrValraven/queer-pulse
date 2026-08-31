import { describe, expect, it } from "vitest";
import { MEMBER_TABS, PUBLIC_TABS, activeTabKey } from "./bottomTabs";

describe("tab sets", () => {
  it("leaves the last slot for More", () => {
    expect(MEMBER_TABS).toHaveLength(3);
    expect(PUBLIC_TABS).toHaveLength(3);
  });

  it("keeps sign-in out of the public set — the app bar owns it", () => {
    expect(PUBLIC_TABS.some((tab) => tab.key === "signIn")).toBe(false);
  });

  it("keeps every public tab reachable by a signed-out visitor", () => {
    // The set is derived through authGate's own isGatedLink, so a gated
    // destination would be filtered out and the length check above would fail.
    // Asserting the destinations too says WHICH pages the signed-out bar owes a
    // visitor, so a silent swap to a gated one is caught by name.
    expect(PUBLIC_TABS.map((tab) => tab.href)).toEqual([
      "/resources",
      "/local/safe-spaces",
      "/about",
    ]);
  });

  it("uses unique keys within each set", () => {
    const memberKeys = MEMBER_TABS.map((tab) => tab.key);
    expect(new Set(memberKeys).size).toBe(memberKeys.length);
    const publicKeys = PUBLIC_TABS.map((tab) => tab.key);
    expect(new Set(publicKeys).size).toBe(publicKeys.length);
  });
});

describe("activeTabKey", () => {
  it("matches an exact path", () => {
    expect(activeTabKey("/feed", MEMBER_TABS)).toBe("feed");
  });

  it("matches a nested path under a tab's prefix", () => {
    expect(activeTabKey("/members/123", MEMBER_TABS)).toBe("members");
  });

  it("returns null when nothing matches", () => {
    expect(activeTabKey("/about/press", MEMBER_TABS)).toBeNull();
  });

  it("does not treat a shared string prefix as a match", () => {
    // "/members-only" must NOT light the "/members" tab.
    expect(activeTabKey("/members-only", MEMBER_TABS)).toBeNull();
  });

  it("prefers the longest matching prefix", () => {
    const tabs = [
      { ...MEMBER_TABS[0]!, key: "short", matchPrefixes: ["/local"] },
      { ...MEMBER_TABS[1]!, key: "long", matchPrefixes: ["/local/directory"] },
    ];
    expect(activeTabKey("/local/directory/cafes", tabs)).toBe("long");
  });

  it("matches the public set's places tab", () => {
    expect(activeTabKey("/local/safe-spaces", PUBLIC_TABS)).toBe("places");
  });
});
