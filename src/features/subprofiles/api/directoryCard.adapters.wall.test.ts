import { describe, expect, it } from "vitest";
import { selectWallTiles } from "./directoryCard.adapters";
import type { SubprofileCardDTO } from "./subprofiles.api";

// Unrun per repo policy (`do-not-run-tests-unless-asked`): verified statically.

function makeCard(overrides: Partial<SubprofileCardDTO>): SubprofileCardDTO {
  return {
    id: "sp-test",
    handle: "test-persona",
    linkVisibility: "unlinked",
    ownerSlug: null,
    ownerName: null,
    slug: "test-persona",
    kind: "photographer",
    displayName: "Test Persona",
    avatarUrl: null,
    coverUrl: null,
    tagline: null,
    accent: "plum",
    availability: null,
    socialCount: 0,
    tags: [],
    followerCount: 0,
    ...overrides,
  };
}

const photoCard = makeCard({
  id: "sp-photo",
  handle: "photo-persona",
  slug: "photo-persona",
  displayName: "Photo Persona",
  avatarUrl: "https://images.example/photo.jpg",
});

const tintCard = makeCard({
  id: "sp-tint",
  handle: "tint-persona",
  slug: "tint-persona",
  displayName: "Tint Persona",
});

const tenCards = Array.from({ length: 10 }, (_unused, index) =>
  makeCard({
    id: `sp-card-${index}`,
    handle: `card-${index}`,
    slug: `card-${index}`,
    displayName: `Card ${index}`,
  }),
);

describe("selectWallTiles", () => {
  it("keeps the server's order whether or not a card has a photo", () => {
    expect(
      selectWallTiles([tintCard, photoCard], 9).map((tile) => tile.key),
    ).toEqual([tintCard.id, photoCard.id]);
  });

  it("cuts the wall to the limit", () => {
    const tiles = selectWallTiles(tenCards, 9);
    expect(tiles).toHaveLength(9);
    expect(tiles.map((tile) => tile.key)).toEqual(
      tenCards.slice(0, 9).map((card) => card.id),
    );
  });

  it("draws the photo on a photo card and leaves a tint card without one", () => {
    const [tintTile, photoTile] = selectWallTiles([tintCard, photoCard], 9);
    expect(tintTile?.image).toBeNull();
    expect(photoTile?.image?.src).toBe("https://images.example/photo.jpg");
  });
});
