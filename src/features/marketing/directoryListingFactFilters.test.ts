import { describe, expect, it } from "vitest";
import {
  clearListingFactParams,
  countListingFactChips,
  isListingFactChipDisabled,
  listingFactFilterKey,
  matchesListingFacts,
  NO_LISTING_FACT_FILTERS,
  readListingFactFilters,
  withListingFactChange,
  writeListingFactFilters,
  type DirectoryListingFactFilters,
} from "./directoryListingFactFilters";

const params = (query: string) => new URLSearchParams(query);

describe("readListingFactFilters", () => {
  it("drops sensitive and unknown slugs so a hand-written link never 400s", () => {
    expect(
      readListingFactFilters(
        params("attr=wifi,sexual-health-prep,bogus,Terrace,wifi"),
        false,
      ).attributes,
    ).toEqual(["terrace", "wifi"]);
  });

  it("reads one way in, codes exactly, and canonical lists", () => {
    expect(
      readListingFactFilters(
        params(
          "entry=walkIn,membersOnly&pay=cash,card&lang=en,pt-br,pt&practice=harm-reduction,chosen-name",
        ),
        false,
      ),
    ).toEqual({
      attributes: [],
      entryMode: "walkIn",
      payments: ["card", "cash"],
      languages: ["pt", "en"],
      practices: ["chosen-name", "harm-reduction"],
    });
  });

  it("never narrows the Online tab by a way in or a way to pay", () => {
    const filters = readListingFactFilters(
      params("entry=walkIn&pay=card&lang=pt"),
      true,
    );
    expect(filters.entryMode).toBeNull();
    expect(filters.payments).toEqual([]);
    expect(filters.languages).toEqual(["pt"]);
  });
});

describe("writing and clearing", () => {
  it("round-trips through the URL and drops empty keys", () => {
    const filters: DirectoryListingFactFilters = {
      attributes: ["terrace"],
      entryMode: "walkIn",
      payments: ["card"],
      languages: ["pt", "en"],
      practices: [],
    };
    const search = params("practice=chosen-name&q=bar");
    writeListingFactFilters(search, filters);
    expect(readListingFactFilters(search, false)).toEqual(filters);
    expect(search.get("practice")).toBeNull();
    expect(search.get("q")).toBe("bar");
    clearListingFactParams(search);
    expect(search.toString()).toBe("q=bar");
  });

  it("toggles one value at a time, and one way in replaces another", () => {
    const walkIn = withListingFactChange(NO_LISTING_FACT_FILTERS, {
      kind: "entryMode",
      mode: "walkIn",
    });
    expect(
      withListingFactChange(walkIn, { kind: "entryMode", mode: "membersOnly" })
        .entryMode,
    ).toBe("membersOnly");
    expect(
      withListingFactChange(walkIn, { kind: "entryMode", mode: "walkIn" })
        .entryMode,
    ).toBeNull();
    expect(
      withListingFactChange(NO_LISTING_FACT_FILTERS, {
        kind: "attribute",
        slug: "wifi",
      }).attributes,
    ).toEqual(["wifi"]);
  });

  it("keys equal filter sets alike", () => {
    expect(
      listingFactFilterKey({ ...NO_LISTING_FACT_FILTERS, languages: ["pt"] }),
    ).toBe(
      listingFactFilterKey({ ...NO_LISTING_FACT_FILTERS, languages: ["pt"] }),
    );
    expect(listingFactFilterKey(NO_LISTING_FACT_FILTERS)).not.toBe(
      listingFactFilterKey({ ...NO_LISTING_FACT_FILTERS, payments: ["card"] }),
    );
  });
});

describe("matchesListingFacts", () => {
  const cafe = {
    attributes: ["terrace", "wifi"],
    entryMode: "walkIn",
    payments: ["card", "cash"],
    langs: ["pt"],
    inclusionPractices: ["chosen-name"],
  };

  it("ANDs attributes, payments and practices, ORs languages, matches one way in", () => {
    const base = NO_LISTING_FACT_FILTERS;
    expect(
      matchesListingFacts(cafe, { ...base, attributes: ["terrace", "wifi"] }),
    ).toBe(true);
    expect(
      matchesListingFacts(cafe, { ...base, attributes: ["terrace", "halal"] }),
    ).toBe(false);
    expect(
      matchesListingFacts(cafe, { ...base, languages: ["en", "pt"] }),
    ).toBe(true);
    expect(matchesListingFacts(cafe, { ...base, languages: ["en"] })).toBe(
      false,
    );
    expect(
      matchesListingFacts(cafe, { ...base, entryMode: "membersOnly" }),
    ).toBe(false);
    expect(
      matchesListingFacts(cafe, { ...base, payments: ["card", "mbway"] }),
    ).toBe(false);
  });

  it("keeps everything with no filter on, and nothing without facts once one is", () => {
    expect(matchesListingFacts(null, NO_LISTING_FACT_FILTERS)).toBe(true);
    expect(
      matchesListingFacts(null, {
        ...NO_LISTING_FACT_FILTERS,
        payments: ["card"],
      }),
    ).toBe(false);
  });
});

describe("isListingFactChipDisabled", () => {
  const withPortuguese = {
    ...NO_LISTING_FACT_FILTERS,
    languages: ["pt" as const],
  };

  it("never disables a language added to an OR, whatever its count", () => {
    expect(
      isListingFactChipDisabled({
        filters: withPortuguese,
        change: { kind: "language", code: "en" },
        count: 0,
        isLoadedSetComplete: true,
      }),
    ).toBe(false);
  });

  it("never disables another way in while one is chosen", () => {
    expect(
      isListingFactChipDisabled({
        filters: { ...NO_LISTING_FACT_FILTERS, entryMode: "walkIn" },
        change: { kind: "entryMode", mode: "membersOnly" },
        count: 0,
        isLoadedSetComplete: true,
      }),
    ).toBe(false);
  });

  it("disables an AND chip at zero only once every page is in", () => {
    const change = { kind: "payment", method: "mbway" } as const;
    expect(
      isListingFactChipDisabled({
        filters: NO_LISTING_FACT_FILTERS,
        change,
        count: 0,
        isLoadedSetComplete: false,
      }),
    ).toBe(false);
    expect(
      isListingFactChipDisabled({
        filters: NO_LISTING_FACT_FILTERS,
        change,
        count: 0,
        isLoadedSetComplete: true,
      }),
    ).toBe(true);
    expect(
      isListingFactChipDisabled({
        filters: { ...NO_LISTING_FACT_FILTERS, payments: ["mbway"] },
        change,
        count: 0,
        isLoadedSetComplete: true,
      }),
    ).toBe(false);
  });
});

describe("countListingFactChips", () => {
  it("counts each chip with its own change applied", () => {
    const counts = countListingFactChips(
      (filters) => (filters.payments.includes("cash") ? 2 : 5),
      NO_LISTING_FACT_FILTERS,
      ["wifi"],
    );
    expect(counts.payments.cash).toBe(2);
    expect(counts.payments.card).toBe(5);
    expect(counts.attributes.wifi).toBe(5);
  });
});
