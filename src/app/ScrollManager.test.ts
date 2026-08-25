import { describe, expect, it } from "vitest";
import { isSameRouteQueryChange, scrollKeyForPath } from "./scrollRouting";

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

describe("isSameRouteQueryChange", () => {
  it("treats a query-only change on the same path as staying put", () => {
    // The local directory's List/Map toggle: same page, new search params.
    // react-router mints a fresh location.key for it, so without this the
    // navigation effect would read it as a new page and scroll to the top.
    expect(
      isSameRouteQueryChange(
        { pathname: "/local/directory", search: "?view=map" },
        { pathname: "/local/directory", search: "" },
      ),
    ).toBe(true);
  });

  it("treats a changed pathname as a real navigation", () => {
    // Opening a listing from the directory is a new page and must reset to top,
    // even though the query string changed too.
    expect(
      isSameRouteQueryChange(
        { pathname: "/local/directory", search: "?view=map" },
        { pathname: "/local/directory/drama-bar", search: "" },
      ),
    ).toBe(false);
  });

  it("treats an identical location as a real navigation", () => {
    // Nothing about the URL moved (a re-render, or the same link tapped twice),
    // so this branch must not claim a filter change happened.
    expect(
      isSameRouteQueryChange(
        { pathname: "/events", search: "?tab=going" },
        { pathname: "/events", search: "?tab=going" },
      ),
    ).toBe(false);
  });

  it("resets on the very first navigation, when there is no previous route", () => {
    // Initial load has nothing to compare against and must land at the top.
    expect(
      isSameRouteQueryChange(null, {
        pathname: "/events",
        search: "?tab=going",
      }),
    ).toBe(false);
  });
});
