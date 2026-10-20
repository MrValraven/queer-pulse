import { describe, expect, it } from "vitest";
import type {
  PublicSubprofileView,
  SubprofileItemView,
} from "../../api/subprofiles.adapters";
import type { SkinData, SubprofileSection } from "../../api/subprofiles.api";
import { TATTOO_MAIN_BLOCKS, buildTattooView } from "./tattooView";
import {
  formatTattooDay,
  localIsoDate,
  styleLabelKey,
  tattooAmountText,
  usableBookingRoute,
} from "./tattooView.helpers";

const TODAY = "2026-10-19";

function makeItem(
  id: string,
  section: SubprofileSection,
  overrides: Partial<SubprofileItemView> = {},
): SubprofileItemView {
  return {
    id,
    section,
    title: id,
    createdAt: "2026-10-01T00:00:00.000Z",
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

function makeData(
  overrides: Partial<PublicSubprofileView> = {},
  sectionItems: Partial<Record<SubprofileSection, SubprofileItemView[]>> = {},
): PublicSubprofileView {
  const sections = Object.entries(sectionItems).map(([section, items]) => ({
    section: section as SubprofileSection,
    labelKey: `subprofiles:section.${section}`,
    icon: (() => null) as never,
    fields: [],
    items: items ?? [],
  }));
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
    sections,
    featured: null,
    affiliations: [],
    endorsementCount: 0,
    viewerEndorsed: false,
    followerCount: 0,
    viewerFollowing: false,
    viewerIsMember: false,
    skinData: null,
    ...overrides,
  } as PublicSubprofileView;
}

function viewOf(skinData: SkinData | null, overrides = {}) {
  return buildTattooView(makeData({ skinData, ...overrides }), TODAY);
}

describe("buildTattooView", () => {
  it("reads the books status, next opening and wait note", () => {
    const view = viewOf({
      tattoo: {
        status: "waitlist",
        nextOpening: "2026-11-03",
        waitNote: "about six weeks",
      },
    });
    expect(view.status).toBe("waitlist");
    expect(view.nextOpening).toBe("2026-11-03");
    expect(view.waitNote).toBe("about six weeks");
    const derived = viewOf({}, { availability: "not_available" });
    expect(derived.status).toBe("closed");
  });

  it("puts the first three styles in the hero and keeps the artist's own words", () => {
    const view = viewOf({
      tattooStyles: {
        styles: ["fine_line", "Botanical blackwork", "dotwork", "lettering"],
      },
    });
    expect(view.heroStyles).toEqual([
      "fine_line",
      "Botanical blackwork",
      "dotwork",
    ]);
    expect(view.styles).toHaveLength(4);
    expect(styleLabelKey("Botanical blackwork")).toBeNull();
    expect(styleLabelKey("dotwork")).toBe("subprofiles:tattoo.style.dotwork");
  });

  it("drops values outside the vocabulary", () => {
    const view = viewOf({
      tattooComfort: {
        options: ["private_room", "free_snacks"] as never,
      },
    });
    expect(view.comfortOptions).toEqual(["private_room"]);
  });

  it("offers the email route only with an email and the message route only on a published page", () => {
    const withoutEmail = viewOf({
      tattooBooking: { route: "email", email: "" },
    });
    expect(withoutEmail.booking.usableRoute).toBeNull();
    const draftMessage = viewOf(
      { tattooBooking: { route: "message" } },
      { status: "draft" },
    );
    expect(draftMessage.booking.usableRoute).toBeNull();
    const publishedMessage = viewOf({ tattooBooking: { route: "message" } });
    expect(publishedMessage.booking.usableRoute).toBe("message");
    const noInstagram = viewOf({ tattooBooking: { route: "instagram" } });
    expect(noInstagram.booking.usableRoute).toBeNull();
    const withInstagram = viewOf(
      { tattooBooking: { route: "instagram" } },
      { socialLinks: [{ platform: "instagram", urlOrHandle: "@inkwell" }] },
    );
    expect(withInstagram.booking.usableRoute).toBe("instagram");
    expect(withInstagram.booking.instagramHref).toContain("instagram.com");
    expect(
      usableBookingRoute(null, {
        email: "a@b.c",
        formUrl: "",
        instagramHref: null,
        isPublished: true,
      }),
    ).toBeNull();
  });

  it("treats a non-https booking form link as unusable", () => {
    const base = { email: "", instagramHref: null, isPublished: true };
    expect(
      usableBookingRoute("form_link", { ...base, formUrl: "http://form.test" }),
    ).toBeNull();
    expect(
      usableBookingRoute("form_link", {
        ...base,
        formUrl: "javascript:alert(1)",
      }),
    ).toBeNull();
    expect(
      usableBookingRoute("form_link", {
        ...base,
        formUrl: "https://form.test",
      }),
    ).toBe("form_link");
  });

  it("splits guest spots into upcoming and past", () => {
    const ended = makeItem("ended", "guest_spots", { date: "2026-10-10" });
    const onNow = makeItem("on-now", "guest_spots", {
      date: "2026-10-15",
      structured: { spot: { type: "guest_spot", endDate: "2026-10-20" } },
    });
    const later = makeItem("later", "guest_spots", { date: "2026-12-01" });
    const view = buildTattooView(
      makeData({}, { guest_spots: [ended, later, onNow] }),
      TODAY,
    );
    expect(view.guestSpots.upcoming.map((item) => item.id)).toEqual([
      "on-now",
      "later",
    ]);
    expect(view.guestSpots.past.map((item) => item.id)).toEqual(["ended"]);
    expect(view.guestSpots.next?.id).toBe("on-now");
    expect(view.guestSpots.isNextRunning).toBe(true);
  });

  it("marks a next guest spot that starts later as not running", () => {
    const later = makeItem("later", "guest_spots", { date: "2026-12-01" });
    const view = buildTattooView(makeData({}, { guest_spots: [later] }), TODAY);
    expect(view.guestSpots.next?.id).toBe("later");
    expect(view.guestSpots.isNextRunning).toBe(false);
  });

  it("reads the studio venue name and address lines, trimmed", () => {
    const view = viewOf({
      venue: { name: " Estúdio Fio ", lines: [" Rua da Madalena 120", ""] },
    });
    expect(view.venue).toEqual({
      name: "Estúdio Fio",
      lines: ["Rua da Madalena 120"],
    });
  });

  it("reads a malformed stored venue as empty and never throws", () => {
    const malformedVenues: unknown[] = [
      "Rua da Madalena 120",
      42,
      { name: 7, lines: "Rua da Madalena 120" },
      { name: null, lines: [3, null, { line: "x" }] },
    ];
    for (const venue of malformedVenues) {
      const view = viewOf({ venue } as unknown as SkinData);
      expect(view.venue).toBeNull();
    }
    const mixedView = viewOf({
      venue: { name: "Estúdio Fio", lines: ["Rua da Madalena 120", 5] },
    } as unknown as SkinData);
    expect(mixedView.venue).toEqual({
      name: "Estúdio Fio",
      lines: ["Rua da Madalena 120"],
    });
  });

  it("leaves the starred item out of its section and shows it as the spotlight", () => {
    const starred = makeItem("starred", "flash", { isFeatured: true });
    const plain = makeItem("plain", "flash");
    const view = buildTattooView(
      makeData({ featured: starred }, { flash: [starred, plain] }),
      TODAY,
    );
    expect(view.itemsBySection.flash.map((item) => item.id)).toEqual(["plain"]);
    expect(view.featured?.id).toBe("starred");
  });

  it("shows the scar work block with its intro alone", () => {
    const view = viewOf({
      tattooScarWork: { intro: "Top surgery scars welcome" },
    });
    expect(view.itemsBySection.scar_work).toHaveLength(0);
    expect(view.hasContent.scarWork).toBe(true);
  });

  it("marks an empty persona's every block empty", () => {
    const view = viewOf(null);
    expect(view.status).toBeNull();
    for (const blockKey of TATTOO_MAIN_BLOCKS) {
      expect(view.hasContent[blockKey]).toBe(false);
    }
  });

  it("survives a malformed faq and non-string skin values", () => {
    const malformedFaq = viewOf({
      faq: [
        null,
        "text",
        { question: 7, answer: "x" },
        { question: " Q ", answer: 3 },
      ],
    } as never);
    expect(malformedFaq.faq).toEqual([{ question: "Q", answer: "" }]);
    const notAList = viewOf({ faq: "oops" } as never);
    expect(notAList.faq).toEqual([]);
    const oddValues = viewOf({
      tattoo: { nextOpening: 5, waitNote: {} },
      tattooBooking: { route: "email", email: 12, replyTime: ["x"] },
      tattooStudio: { city: 42 },
    } as never);
    expect(oddValues.nextOpening).toBe("");
    expect(oddValues.waitNote).toBe("");
    expect(oddValues.city).toBe("");
    expect(oddValues.booking.usableRoute).toBeNull();
    expect(oddValues.booking.replyTime).toBe("");
  });
});

describe("localIsoDate", () => {
  it("formats the local calendar day with zero padding", () => {
    expect(localIsoDate(new Date(2026, 0, 5, 23, 59))).toBe("2026-01-05");
  });
});

describe("formatTattooDay", () => {
  it("writes day, short month and year in English", () => {
    expect(formatTattooDay("2026-10-18", "en")).toBe("18 Oct 2026");
    expect(formatTattooDay("2026-03-02", "en")).toBe("2 Mar 2026");
  });

  it("writes day, short month and year in Portuguese with no trailing dot", () => {
    expect(formatTattooDay("2026-10-18", "pt")).toBe("18 out 2026");
  });

  it("reads the day of a full timestamp", () => {
    expect(formatTattooDay("2026-10-18T12:00:00.000Z", "en")).toBe(
      "18 Oct 2026",
    );
  });

  it("returns empty and unparseable text as given", () => {
    expect(formatTattooDay("", "en")).toBe("");
    expect(formatTattooDay("Ongoing", "en")).toBe("Ongoing");
    expect(formatTattooDay("2026-02-31", "en")).toBe("2026-02-31");
  });
});

describe("tattooAmountText", () => {
  const formatNumber = (value: number) => `n${value}`;

  it("formats a typed price through the number formatter", () => {
    expect(tattooAmountText("25", formatNumber)).toBe("n25");
    expect(tattooAmountText("18,5", formatNumber)).toBe("n18.5");
  });

  it("returns text off the price pattern as typed", () => {
    expect(tattooAmountText("ask me", formatNumber)).toBe("ask me");
  });
});
