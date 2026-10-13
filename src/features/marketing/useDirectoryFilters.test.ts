import { act, renderHook } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { listingFactActiveFilters } from "./directoryListingFactActiveFilters";
import { NO_LISTING_FACT_FILTERS } from "./directoryListingFactFilters";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { businessToLocal, filterLocalPlaces } from "./localPlaces";
import {
  categoriesForView,
  countByCategory,
  toCategories,
  toOwned,
  useDirectoryFilterParams,
} from "./useDirectoryFilters";

describe("toOwned", () => {
  it("reads a stale or hand-edited URL without erroring", () => {
    expect(toOwned("bogus,women,women")).toEqual(["women"]);
  });
  it("returns canonical order", () => {
    expect(toOwned("bipoc,trans")).toEqual(["trans", "bipoc"]);
  });
  it("reads an absent param as none", () => {
    expect(toOwned(null)).toEqual([]);
  });
});

describe("toCategories", () => {
  it("keeps online and place ids, in chip order, once each", () => {
    expect(toCategories("therapy,food,bogus,food")).toEqual([
      "food",
      "therapy",
    ]);
  });
  it("reads an absent param as none", () => {
    expect(toCategories(null)).toEqual([]);
  });
});

describe("categoriesForView", () => {
  it("offers the online vocabulary on the Online tab and the place one elsewhere", () => {
    expect(categoriesForView("online")).toContain("books-music");
    expect(categoriesForView("online")).not.toContain("nightlife");
    expect(categoriesForView("list")).toContain("nightlife");
    expect(categoriesForView("map")).not.toContain("therapy");
  });
  it("keeps food on every tab, so it survives a switch either way", () => {
    expect(categoriesForView("online")).toContain("food");
    expect(categoriesForView("list")).toContain("food");
  });
});

describe("countByCategory", () => {
  const onlineListing = (slug: string, cat: string) =>
    businessToLocal({ ...DIRECTORY_PLACES[0]!, slug, cat, online: true }, true);
  const places = [
    ...DIRECTORY_PLACES.filter((place) => !place.online).map((place) =>
      businessToLocal(place, true),
    ),
    onlineListing("test-handmade-shop", "handmade"),
    onlineListing("test-apparel-shop", "apparel"),
  ];
  const listedUnder = (categoryId: string, isOnlineScope: boolean) =>
    filterLocalPlaces(places, {
      categories: [categoryId],
      query: "",
      isOnlineScope,
    }).length;

  it("counts a migrated online listing under its place chip on the List tab", () => {
    const placeCounts = countByCategory(places, false);
    expect(placeCounts.handmade).toBeUndefined();
    expect(placeCounts.apparel).toBe(1);
    expect(placeCounts.design).toBe(listedUnder("design", false));
    expect(listedUnder("design", false)).toBeGreaterThan(
      places.filter((place) => place.category === "design").length,
    );
  });

  it("shows on every chip of a tab exactly as many as that chip lists", () => {
    for (const view of ["list", "online"] as const) {
      const isOnlineScope = view === "online";
      const counts = countByCategory(places, isOnlineScope);
      for (const categoryId of categoriesForView(view)) {
        expect(counts[categoryId] ?? 0).toBe(
          listedUnder(categoryId, isOnlineScope),
        );
      }
    }
  });

  it("keeps the Online tab counting the online vocabulary", () => {
    const onlineCounts = countByCategory(places, true);
    expect(onlineCounts.handmade).toBe(listedUnder("handmade", true));
    expect(onlineCounts.handmade).toBeGreaterThanOrEqual(1);
    expect(onlineCounts.design).toBeUndefined();
  });
});

function renderParams(url: string) {
  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(MemoryRouter, { initialEntries: [url] }, children);
  return renderHook(() => useDirectoryFilterParams(), { wrapper });
}

describe("useDirectoryFilterParams and the fact filters", () => {
  it("reads them from the URL, dropping a sensitive slug", () => {
    const { result } = renderParams(
      "/local/directory?attr=wifi,sexual-health-prep&lang=pt",
    );
    expect(result.current.listingFacts.attributes).toEqual(["wifi"]);
    expect(result.current.listingFacts.languages).toEqual(["pt"]);
  });

  it("writes a pressed chip and reads it back", () => {
    const { result } = renderParams("/local/directory");
    act(() =>
      result.current.toggleListingFact({ kind: "payment", method: "card" }),
    );
    expect(result.current.listingFacts.payments).toEqual(["card"]);
  });

  it("drops the way in and the ways to pay on the way into the Online tab", () => {
    const { result } = renderParams(
      "/local/directory?entry=walkIn&pay=card&lang=en",
    );
    act(() => result.current.selectView("online"));
    expect(result.current.view).toBe("online");
    expect(result.current.listingFacts).toMatchObject({
      entryMode: null,
      payments: [],
      languages: ["en"],
    });
    act(() => result.current.selectView("list"));
    expect(result.current.listingFacts.entryMode).toBeNull();
  });

  it("clears them with every other filter, and reads nothing from an old vibe link", () => {
    const { result } = renderParams(
      "/local/directory?vibe=mixed&practice=chosen-name",
    );
    expect(result.current).not.toHaveProperty("vibes");
    expect(result.current.listingFacts.practices).toEqual(["chosen-name"]);
    act(() => result.current.clearFilters());
    expect(result.current.listingFacts.practices).toEqual([]);
  });

  it("reads an old vibe link as no fact filters, and clears its dead param", () => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        MemoryRouter,
        { initialEntries: ["/local/directory?vibe=mixed"] },
        children,
      );
    const { result } = renderHook(
      () => ({ params: useDirectoryFilterParams(), location: useLocation() }),
      { wrapper },
    );
    expect(result.current.params.listingFacts).toEqual(NO_LISTING_FACT_FILTERS);
    act(() => result.current.params.clearFilters());
    expect(
      new URLSearchParams(result.current.location.search).has("vibe"),
    ).toBe(false);
  });
});

describe("listingFactActiveFilters", () => {
  it("gives each fact filter a removable chip that undoes exactly it", () => {
    const changes: unknown[] = [];
    const chips = listingFactActiveFilters(
      (key) => key,
      {
        ...NO_LISTING_FACT_FILTERS,
        entryMode: "walkIn",
        languages: ["pt"],
        attributes: ["wifi"],
      },
      (change) => changes.push(change),
    );
    expect(chips.map((chip) => chip.key)).toEqual([
      "entry",
      "lang:pt",
      "attr:wifi",
    ]);
    chips[1]?.onRemove();
    expect(changes).toEqual([{ kind: "language", code: "pt" }]);
  });
});
