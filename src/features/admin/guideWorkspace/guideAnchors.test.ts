import { describe, expect, it } from "vitest";
import {
  anchorForHeading,
  guideSlugFromTitle,
  toKebabSlug,
  uniqueAnchor,
} from "./guideAnchors";

describe("guideAnchors", () => {
  it("kebab-cases and strips accents and punctuation", () => {
    expect(toKebabSlug("Saúde & bem-estar: o essencial!", 80)).toBe(
      "saude-bem-estar-o-essencial",
    );
  });

  it("truncates without leaving a trailing hyphen", () => {
    expect(toKebabSlug("abc def", 4)).toBe("abc");
  });

  it("suffixes a taken anchor", () => {
    expect(uniqueAnchor("routes", new Set(["routes", "routes-2"]))).toBe(
      "routes-3",
    );
  });

  it("falls back to section for an empty heading", () => {
    expect(anchorForHeading("", new Set())).toBe("section");
    expect(anchorForHeading("", new Set(["section"]))).toBe("section-2");
  });

  it("builds a guide slug from a title", () => {
    expect(guideSlugFromTitle("Accessible Lisbon: step-free routes")).toBe(
      "accessible-lisbon-step-free-routes",
    );
  });
});
