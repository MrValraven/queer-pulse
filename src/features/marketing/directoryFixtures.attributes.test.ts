import { describe, expect, it } from "vitest";
import { DIRECTORY_PLACES } from "./directoryPlaces";
import { ADULT_ONLINE_DIRECTORY_PLACES } from "./directoryOnlinePlaces.data";
import {
  isSensitiveAttribute,
  LOCAL_ATTRIBUTE_VOCABULARY,
  offeredAttributeGroups,
} from "./listBusiness/listingAttributes.data";
import {
  hasCoverCategory,
  LISTING_LANGUAGE_CODES,
} from "./listBusiness/listingFacts.data";
import { isSaferSpacePolicyUrlValid } from "./listBusiness/listingFactsMissing";
import { listingKindOf } from "./listBusiness/listingMobile.data";

const FIXTURES = [...DIRECTORY_PLACES, ...ADULT_ONLINE_DIRECTORY_PLACES];
const LANGUAGE_CODES: readonly string[] = LISTING_LANGUAGE_CODES;

describe("demo fixtures", () => {
  it("tick only attributes their kind and category are offered", () => {
    for (const place of FIXTURES) {
      const offered = new Set(
        offeredAttributeGroups(
          LOCAL_ATTRIBUTE_VOCABULARY,
          listingKindOf(place),
          [place.cat],
        ).flatMap((group) => group.attributes),
      );
      for (const slug of place.attributes ?? []) {
        expect(offered.has(slug), `${place.slug}: ${slug}`).toBe(true);
      }
    }
  });

  it("pick at most three highlights among their own, never a sensitive one", () => {
    for (const place of FIXTURES) {
      const highlights = place.highlights ?? [];
      expect(highlights.length, place.slug).toBeLessThanOrEqual(3);
      for (const slug of highlights) {
        expect(place.attributes ?? [], `${place.slug}: ${slug}`).toContain(
          slug,
        );
        expect(isSensitiveAttribute(slug), `${place.slug}: ${slug}`).toBe(
          false,
        );
      }
    }
  });

  it("speak in language codes", () => {
    for (const place of FIXTURES) {
      for (const code of place.langs ?? []) {
        expect(LANGUAGE_CODES, `${place.slug}: ${code}`).toContain(code);
      }
    }
  });

  it("keep online listings free of a way in and of ways to pay", () => {
    for (const place of FIXTURES.filter((entry) => entry.online === true)) {
      expect(place.entryMode ?? null, place.slug).toBeNull();
      expect(place.payments ?? [], place.slug).toEqual([]);
    }
  });

  it("answer cover only with nightlife or culture, and link every published policy", () => {
    for (const place of FIXTURES) {
      if (place.coverPolicy) {
        expect(hasCoverCategory([place.cat]), place.slug).toBe(true);
      }
      const hasPolicy = (place.inclusionPractices ?? []).includes(
        "safer-space-policy",
      );
      expect(Boolean(place.saferSpacePolicyUrl), place.slug).toBe(hasPolicy);
      if (place.saferSpacePolicyUrl) {
        expect(
          isSaferSpacePolicyUrlValid(place.saferSpacePolicyUrl),
          place.slug,
        ).toBe(true);
      }
    }
  });

  it("say Hosts gatherings only where a gathering is listed", () => {
    for (const place of FIXTURES) {
      if (place.hostsGatherings) {
        expect((place.upcoming ?? []).length, place.slug).toBeGreaterThan(0);
      }
    }
  });

  it("cover every way in, every way to pay, Cash only and a sensitive attribute", () => {
    for (const mode of [
      "walkIn",
      "bookingRecommended",
      "appointmentOnly",
      "membersOnly",
    ]) {
      expect(
        FIXTURES.some((place) => place.entryMode === mode),
        mode,
      ).toBe(true);
    }
    for (const method of ["card", "mbway", "multibanco", "cash"]) {
      expect(
        FIXTURES.some((place) =>
          (place.payments ?? []).some((entry) => entry === method),
        ),
        method,
      ).toBe(true);
    }
    expect(
      FIXTURES.some(
        (place) =>
          (place.payments ?? []).length === 1 && place.payments?.[0] === "cash",
      ),
    ).toBe(true);
    expect(
      FIXTURES.some((place) =>
        (place.attributes ?? []).some((slug) => isSensitiveAttribute(slug)),
      ),
    ).toBe(true);
  });

  it("carry one nightlife fixture with a late close, a free-before cover and a policy link", () => {
    const place = DIRECTORY_PLACES.find(
      (entry) => entry.slug === "noite-aberta",
    );
    expect(place?.cat).toBe("nightlife");
    expect(place?.coverPolicy).toBe("freeBefore");
    expect(place?.coverFreeBefore).toBe("23:00");
    expect(place?.highlights).toHaveLength(3);
    expect(place?.saferSpacePolicyUrl).toMatch(/^https:\/\//);
    expect(place?.hours?.Sat?.intervals[0]?.to).toBe("06:00");
  });
});
