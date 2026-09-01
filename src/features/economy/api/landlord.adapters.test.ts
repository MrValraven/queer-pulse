import { beforeAll, describe, expect, it } from "vitest";
import { landlordDetailToLandlord } from "./landlord.adapters";
import { createFormatters } from "../../../shared/i18n/format";
import { catalogs, loadNamespace } from "../../../shared/i18n/catalogs";
import type { TFunction } from "../../../shared/i18n/types";
import type { LandlordDetailDTO, RecommendationDTO } from "./landlord.api";

/**
 * A minimal `t` over the real `en` catalog, matching `jobs.adapters.test.ts`,
 * so a key that goes missing fails here too.
 */
let economyCatalog = catalogs.en.economy;
beforeAll(async () => {
  economyCatalog = await loadNamespace("en", "economy");
});

const t: TFunction = (key, options) => {
  const [, path] = key.split(":");
  const value = economyCatalog?.[path ?? ""] ?? key;
  return Object.entries(options ?? {}).reduce(
    (accumulated, [token, replacement]) =>
      accumulated.replace(`{${token}}`, String(replacement)),
    value,
  );
};
const fmt = createFormatters("en-GB");

function makeRecommendationDTO(
  overrides: Partial<RecommendationDTO> = {},
): RecommendationDTO {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Ana Reis",
    initials: "AR",
    tint: "plum",
    member: {
      slug: "ana-reis",
      firstName: "Ana",
      lastName: "Reis",
      avatarUrl: null,
    },
    stars: 5,
    text: "Never once asked who my partner was.",
    createdAt: "2026-03-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeDetailDTO(
  recommendations: RecommendationDTO[],
): LandlordDetailDTO {
  return {
    slug: "senhor-costa",
    name: "Senhor Costa",
    initials: "SC",
    tint: "plum",
    photo: null,
    hood: "Arroios",
    note: "",
    tagline: "",
    rating: { score: "5.0", count: recommendations.length },
    about: [],
    areas: [],
    rentingNote: "",
    stats: [],
    recommendations,
  };
}

describe("landlordDetailToLandlord", () => {
  // The id is what lets a member point a complaint at ONE recommendation. Drop
  // it in the adapter and the card silently falls back to the entry-level
  // report control, whose takedown withholds every other tenant's warning about
  // the same landlord.
  it("carries each recommendation's report handle through to the card", () => {
    const landlord = landlordDetailToLandlord(
      makeDetailDTO([makeRecommendationDTO()]),
      t,
      fmt,
    );

    expect(landlord.recommendations[0]?.id).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
  });

  it("marks a recommendation whose author has erased their account", () => {
    const landlord = landlordDetailToLandlord(
      makeDetailDTO([
        makeRecommendationDTO({ member: null, name: "", initials: "" }),
      ]),
      t,
      fmt,
    );

    // The warning survives its author leaving: the stars and the text stand,
    // only the byline is gone.
    expect(landlord.recommendations[0]).toMatchObject({
      isAuthorRemoved: true,
      stars: 5,
      text: "Never once asked who my partner was.",
    });
  });

  it("leaves a recommendation with a live author unmarked", () => {
    const landlord = landlordDetailToLandlord(
      makeDetailDTO([makeRecommendationDTO()]),
      t,
      fmt,
    );

    expect(landlord.recommendations[0]?.isAuthorRemoved).toBe(false);
  });

  // An erased author belongs to nobody, so the withdraw control must not appear
  // on their entry for whoever happens to be reading.
  it("never treats an author-less recommendation as the reader's own", () => {
    const landlord = landlordDetailToLandlord(
      makeDetailDTO([makeRecommendationDTO({ member: null, name: "" })]),
      t,
      fmt,
      "ana-reis",
    );

    expect(landlord.recommendations[0]?.isMine).toBe(false);
  });
});
