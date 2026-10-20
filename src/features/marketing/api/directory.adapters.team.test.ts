import { describe, expect, it } from "vitest";
import type { Formatters } from "../../../shared/i18n/format";
import { detailDtoToPlace } from "./directory.adapters";
import type { DirectoryDetailDTO } from "./directory.api";

const fmt = {
  date: () => "Sun 21 Jun",
  time: () => "20:00",
} as unknown as Formatters;

function makeDetailDto(): DirectoryDetailDTO {
  return {
    id: "uuid-1",
    slug: "tinta-viva",
    name: "Tinta Viva",
    cat: "grooming",
    hood: "Marvila",
    blurb: "A tattoo studio.",
    tint: "jade",
    av: "TV",
    owned: true,
    queerOwnedVerified: false,
    memberFirst: null,
    latitude: null,
    longitude: null,
    safeSpaceStatus: "none",
    safeSpaceTier: null,
    tagline: "",
    timezone: null,
    gallery: [],
    whatItIs: [],
    hoursType: "gallery",
    hoursNote: "",
    owner: {
      name: "",
      initials: "",
      tint: "coral",
      role: "",
      bio: "",
      inQueerPulse: false,
      first: "",
    },
    social: { instagram: "", website: "", email: "", phone: "" },
    address: "",
    rating: { score: "0", count: 0 },
    reviews: [],
    upcoming: [],
    photos: { wide: null, d1: null, d2: null, vibe: null },
    alt: { wide: "", d1: "", d2: "", vibe: "" },
    hours: {},
    langs: [],
    savedCount: 0,
    safeSpaceVerifier: null,
    safeSpaceReVerifiedAt: null,
    safeSpaceSub: null,
    safeSpacePromises: [],
    safeSpaceVouches: [],
    safeSpaceRemoval: null,
  };
}

describe("detailDtoToPlace and the team", () => {
  it("maps the detail team in page order", () => {
    const place = detailDtoToPlace(
      {
        ...makeDetailDto(),
        team: [
          {
            persona: {
              id: "sp-1",
              handle: "rosa-brava",
              displayName: "Rosa Brava",
              kind: "tattoo_artist",
              avatarUrl: null,
            },
            roleLabel: "Resident artist",
          },
          {
            persona: {
              id: "sp-2",
              handle: "linha-fina",
              displayName: "Linha Fina",
              kind: "tattoo_artist",
              avatarUrl: null,
            },
            roleLabel: null,
          },
        ],
      },
      fmt,
    );
    expect(place.team?.map((member) => member.persona.handle)).toEqual([
      "rosa-brava",
      "linha-fina",
    ]);
    expect(place.team?.map((member) => member.persona.href)).toEqual([
      "/p/rosa-brava",
      "/p/linha-fina",
    ]);
    expect(place.team?.[0]?.roleLabel).toBe("Resident artist");
  });

  it("reads a detail without a team as an empty team", () => {
    expect(detailDtoToPlace(makeDetailDto(), fmt).team).toEqual([]);
  });
});
