import { describe, expect, it } from "vitest";
import {
  buildSections,
  itemsToInputDto,
  ownerViewToShowcaseView,
  publicSubprofileToView,
  subprofileToView,
  type SubprofileItemView,
} from "./subprofiles.adapters";
import type {
  CollaboratorDTO,
  SubprofileDTO,
  SubprofileItemDTO,
  SubprofilePublicDTO,
} from "./subprofiles.api";

/**
 * Pure DTO→view-model adapter logic — no providers, no network. Locks down the
 * normalization (nulls → "" / []), the single-featured lookup, the per-kind
 * section grouping (empty-section drop vs `includeEmpty`), the owner→showcase
 * viewer-relative defaults, and the editor's items→input mapping (empty
 * optionals omitted, collaborators flattened to handle strings). These are the
 * seams the public view, the editor, and the duplicate/vCard flows all sit on,
 * so a drift here silently corrupts every consuming screen.
 */

function makeItem(
  overrides: Partial<SubprofileItemDTO> & Pick<SubprofileItemDTO, "section" | "title">,
): SubprofileItemDTO {
  return {
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

/** A musician DTO (sections: discography, gigs) with a single featured
 *  discography track, no gig rows, and one stray `links` item (no longer a
 *  produced section, so it is dropped) — plus null identity fields so the ""
 *  normalization is exercised. */
function makeMusicianDto(overrides: Partial<SubprofileDTO> = {}): SubprofileDTO {
  return {
    id: "sp-test-musician",
    kind: "musician",
    slug: "nightform",
    handle: "nightform",
    displayName: "NIGHTFORM",
    avatarUrl: null,
    tagline: null,
    bio: null,
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: null,
    ctaUrl: null,
    socialLinks: [{ platform: "bandcamp", urlOrHandle: "nightform" }],
    linkVisibility: "unlinked",
    visibility: "open",
    status: "published",
    position: 0,
    items: [
      makeItem({
        section: "discography",
        title: "Threshold EP",
        tags: ["techno"],
        isFeatured: true,
      }),
      makeItem({ section: "links", title: "Bandcamp", url: "https://x.test" }),
    ],
    affiliations: [],
    endorsementCount: 3,
    followerCount: 41,
    ...overrides,
  };
}

describe("buildSections", () => {
  it("drops empty sections in public mode, keeping kind order", () => {
    const items = [
      makeItem({ section: "discography", title: "Threshold EP" }),
      makeItem({ section: "links", title: "Bandcamp" }),
    ];
    const sections = buildSections(items, "musician");
    // Only discography is present; the stray `links` item is dropped (`links`
    // is no longer a produced section) and the empty `gigs` section is dropped.
    expect(sections.map((section) => section.section)).toEqual(["discography"]);
  });

  it("keeps every allowed section (in kind order) with includeEmpty for the editor", () => {
    const items = [makeItem({ section: "discography", title: "Threshold EP" })];
    const sections = buildSections(items, "musician", { includeEmpty: true });
    expect(sections.map((section) => section.section)).toEqual([
      "discography",
      "gigs",
    ]);
    // The empty section still surfaces its metadata (label key + no items).
    const gigs = sections.find((section) => section.section === "gigs");
    expect(gigs?.labelKey).toBe("subprofiles:section.gigs");
    expect(gigs?.items).toEqual([]);
  });
});

describe("subprofileToView", () => {
  it("normalizes null identity fields to empty strings and finds the featured item", () => {
    const view = subprofileToView(makeMusicianDto());
    expect(view.tagline).toBe("");
    expect(view.bio).toBe("");
    expect(view.ctaLabel).toBe("");
    expect(view.ctaUrl).toBe("");
    expect(view.featured?.title).toBe("Threshold EP");
    expect(view.endorsementCount).toBe(3);
    expect(view.followerCount).toBe(41);
    // Owner view is includeEmpty, so the empty `gigs` section is still present.
    expect(view.sections.map((section) => section.section)).toEqual([
      "discography",
      "gigs",
    ]);
  });

  it("returns a null featured item when no item is flagged", () => {
    const dto = makeMusicianDto({
      items: [makeItem({ section: "discography", title: "Static Bloom" })],
    });
    expect(subprofileToView(dto).featured).toBeNull();
  });
});

describe("publicSubprofileToView", () => {
  function makePublicDto(
    overrides: Partial<SubprofilePublicDTO> = {},
  ): SubprofilePublicDTO {
    return {
      id: "sp-public",
      kind: "developer",
      slug: "engineering",
      handle: null,
      displayName: "Rui Marçal",
      avatarUrl: null,
      tagline: "Backend & infrastructure",
      bio: null,
      coverUrl: null,
      accent: null,
      availability: null,
      ctaLabel: null,
      ctaUrl: null,
      socialLinks: [],
      linkVisibility: "linked",
      status: "published",
      items: [makeItem({ section: "projects", title: "Tide" })],
      affiliations: [],
      endorsementCount: 0,
      viewerEndorsed: false,
      followerCount: 6,
      viewerFollowing: true,
      viewerIsMember: false,
      ...overrides,
    };
  }

  it("carries owner identity through only when the DTO provides it (linked)", () => {
    const view = publicSubprofileToView(
      makePublicDto({ ownerSlug: "rui", ownerName: "Rui Marçal" }),
    );
    expect(view.ownerSlug).toBe("rui");
    expect(view.ownerName).toBe("Rui Marçal");
    expect(view.viewerFollowing).toBe(true);
    // Public grouping drops empty sections: only the populated `projects` remains.
    expect(view.sections.map((section) => section.section)).toEqual(["projects"]);
  });

  it("omits owner identity entirely for an unlinked persona", () => {
    const view = publicSubprofileToView(
      makePublicDto({ linkVisibility: "unlinked" }),
    );
    expect(view.ownerSlug).toBeUndefined();
    expect(view.ownerName).toBeUndefined();
  });
});

describe("ownerViewToShowcaseView", () => {
  it("stamps the self owner slug and neutralizes viewer-relative flags", () => {
    const ownerView = subprofileToView(makeMusicianDto());
    const showcase = ownerViewToShowcaseView(ownerView, "diogo");
    expect(showcase.ownerSlug).toBe("diogo");
    // The owner-as-visitor has no endorsed/following state; the card reads
    // `isSelf` instead, but these must default false, not leak true.
    expect(showcase.viewerEndorsed).toBe(false);
    expect(showcase.viewerFollowing).toBe(false);
    // The signed-in owner is trivially a member of their own persona.
    expect(showcase.viewerIsMember).toBe(true);
    expect(showcase.featured?.title).toBe("Threshold EP");
  });
});

describe("Phase 0 skin-specific fields (plumbing only, no UI yet)", () => {
  it("carries item gig/structured fields and persona skinData through the owner adapter unchanged", () => {
    const dto = makeMusicianDto({
      items: [
        makeItem({
          section: "gigs",
          title: "Rrraw · Warehouse",
          venue: "Warehouse, Lisbon",
          doors: "22:00",
          ticketUrl: "https://example.com/tickets",
          gigState: "sold_out",
          structured: {
            courses: [
              { n: "1", name: "Set", dishes: [{ title: "Opener" }] },
            ],
          },
        }),
        makeItem({ section: "links", title: "Bandcamp", url: "https://x.test" }),
      ],
      skinData: {
        booker: {
          fee: "€400",
          rider: "Two decks, a mixer, a dark room.",
          press: "https://example.com/press",
          contact: "booking@nightform.example",
        },
      },
    });

    const view = subprofileToView(dto);
    const gigsSection = view.sections.find(
      (section) => section.section === "gigs",
    );
    const gigItem = gigsSection?.items[0];
    expect(gigItem?.venue).toBe("Warehouse, Lisbon");
    expect(gigItem?.doors).toBe("22:00");
    expect(gigItem?.ticketUrl).toBe("https://example.com/tickets");
    expect(gigItem?.gigState).toBe("sold_out");
    expect(gigItem?.structured?.courses?.[0]?.name).toBe("Set");
    expect(view.skinData?.booker?.fee).toBe("€400");
  });

  it("defaults absent item/skin fields to null rather than undefined", () => {
    const view = subprofileToView(makeMusicianDto());
    const discographyItem = view.sections.find(
      (section) => section.section === "discography",
    )?.items[0];
    expect(discographyItem?.venue).toBeNull();
    expect(discographyItem?.gigState).toBeNull();
    expect(discographyItem?.structured).toBeNull();
    expect(view.skinData).toBeNull();
  });

  it("carries skinData through publicSubprofileToView unchanged", () => {
    const publicDto: SubprofilePublicDTO = {
      id: "sp-public",
      kind: "developer",
      slug: "engineering",
      handle: null,
      displayName: "Rui Marçal",
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
      status: "published",
      items: [],
      affiliations: [],
      endorsementCount: 0,
      viewerEndorsed: false,
      followerCount: 0,
      viewerFollowing: false,
      viewerIsMember: false,
      skinData: { colophon: "Set in Fraunces." },
    };
    expect(publicSubprofileToView(publicDto).skinData?.colophon).toBe(
      "Set in Fraunces.",
    );
  });
});

describe("itemsToInputDto", () => {
  it("omits empty optionals and flattens collaborators to handle strings", () => {
    const collaborator: CollaboratorDTO = {
      handle: "rui",
      type: "member",
      name: "Rui Marçal",
      avatarUrl: null,
      slug: "rui",
    };
    const full: SubprofileItemView = {
      section: "discography",
      title: "Threshold EP",
      subtitle: "Penumbra Records",
      description: "",
      url: "https://x.test",
      imageUrl: "",
      date: "2025",
      meta: "",
      tags: ["techno", "vinyl"],
      isFeatured: true,
      collaborators: [collaborator],
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
    const minimal: SubprofileItemView = {
      section: "discography",
      title: "Static Bloom",
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
    };

    const [fullDto, minimalDto] = itemsToInputDto([full, minimal]);

    expect(fullDto).toEqual({
      title: "Threshold EP",
      subtitle: "Penumbra Records",
      url: "https://x.test",
      date: "2025",
      tags: ["techno", "vinyl"],
      isFeatured: true,
      collaborators: ["rui"],
    });
    // Empty optionals + a false `isFeatured` collapse to a title-only payload.
    expect(minimalDto).toEqual({ title: "Static Bloom" });
    expect(minimalDto).not.toHaveProperty("isFeatured");
    expect(minimalDto).not.toHaveProperty("collaborators");
  });

  it("round-trips the Phase-0 rich fields on a section resave (Phase 3 fix)", () => {
    // Regression guard for the `TODO(Phase 3 editor)` gap: a full-section
    // resave used to silently drop gigState/venue/medium/workState/structured
    // because `itemsToInputDto` never forwarded them.
    const gigItem: SubprofileItemView = {
      section: "gigs",
      title: "Rrraw · Warehouse",
      subtitle: "",
      description: "",
      url: "",
      imageUrl: "",
      date: "",
      meta: "",
      tags: [],
      isFeatured: false,
      collaborators: [],
      venue: "Warehouse, Lisbon",
      doors: "22:00",
      ticketUrl: "https://example.com/tickets",
      gigState: "sold_out",
      medium: null,
      dimensions: null,
      edition: null,
      workState: null,
      structured: null,
    };
    const projectItem: SubprofileItemView = {
      section: "projects",
      title: "Tide",
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
      medium: "Oil on canvas",
      dimensions: "60x80cm",
      edition: null,
      workState: "shipped",
      structured: { courses: null, snippet: ["First line.", "Second line."] },
    };

    const [gigDto, projectDto] = itemsToInputDto([gigItem, projectItem]);

    expect(gigDto).toEqual({
      title: "Rrraw · Warehouse",
      venue: "Warehouse, Lisbon",
      doors: "22:00",
      ticketUrl: "https://example.com/tickets",
      gigState: "sold_out",
    });
    expect(projectDto).toEqual({
      title: "Tide",
      medium: "Oil on canvas",
      dimensions: "60x80cm",
      workState: "shipped",
      structured: { courses: null, snippet: ["First line.", "Second line."] },
    });
  });
});
