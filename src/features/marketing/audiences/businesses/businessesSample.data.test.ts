import { describe, expect, it } from "vitest";
import type { Language } from "../../../../shared/i18n/types";
import { DIRECTORY_PLACES } from "../../directoryPlaces";
import {
  listingKindOf,
  type ListingKind,
} from "../../listBusiness/listingMobile.data";
import { loadTestT } from "../shared/testing/audienceTestUtils";
import {
  buildSampleBusiness,
  buildSampleCoManagers,
  buildSampleReview,
  buildSampleTeamThread,
  buildSampleThread,
} from "./businessesSample.data";

const LANGUAGES: readonly Language[] = ["en", "pt"];
const KINDS: readonly ListingKind[] = ["place", "online", "mobile"];
const TODAY = new Date(2026, 9, 27);
const DEMO_USER_PHOTO = "photo-1500648767791-00dcc994a43e";
const BANNED_KEY = /^(tips?|sustain\w*|payouts?|listening\w*)$/i;

async function everySample(language: Language) {
  const t = await loadTestT(language, ["forBusinesses", "marketing"]);
  return {
    places: KINDS.map((kind) => buildSampleBusiness(t, kind, TODAY)),
    review: buildSampleReview(t, TODAY),
    thread: buildSampleThread(t),
    teamThread: buildSampleTeamThread(t),
    coManagers: buildSampleCoManagers(TODAY),
  };
}

/** Every object key anywhere under `value`. */
function allKeys(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(allKeys);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) => [
      key,
      ...allKeys(child),
    ]);
  }
  return [];
}

describe("businesses sample data honesty guard", () => {
  it.each(LANGUAGES)(
    "%s: no real people, places or demo photo",
    async (language) => {
      const serialized = JSON.stringify(await everySample(language));
      expect(serialized).not.toMatch(/Tiago|ILGA|Trumps|Cevicheria/i);
      expect(serialized).not.toContain(DEMO_USER_PHOTO);
    },
  );

  it.each(LANGUAGES)(
    "%s: no name or slug of a directory entry",
    async (language) => {
      const { places } = await everySample(language);
      const directoryNames = new Set(
        DIRECTORY_PLACES.map((entry) => entry.name),
      );
      const directorySlugs = new Set(
        DIRECTORY_PLACES.map((entry) => entry.slug),
      );
      for (const place of places) {
        expect(directoryNames.has(place.name)).toBe(false);
        expect(directorySlugs.has(place.slug)).toBe(false);
      }
    },
  );

  it.each(LANGUAGES)(
    "%s: no tip, sustain, payout or listening fields",
    async (language) => {
      const offenders = allKeys(await everySample(language)).filter((key) =>
        BANNED_KEY.test(key),
      );
      expect(offenders).toEqual([]);
    },
  );

  it.each(LANGUAGES)(
    "%s: every https URL is an Unsplash image",
    async (language) => {
      const serialized = JSON.stringify(await everySample(language));
      const urls = serialized.match(/https:\/\/[^"\s]+/g) ?? [];
      expect(urls.length).toBeGreaterThan(0);
      for (const url of urls) {
        expect(url.startsWith("https://images.unsplash.com/")).toBe(true);
      }
    },
  );

  it("each kind builds a listing of that kind", async () => {
    const t = await loadTestT("en", ["forBusinesses", "marketing"]);
    for (const kind of KINDS) {
      expect(listingKindOf(buildSampleBusiness(t, kind, TODAY))).toBe(kind);
    }
  });

  it("the review carries an owner reply", async () => {
    const t = await loadTestT("en", ["forBusinesses"]);
    expect(buildSampleReview(t, TODAY).ownerReply?.text).toBeTruthy();
  });
});
