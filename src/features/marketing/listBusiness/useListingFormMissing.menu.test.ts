import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { type ListingDraft } from "./listBusiness.data";
import { blankDraft } from "./listingFormDraft";
import { toMenuDraft } from "./listingMenu.data";
import { useListingFormMissing } from "./useListingFormMissing";

const MENU_LABEL_KEY = "marketing:listBusiness.missing.menu";
const BASICS_STEP = 1;

function menuDraft(subsection: Record<string, unknown>): ListingDraft {
  return {
    ...blankDraft(),
    path: "claim",
    isWhereFoundAnswered: true,
    online: false,
    hasOnlineShop: false,
    cats: ["food"],
    pricingMode: "menu",
    menu: toMenuDraft({
      sections: [{ title: "Wines", items: [], subsections: [subsection] }],
      file: null,
      link: "",
    }),
  };
}

function basicsLabelKeys(draft: ListingDraft): string[] {
  const { result } = renderHook(() => useListingFormMissing(draft));
  return (result.current[BASICS_STEP] ?? []).map((field) => field.labelKey);
}

describe("useListingFormMissing menu sub-sections", () => {
  it("reports an untitled sub-section that holds a typed item", () => {
    const draft = menuDraft({
      title: "",
      items: [{ name: "Douro", priceGlass: "4.50" }],
    });
    expect(basicsLabelKeys(draft)).toContain(MENU_LABEL_KEY);
  });

  it("reports nothing for a titled sub-section whose item has no price", () => {
    const draft = menuDraft({ title: "Red", items: [{ name: "Douro" }] });
    expect(basicsLabelKeys(draft)).not.toContain(MENU_LABEL_KEY);
  });

  it("reports nothing for an untitled sub-section with only blank items", () => {
    const draft = menuDraft({ title: "", items: [{ name: "" }] });
    expect(basicsLabelKeys(draft)).not.toContain(MENU_LABEL_KEY);
  });
});
