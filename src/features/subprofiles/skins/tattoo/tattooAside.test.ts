import { describe, expect, it } from "vitest";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { SkinData } from "../../api/subprofiles.api";
import { hasTattooSidebar, isTattooBookShown } from "./tattooAside";
import { buildTattooView } from "./tattooView";

// Unrun per repo policy: verified statically.

const TODAY = "2026-10-19";

function makeData(
  skinData: SkinData | null,
  guestSpots: SubprofileItemView[] = [],
): PublicSubprofileView {
  return {
    id: "persona-1",
    kind: "tattoo_artist",
    slug: "inkwell",
    handle: "inkwell",
    displayName: "Mariana",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "public",
    visibility: "open",
    status: "published",
    sections:
      guestSpots.length > 0
        ? [
            {
              section: "guest_spots",
              labelKey: "subprofiles:section.guest_spots",
              icon: (() => null) as never,
              fields: [],
              items: guestSpots,
            },
          ]
        : [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData,
  } as unknown as PublicSubprofileView;
}

function guestSpot(date: string): SubprofileItemView {
  return {
    id: `spot-${date}`,
    section: "guest_spots",
    title: "Tinta Viva",
    createdAt: "2026-10-01T00:00:00.000Z",
    subtitle: "Lisbon",
    description: "",
    url: "",
    imageUrl: "",
    date,
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
  };
}

const emptyView = () => buildTattooView(makeData(null), TODAY);

describe("isTattooBookShown", () => {
  it("shows How to book to a visitor once the booking block has content", () => {
    const view = buildTattooView(
      makeData({ tattooBooking: { replyTime: "within 3 days" } }),
      TODAY,
    );
    expect(isTattooBookShown(view, "public")).toBe(true);
  });

  it("hides How to book from a visitor while the booking block is empty", () => {
    expect(isTattooBookShown(emptyView(), "public")).toBe(false);
    expect(isTattooBookShown(emptyView(), "visitor")).toBe(false);
  });

  it("always shows the owner How to book", () => {
    expect(isTattooBookShown(emptyView(), "owner")).toBe(true);
  });
});

describe("hasTattooSidebar", () => {
  it("drops the sidebar for a visitor of an empty persona", () => {
    expect(hasTattooSidebar(emptyView(), "public")).toBe(false);
  });

  it("keeps the sidebar for the owner of an empty persona", () => {
    expect(hasTattooSidebar(emptyView(), "owner")).toBe(true);
  });

  it("shows the sidebar for a books status alone", () => {
    const view = buildTattooView(
      makeData({ tattoo: { status: "open" } }),
      TODAY,
    );
    expect(hasTattooSidebar(view, "public")).toBe(true);
  });

  it("shows the sidebar for the studio city alone", () => {
    const view = buildTattooView(
      makeData({ tattooStudio: { city: "Lisbon" } }),
      TODAY,
    );
    expect(hasTattooSidebar(view, "public")).toBe(true);
  });

  it("shows the sidebar for an upcoming guest spot alone", () => {
    const view = buildTattooView(
      makeData(null, [guestSpot("2026-11-03")]),
      TODAY,
    );
    expect(hasTattooSidebar(view, "public")).toBe(true);
  });

  it("drops the sidebar when every guest spot is past", () => {
    const view = buildTattooView(
      makeData(null, [guestSpot("2026-09-03")]),
      TODAY,
    );
    expect(hasTattooSidebar(view, "public")).toBe(false);
  });
});
