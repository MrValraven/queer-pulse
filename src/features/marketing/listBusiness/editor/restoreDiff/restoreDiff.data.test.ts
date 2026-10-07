import { describe, expect, it } from "vitest";
import { API_BASE_URL } from "../../../../../shared/api/config";
import type { TFunction } from "../../../../../shared/i18n/types";
import { wordDiff } from "../../../../../shared/lib/wordDiff";
import {
  catLabel,
  emptyHours,
  witLine,
  type ListingDraft,
} from "../../listBusiness.data";
import { blankDraft } from "../../listingFormDraft";
import {
  emptyAccessibilityAnswers,
  normalizeListingAccessibilityAnswers,
} from "../../listingAccessibility.data";
import { toMenuDraft } from "../../listingMenu.data";
import { normalizeOnlineDetails } from "../../listingOnline.data";
import { toServiceRows } from "../../listingServices.data";
import {
  CO_MANAGER_EDITOR_SECTIONS,
  LISTING_EDITOR_SECTIONS,
} from "../listingEditor.data";
import { isSameListingContent } from "./listingDraftComparable";
import {
  buildRestoreDiff,
  mergeRestoredAreas,
  RESTORE_FIELD_AREAS,
} from "./restoreDiff.data";
import type { RestoreAreaKey, RestoreFieldChange } from "./restoreDiff.types";
import { isVisibleFieldChange } from "./restoreDiffSafetyNet.data";

/** Hands back the key, so assertions can name exactly which copy was used. */
const t: TFunction = (key) => key;

/**
 * A filled-in listing. Every call mints fresh client row ids (description
 * lines, services, menu sections and items), exactly as two editor mounts
 * of the same listing would.
 */
function listingDraft(overrides: Partial<ListingDraft> = {}): ListingDraft {
  const hours = emptyHours();
  hours.Mon = { open: true, intervals: [{ from: "09:00", to: "18:00" }] };
  hours.Tue = { open: true, intervals: [{ from: "09:00", to: "18:00" }] };
  return {
    ...blankDraft(),
    path: "claim",
    name: "Livraria Rosa",
    cats: ["culture"],
    hood: "Graça",
    badge: "owned",
    evidence: "Run by two queer booksellers since 2019.",
    price: "€",
    blurb: "A queer bookshop with a reading nook.",
    tagline: "Stories for everyone",
    whatItIs: [
      witLine("We stock queer fiction and poetry."),
      witLine("Readings every Thursday evening."),
    ],
    tags: ["books", "readings"],
    goodFor: ["Solo-friendly"],
    services: toServiceRows([
      { name: "Book club", price: "5 EUR", note: "Monthly" },
    ]),
    pricingMode: "services",
    menu: toMenuDraft({
      sections: [
        {
          title: "Drinks",
          items: [
            {
              name: "Tea",
              price: "2 EUR",
              description: "",
              dietary: ["vegan"],
            },
          ],
        },
      ],
      file: null,
      link: "",
    }),
    langs: ["Português", "English"],
    address: "Rua da Graça 12, Lisboa",
    geocoded: true,
    latitude: 38.7186,
    longitude: -9.13,
    hours,
    social: {
      instagram: "@livrariarosa",
      website: "livrariarosa.pt",
      email: "ola@livrariarosa.pt",
      phone: "",
    },
    rel: "own",
    ownerName: "Rosa",
    ownerRole: "Founder",
    ownerBio: "Bookseller.",
    consentOuting: true,
    consentGuide: true,
    affirmingBaselineAccepted: true,
    ...overrides,
  };
}

function diff(
  current: ListingDraft,
  saved: ListingDraft,
  sections = LISTING_EDITOR_SECTIONS,
) {
  return buildRestoreDiff({ current, saved, sections, t });
}

function fieldOfKind<Kind extends RestoreFieldChange["kind"]>(
  field: RestoreFieldChange | undefined,
  kind: Kind,
): Extract<RestoreFieldChange, { kind: Kind }> {
  expect(field?.kind).toBe(kind);
  return field as Extract<RestoreFieldChange, { kind: Kind }>;
}

describe("RESTORE_FIELD_AREAS", () => {
  it("keeps the fields that no edit changes out of every area", () => {
    expect(RESTORE_FIELD_AREAS.path).toBe("notRestorable");
    expect(RESTORE_FIELD_AREAS.affirmingBaselineAccepted).toBe("notRestorable");
    expect(RESTORE_FIELD_AREAS.managementRole).toBe("notRestorable");
    expect(RESTORE_FIELD_AREAS.isStaffAuthored).toBe("notRestorable");
  });
});

describe("buildRestoreDiff", () => {
  it("finds nothing when two drafts differ only by their row ids", () => {
    const current = listingDraft();
    const saved = listingDraft();
    expect(saved.services?.[0]?.id).not.toBe(current.services?.[0]?.id);
    expect(saved.whatItIs[0]?.id).not.toBe(current.whatItIs[0]?.id);
    expect(isSameListingContent(current, saved)).toBe(true);
    expect(diff(current, saved)).toEqual([]);
  });

  it("finds nothing when only a closed day's hidden times differ", () => {
    const current = listingDraft();
    const saved = listingDraft();
    saved.hours.Sun = {
      open: false,
      intervals: [{ from: "11:00", to: "14:00" }],
    };
    expect(isSameListingContent(current, saved)).toBe(true);
    expect(diff(current, saved)).toEqual([]);
  });

  it("reports one name change as the basics area with one text field", () => {
    const current = listingDraft();
    const saved = listingDraft({ name: "Livraria Rosa Choque" });
    const areas = diff(current, saved);
    expect(areas).toHaveLength(1);
    expect(areas[0]?.key).toBe("basics");
    expect(areas[0]?.labelKey).toBe(
      "marketing:listBusiness.wizard.pill.basics",
    );
    expect(areas[0]?.changeCount).toBe(1);
    const field = fieldOfKind(areas[0]?.fields[0], "text");
    expect(field.key).toBe("name");
    expect(field.segments).toEqual(
      wordDiff("Livraria Rosa", "Livraria Rosa Choque"),
    );
  });

  it("orders areas the way the given section list does", () => {
    const current = listingDraft();
    const saved = listingDraft({
      name: "Rosa Livros",
      ownerRole: "Co-founder",
    });
    const reversed = [...LISTING_EDITOR_SECTIONS].reverse();
    expect(diff(current, saved, reversed).map((area) => area.key)).toEqual([
      "aboutYou",
      "basics",
    ]);
    expect(diff(current, saved).map((area) => area.key)).toEqual([
      "basics",
      "aboutYou",
    ]);
  });

  it("lists categories the saved copy adds and drops by their labels", () => {
    const current = listingDraft({ cats: ["culture", "space"] });
    const saved = listingDraft({ cats: ["culture", "food"] });
    const field = fieldOfKind(diff(current, saved)[0]?.fields[0], "set");
    expect(field.key).toBe("cats");
    expect(field.added).toEqual([catLabel(t, "food")]);
    expect(field.removed).toEqual([catLabel(t, "space")]);
  });

  it("marks a changed paragraph with a word diff at its position", () => {
    const current = listingDraft();
    const saved = listingDraft({
      whatItIs: [
        witLine("We stock queer fiction and poetry."),
        witLine("Readings every Friday evening."),
      ],
    });
    const field = fieldOfKind(diff(current, saved)[0]?.fields[0], "paragraphs");
    expect(field.paragraphs).toEqual([
      {
        key: "paragraph-2",
        status: "changed",
        position: 2,
        segments: wordDiff(
          "Readings every Thursday evening.",
          "Readings every Friday evening.",
        ),
      },
    ]);
  });

  it("marks paragraphs only the saved copy has as added", () => {
    const current = listingDraft();
    const saved = listingDraft({
      whatItIs: [...current.whatItIs, witLine("Open late in summer.")],
    });
    const field = fieldOfKind(diff(current, saved)[0]?.fields[0], "paragraphs");
    expect(field.paragraphs).toEqual([
      {
        key: "paragraph-3",
        status: "added",
        position: 3,
        segments: [{ kind: "added", text: "Open late in summer." }],
      },
    ]);
  });

  it("marks paragraphs only the screen has as removed", () => {
    const current = listingDraft();
    const saved = listingDraft({ whatItIs: [current.whatItIs[0]!] });
    const field = fieldOfKind(diff(current, saved)[0]?.fields[0], "paragraphs");
    expect(field.paragraphs).toEqual([
      {
        key: "paragraph-2",
        status: "removed",
        position: 2,
        segments: [
          { kind: "removed", text: "Readings every Thursday evening." },
        ],
      },
    ]);
  });

  it("shows a new address as the address text plus one map-pin change", () => {
    const current = listingDraft();
    const saved = listingDraft({
      address: "Rua dos Anjos 3, Lisboa",
      latitude: 38.7267,
      longitude: -9.135,
    });
    const [practical] = diff(current, saved);
    expect(practical?.key).toBe("practical");
    expect(practical?.changeCount).toBe(2);
    expect(practical?.fields.map((field) => field.key)).toEqual([
      "address",
      "mapPin",
    ]);
    const pin = fieldOfKind(practical?.fields[1], "choice");
    expect(pin.labelKey).toBe(
      "marketing:listBusiness.editor.restore.diff.field.mapPin",
    );
    expect(pin.before).toBe(
      "marketing:listBusiness.editor.restore.diff.pin.exact",
    );
    expect(pin.after).toBe(
      "marketing:listBusiness.editor.restore.diff.pin.moved",
    );
  });

  it("gives a changed day of hours one row", () => {
    const current = listingDraft();
    const saved = listingDraft();
    saved.hours.Mon = {
      open: true,
      intervals: [{ from: "10:00", to: "18:00" }],
    };
    const [practical] = diff(current, saved);
    const field = fieldOfKind(practical?.fields[0], "rows");
    expect(field.key).toBe("hours");
    expect(field.rows).toHaveLength(1);
    expect(field.rows[0]).toMatchObject({
      key: "hours.Mon",
      status: "changed",
      label: "marketing:listBusiness.day.mon",
    });
  });

  it("marks a photo added to an empty slot with no before text", () => {
    const current = listingDraft();
    const saved = listingDraft({
      photos: { ...current.photos, wide: "listings/wide.jpg" },
      alt: { ...current.alt, wide: "The front of the shop" },
    });
    const [photos] = diff(current, saved);
    expect(photos?.key).toBe("photos");
    const field = fieldOfKind(photos?.fields[0], "rows");
    expect(field.rows).toEqual([
      {
        key: "photos.wide",
        status: "added",
        label: "marketing:listBusiness.editor.restore.diff.photo.wide",
        before: null,
        after: "The front of the shop",
        beforeImageUrl: null,
        afterImageUrl: `${API_BASE_URL}/files/listings/wide.jpg`,
      },
    ]);
  });

  it("skips an area missing from a co-manager's section list", () => {
    const current = listingDraft();
    const saved = listingDraft({ consentGuide: false });
    const withoutPermissions = CO_MANAGER_EDITOR_SECTIONS.filter(
      (section) => section.key !== "permissions",
    );
    expect(diff(current, saved)).toHaveLength(1);
    expect(diff(current, saved, withoutPermissions)).toEqual([]);
  });

  it("names an area by the label the given section list uses", () => {
    const current = listingDraft();
    const saved = listingDraft({ ownerRole: "Head chef" });
    const [aboutYou] = diff(current, saved, CO_MANAGER_EDITOR_SECTIONS);
    expect(aboutYou?.labelKey).toBe(
      "marketing:listBusiness.editor.section.roleOnListing",
    );
  });
});

describe("mergeRestoredAreas", () => {
  it("copies only the picked areas and keeps unrestorable fields", () => {
    const current = listingDraft();
    const saved = listingDraft({
      name: "Rosa Livros",
      cats: ["culture", "food"],
      tagline: "Books and tea",
      path: "suggest",
      affirmingBaselineAccepted: false,
      managementRole: "co_manager",
    });
    const merged = mergeRestoredAreas({
      current,
      saved,
      areaKeys: new Set<RestoreAreaKey>(["basics"]),
    });
    expect(merged.name).toBe("Rosa Livros");
    expect(merged.cats).toEqual(["culture", "food"]);
    expect(merged.cats).not.toBe(saved.cats);
    expect(merged.tagline).toBe(current.tagline);
    expect(merged.path).toBe("claim");
    expect(merged.affirmingBaselineAccepted).toBe(true);
    expect(merged.managementRole).toBeUndefined();
  });

  it("brings the pricing mode and the menu back with the services area", () => {
    const current = listingDraft();
    const saved = listingDraft({
      services: toServiceRows([
        { name: "Book club", price: "6 EUR", note: "Monthly" },
      ]),
      pricingMode: "menu",
      menu: toMenuDraft({
        sections: [{ title: "Cakes", items: [] }],
        file: null,
        link: "",
      }),
    });
    const merged = mergeRestoredAreas({
      current,
      saved,
      areaKeys: new Set<RestoreAreaKey>(["services"]),
    });
    expect(merged.services).toEqual(saved.services);
    expect(merged.pricingMode).toBe("menu");
    expect(merged.menu).toEqual(saved.menu);
    expect(merged.menu).not.toBe(saved.menu);
    expect(merged.name).toBe(current.name);
  });

  it("changes nothing when no area is picked", () => {
    const current = listingDraft();
    const saved = listingDraft({
      name: "Rosa Livros",
      hoursNote: "Closed in August",
    });
    expect(
      mergeRestoredAreas({
        current,
        saved,
        areaKeys: new Set<RestoreAreaKey>(),
      }),
    ).toEqual(current);
  });
});

const DIFF_PREFIX = "marketing:listBusiness.editor.restore.diff";

describe("buildRestoreDiff shows every change the merge would apply", () => {
  it("shows a category reorder, since the first category is the main one", () => {
    const current = listingDraft({ cats: ["culture", "food"] });
    const saved = listingDraft({ cats: ["food", "culture"] });
    const [basics] = diff(current, saved);
    const field = fieldOfKind(basics?.fields[0], "choice");
    expect(field.key).toBe("cats");
    expect(field.labelKey).toBe(`${DIFF_PREFIX}.field.catsOrder`);
    expect(field.before).toBe(
      `${catLabel(t, "culture")}, ${catLabel(t, "food")}`,
    );
    expect(field.after).toBe(
      `${catLabel(t, "food")}, ${catLabel(t, "culture")}`,
    );
  });

  it("shows a tag reorder as both orders", () => {
    const current = listingDraft({ tags: ["books", "readings"] });
    const saved = listingDraft({ tags: ["readings", "books"] });
    const [story] = diff(current, saved);
    const field = fieldOfKind(story?.fields[0], "choice");
    expect(field.key).toBe("tags");
    expect(field.labelKey).toBe(`${DIFF_PREFIX}.field.tags`);
    expect(field.before).toBe("books, readings");
    expect(field.after).toBe("readings, books");
  });

  it("gives a menu item a row when only its raw fields moved", () => {
    const menuWith = (price: string, description: string) =>
      toMenuDraft({
        sections: [
          {
            title: "Drinks",
            items: [{ name: "Tea", price, description, dietary: ["vegan"] }],
          },
        ],
        file: null,
        link: "",
      });
    const current = listingDraft({ menu: menuWith("2 EUR", "") });
    const saved = listingDraft({ menu: menuWith("", "2 EUR") });
    const [services] = diff(current, saved);
    const field = fieldOfKind(services?.fields[0], "rows");
    expect(field.key).toBe("menu");
    expect(field.rows.map((row) => row.key)).toEqual(["menu.section.1.item.1"]);
  });

  it("gives a photo whose alt text alone changed a changed row", () => {
    const photos = { ...blankDraft().photos, wide: "https://img.test/w.jpg" };
    const current = listingDraft({
      photos,
      alt: { ...blankDraft().alt, wide: "The shop front" },
    });
    const saved = listingDraft({
      photos,
      alt: { ...blankDraft().alt, wide: "The shop front at dusk" },
    });
    const [photosArea] = diff(current, saved);
    const field = fieldOfKind(photosArea?.fields[0], "rows");
    expect(field.rows).toEqual([
      {
        key: "photos.wide",
        status: "changed",
        label: `${DIFF_PREFIX}.photo.wide`,
        before: "The shop front",
        after: "The shop front at dusk",
        beforeImageUrl: "https://img.test/w.jpg",
        afterImageUrl: "https://img.test/w.jpg",
      },
    ]);
  });

  it("prefers this session's preview on screen and drops a stored blob", () => {
    const current = listingDraft({
      photos: { ...blankDraft().photos, d1: "listings/d1.jpg" },
    });
    const saved = listingDraft({
      photos: { ...blankDraft().photos, d1: "blob:http://localhost/old" },
    });
    const areas = buildRestoreDiff({
      current,
      saved,
      sections: LISTING_EDITOR_SECTIONS,
      t,
      photoPreviews: {
        wide: "",
        d1: "blob:http://localhost/now",
        d2: "",
        vibe: "",
      },
    });
    const field = fieldOfKind(areas[0]?.fields[0], "rows");
    expect(field.rows[0]?.beforeImageUrl).toBe("blob:http://localhost/now");
    expect(field.rows[0]?.afterImageUrl).toBeNull();
  });

  it("treats a reordered list of dated exceptions as no change", () => {
    const christmas = {
      date: "2026-12-24",
      open: false,
      intervals: [],
      note: "Christmas Eve",
    };
    const newYear = {
      date: "2026-12-31",
      open: false,
      intervals: [],
      note: "",
    };
    const current = listingDraft({ hoursExceptions: [christmas, newYear] });
    const saved = listingDraft({ hoursExceptions: [newYear, christmas] });
    expect(isSameListingContent(current, saved)).toBe(true);
    expect(diff(current, saved)).toEqual([]);
  });

  it("gives a half-filled opening window a row, since it blocks saving", () => {
    const current = listingDraft();
    const saved = listingDraft();
    saved.hours.Mon = {
      open: true,
      intervals: [
        { from: "09:00", to: "18:00" },
        { from: "19:00", to: "" },
      ],
    };
    expect(isSameListingContent(current, saved)).toBe(false);
    const [practical] = diff(current, saved);
    const field = fieldOfKind(practical?.fields[0], "rows");
    expect(field.key).toBe("hours");
    expect(field.rows).toHaveLength(1);
    expect(field.rows[0]).toMatchObject({
      key: "hours.Mon",
      status: "changed",
    });
  });

  it("names a new main category when one is added in front", () => {
    const current = listingDraft({ cats: ["nightlife"] });
    const saved = listingDraft({ cats: ["food", "nightlife"] });
    const [basics] = diff(current, saved);
    expect(basics?.changeCount).toBe(2);
    const set = fieldOfKind(basics?.fields[0], "set");
    expect(set.added).toEqual([catLabel(t, "food")]);
    expect(set.removed).toEqual([]);
    const main = fieldOfKind(basics?.fields[1], "choice");
    expect(main.key).toBe("cats.main");
    expect(main.labelKey).toBe(`${DIFF_PREFIX}.field.mainCategory`);
    expect(main.before).toBe(catLabel(t, "nightlife"));
    expect(main.after).toBe(catLabel(t, "food"));
  });

  it("shows a changed contact link as its own text field", () => {
    const current = listingDraft();
    const saved = listingDraft({
      social: { ...current.social, phone: "+351 912 345 678" },
    });
    const [practical] = diff(current, saved);
    expect(practical?.changeCount).toBe(1);
    const field = fieldOfKind(practical?.fields[0], "text");
    expect(field.key).toBe("social.phone");
    expect(field.labelKey).toBe(`${DIFF_PREFIX}.field.phone`);
  });

  it("uses label-case field labels of its own", () => {
    const [basics] = diff(listingDraft(), listingDraft({ name: "Rosa" }));
    expect(basics?.fields[0]?.labelKey).toBe(`${DIFF_PREFIX}.field.name`);
  });
});

describe("buildRestoreDiff safety net", () => {
  it("keeps a spacing-only edit visible", () => {
    const current = listingDraft();
    const saved = listingDraft({ name: "Livraria  Rosa" });
    const [basics] = diff(current, saved);
    expect(basics?.fields.map((field) => field.key)).toEqual(["name"]);
    expect(isVisibleFieldChange(basics!.fields[0]!)).toBe(true);
  });

  it("leaves a geocoded flag flip with no pin on either side unlisted", () => {
    const unpinned = { latitude: null, longitude: null };
    const current = listingDraft({ ...unpinned, geocoded: false });
    const saved = listingDraft({ ...unpinned, geocoded: true });
    expect(diff(current, saved)).toEqual([]);
  });

  it("reads a partial stored copy without throwing", () => {
    const current = listingDraft();
    const legacy = {
      ...listingDraft(),
      hours: undefined,
      whatItIs: undefined,
      social: undefined,
      hoursExceptions: "junk",
    } as unknown as ListingDraft;
    expect(() => diff(current, legacy)).not.toThrow();
    expect(() => isSameListingContent(current, legacy)).not.toThrow();
    const merged = mergeRestoredAreas({
      current,
      saved: legacy,
      areaKeys: new Set<RestoreAreaKey>(["story", "practical"]),
    });
    expect(merged.whatItIs).toEqual([]);
    expect(merged.social.phone).toBe("");
  });
});

describe("restore review for the online fields", () => {
  it("reports no change for a copy saved before the online fields existed", () => {
    const current = listingDraft();
    const {
      city: _city,
      hasOnlineShop: _hasOnlineShop,
      onlineDetails: _onlineDetails,
      shopItems: _shopItems,
      adultTermsAccepted: _adultTermsAccepted,
      isWhereFoundAnswered: _isWhereFoundAnswered,
      ...legacy
    } = current;
    const sixAnswerAccessibility = {
      answers: emptyAccessibilityAnswers(),
      note: current.accessibility?.note ?? "",
    };
    const saved = {
      ...legacy,
      accessibility: sixAnswerAccessibility,
    } as ListingDraft;
    expect(isSameListingContent(current, saved)).toBe(true);
    expect(
      buildRestoreDiff({
        current,
        saved,
        sections: LISTING_EDITOR_SECTIONS,
        t,
      }),
    ).toEqual([]);
  });

  it("ignores the draft-only answer state and the stashed categories", () => {
    const current = listingDraft({ isWhereFoundAnswered: true });
    const saved = listingDraft({
      isWhereFoundAnswered: false,
      inactiveModeCats: ["books-music"],
    });
    expect(isSameListingContent(current, saved)).toBe(true);
  });

  it("lists a changed main link and a new payment method by name", () => {
    const current = listingDraft({
      hasOnlineShop: true,
      onlineDetails: normalizeOnlineDetails({
        mainLink: { url: "a.pt", kind: "shop" },
      }),
    });
    const saved = listingDraft({
      hasOnlineShop: true,
      onlineDetails: normalizeOnlineDetails({
        mainLink: { url: "b.pt", kind: "shop" },
        payments: ["mbway"],
      }),
    });
    const practical = buildRestoreDiff({
      current,
      saved,
      sections: LISTING_EDITOR_SECTIONS,
      t,
    }).find((area) => area.key === "practical");
    expect(practical?.fields.map((field) => field.key)).toEqual([
      "onlineDetails.mainLink",
      "onlineDetails.payments",
    ]);
  });

  it("restores the online block with the practical area", () => {
    const current = listingDraft();
    const saved = listingDraft({
      hasOnlineShop: true,
      onlineDetails: normalizeOnlineDetails({ replyNote: "Packed Tuesdays" }),
    });
    const merged = mergeRestoredAreas({
      current,
      saved,
      areaKeys: new Set<RestoreAreaKey>(["practical"]),
    });
    expect(merged.hasOnlineShop).toBe(true);
    expect(merged.onlineDetails?.replyNote).toBe("Packed Tuesdays");
  });

  it("lists a changed online accessibility answer on an online listing", () => {
    const answers = normalizeListingAccessibilityAnswers({});
    const current = listingDraft({
      online: true,
      accessibility: { answers, note: "" },
    });
    const saved = listingDraft({
      online: true,
      accessibility: {
        answers: { ...answers, "image-descriptions": "yes" },
        note: "",
      },
    });
    const accessibility = diff(current, saved).find(
      (area) => area.key === "accessibility",
    );
    const rows = fieldOfKind(accessibility?.fields[0], "rows").rows;
    expect(rows.map((row) => row.key)).toEqual([
      "accessibility.image-descriptions",
    ]);
  });

  it("puts every new draft key in an area", () => {
    for (const key of [
      "city",
      "hasOnlineShop",
      "onlineDetails",
      "shopItems",
      "adultTermsAccepted",
      "isWhereFoundAnswered",
      "inactiveModeCats",
    ] as const) {
      expect(RESTORE_FIELD_AREAS[key], key).toBeDefined();
    }
  });
});

describe("isSameListingContent on the online flags", () => {
  it("ignores an online shop flag on an online listing and an acknowledgement without intimacy", () => {
    const current = listingDraft({ online: true, hasOnlineShop: false });
    const saved = listingDraft({
      online: true,
      hasOnlineShop: true,
      adultTermsAccepted: true,
    });
    expect(isSameListingContent(current, saved)).toBe(true);
    const adultCurrent = listingDraft({ online: true, cats: ["intimacy"] });
    const adultSaved = { ...adultCurrent, adultTermsAccepted: true };
    expect(isSameListingContent(adultCurrent, adultSaved)).toBe(false);
  });
});
