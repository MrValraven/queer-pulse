import { describe, expect, it } from "vitest";
import { ANCHOR } from "../listBusiness.data";
import {
  editorSectionByKeyFor,
  editorSectionsFor,
  LISTING_EDITOR_SECTIONS,
  withListingKindLabels,
  withPricingModeLabel,
} from "./listingEditor.data";

describe("withPricingModeLabel", () => {
  it("renames the services section to Menu in menu mode", () => {
    const sections = withPricingModeLabel(LISTING_EDITOR_SECTIONS, "menu");
    const pricing = sections.find((section) => section.key === "services");
    expect(pricing?.labelKey).toBe(
      "marketing:listBusiness.editor.section.menu",
    );
    expect(pricing?.id).toBe("lb-editor-services");
  });

  it("returns the same array in services mode", () => {
    expect(withPricingModeLabel(LISTING_EDITOR_SECTIONS, "services")).toBe(
      LISTING_EDITOR_SECTIONS,
    );
  });
});

describe("editorSectionsFor", () => {
  it("ends the owner's sections with the danger zone", () => {
    const sections = editorSectionsFor(false);
    const lastSection = sections[sections.length - 1];
    expect(lastSection?.key).toBe("dangerZone");
    expect(lastSection?.id).toBe("lb-editor-danger-zone");
    expect(lastSection?.labelKey).toBe(
      "marketing:listBusiness.editor.section.dangerZone",
    );
    expect(lastSection?.anchors).toEqual([]);
  });

  it("leaves the danger zone out of a co-manager's sections", () => {
    const sectionKeys = editorSectionsFor(true).map((section) => section.key);
    expect(sectionKeys).not.toContain("dangerZone");
    expect(sectionKeys).toHaveLength(LISTING_EDITOR_SECTIONS.length - 1);
  });

  it("puts History just before the danger zone, and last for a co-manager", () => {
    const ownerKeys = editorSectionsFor(false).map((section) => section.key);
    const coManagerKeys = editorSectionsFor(true).map((section) => section.key);
    expect(ownerKeys.slice(-2)).toEqual(["history", "dangerZone"]);
    expect(coManagerKeys[coManagerKeys.length - 1]).toBe("history");
    expect(editorSectionByKeyFor(false).history.id).toBe("lb-editor-history");
  });

  it("keeps the trading section id the hash landing links to", () => {
    expect(editorSectionByKeyFor(false).trading.id).toBe("lb-editor-trading");
    expect(editorSectionByKeyFor(true).trading.id).toBe("lb-editor-trading");
  });
});

describe("sections for an online listing", () => {
  it("brings Accessibility back for an online listing", () => {
    const keys = editorSectionsFor(false, true).map((section) => section.key);
    expect(keys).toContain("accessibility");
  });

  it("names the practical and access sections for selling online", () => {
    const sections = withListingKindLabels(
      LISTING_EDITOR_SECTIONS,
      "services",
      "online",
    );
    const byKey = Object.fromEntries(
      sections.map((section) => [section.key, section]),
    );
    expect(byKey.practical?.labelKey).toBe(
      "marketing:listBusiness.editor.section.practicalOnline",
    );
    expect(byKey.accessibility?.labelKey).toBe(
      "marketing:listBusiness.editor.section.accessibilityOnline",
    );
    expect(byKey.practical?.id).toBe("lb-editor-practical");
  });

  it("names the access section for joining in on an out-and-about listing", () => {
    const accessibility = withListingKindLabels(
      LISTING_EDITOR_SECTIONS,
      "services",
      "mobile",
    ).find((section) => section.key === "accessibility");
    expect(accessibility?.labelKey).toBe(
      "marketing:listBusiness.editor.section.accessibilityMobile",
    );
  });

  it("names the pricing section In the shop in shop mode", () => {
    const pricing = withListingKindLabels(
      LISTING_EDITOR_SECTIONS,
      "shop",
      "place",
    ).find((section) => section.key === "services");
    expect(pricing?.labelKey).toBe(
      "marketing:listBusiness.editor.section.shop",
    );
  });

  it("returns the same array for a place in services mode", () => {
    expect(
      withListingKindLabels(LISTING_EDITOR_SECTIONS, "services", "place"),
    ).toBe(LISTING_EDITOR_SECTIONS);
  });

  it("lets the practical section count the online fields as outstanding", () => {
    const practical = LISTING_EDITOR_SECTIONS.find(
      (section) => section.key === "practical",
    );
    expect(practical?.anchors).toEqual(
      expect.arrayContaining([
        ANCHOR.mainLink,
        ANCHOR.fulfilment,
        ANCHOR.hasOnlineShop,
      ]),
    );
  });
});
