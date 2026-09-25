import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import {
  filterTagGroups,
  LISTING_TAG_GROUP_LABEL_KEYS,
  LISTING_TAG_GROUPS,
  LISTING_TAG_LABEL_KEYS,
  listingTagGroupLabel,
  listingTagLabel,
  splitLegacyTags,
} from "./listingTags.data";

/** A stand-in translator: a few Portuguese labels, the key itself otherwise. */
const PORTUGUESE_LABELS: Record<string, string> = {
  "marketing:listBusiness.tag.glutenFreeOptions": "Opções sem glúten",
  "marketing:listBusiness.tag.terrace": "Esplanada",
  "marketing:listBusiness.tagGroup.foodDrink": "Comida e bebida",
};
const translate: TFunction = (key) => PORTUGUESE_LABELS[key] ?? key;

const ALL_TAGS = LISTING_TAG_GROUPS.flatMap((group) => group.tags);

describe("LISTING_TAG_GROUPS", () => {
  it("holds the five groups in display order", () => {
    expect(LISTING_TAG_GROUPS.map((group) => group.id)).toEqual([
      "visiting",
      "happening",
      "foodDrink",
      "pricing",
      "languages",
    ]);
    expect(ALL_TAGS).toHaveLength(32);
  });

  it("gives every tag an i18n key", () => {
    const tagsWithoutKey = ALL_TAGS.filter(
      (tag) => !LISTING_TAG_LABEL_KEYS[tag],
    );
    expect(tagsWithoutKey).toEqual([]);
  });

  it("gives every group an i18n key", () => {
    const groupsWithoutKey = LISTING_TAG_GROUPS.filter(
      (group) => !LISTING_TAG_GROUP_LABEL_KEYS[group.id],
    );
    expect(groupsWithoutKey).toEqual([]);
  });

  it("keeps every tag to 24 characters at most", () => {
    const longTags = ALL_TAGS.filter((tag) => tag.length > 24);
    expect(longTags).toEqual([]);
  });

  it("keeps tags unique ignoring case", () => {
    const loweredTags = ALL_TAGS.map((tag) => tag.toLowerCase());
    expect(new Set(loweredTags).size).toBe(loweredTags.length);
  });
});

describe("listingTagLabel and listingTagGroupLabel", () => {
  it("translate a known tag and group", () => {
    expect(listingTagLabel(translate, "Terrace")).toBe("Esplanada");
    expect(listingTagGroupLabel(translate, "foodDrink")).toBe(
      "Comida e bebida",
    );
  });

  it("fall back to the raw string for anything outside the maps", () => {
    expect(listingTagLabel(translate, "Bookshop")).toBe("Bookshop");
    expect(listingTagGroupLabel(translate, "unknownGroup")).toBe(
      "unknownGroup",
    );
  });
});

describe("filterTagGroups", () => {
  it("returns every group for a blank query", () => {
    expect(filterTagGroups(LISTING_TAG_GROUPS, "   ", translate)).toEqual(
      LISTING_TAG_GROUPS,
    );
  });

  it("matches the stored string case-insensitively and drops empty groups", () => {
    const groups = filterTagGroups(LISTING_TAG_GROUPS, "SPOKEN", translate);
    expect(groups.map((group) => group.id)).toEqual(["languages"]);
    expect(groups[0]?.tags).toEqual([
      "Portuguese spoken",
      "English spoken",
      "Spanish spoken",
      "French spoken",
    ]);
  });

  it("matches the translated label, accents folded", () => {
    const groups = filterTagGroups(LISTING_TAG_GROUPS, "GLÚTEN", translate);
    expect(groups).toEqual([
      { id: "foodDrink", tags: ["Gluten-free options"] },
    ]);
    const byLabel = filterTagGroups(LISTING_TAG_GROUPS, "esplan", translate);
    expect(byLabel).toEqual([{ id: "foodDrink", tags: ["Terrace"] }]);
  });

  it("returns no groups when nothing matches", () => {
    expect(filterTagGroups(LISTING_TAG_GROUPS, "zzz", translate)).toEqual([]);
  });

  it("works on server groups typed with a plain string id", () => {
    const serverGroups = [{ id: "extra", tags: ["Rooftop", "Garden"] }];
    expect(filterTagGroups(serverGroups, "roof", translate)).toEqual([
      { id: "extra", tags: ["Rooftop"] },
    ]);
  });
});

describe("splitLegacyTags", () => {
  it("returns the selected tags outside the vocabulary, in order", () => {
    expect(
      splitLegacyTags(
        ["Bookshop", "Terrace", "Queer-run", "Workshops"],
        LISTING_TAG_GROUPS,
      ),
    ).toEqual(["Bookshop", "Queer-run"]);
  });

  it("compares exactly, so a differently cased older tag stays legacy", () => {
    expect(splitLegacyTags(["terrace"], LISTING_TAG_GROUPS)).toEqual([
      "terrace",
    ]);
  });

  it("returns nothing when every tag is in the vocabulary", () => {
    expect(
      splitLegacyTags(["Live music", "Sliding scale"], LISTING_TAG_GROUPS),
    ).toEqual([]);
  });
});
