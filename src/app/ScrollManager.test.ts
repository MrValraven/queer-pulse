import { describe, expect, it } from "vitest";
import { isSameRouteQueryChange, scrollKeyForPath } from "./scrollRouting";

describe("scrollKeyForPath", () => {
  it("keys a tab root itself on its own path, shared across visits", () => {
    // "/communities" IS the communities tab's root (MEMBER_TABS matchPrefixes),
    // so every visit to the tab root reads/writes the same shared slot.
    expect(scrollKeyForPath("/communities", "k1")).toBe("/communities");
  });

  it("keeps a detail page under a tab root on its own history key", () => {
    // "/communities/42" sits one level under the tab root. It keeps its own
    // history key, so the detail's scroll offset leaves the hub's remembered
    // offset intact when navigating back.
    expect(scrollKeyForPath("/communities/42", "k1")).toBe("k1");
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

  it("treats a changed id param on the same path as a real navigation", () => {
    // Picking another album from the "More from" shelf: same pathname, but the
    // `id` names a different album, so it is a new page and lands at the top.
    expect(
      isSameRouteQueryChange(
        { pathname: "/studio/album", search: "?id=a" },
        { pathname: "/studio/album", search: "?id=b" },
      ),
    ).toBe(false);
  });

  it("treats another param change under the same id as staying put", () => {
    // Switching the artist page's tab keeps the same artist on screen, so it
    // is a re-filter and the scroll offset survives it.
    expect(
      isSameRouteQueryChange(
        { pathname: "/studio/artist", search: "?id=a&tab=gigs" },
        { pathname: "/studio/artist", search: "?id=a&tab=about" },
      ),
    ).toBe(true);
  });
});
