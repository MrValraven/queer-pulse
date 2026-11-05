import { describe, expect, it } from "vitest";
import {
  publicSubprofileToView,
  subprofileToView,
} from "./subprofiles.adapters";
import type {
  SubprofileDTO,
  SubprofileItemDTO,
  SubprofilePublicDTO,
} from "./subprofiles.api";

/**
 * After a persona changes type, items can sit in sections the new kind hides.
 * Those items must never surface as the featured item.
 */

function makeItem(
  overrides: Partial<SubprofileItemDTO> &
    Pick<SubprofileItemDTO, "section" | "title">,
): SubprofileItemDTO {
  return {
    id: "item-test",
    createdAt: "2025-07-14T09:32:00.000Z",
    subtitle: null,
    description: null,
    url: null,
    imageUrl: null,
    date: null,
    meta: null,
    tags: [],
    isFeatured: false,
    collaborators: [],
    ...overrides,
  };
}

function makeDjDto(items: SubprofileItemDTO[]): SubprofileDTO {
  return {
    id: "sp-test-dj",
    kind: "dj",
    slug: "low-tide",
    handle: "low-tide",
    displayName: "Low Tide",
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
    position: 0,
    items,
    affiliations: [],
    endorsementCount: 0,
    followerCount: 0,
  };
}

function makePublicDjDto(items: SubprofileItemDTO[]): SubprofilePublicDTO {
  return {
    id: "sp-public-dj",
    kind: "dj",
    slug: "low-tide",
    handle: "low-tide",
    displayName: "Low Tide",
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
    items,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
  };
}

const hiddenFeaturedItem = makeItem({
  id: "item-hidden",
  section: "discography",
  title: "Threshold EP",
  isFeatured: true,
});

describe("featured item and sections the kind hides", () => {
  it("gives null for the owner view when the only featured item is hidden", () => {
    const view = subprofileToView(makeDjDto([hiddenFeaturedItem]));
    expect(view.featured).toBeNull();
  });

  it("gives null for the public view when the only featured item is hidden", () => {
    const view = publicSubprofileToView(makePublicDjDto([hiddenFeaturedItem]));
    expect(view.featured).toBeNull();
  });

  it("keeps a featured item that sits in a section the kind shows", () => {
    const shownFeaturedItem = makeItem({
      id: "item-shown",
      section: "mixes",
      title: "Night Bus Mix",
      isFeatured: true,
    });
    const items = [hiddenFeaturedItem, shownFeaturedItem];
    expect(subprofileToView(makeDjDto(items)).featured?.title).toBe(
      "Night Bus Mix",
    );
    expect(publicSubprofileToView(makePublicDjDto(items)).featured?.title).toBe(
      "Night Bus Mix",
    );
  });

  it("lists only the sections the kind shows for the owner view", () => {
    const view = subprofileToView(makeDjDto([hiddenFeaturedItem]));
    expect(view.sections.map((section) => section.section)).toEqual([
      "mixes",
      "gigs",
      "gallery",
    ]);
  });
});
