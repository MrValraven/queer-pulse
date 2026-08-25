import { FiStar } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";

// Unrun per repo policy (`do-not-run-tests-unless-asked`) — verified statically.

function makeItem(
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView {
  return {
    id: "item-test",
    section: "showcase",
    title: "Untitled",
    createdAt: "2025-01-01T00:00:00.000Z",
    subtitle: "",
    description: "",
    url: "",
    imageUrl: "",
    date: "",
    meta: "",
    tags: [],
    isFeatured: false,
    collaborators: [],
    venue: null,
    doors: null,
    ticketUrl: null,
    gigState: null,
    medium: null,
    dimensions: null,
    edition: null,
    workState: null,
    structured: null,
    ...overrides,
  };
}

function makeSection(
  itemCount: number,
  overrides: Partial<SubprofileSectionView> = {},
): SubprofileSectionView {
  return {
    section: "showcase",
    labelKey: "subprofiles:section.showcase",
    icon: FiStar,
    fields: [],
    items: Array.from({ length: itemCount }, () => makeItem()),
    ...overrides,
  };
}

const READY_BIO =
  "A bio that is long enough to clear the eighty character minimum readiness threshold easily.";

const SOCIAL_LINK = {
  platform: "instagram",
  urlOrHandle: "@kai",
};

describe("estimateDraftReadiness", () => {
  it("does not give a linked persona a free full ring — it counts real completeness (no handle requirement)", () => {
    // A brand-new linked persona (only a display name) is 0% complete, not 100%.
    expect(
      estimateDraftReadiness({
        linkVisibility: "linked",
        handle: null,
        avatarUrl: null,
        bio: "",
        coverUrl: null,
        availability: null,
        socialLinks: [],
        sections: [],
      }),
    ).toEqual({ readyCount: 0, totalCount: 6 });

    // Fully filled out, a linked persona reaches 100% without needing a handle.
    expect(
      estimateDraftReadiness({
        linkVisibility: "linked",
        handle: null,
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: READY_BIO,
        coverUrl: "https://cdn.example.com/cover.png",
        availability: "open_to_collabs",
        socialLinks: [SOCIAL_LINK],
        sections: [makeSection(3)],
      }),
    ).toEqual({ readyCount: 6, totalCount: 6 });
  });

  it("reports a full ring for an unlinked persona only when every signal — including polish — is met", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        handle: "kai-studio",
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: READY_BIO,
        coverUrl: "https://cdn.example.com/cover.png",
        availability: "open_to_collabs",
        socialLinks: [SOCIAL_LINK],
        sections: [makeSection(3)],
      }),
    ).toEqual({ readyCount: 7, totalCount: 7 });
  });

  it("counts polish signals (cover, availability, socials) as part of the estimate", () => {
    // Publish-ready on the blocking requirements (handle/avatar/bio/items), but
    // missing all three polish items — so the ring must sit below 100.
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        handle: "kai-studio",
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: READY_BIO,
        coverUrl: null,
        availability: null,
        socialLinks: [],
        sections: [makeSection(3)],
      }),
    ).toEqual({ readyCount: 4, totalCount: 7 });
  });

  it("reports partial readiness for an unlinked persona (public PublicSubprofileView shape, the draft-banner callsite)", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        handle: null,
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: "Too short.",
        coverUrl: null,
        availability: null,
        socialLinks: [],
        sections: [makeSection(1)],
      }),
    ).toEqual({ readyCount: 1, totalCount: 7 });
  });

  it("excludes the universal 'links' section from the content-item count", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        handle: "kai-studio",
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: READY_BIO,
        coverUrl: null,
        availability: null,
        socialLinks: [],
        sections: [
          makeSection(0, { section: "showcase" }),
          makeSection(3, { section: "links" }),
        ],
      }),
    ).toEqual({ readyCount: 3, totalCount: 7 });
  });
});
