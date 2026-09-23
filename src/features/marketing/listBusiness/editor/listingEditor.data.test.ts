import { describe, expect, it } from "vitest";
import {
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
