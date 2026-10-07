import { describe, expect, it } from "vitest";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { VENUES } from "./map.data";
import {
  appendUniquePlaces,
  businessToLocal,
  categoryForScope,
  filterLocalPlaces,
  isOnlinePlace,
  isPlaceOpenNow,
  isSellingOnlinePlace,
  mergeLocalPlaces,
  placeMatchesOwnedBy,
  normalizeName,
  sortLocalPlaces,
  venueToLocal,
} from "./localPlaces";

describe("normalizeName", () => {
  it("lowercases, trims, and folds diacritics for cross-dataset matching", () => {
    expect(normalizeName("  Salão Mouraria ")).toBe("salao mouraria");
    expect(normalizeName("Navalha")).toBe("navalha");
    expect(normalizeName("Café Central")).toBe("cafe central");
  });
});

describe("businessToLocal", () => {
  it("maps a street-addressed business to a coords-having LocalPlace", () => {
    const atelier = DIRECTORY_PLACES.find(
      (place) => place.slug === "atelier-pulso",
    )!;
    const local = businessToLocal(atelier, true);
    expect(local.id).toBe("business:atelier-pulso");
    expect(local.kind).toBe("business");
    expect(local.category).toBe("design");
    expect(local.freguesia).toBe("Misericórdia");
    expect(local.coords).toEqual({ latitude: 38.7167, longitude: -9.149 });
    expect(local.detailPath).toBe("/local/directory/atelier-pulso");
  });

  it("files a business under the parish its pin sits in, over its typed hood", () => {
    const atelier = DIRECTORY_PLACES.find(
      (place) => place.slug === "atelier-pulso",
    )!;
    const pinnedInArroios = {
      ...atelier,
      hood: "Alfama",
      latitude: 38.72984,
      longitude: -9.13881,
    };
    expect(businessToLocal(pinnedInArroios, false).freguesia).toBe("Arroios");
  });

  it("gives a location-less business null coords (list-only)", () => {
    const supper = DIRECTORY_PLACES.find(
      (place) => place.slug === "queer-supper-club",
    )!;
    expect(businessToLocal(supper, true).coords).toBeNull();
  });
});

describe("venueToLocal", () => {
  it("maps a venue, folding its type into the unified category", () => {
    const finalmente = VENUES.find((venue) => venue.id === "v1")!;
    const local = venueToLocal(finalmente);
    expect(local.id).toBe("venue:v1");
    expect(local.kind).toBe("venue");
    expect(local.category).toBe("nightlife");
    expect(local.coords).toEqual({ latitude: 38.7168, longitude: -9.1489 });
    expect(local.vibe).toEqual(["mixed", "masc-leaning"]);
    expect(local.beenHere).toBe(247);
    expect(local.detailPath).toBe("/local/venue/v1");
  });
});

describe("mergeLocalPlaces", () => {
  it("folds a name-matched venue's geo/vibe/been-here into the business and drops the venue", () => {
    const businesses = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    const venues = VENUES.map(venueToLocal);
    const merged = mergeLocalPlaces(businesses, venues);

    const navalhaEntries = merged.filter(
      (place) => place.name.toLowerCase() === "navalha",
    );
    expect(navalhaEntries).toHaveLength(1);
    const navalha = navalhaEntries[0]!;
    expect(navalha.kind).toBe("business");
    expect(navalha.coords).not.toBeNull();
    expect(navalha.vibe).toBeDefined();
    expect(navalha.beenHere).toBeDefined();
  });

  it("passes venues with no business twin through unchanged", () => {
    const businesses = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    const venues = VENUES.map(venueToLocal);
    const merged = mergeLocalPlaces(businesses, venues);

    const tesoura = merged.find((place) => place.name === "A Tesoura");
    expect(tesoura).toBeDefined();
    expect(tesoura!.kind).toBe("venue");
  });

  it("keeps a business's own coords if it has them, even when a twin exists", () => {
    const business = businessToLocal(
      DIRECTORY_PLACES.find((place) => place.slug === "atelier-pulso")!,
      true,
    );
    const twin = {
      ...business,
      id: "venue:x",
      kind: "venue" as const,
      coords: { latitude: 0, longitude: 0 },
    };
    const merged = mergeLocalPlaces([business], [twin]);
    expect(merged).toHaveLength(1);
    expect(merged[0]!.coords).toEqual(business.coords);
  });
});

describe("filterLocalPlaces", () => {
  const places = mergeLocalPlaces(
    DIRECTORY_PLACES.map((place) => businessToLocal(place, true)),
    VENUES.map(venueToLocal),
  );

  it("returns everything when no place type is chosen, query empty, no vibes", () => {
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "",
      vibes: [],
    });
    expect(result).toEqual(places);
  });

  it("filters by unified category", () => {
    const nightlife = filterLocalPlaces(places, {
      categories: ["nightlife"],
      query: "",
      vibes: [],
    });
    expect(nightlife.length).toBeGreaterThan(0);
    expect(nightlife.every((place) => place.category === "nightlife")).toBe(
      true,
    );
  });

  it("combines several place types as an OR", () => {
    const filtersFor = (categories: string[]) => ({
      categories,
      query: "",
      vibes: [],
    });
    const nightlife = filterLocalPlaces(places, filtersFor(["nightlife"]));
    const food = filterLocalPlaces(places, filtersFor(["food"]));
    const both = filterLocalPlaces(places, filtersFor(["food", "nightlife"]));
    expect(nightlife.length).toBeGreaterThan(0);
    expect(food.length).toBeGreaterThan(0);
    expect(both).toHaveLength(nightlife.length + food.length);
    expect(
      both.every((place) => ["food", "nightlife"].includes(place.category)),
    ).toBe(true);
  });

  it("matches the query against the full searchText haystack, case-insensitively", () => {
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "Mouraria",
      vibes: [],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((place) => place.searchText.includes("mouraria"))).toBe(
      true,
    );
  });

  it("broadens beyond the name — a word from the blurb still matches", () => {
    // "sliding scale" appears in descriptions, never in a place name.
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "sliding scale",
      vibes: [],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some((place) => !place.name.toLowerCase().includes("sliding")),
    ).toBe(true);
  });

  it("passes vibe-less businesses through while narrowing venues to the vibe", () => {
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "",
      vibes: ["mixed"],
    });
    // Every venue kept matches the selected vibe…
    expect(
      result
        .filter((place) => place.kind === "venue")
        .every((place) => (place.vibe ?? []).includes("mixed")),
    ).toBe(true);
    // …and vibe-less businesses are still present, not silently dropped.
    expect(result.some((place) => place.kind === "business")).toBe(true);
  });

  const ownedByOf = (place: (typeof places)[number]) =>
    place.kind === "business"
      ? ((place.source as (typeof DIRECTORY_PLACES)[number]).ownedBy ?? [])
      : [];

  it("keeps only places whose owner gave the chosen tag", () => {
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "",
      vibes: [],
      owned: ["trans"],
    });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((place) => ownedByOf(place).includes("trans"))).toBe(
      true,
    );
    // A demo venue says nothing about its owners, so it never qualifies.
    expect(result.some((place) => place.kind === "venue")).toBe(false);
  });

  it("treats several tags as an OR, never an AND", () => {
    const filtersFor = (owned: ("women" | "trans" | "nonbinary")[]) => ({
      categories: [],
      query: "",
      vibes: [],
      owned,
    });
    const trans = filterLocalPlaces(places, filtersFor(["trans"]));
    const nonbinary = filterLocalPlaces(places, filtersFor(["nonbinary"]));
    const either = filterLocalPlaces(
      places,
      filtersFor(["trans", "nonbinary"]),
    );
    const union = new Set([...trans, ...nonbinary].map((place) => place.id));
    expect(either.map((place) => place.id).sort()).toEqual([...union].sort());
    expect(either.length).toBeGreaterThan(
      Math.max(trans.length, nonbinary.length),
    );
  });

  it("is independent of the queer-owned badge: an allied place can qualify", () => {
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "",
      vibes: [],
      owned: ["women"],
    });
    expect(
      result.some(
        (place) =>
          place.kind === "business" &&
          !(place.source as (typeof DIRECTORY_PLACES)[number]).owned,
      ),
    ).toBe(true);
  });

  it("leaves the list untouched when no tag is chosen", () => {
    const unfiltered = filterLocalPlaces(places, {
      categories: [],
      query: "",
      vibes: [],
    });
    const result = filterLocalPlaces(places, {
      categories: [],
      query: "",
      vibes: [],
      owned: [],
    });
    expect(result).toHaveLength(unfiltered.length);
  });
});

describe("placeMatchesOwnedBy", () => {
  const salon = DIRECTORY_PLACES.find(
    (place) => place.slug === "salao-mouraria",
  )!;

  it("matches any of the chosen tags on the business's own list", () => {
    const local = businessToLocal({ ...salon, ownedBy: ["women"] }, true);
    expect(placeMatchesOwnedBy(local, ["women"])).toBe(true);
    expect(placeMatchesOwnedBy(local, ["trans", "women"])).toBe(true);
    expect(placeMatchesOwnedBy(local, ["trans"])).toBe(false);
  });

  it("treats an absent list (older payload) as no tags", () => {
    const { ownedBy: _ownedBy, ...withoutTags } = salon;
    expect(
      placeMatchesOwnedBy(businessToLocal(withoutTags, true), ["women"]),
    ).toBe(false);
  });

  it("matches the bipoc tag like any other", () => {
    const local = businessToLocal({ ...salon, ownedBy: ["bipoc"] }, true);
    expect(placeMatchesOwnedBy(local, ["bipoc"])).toBe(true);
    expect(placeMatchesOwnedBy(local, ["women", "bipoc"])).toBe(true);
    expect(placeMatchesOwnedBy(local, ["women"])).toBe(false);
  });
});

describe("selling online", () => {
  const locals = DIRECTORY_PLACES.map((place) => businessToLocal(place, true));
  const bookshop = locals.find(
    (place) => place.id === "business:livraria-bertha",
  )!;

  it("counts a place with an online shop as selling online", () => {
    expect(isSellingOnlinePlace(bookshop)).toBe(true);
    expect(locals.filter(isSellingOnlinePlace).length).toBeGreaterThan(
      locals.filter(isOnlinePlace).length,
    );
  });

  it("matches a place's category to the online chips in the Online tab", () => {
    expect(categoryForScope(bookshop, true)).toBe("books-music");
    expect(categoryForScope(bookshop, false)).toBe("culture");
    const result = filterLocalPlaces([bookshop], {
      categories: ["books-music"],
      query: "",
      vibes: [],
      isOnlineScope: true,
    });
    expect(result).toEqual([bookshop]);
  });
});

describe("online-only listings on the List tab", () => {
  const handmadeShop = businessToLocal(
    {
      ...DIRECTORY_PLACES[0]!,
      slug: "test-handmade-shop",
      cat: "handmade",
      online: true,
    },
    true,
  );
  const apparelShop = businessToLocal(
    {
      ...DIRECTORY_PLACES[0]!,
      slug: "test-apparel-shop",
      cat: "apparel",
      online: true,
    },
    true,
  );
  const filtersFor = (categories: string[], isOnlineScope: boolean) => ({
    categories,
    query: "",
    vibes: [],
    isOnlineScope,
  });

  it("reads a migrated online category through its place counterpart", () => {
    expect(categoryForScope(handmadeShop, false)).toBe("design");
    expect(
      filterLocalPlaces([handmadeShop], filtersFor(["design"], false)),
    ).toEqual([handmadeShop]);
  });

  it("leaves an online category with no place counterpart under no chip", () => {
    expect(categoryForScope(apparelShop, false)).toBe("apparel");
    for (const placeCategory of ["food", "design", "culture", "health"]) {
      expect(
        filterLocalPlaces([apparelShop], filtersFor([placeCategory], false)),
      ).toEqual([]);
    }
    expect(filterLocalPlaces([apparelShop], filtersFor([], false))).toEqual([
      apparelShop,
    ]);
  });

  it("keeps the Online tab reading the online vocabulary", () => {
    expect(categoryForScope(handmadeShop, true)).toBe("handmade");
    expect(categoryForScope(apparelShop, true)).toBe("apparel");
    expect(
      filterLocalPlaces(
        [handmadeShop, apparelShop],
        filtersFor(["handmade"], true),
      ),
    ).toEqual([handmadeShop]);
    expect(
      filterLocalPlaces([handmadeShop], filtersFor(["design"], true)),
    ).toEqual([]);
  });
});

describe("isPlaceOpenNow", () => {
  it("never counts an online-only listing as open, whatever hours it kept", () => {
    const allWeek = Object.fromEntries(
      ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => [
        day,
        { open: true, intervals: [{ from: "00:00", to: "23:59" }] },
      ]),
    );
    const onlinePlace = businessToLocal(
      { ...DIRECTORY_PLACES[0]!, online: true, hours: allWeek },
      true,
    );
    expect(isPlaceOpenNow(onlinePlace)).toBe(false);
  });
});

describe("sortLocalPlaces by neighbourhood", () => {
  it("puts places with no neighbourhood last", () => {
    const [first, second] = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    const noHood = { ...first!, neighbourhood: "", name: "A first by name" };
    const withHood = { ...second!, neighbourhood: "Graça" };
    expect(sortLocalPlaces([noHood, withHood], "hood")).toEqual([
      withHood,
      noHood,
    ]);
  });
});

describe("appendUniquePlaces", () => {
  it("adds only the places not already there", () => {
    const [first, second] = DIRECTORY_PLACES.map((place) =>
      businessToLocal(place, true),
    );
    expect(appendUniquePlaces([first!], [first!, second!])).toEqual([
      first,
      second,
    ]);
  });
});
