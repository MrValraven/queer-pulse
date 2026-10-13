import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import {
  attributeLabel,
  carriedAttributesOutsideOffer,
  filterableAttributeGroupsFor,
  filterAttributeGroups,
  groupAttributesForDisplay,
  isFilterableAttribute,
  isHighlightableAttribute,
  LISTING_ATTRIBUTE_GROUP_IDS,
  LISTING_ATTRIBUTE_GROUP_LABEL_KEYS,
  LISTING_ATTRIBUTE_GROUPS,
  LISTING_ATTRIBUTE_LABEL_KEYS,
  LISTING_ATTRIBUTE_SLUGS,
  LOCAL_ATTRIBUTE_VOCABULARY,
  normalizeAttributeVocabulary,
  offeredAttributeGroups,
  PREMISES_ONLY_ATTRIBUTE_SLUGS,
  SENSITIVE_ATTRIBUTE_SLUGS,
  withAttributeToggled,
  withHighlightToggled,
} from "./listingAttributes.data";

const t: TFunction = (key) => key;
const groupIds = (groups: readonly { id: string }[]) =>
  groups.map((group) => group.id);
const slugsOf = (groups: readonly { attributes: readonly string[] }[]) =>
  groups.flatMap((group) => group.attributes);

describe("the vocabulary", () => {
  it("holds 88 slugs, each in at least one group, each group in table order", () => {
    expect(LISTING_ATTRIBUTE_SLUGS).toHaveLength(88);
    expect(new Set(LISTING_ATTRIBUTE_SLUGS).size).toBe(88);
    expect(new Set(slugsOf(LISTING_ATTRIBUTE_GROUPS))).toEqual(
      new Set(LISTING_ATTRIBUTE_SLUGS),
    );
    expect(groupIds(LISTING_ATTRIBUTE_GROUPS)).toEqual([
      ...LISTING_ATTRIBUTE_GROUP_IDS,
    ]);
  });

  it("labels every slug and every group", () => {
    expect(Object.keys(LISTING_ATTRIBUTE_LABEL_KEYS).sort()).toEqual(
      [...LISTING_ATTRIBUTE_SLUGS].sort(),
    );
    for (const groupId of LISTING_ATTRIBUTE_GROUP_IDS) {
      expect(LISTING_ATTRIBUTE_GROUP_LABEL_KEYS[groupId], groupId).toMatch(
        /^marketing:listingAttribute\.group\./,
      );
    }
  });

  it("keeps the premises-only and sensitive sets inside the vocabulary", () => {
    for (const slug of [
      ...PREMISES_ONLY_ATTRIBUTE_SLUGS,
      ...SENSITIVE_ATTRIBUTE_SLUGS,
    ]) {
      expect(LISTING_ATTRIBUTE_SLUGS, slug).toContain(slug);
    }
    expect(PREMISES_ONLY_ATTRIBUTE_SLUGS).toHaveLength(14);
  });

  it("never lets a sensitive slug be a highlight or a filter", () => {
    for (const slug of SENSITIVE_ATTRIBUTE_SLUGS) {
      expect(isHighlightableAttribute(slug)).toBe(false);
      expect(isFilterableAttribute(slug)).toBe(false);
    }
    expect(isFilterableAttribute("terrace")).toBe(true);
    expect(isFilterableAttribute("bogus")).toBe(false);
  });
});

describe("offeredAttributeGroups", () => {
  it("offers a barbershop the universal, grooming and pricing groups, pricing last", () => {
    const groups = offeredAttributeGroups(LOCAL_ATTRIBUTE_VOCABULARY, "place", [
      "grooming",
    ]);
    expect(groupIds(groups)).toEqual(["around", "grooming", "pricing"]);
    expect(slugsOf(groups)).not.toContain("dj-nights");
    expect(slugsOf(groups)).not.toContain("vegan-options");
  });

  it("shows a slug two offered groups share once, in the first", () => {
    const groups = offeredAttributeGroups(LOCAL_ATTRIBUTE_VOCABULARY, "place", [
      "nightlife",
      "food",
    ]);
    const shared = slugsOf(groups).filter(
      (slug) => slug === "alcohol-free-drinks",
    );
    expect(shared).toHaveLength(1);
    expect(groups.find((group) => group.id === "food")?.attributes).toContain(
      "alcohol-free-drinks",
    );
  });

  it("never offers a premises-only slug to an out-and-about listing", () => {
    const groups = offeredAttributeGroups(
      LOCAL_ATTRIBUTE_VOCABULARY,
      "mobile",
      ["grooming"],
    );
    for (const slug of PREMISES_ONLY_ATTRIBUTE_SLUGS) {
      expect(slugsOf(groups), slug).not.toContain(slug);
    }
    expect(slugsOf(groups)).toContain("kid-friendly");
  });

  it("offers an online food shop the online groups, in table order", () => {
    expect(
      groupIds(
        offeredAttributeGroups(LOCAL_ATTRIBUTE_VOCABULARY, "online", ["food"]),
      ),
    ).toEqual([
      "onlineOffering",
      "onlineFood",
      "onlineOrdering",
      "onlineSessions",
      "pricing",
    ]);
  });
});

describe("a category change", () => {
  it("keeps ticked attributes the new categories do not offer as carried", () => {
    const groups = offeredAttributeGroups(LOCAL_ATTRIBUTE_VOCABULARY, "place", [
      "grooming",
    ]);
    expect(
      carriedAttributesOutsideOffer(
        ["vegan-options", "terrace", "makeup", "something-retired"],
        groups,
      ),
    ).toEqual(["vegan-options", "something-retired"]);
  });
});

describe("ticking and highlights", () => {
  it("drops a highlight when its attribute is unticked", () => {
    expect(
      withAttributeToggled(
        { attributes: ["terrace", "wifi"], highlights: ["terrace"] },
        "terrace",
      ),
    ).toEqual({ attributes: ["wifi"], highlights: [] });
  });

  it("appends a new tick and stops at forty", () => {
    expect(
      withAttributeToggled({ attributes: ["wifi"], highlights: [] }, "terrace"),
    ).toEqual({ attributes: ["wifi", "terrace"], highlights: [] });
    const forty = LISTING_ATTRIBUTE_SLUGS.slice(0, 40);
    expect(
      withAttributeToggled({ attributes: forty, highlights: [] }, "insured")
        .attributes,
    ).toHaveLength(40);
  });

  it("picks only ticked, non-sensitive attributes, three at most", () => {
    const attributes = [
      "terrace",
      "wifi",
      "dog-friendly",
      "kid-friendly",
      "sexual-health-prep",
    ];
    expect(
      withHighlightToggled(
        { attributes, highlights: [] },
        "sexual-health-prep",
      ),
    ).toEqual([]);
    expect(
      withHighlightToggled({ attributes, highlights: [] }, "halal"),
    ).toEqual([]);
    expect(
      withHighlightToggled(
        { attributes, highlights: ["terrace", "wifi", "dog-friendly"] },
        "kid-friendly",
      ),
    ).toEqual(["terrace", "wifi", "dog-friendly"]);
    expect(
      withHighlightToggled(
        { attributes, highlights: ["terrace", "wifi"] },
        "terrace",
      ),
    ).toEqual(["wifi"]);
  });

  it("leaves a stored sensitive highlight out of the cap of three", () => {
    const attributes = [
      "terrace",
      "wifi",
      "dog-friendly",
      "sexual-health-prep",
    ];
    expect(
      withHighlightToggled(
        { attributes, highlights: ["sexual-health-prep", "terrace", "wifi"] },
        "dog-friendly",
      ),
    ).toEqual(["terrace", "wifi", "dog-friendly"]);
  });
});

describe("search", () => {
  it("matches the translated label with accents folded, and drops empty groups", () => {
    const portuguese: TFunction = (key) =>
      key === "marketing:listingAttribute.glutenFreeOptions"
        ? "Opções sem glúten"
        : key;
    const groups = offeredAttributeGroups(LOCAL_ATTRIBUTE_VOCABULARY, "place", [
      "food",
    ]);
    const found = filterAttributeGroups(groups, "gluten", portuguese);
    expect(groupIds(found)).toEqual(["food"]);
    expect(slugsOf(found)).toEqual(["gluten-free-options"]);
    expect(filterAttributeGroups(groups, "  ", t)).toEqual(groups);
  });
});

describe("groupAttributesForDisplay", () => {
  it("puts each attribute under its group, in group order, and unknown ones last", () => {
    expect(
      groupAttributesForDisplay(
        [
          "sexual-health-prep",
          "wifi",
          "sliding-scale",
          "terrace",
          "retired-one",
        ],
        "place",
      ),
    ).toEqual([
      { groupId: "around", attributes: ["terrace", "wifi"] },
      { groupId: "health", attributes: ["sexual-health-prep"] },
      { groupId: "pricing", attributes: ["sliding-scale"] },
      { groupId: "other", attributes: ["retired-one"] },
    ]);
  });

  it("reads a shared slug under the group of the listing's kind", () => {
    expect(groupAttributesForDisplay(["workshops"], "online")).toEqual([
      { groupId: "onlineOffering", attributes: ["workshops"] },
    ]);
  });

  it("files a shared slug under the listing's own category group when given its categories", () => {
    const groupOf = (slug: string, cats: readonly string[]) =>
      groupAttributesForDisplay(
        [slug],
        "place",
        LOCAL_ATTRIBUTE_VOCABULARY,
        cats,
      ).map((entry) => entry.groupId);
    expect(groupOf("alcohol-free-drinks", ["nightlife"])).toEqual([
      "nightlife",
    ]);
    expect(groupOf("repairs", ["tech"])).toEqual(["tech"]);
    expect(groupOf("second-hand", ["design"])).toEqual(["design"]);
  });

  it("falls back to the kind's first group for a slug the categories do not offer", () => {
    expect(
      groupAttributesForDisplay(
        ["vegan-options", "makeup"],
        "place",
        LOCAL_ATTRIBUTE_VOCABULARY,
        ["grooming"],
      ),
    ).toEqual([
      { groupId: "food", attributes: ["vegan-options"] },
      { groupId: "grooming", attributes: ["makeup"] },
    ]);
  });

  it("keeps the first group in display order when no categories are given", () => {
    expect(groupAttributesForDisplay(["alcohol-free-drinks"], "place")).toEqual(
      [{ groupId: "food", attributes: ["alcohol-free-drinks"] }],
    );
    expect(groupAttributesForDisplay(["repairs"], "place")).toEqual([
      { groupId: "design", attributes: ["repairs"] },
    ]);
    expect(groupAttributesForDisplay(["second-hand"], "place")).toEqual([
      { groupId: "culture", attributes: ["second-hand"] },
    ]);
  });
});

describe("filterableAttributeGroupsFor", () => {
  it("offers the universal and pricing groups when no category is chosen", () => {
    expect(
      groupIds(
        filterableAttributeGroupsFor(LOCAL_ATTRIBUTE_VOCABULARY, {
          categories: [],
          isOnlineScope: false,
        }),
      ),
    ).toEqual(["around", "pricing"]);
    expect(
      groupIds(
        filterableAttributeGroupsFor(LOCAL_ATTRIBUTE_VOCABULARY, {
          categories: [],
          isOnlineScope: true,
        }),
      ),
    ).toEqual([
      "onlineOffering",
      "onlineOrdering",
      "onlineSessions",
      "pricing",
    ]);
  });

  it("offers a chosen category's groups first, then Around the place and Pricing, with no sensitive slug", () => {
    const groups = filterableAttributeGroupsFor(LOCAL_ATTRIBUTE_VOCABULARY, {
      categories: ["health"],
      isOnlineScope: false,
    });
    expect(groupIds(groups)).toEqual(["health", "around", "pricing"]);
    expect(slugsOf(groups)).not.toContain("sexual-health-prep");
    expect(slugsOf(groups)).not.toContain("trans-care-experience");
  });

  it("shows a slug two chosen categories share once, in the first group", () => {
    const groups = filterableAttributeGroupsFor(LOCAL_ATTRIBUTE_VOCABULARY, {
      categories: ["nightlife", "food"],
      isOnlineScope: false,
    });
    expect(groupIds(groups)).toEqual([
      "food",
      "nightlife",
      "around",
      "pricing",
    ]);
    expect(
      slugsOf(groups).filter((slug) => slug === "alcohol-free-drinks"),
    ).toHaveLength(1);
    expect(new Set(slugsOf(groups)).size).toBe(slugsOf(groups).length);
  });

  it("puts the online universal groups under an online category's group", () => {
    expect(
      groupIds(
        filterableAttributeGroupsFor(LOCAL_ATTRIBUTE_VOCABULARY, {
          categories: ["food"],
          isOnlineScope: true,
        }),
      ),
    ).toEqual([
      "onlineFood",
      "onlineOffering",
      "onlineOrdering",
      "onlineSessions",
      "pricing",
    ]);
  });
});

describe("normalizeAttributeVocabulary", () => {
  it("answers null for a body that is no vocabulary", () => {
    expect(normalizeAttributeVocabulary(null)).toBeNull();
    expect(normalizeAttributeVocabulary({ groups: [] })).toBeNull();
    expect(normalizeAttributeVocabulary([{ id: "visiting" }])).toBeNull();
  });

  it("keeps the server's groups and never forgets a sensitive slug", () => {
    const vocabulary = normalizeAttributeVocabulary({
      groups: [
        {
          id: "around",
          kinds: ["place", "mobile", "spaceship"],
          categories: null,
          attributes: ["terrace", 4],
        },
      ],
      premisesOnly: ["terrace"],
      sensitive: [],
      inclusionPractices: [],
      languages: ["pt"],
      commonLanguages: ["pt"],
    });
    expect(vocabulary?.groups).toEqual([
      {
        id: "around",
        kinds: ["place", "mobile"],
        categories: null,
        attributes: ["terrace"],
      },
    ]);
    expect(vocabulary?.sensitive).toEqual([...SENSITIVE_ATTRIBUTE_SLUGS]);
  });
});

describe("attributeLabel", () => {
  it("reads a known slug through its key and humanises an unknown one", () => {
    expect(attributeLabel(t, "dog-friendly")).toBe(
      "marketing:listingAttribute.dogFriendly",
    );
    expect(attributeLabel(t, "rooftop-cinema")).toBe("Rooftop cinema");
  });
});
