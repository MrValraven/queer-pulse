import { describe, expect, it } from "vitest";
import { FiStar } from "react-icons/fi";
import type { TherapistCardVM } from "../../../resources/therapistPersonaCard";
import type {
  PublicSubprofileView,
  SubprofileItemView,
  SubprofileSectionView,
} from "../../api/subprofiles.adapters";
import type { SubprofileSection } from "../../api/subprofiles.api";
import {
  rankSimilarTherapists,
  stableHash,
  therapistTopicSet,
} from "./rankSimilarTherapists";
import {
  isTherapistStatusFresh,
  STATUS_CONFIRMED_WITHIN_DAYS,
} from "./therapistStatusFreshness";

/** The fixed clock every ranking below reads freshness against. */
const NOW = Date.parse("2026-10-06T12:00:00.000Z");
const DAY_IN_MILLISECONDS = 24 * 60 * 60 * 1000;
const isoDaysBeforeNow = (days: number) =>
  new Date(NOW - days * DAY_IN_MILLISECONDS).toISOString();

function makeCard(
  slug: string,
  overrides: Partial<TherapistCardVM> = {},
): TherapistCardVM {
  return {
    id: null,
    handle: slug,
    slug,
    ownerSlug: null,
    href: `/p/${slug}`,
    name: slug,
    initials: slug.slice(0, 2).toUpperCase(),
    avatarUrl: null,
    creds: null,
    acceptingNew: false,
    availability: null,
    availabilityUpdatedAt: isoDaysBeforeNow(5),
    specs: [],
    langs: [],
    note: null,
    format: null,
    ...overrides,
  };
}

function makeItem(
  section: SubprofileSection,
  title: string,
  tags: string[] = [],
): SubprofileItemView {
  return {
    id: `${section}-${title}`,
    section,
    title,
    createdAt: "2026-09-01T00:00:00.000Z",
    subtitle: "",
    description: "",
    url: "",
    imageUrl: "",
    date: "",
    meta: "",
    tags,
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

function makeSection(
  section: SubprofileSection,
  items: SubprofileItemView[],
): SubprofileSectionView {
  return { section, labelKey: section, icon: FiStar, fields: [], items };
}

function makeView(
  overrides: Partial<PublicSubprofileView> = {},
): PublicSubprofileView {
  return {
    id: "sp-therapist",
    kind: "therapist",
    slug: "sofia",
    handle: "sofia",
    displayName: "Sofia",
    avatarUrl: null,
    tagline: "",
    bio: "",
    coverUrl: null,
    accent: null,
    availability: null,
    ctaLabel: "",
    ctaUrl: "",
    socialLinks: [],
    linkVisibility: "unlinked",
    status: "published",
    visibility: "open",
    sections: [],
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: null,
    ...overrides,
  };
}

const slugsOf = (cards: TherapistCardVM[]) => cards.map((card) => card.slug);

describe("therapistTopicSet", () => {
  it("gathers specialism titles, item tags and modality ids, folded", () => {
    const view = makeView({
      sections: [
        makeSection("specialisms", [
          makeItem("specialisms", " Gender Identity "),
        ]),
        makeSection("credentials", [
          makeItem("credentials", "MSc", ["Trauma"]),
        ]),
      ],
      skinData: {
        approach: ["I work at your pace."],
        modalities: ["EMDR"],
      },
    });
    expect([...therapistTopicSet(view)].sort()).toEqual([
      "emdr",
      "gender identity",
      "trauma",
    ]);
  });

  it("leaves out link items and folds accents", () => {
    const view = makeView({
      sections: [
        makeSection("links", [makeItem("links", "My site", ["Promo"])]),
        makeSection("specialisms", [
          makeItem("specialisms", "Ansiedade Social"),
        ]),
        makeSection("credentials", [
          makeItem("credentials", "OPP", ["Luto é"]),
        ]),
      ],
    });
    const topics = therapistTopicSet(view);
    expect(topics.has("promo")).toBe(false);
    expect(topics.has("ansiedade social")).toBe(true);
    expect(topics.has("luto e")).toBe(true);
  });
});

describe("stableHash", () => {
  it("returns the same unsigned number for the same text", () => {
    expect(stableHash("sofia|/p/ana")).toBe(stableHash("sofia|/p/ana"));
    expect(stableHash("sofia|/p/ana")).toBeGreaterThanOrEqual(0);
    expect(stableHash("sofia|/p/ana")).not.toBe(stableHash("sofia|/p/rui"));
  });
});

describe("rankSimilarTherapists", () => {
  const topics = new Set(["trauma", "gender identity"]);

  it("ranks cards with more shared topics first, whatever their order", () => {
    const cards = [
      makeCard("none", { availability: "open", specs: ["Couples"] }),
      makeCard("one", { specs: ["Trauma"] }),
      makeCard("two", { specs: ["Gender identity", "TRAUMA"] }),
    ];
    const ranked = rankSimilarTherapists({
      now: NOW,
      cards,
      topics,
      currentSlug: "sofia",
      limit: 3,
    });
    expect(slugsOf(ranked)).toEqual(["two", "one", "none"]);
  });

  it("puts open therapists ahead within the same relevance", () => {
    const cards = [
      makeCard("waiting", { availability: "wait", specs: ["Trauma"] }),
      makeCard("closed", { availability: "closed", specs: ["Trauma"] }),
      makeCard("open", { availability: "open", specs: ["Trauma"] }),
    ];
    const ranked = rankSimilarTherapists({
      now: NOW,
      cards,
      topics,
      currentSlug: "sofia",
      limit: 3,
    });
    expect(ranked[0]?.slug).toBe("open");
  });

  it("breaks the remaining ties by a rotation seeded from the page", () => {
    const cards = Array.from({ length: 12 }, (_, index) =>
      makeCard(`therapist-${index}`),
    );
    const rankFor = (currentSlug: string) =>
      slugsOf(
        rankSimilarTherapists({
          now: NOW,
          cards,
          topics,
          currentSlug,
          limit: 3,
        }),
      );
    const expected = [...cards]
      .sort(
        (first, second) =>
          stableHash(`sofia|${first.href}`) -
          stableHash(`sofia|${second.href}`),
      )
      .slice(0, 3)
      .map((card) => card.slug);
    expect(rankFor("sofia")).toEqual(expected);
    expect(rankFor("sofia")).toEqual(rankFor("sofia"));

    const pages = ["sofia", "ana", "rui", "marta", "joao", "ines"];
    const distinctPicks = new Set(pages.map((page) => rankFor(page).join()));
    expect(distinctPicks.size).toBeGreaterThan(1);
  });

  it("gives the same order whatever order the directory returned", () => {
    const cards = [
      makeCard("alpha", { specs: ["Trauma"] }),
      makeCard("beta", { availability: "open" }),
      makeCard("gamma"),
      makeCard("delta", { availability: "open", specs: ["Trauma"] }),
    ];
    const forward = rankSimilarTherapists({
      now: NOW,
      cards,
      topics,
      currentSlug: "sofia",
      limit: 4,
    });
    const reversed = rankSimilarTherapists({
      now: NOW,
      cards: [...cards].reverse(),
      topics,
      currentSlug: "sofia",
      limit: 4,
    });
    expect(slugsOf(reversed)).toEqual(slugsOf(forward));
    expect(slugsOf(forward).slice(0, 2)).toEqual(["delta", "alpha"]);
  });

  it("returns at most the limit and leaves the input untouched", () => {
    const cards = [makeCard("a1"), makeCard("b2"), makeCard("c3")];
    const before = slugsOf(cards);
    const ranked = rankSimilarTherapists({
      now: NOW,
      cards,
      topics,
      currentSlug: "sofia",
      limit: 2,
    });
    expect(ranked).toHaveLength(2);
    expect(slugsOf(cards)).toEqual(before);
  });

  it("gives a stale open status no boost over a closed one", () => {
    const staleOpen = makeCard("stale", {
      availability: "open",
      availabilityUpdatedAt: isoDaysBeforeNow(STATUS_CONFIRMED_WITHIN_DAYS + 1),
      specs: ["Trauma"],
    });
    const closed = makeCard("closed", {
      availability: "closed",
      specs: ["Trauma"],
    });
    const rankWith = (card: TherapistCardVM) =>
      slugsOf(
        rankSimilarTherapists({
          now: NOW,
          cards: [card, closed],
          topics,
          currentSlug: "sofia",
          limit: 2,
        }),
      );
    // Ranked exactly as if it had said "closed": the rotation alone decides.
    expect(rankWith(staleOpen)).toEqual(
      rankWith({ ...staleOpen, availability: "closed" }),
    );
  });

  it("puts a fresh open status ahead of a stale or undated one", () => {
    const cards = [
      makeCard("stale", {
        availability: "open",
        availabilityUpdatedAt: isoDaysBeforeNow(140),
        specs: ["Trauma"],
      }),
      makeCard("undated", {
        availability: "open",
        availabilityUpdatedAt: null,
        specs: ["Trauma"],
      }),
      makeCard("fresh", {
        availability: "open",
        availabilityUpdatedAt: isoDaysBeforeNow(3),
        specs: ["Trauma"],
      }),
    ];
    for (const currentSlug of ["sofia", "ana", "rui"]) {
      const ranked = rankSimilarTherapists({
        now: NOW,
        cards,
        topics,
        currentSlug,
        limit: 3,
      });
      expect(ranked[0]?.slug).toBe("fresh");
    }
  });

  it("returns nothing for an empty directory", () => {
    expect(
      rankSimilarTherapists({
        now: NOW,
        cards: [],
        topics,
        currentSlug: "sofia",
        limit: 3,
      }),
    ).toEqual([]);
  });
});

describe("isTherapistStatusFresh", () => {
  it("trusts a status changed within the window, the last day included", () => {
    expect(
      isTherapistStatusFresh(
        {
          availabilityUpdatedAt: isoDaysBeforeNow(STATUS_CONFIRMED_WITHIN_DAYS),
        },
        NOW,
      ),
    ).toBe(true);
  });

  it("stops trusting a status once the window has passed", () => {
    expect(
      isTherapistStatusFresh(
        {
          availabilityUpdatedAt: isoDaysBeforeNow(
            STATUS_CONFIRMED_WITHIN_DAYS + 1,
          ),
        },
        NOW,
      ),
    ).toBe(false);
  });

  it("treats a missing or unreadable date as unconfirmed", () => {
    expect(isTherapistStatusFresh({ availabilityUpdatedAt: null }, NOW)).toBe(
      false,
    );
    expect(
      isTherapistStatusFresh({ availabilityUpdatedAt: "not a date" }, NOW),
    ).toBe(false);
  });
});
