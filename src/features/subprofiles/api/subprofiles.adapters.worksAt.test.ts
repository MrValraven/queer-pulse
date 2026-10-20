import { describe, expect, it } from "vitest";
import { publicSubprofileToView } from "./subprofiles.adapters";
import type { SubprofilePublicDTO } from "./subprofiles.api";

function makePublicDto(): SubprofilePublicDTO {
  return {
    id: "sp-public",
    kind: "tattoo_artist",
    slug: "agulha-lenta",
    handle: "agulha-lenta",
    displayName: "Agulha Lenta",
    avatarUrl: null,
    tagline: null,
    bio: null,
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    items: [],
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
  };
}

describe("publicSubprofileToView and works at", () => {
  it("maps works at links with their listing page", () => {
    const view = publicSubprofileToView({
      ...makePublicDto(),
      worksAt: [
        {
          slug: "tinta-viva",
          name: "Tinta Viva",
          cat: "grooming",
          coverPhoto: null,
          tint: "jade",
          av: "TV",
          roleLabel: "Apprentice",
        },
      ],
    });
    expect(view.worksAt).toHaveLength(1);
    expect(view.worksAt?.[0]).toMatchObject({
      slug: "tinta-viva",
      href: "/local/directory/tinta-viva",
      roleLabel: "Apprentice",
      imageUrl: null,
    });
  });

  it("reads a view without works at as empty", () => {
    expect(publicSubprofileToView(makePublicDto()).worksAt).toEqual([]);
  });
});
