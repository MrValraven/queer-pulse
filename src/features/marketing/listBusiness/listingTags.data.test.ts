import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../shared/i18n/types";
import {
  filterTagGroups,
  LISTING_TAG_GROUP_LABEL_KEYS,
  LISTING_TAG_GROUPS,
  LISTING_TAG_LABEL_KEYS,
  listingTagGroupLabel,
  listingTagLabel,
  normalizeServerTagGroups,
  splitLegacyTags,
  tagGroupsForAudience,
} from "./listingTags.data";

/** A stand-in translator: a few Portuguese labels, the key itself otherwise. */
const PORTUGUESE_LABELS: Record<string, string> = {
  "marketing:listBusiness.tag.glutenFreeOptions": "Opções sem glúten",
  "marketing:listBusiness.tag.terrace": "Esplanada",
  "marketing:listBusiness.tagGroup.foodDrink": "Comida e bebida",
  "marketing:listBusiness.tagGroup.visiting": "Como visitar",
  "marketing:listBusiness.tagGroup.visitingOnline": "Como marcar",
};
const translate: TFunction = (key) => PORTUGUESE_LABELS[key] ?? key;

const PLACE_TAGS = LISTING_TAG_GROUPS.flatMap((group) => group.tags);
const ONLINE_TAGS = LISTING_TAG_GROUPS.flatMap((group) => group.onlineTags);
const ALL_TAGS = [...new Set([...PLACE_TAGS, ...ONLINE_TAGS])];
const PLACE_GROUPS = tagGroupsForAudience(LISTING_TAG_GROUPS, false);

describe("LISTING_TAG_GROUPS", () => {
  it("holds the seven groups in display order", () => {
    expect(LISTING_TAG_GROUPS.map((group) => group.id)).toEqual([
      "visiting",
      "happening",
      "foodDrink",
      "pricing",
      "ordering",
      "payment",
      "sessions",
    ]);
    expect(PLACE_TAGS).toHaveLength(27);
    expect(ONLINE_TAGS).toHaveLength(29);
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

  it("keeps tags unique ignoring case within each audience", () => {
    for (const audienceTags of [PLACE_TAGS, ONLINE_TAGS]) {
      const loweredTags = audienceTags.map((tag) => tag.toLowerCase());
      expect(new Set(loweredTags).size).toBe(loweredTags.length);
    }
  });

  it("keeps a tag shared by both audiences in the same group", () => {
    const misplaced = LISTING_TAG_GROUPS.flatMap((group) =>
      group.onlineTags.filter((tag) => {
        const placeGroup = LISTING_TAG_GROUPS.find((candidate) =>
          candidate.tags.includes(tag),
        );
        return placeGroup !== undefined && placeGroup.id !== group.id;
      }),
    );
    expect(misplaced).toEqual([]);
  });
});

describe("listingTagLabel and listingTagGroupLabel", () => {
  it("translate a known tag and group", () => {
    expect(listingTagLabel(translate, "Terrace")).toBe("Esplanada");
    expect(listingTagGroupLabel(translate, "foodDrink")).toBe(
      "Comida e bebida",
    );
  });

  it("use the online heading for an online listing where one exists", () => {
    expect(listingTagGroupLabel(translate, "visiting", true)).toBe(
      "Como marcar",
    );
    expect(listingTagGroupLabel(translate, "visiting", false)).toBe(
      "Como visitar",
    );
    expect(listingTagGroupLabel(translate, "foodDrink", true)).toBe(
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
    expect(filterTagGroups(PLACE_GROUPS, "   ", translate)).toEqual(
      PLACE_GROUPS,
    );
  });

  it("matches the stored string case-insensitively and drops empty groups", () => {
    const groups = filterTagGroups(PLACE_GROUPS, "OPTIONS", translate);
    expect(groups.map((group) => group.id)).toEqual(["foodDrink"]);
    expect(groups[0]?.tags).toEqual([
      "Vegan options",
      "Vegetarian options",
      "Gluten-free options",
      "Alcohol-free options",
    ]);
  });

  it("matches the translated label, accents folded", () => {
    const groups = filterTagGroups(PLACE_GROUPS, "GLÚTEN", translate);
    expect(groups).toEqual([
      { id: "foodDrink", tags: ["Gluten-free options"] },
    ]);
    const byLabel = filterTagGroups(PLACE_GROUPS, "esplan", translate);
    expect(byLabel).toEqual([{ id: "foodDrink", tags: ["Terrace"] }]);
  });

  it("returns no groups when nothing matches", () => {
    expect(filterTagGroups(PLACE_GROUPS, "zzz", translate)).toEqual([]);
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
        PLACE_GROUPS,
      ),
    ).toEqual(["Bookshop", "Queer-run"]);
  });

  it("compares exactly, so a differently cased older tag stays legacy", () => {
    expect(splitLegacyTags(["terrace"], PLACE_GROUPS)).toEqual(["terrace"]);
  });

  it("returns nothing when every tag is in the vocabulary", () => {
    expect(
      splitLegacyTags(["Live music", "Sliding scale"], PLACE_GROUPS),
    ).toEqual([]);
  });

  it("keeps a place tag on a listing since made online-only", () => {
    const onlineGroups = tagGroupsForAudience(LISTING_TAG_GROUPS, true);
    expect(
      splitLegacyTags(["Terrace", "Workshops", "MB WAY"], onlineGroups),
    ).toEqual(["Terrace"]);
  });
});

describe("tagGroupsForAudience", () => {
  it("offers an online listing each group's online tags", () => {
    const onlineGroups = tagGroupsForAudience(LISTING_TAG_GROUPS, true);
    const onlineTags = onlineGroups.flatMap((group) => group.tags);
    expect(onlineTags).not.toContain("Terrace");
    expect(onlineTags).not.toContain("DJ nights");
    expect(onlineTags).toContain("MB WAY");
    expect(onlineGroups[0]).toEqual({
      id: "visiting",
      tags: ["By appointment", "Memberships"],
    });
  });

  it("offers a place listing each group's place tags", () => {
    const placeTags = PLACE_GROUPS.flatMap((group) => group.tags);
    expect(placeTags).toContain("Terrace");
    expect(placeTags).not.toContain("MB WAY");
  });

  it("drops the groups left empty for the audience", () => {
    expect(PLACE_GROUPS.map((group) => group.id)).toEqual([
      "visiting",
      "happening",
      "foodDrink",
      "pricing",
    ]);
    const onlyPlaceGroup = [
      { id: "foodDrink", tags: ["Terrace"], onlineTags: [] },
    ];
    expect(tagGroupsForAudience(onlyPlaceGroup, true)).toEqual([]);
  });
});

describe("normalizeServerTagGroups", () => {
  it("reads a missing onlineTags list as empty", () => {
    const olderServerGroups = [{ id: "foodDrink", tags: ["Terrace"] }];
    const groups = normalizeServerTagGroups(olderServerGroups);
    expect(groups).toEqual([
      { id: "foodDrink", tags: ["Terrace"], onlineTags: [] },
    ]);
    expect(tagGroupsForAudience(groups, false)).toEqual([
      { id: "foodDrink", tags: ["Terrace"] },
    ]);
    expect(tagGroupsForAudience(groups, true)).toEqual([]);
  });

  it("keeps the online list a newer server sends", () => {
    const serverGroups = [
      { id: "payment", tags: [], onlineTags: ["MB WAY", "PayPal"] },
    ];
    expect(
      tagGroupsForAudience(normalizeServerTagGroups(serverGroups), true),
    ).toEqual([{ id: "payment", tags: ["MB WAY", "PayPal"] }]);
  });
});
