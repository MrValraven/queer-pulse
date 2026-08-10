import { FiStar } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import { estimateDraftReadiness } from "./subprofileDraftReadiness";
import type {
  SubprofileItemView,
  SubprofileSectionView,
} from "./api/subprofiles.adapters";

// Unrun per repo policy (`do-not-run-tests-unless-asked`) — verified statically.

function makeItem(overrides: Partial<SubprofileItemView> = {}): SubprofileItemView {
  return {
    section: "showcase",
    title: "Untitled",
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

describe("estimateDraftReadiness", () => {
  it("reports a 1-requirement checklist for a linked persona (displayName only)", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "linked",
        displayName: "Kai",
        handle: null,
        avatarUrl: null,
        bio: "",
        sections: [],
      }),
    ).toEqual({ readyCount: 1, totalCount: 1 });

    expect(
      estimateDraftReadiness({
        linkVisibility: "linked",
        displayName: "   ",
        handle: null,
        avatarUrl: null,
        bio: "",
        sections: [],
      }),
    ).toEqual({ readyCount: 0, totalCount: 1 });
  });

  it("reports every client-checkable requirement met for an unlinked persona (owner SubprofileView shape)", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        displayName: "Kai's Studio",
        handle: "kai-studio",
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: READY_BIO,
        sections: [makeSection(3)],
      }),
    ).toEqual({ readyCount: 4, totalCount: 4 });
  });

  it("reports partial readiness for an unlinked persona (public PublicSubprofileView shape, the existing draft-banner callsite)", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        displayName: "Kai's Studio",
        handle: null,
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: "Too short.",
        sections: [makeSection(1)],
      }),
    ).toEqual({ readyCount: 1, totalCount: 4 });
  });

  it("excludes the universal 'links' section from the content-item count", () => {
    expect(
      estimateDraftReadiness({
        linkVisibility: "unlinked",
        displayName: "Kai's Studio",
        handle: "kai-studio",
        avatarUrl: "https://cdn.example.com/avatar.png",
        bio: READY_BIO,
        sections: [
          makeSection(0, { section: "showcase" }),
          makeSection(3, { section: "links" }),
        ],
      }),
    ).toEqual({ readyCount: 3, totalCount: 4 });
  });
});
