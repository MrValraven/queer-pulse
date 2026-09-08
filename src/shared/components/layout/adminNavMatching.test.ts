import { FiGrid, FiShield } from "react-icons/fi";
import { describe, expect, it } from "vitest";
import type { AdminNavItem, AdminNavSection } from "./adminNav.data";
import {
  countAdminNavMatches,
  firstAdminNavMatch,
  normalizeSearchText,
  searchAdminNav,
} from "./adminNavMatching";

/** Labels stand in for catalog keys, so the fixtures read as what an admin sees. */
const LABELS: Record<string, string> = {
  "section.trust": "Trust & safety",
  "section.site": "Site content",
  "item.moderation": "Moderation",
  "item.housing": "Housing review",
  "item.pages": "Definições",
  "item.overview": "Overview",
};
const translate = (key: string) => LABELS[key] ?? key;

const OVERVIEW: AdminNavItem = {
  labelKey: "item.overview",
  to: "/admin",
  icon: FiGrid,
};

const TRUST: AdminNavSection = {
  id: "trust",
  labelKey: "section.trust",
  icon: FiShield,
  items: [
    { labelKey: "item.moderation", to: "/admin/moderation", icon: FiShield },
    { labelKey: "item.housing", to: "/admin/housing", icon: FiShield },
  ],
};

const SITE: AdminNavSection = {
  id: "site",
  labelKey: "section.site",
  icon: FiGrid,
  items: [{ labelKey: "item.pages", to: "/admin/pages", icon: FiGrid }],
};

const SECTIONS: AdminNavSection[] = [TRUST, SITE];

function search(query: string) {
  return searchAdminNav({
    sections: SECTIONS,
    overview: OVERVIEW,
    query,
    translate,
  });
}

describe("normalizeSearchText", () => {
  it("folds case, accents and surrounding space", () => {
    expect(normalizeSearchText("  Definições ")).toBe("definicoes");
  });
});

describe("searchAdminNav", () => {
  it("returns nothing for an empty or whitespace query", () => {
    expect(search("")).toEqual([]);
    expect(search("   ")).toEqual([]);
  });

  it("matches an item by its own label", () => {
    const groups = search("moder");
    expect(groups).toHaveLength(1);
    expect(groups[0]?.label).toBe("Trust & safety");
    expect(groups[0]?.items.map((item) => item.to)).toEqual([
      "/admin/moderation",
    ]);
  });

  it("finds a PT label typed without its accents", () => {
    expect(search("definicoes")[0]?.items[0]?.to).toBe("/admin/pages");
  });

  it("returns a whole section when the heading is what matched", () => {
    expect(countAdminNavMatches(search("trust"))).toBe(2);
  });

  it("narrows rather than widens as tokens are added", () => {
    const groups = search("trust housing");
    expect(countAdminNavMatches(groups)).toBe(1);
    expect(groups[0]?.items[0]?.to).toBe("/admin/housing");
  });

  it("files the loose Overview link first and without a heading", () => {
    const groups = search("overview");
    expect(groups[0]?.label).toBeNull();
    expect(groups[0]?.items[0]).toBe(OVERVIEW);
  });

  it("omits Overview entirely for a viewer who is not offered it", () => {
    const groups = searchAdminNav({
      sections: SECTIONS,
      query: "overview",
      translate,
    });
    expect(groups).toEqual([]);
  });

  it("can only find what the viewer's own rail already holds", () => {
    // The caller passes `visibleAdminNavSections(...)`, so an entry the tier
    // never sees is not in the haystack to begin with.
    const groups = searchAdminNav({
      sections: [SITE],
      query: "moderation",
      translate,
    });
    expect(groups).toEqual([]);
  });

  it("returns nothing for a query nothing matches", () => {
    expect(search("zzz")).toEqual([]);
    expect(countAdminNavMatches(search("zzz"))).toBe(0);
  });
});

describe("firstAdminNavMatch", () => {
  it("takes the first match in rail order", () => {
    expect(firstAdminNavMatch(search("trust"))?.to).toBe("/admin/moderation");
  });

  it("is undefined when nothing matched", () => {
    expect(firstAdminNavMatch(search("zzz"))).toBeUndefined();
  });
});
