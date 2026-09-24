import { describe, expect, it } from "vitest";
import {
  editorSectionByKeyFor,
  editorSectionsFor,
  LISTING_EDITOR_SECTIONS,
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

  it("keeps the trading section id the hash landing links to", () => {
    expect(editorSectionByKeyFor(false).trading.id).toBe("lb-editor-trading");
    expect(editorSectionByKeyFor(true).trading.id).toBe("lb-editor-trading");
  });
});
