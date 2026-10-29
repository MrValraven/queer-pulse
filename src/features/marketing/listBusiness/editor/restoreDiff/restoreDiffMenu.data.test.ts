import { describe, expect, it } from "vitest";
import type { TFunction } from "../../../../../shared/i18n/types";
import { blankDraft } from "../../listingFormDraft";
import type { ListingDraft } from "../../listBusiness.data";
import { toMenuDraft } from "../../listingMenu.data";
import { LISTING_EDITOR_SECTIONS } from "../listingEditor.data";
import { healListingDraft } from "./healListingDraft";
import { isSameListingContent } from "./listingDraftComparable";
import { buildRestoreDiff } from "./restoreDiff.data";
import type { RestoreFieldChange } from "./restoreDiff.types";

/** Hands back the key, so assertions can name exactly which copy was used. */
const t: TFunction = (key) => key;

function listingDraft(overrides: Partial<ListingDraft> = {}): ListingDraft {
  return { ...blankDraft(), path: "claim", ...overrides };
}

function diff(current: ListingDraft, saved: ListingDraft) {
  return buildRestoreDiff({
    current,
    saved,
    sections: LISTING_EDITOR_SECTIONS,
    t,
  });
}

function fieldOfKind<Kind extends RestoreFieldChange["kind"]>(
  field: RestoreFieldChange | undefined,
  kind: Kind,
): Extract<RestoreFieldChange, { kind: Kind }> {
  expect(field?.kind).toBe(kind);
  return field as Extract<RestoreFieldChange, { kind: Kind }>;
}

describe("restore review of the menu", () => {
  it("reads a menu saved before sub-sections and glass prices as unchanged", () => {
    const legacyMenu = {
      sections: [
        {
          id: "old-section",
          title: "Drinks",
          items: [
            {
              id: "old-item",
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
      currency: "EUR",
    };
    const current = listingDraft({ menu: toMenuDraft(legacyMenu) });
    const saved = { ...current, menu: legacyMenu } as unknown as ListingDraft;
    expect(healListingDraft(saved).menu?.sections[0]?.subsections).toEqual([]);
    expect(isSameListingContent(current, saved)).toBe(true);
    expect(diff(current, saved)).toEqual([]);
  });

  describe("sub-sections", () => {
    const winesMenu = (redWine: Record<string, string>, extra = false) =>
      toMenuDraft({
        sections: [
          {
            title: "Wines",
            items: [],
            subsections: [
              {
                title: "Red",
                items: [
                  { name: "Douro", description: "", dietary: [], ...redWine },
                ],
              },
              ...(extra
                ? [{ title: "White", items: [{ name: "Vinho verde" }] }]
                : []),
            ],
          },
        ],
        file: null,
        link: "",
      });

    it("finds nothing when two menus differ only by their sub-section ids", () => {
      const prices = { priceGlass: "4.50", priceBottle: "18.00" };
      const current = listingDraft({ menu: winesMenu(prices) });
      const saved = listingDraft({ menu: winesMenu(prices) });
      expect(isSameListingContent(current, saved)).toBe(true);
      expect(diff(current, saved)).toEqual([]);
    });

    it("gives a glass or bottle price change its own item row", () => {
      const current = listingDraft({
        menu: winesMenu({ priceGlass: "4.50", priceBottle: "18.00" }),
      });
      const saved = listingDraft({
        menu: winesMenu({ priceGlass: "4.50", priceBottle: "20.00" }),
      });
      expect(isSameListingContent(current, saved)).toBe(false);
      const [services] = diff(current, saved);
      const field = fieldOfKind(services?.fields[0], "rows");
      expect(field.rows.map((row) => row.key)).toEqual([
        "menu.section.1.subsection.1.item.1",
      ]);
      expect(field.rows[0]?.label).toBe(
        "marketing:listBusiness.editor.restore.diff.row.menuSubsectionItem",
      );
      expect(field.rows[0]?.before).toBe("Douro · 4.50 / 18.00");
      expect(field.rows[0]?.after).toBe("Douro · 4.50 / 20.00");
    });

    it("keeps the slash in place when only a bottle price is set", () => {
      const current = listingDraft({ menu: winesMenu({}) });
      const saved = listingDraft({ menu: winesMenu({ priceBottle: "18.00" }) });
      const [services] = diff(current, saved);
      const field = fieldOfKind(services?.fields[0], "rows");
      expect(field.rows[0]?.before).toBe("Douro");
      expect(field.rows[0]?.after).toBe("Douro · / 18.00");
    });

    it("lists an added sub-section and its items", () => {
      const current = listingDraft({ menu: winesMenu({}) });
      const saved = listingDraft({ menu: winesMenu({}, true) });
      const [services] = diff(current, saved);
      const field = fieldOfKind(services?.fields[0], "rows");
      expect(field.rows.map((row) => [row.key, row.status])).toEqual([
        ["menu.section.1.subsection.2", "added"],
        ["menu.section.1.subsection.2.item.1", "added"],
      ]);
      expect(field.rows[0]?.label).toBe(
        "marketing:listBusiness.editor.restore.diff.row.menuSubsection",
      );
    });
  });
});
