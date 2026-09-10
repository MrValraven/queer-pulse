import { describe, expect, it } from "vitest";
import { gatherings as gatheringsEn } from "../../shared/i18n/catalogs/en/gatherings";
import { gatherings as gatheringsPt } from "../../shared/i18n/catalogs/pt/gatherings";
import {
  allowedDetailKeys,
  familyForLegacyLabel,
  findFormat,
  FORMAT_DETAIL_HINT_KEYS,
  FORMAT_DETAIL_LABEL_KEYS,
  formatLabel,
  formatsForFamily,
  GATHERING_FAMILIES,
  GATHERING_FORMATS,
  hasAnyDetail,
  OTHER_FORMAT_NAME_KEY,
  OTHER_FORMAT_SUB_KEY,
  stripDisallowedDetails,
  TERRAIN_LABEL_KEYS,
  type GatheringFamily,
} from "./gatheringCatalog";

/**
 * The one vocabulary a gathering is described in.
 *
 * Format keys are STORED VALUES: they go into `events.event_type` and come
 * back out of it, so a duplicate key or a renamed one silently reclassifies
 * real gatherings. Icons are how a host scans 56 cards, so two formats sharing
 * one glyph makes the grid unreadable. And every key here has to resolve in
 * BOTH catalogs, or a host picks a card labelled with a raw key string.
 */

/** Strip the `gatherings:` namespace a catalog file does not carry. */
function bareKey(namespacedKey: string): string {
  return namespacedKey.replace(/^gatherings:/, "");
}

describe("gatheringCatalog", () => {
  it("declares 56 curated formats", () => {
    expect(GATHERING_FORMATS).toHaveLength(56);
  });

  it("gives every format a unique key", () => {
    const keys = GATHERING_FORMATS.map((format) => format.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("gives every format a unique icon", () => {
    const icons = GATHERING_FORMATS.map((format) => format.icon);
    expect(new Set(icons).size).toBe(icons.length);
  });

  it("files every format under one of the nine families", () => {
    const familyKeys = new Set(GATHERING_FAMILIES.map((family) => family.key));
    expect(familyKeys.size).toBe(9);
    for (const format of GATHERING_FORMATS) {
      expect(familyKeys.has(format.family)).toBe(true);
    }
  });

  it("leaves no family without at least one format", () => {
    for (const family of GATHERING_FAMILIES) {
      expect(formatsForFamily(family.key).length).toBeGreaterThan(0);
    }
  });

  it("names every format in both catalogs", () => {
    for (const format of GATHERING_FORMATS) {
      expect(gatheringsEn[bareKey(format.nameKey)]).toBeTruthy();
      expect(gatheringsPt[bareKey(format.nameKey)]).toBeTruthy();
      expect(gatheringsEn[bareKey(format.subKey)]).toBeTruthy();
      expect(gatheringsPt[bareKey(format.subKey)]).toBeTruthy();
    }
  });

  it("names every family in both catalogs", () => {
    for (const family of GATHERING_FAMILIES) {
      expect(gatheringsEn[bareKey(family.nameKey)]).toBeTruthy();
      expect(gatheringsPt[bareKey(family.nameKey)]).toBeTruthy();
    }
  });

  it("names every key outside the two arrays in both catalogs", () => {
    for (const key of [
      OTHER_FORMAT_NAME_KEY,
      OTHER_FORMAT_SUB_KEY,
      "gatherings:catalog.format.unset",
      ...Object.values(TERRAIN_LABEL_KEYS),
      ...Object.values(FORMAT_DETAIL_LABEL_KEYS),
      ...Object.values(FORMAT_DETAIL_HINT_KEYS),
    ]) {
      expect(gatheringsEn[bareKey(key)]).toBeTruthy();
      expect(gatheringsPt[bareKey(key)]).toBeTruthy();
    }
  });

  describe("formatLabel", () => {
    /** A stand-in resolver: returns the EN catalog string, or the key when
     *  there is none, which is exactly what the real `t` does. */
    const translate = (key: string) => gatheringsEn[bareKey(key)] ?? key;

    it("resolves a curated key to its translated name", () => {
      expect(formatLabel(translate, "supper-club")).toBe("Supper club");
    });

    it("falls back to the host's own words verbatim", () => {
      expect(formatLabel(translate, "Sapphic chess ladder")).toBe(
        "Sapphic chess ladder",
      );
    });

    it("reads an unset format as the generic word", () => {
      expect(formatLabel(translate, null)).toBe("Gathering");
      expect(formatLabel(translate, "")).toBe("Gathering");
      expect(formatLabel(translate, undefined)).toBe("Gathering");
    });
  });

  describe("familyForLegacyLabel", () => {
    it("covers all eight labels the old wizard could store", () => {
      expect(familyForLegacyLabel("Supper club")).toBe("eat");
      expect(familyForLegacyLabel("Workshop / talk")).toBe("learn");
      expect(familyForLegacyLabel("Screening")).toBe("watch");
      expect(familyForLegacyLabel("Studio visit")).toBe("make");
      expect(familyForLegacyLabel("Walk or outdoor")).toBe("move");
      expect(familyForLegacyLabel("Discussion")).toBe("learn");
      expect(familyForLegacyLabel("Skills exchange")).toBe("learn");
      expect(familyForLegacyLabel("Other")).toBeUndefined();
    });

    it("matches case-insensitively, as the migration does", () => {
      expect(familyForLegacyLabel("supper CLUB")).toBe("eat");
    });

    it("leaves anything else unclassified", () => {
      expect(familyForLegacyLabel("Sapphic chess ladder")).toBeUndefined();
      expect(familyForLegacyLabel(null)).toBeUndefined();
    });
  });

  describe("findFormat", () => {
    it("finds a curated format by key", () => {
      expect(findFormat("walk-or-hike")?.family).toBe("move");
    });

    it("finds nothing for a host's own words", () => {
      expect(findFormat("Sapphic chess ladder")).toBeUndefined();
      expect(findFormat(null)).toBeUndefined();
    });
  });

  describe("the details bag", () => {
    it("matches the backend's per-family table exactly", () => {
      const detailKeysByFamily: Record<GatheringFamily, string[]> = {
        meet: [],
        eat: ["bring"],
        party: ["isAdultsOnly", "isSoberFriendly"],
        make: ["bring"],
        learn: [],
        watch: ["runtimeMinutes"],
        move: ["terrain", "isBeginnerFriendly"],
        care: [],
        organise: [],
      };
      for (const family of GATHERING_FAMILIES) {
        expect(allowedDetailKeys(family.key)).toEqual(
          detailKeysByFamily[family.key],
        );
      }
    });

    it("strips keys the family does not allow", () => {
      expect(
        stripDisallowedDetails("move", {
          terrain: "steep",
          isBeginnerFriendly: true,
          bring: "water",
        }),
      ).toEqual({ terrain: "steep", isBeginnerFriendly: true });
    });

    it("stores a surviving bring trimmed, as the backend does", () => {
      expect(stripDisallowedDetails("eat", { bring: "  a salad  " })).toEqual({
        bring: "a salad",
      });
    });

    it("reads a blank bring as no answer at all", () => {
      expect(stripDisallowedDetails("eat", { bring: "   " })).toBeNull();
    });

    it("collapses an empty result to null", () => {
      expect(stripDisallowedDetails("learn", { bring: "a pen" })).toBeNull();
      expect(stripDisallowedDetails(null, { bring: "a pen" })).toBeNull();
      expect(stripDisallowedDetails("eat", null)).toBeNull();
    });
  });

  describe("hasAnyDetail", () => {
    it("reads an answered question as an answer", () => {
      expect(hasAnyDetail({ bring: "a salad" })).toBe(true);
      expect(hasAnyDetail({ runtimeMinutes: 92 })).toBe(true);
    });

    it("reads a whitespace-only bring as no answer, as stripping does", () => {
      expect(hasAnyDetail({ bring: "   " })).toBe(false);
    });

    it("reads a false boolean as no answer, since nothing prints it", () => {
      expect(hasAnyDetail({ isAdultsOnly: false })).toBe(false);
    });

    it("reads an empty bag, and no bag at all, as no answer", () => {
      expect(hasAnyDetail({})).toBe(false);
      expect(hasAnyDetail(null)).toBe(false);
      expect(hasAnyDetail(undefined)).toBe(false);
    });
  });

  describe("family defaults", () => {
    it("carries the capacity default the spec sets for each family", () => {
      const capacityByFamily: Record<GatheringFamily, number> = {
        care: 10,
        eat: 12,
        make: 12,
        move: 15,
        learn: 20,
        organise: 25,
        meet: 30,
        watch: 30,
        party: 40,
      };
      for (const family of GATHERING_FAMILIES) {
        expect(family.capacityDefault).toBe(capacityByFamily[family.key]);
      }
    });

    it("hides the attendee count only for care and support", () => {
      for (const family of GATHERING_FAMILIES) {
        expect(family.isAttendeeCountShownByDefault).toBe(
          family.key !== "care",
        );
      }
    });
  });
});
