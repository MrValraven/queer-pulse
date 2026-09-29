import { describe, expect, it, vi } from "vitest";
import {
  EMPTY_FILTERS,
  MEMBERS,
  appliedChips,
  directoryFacetCounts,
  matchesFilters,
  removeChip,
  type FilterState,
  type MemberCard,
} from "./memberDirectoryFilter.data";
import { AMBASSADOR_FOCUS_LABEL_KEY } from "../../shared/ambassadors/ambassadorFocusAreas.data";

/** Real EN copy for the keys this test touches; see the note in
 *  `SCRATCH/i18n-task-F6.md`: rewording either at merge breaks this test. */
const EN_LABELS: Record<string, string> = {
  "members:directory.filters.ambassadors.chipLabel": "Ambassadors",
  [AMBASSADOR_FOCUS_LABEL_KEY.housing]: "Housing",
  [AMBASSADOR_FOCUS_LABEL_KEY.youth]: "Youth",
};
const translate = (key: string) => EN_LABELS[key] ?? key;

function findMember(slug: string): MemberCard {
  const member = MEMBERS.find((m) => m.slug === slug);
  if (!member) throw new Error(`fixture member missing: ${slug}`);
  return member;
}

describe("appliedChips: ambassadors", () => {
  it("yields no ambassador chips while the switch is off", () => {
    const chips = appliedChips(EMPTY_FILTERS, translate);
    expect(chips.some((c) => c.group === "ambassador")).toBe(false);
    expect(chips.some((c) => c.group === "ambassadorFocus")).toBe(false);
  });

  it("yields one 'Ambassadors' chip when the switch is on, with no focus areas", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: true,
    };
    const chips = appliedChips(filters, translate);
    expect(chips).toEqual([
      { label: "Ambassadors", group: "ambassador", value: "ambassador" },
    ]);
  });

  it("yields the switch chip plus one chip per selected focus area", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: true,
      ambassadorFocusAreas: ["housing", "youth"],
    };
    const chips = appliedChips(filters, translate);
    expect(chips).toEqual([
      { label: "Ambassadors", group: "ambassador", value: "ambassador" },
      { label: "Housing", group: "ambassadorFocus", value: "housing" },
      { label: "Youth", group: "ambassadorFocus", value: "youth" },
    ]);
  });

  it("ignores a stale focus selection while the switch is off", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: false,
      ambassadorFocusAreas: ["housing"],
    };
    const chips = appliedChips(filters, translate);
    expect(chips).toEqual([]);
  });
});

describe("removeChip: ambassadors", () => {
  it("removing the Ambassadors chip also clears the focus areas", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: true,
      ambassadorFocusAreas: ["housing", "youth"],
    };
    const next = removeChip(filters, {
      label: "Ambassadors",
      group: "ambassador",
      value: "ambassador",
    });
    expect(next.isAmbassadorsOnly).toBe(false);
    expect(next.ambassadorFocusAreas).toEqual([]);
  });

  it("removing one focus chip drops only that focus area", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: true,
      ambassadorFocusAreas: ["housing", "youth"],
    };
    const next = removeChip(filters, {
      label: "Housing",
      group: "ambassadorFocus",
      value: "housing",
    });
    expect(next.isAmbassadorsOnly).toBe(true);
    expect(next.ambassadorFocusAreas).toEqual(["youth"]);
  });
});

describe("matchesFilters: ambassadors", () => {
  it("passes through every member while the switch is off", () => {
    expect(matchesFilters(findMember("rui"), EMPTY_FILTERS)).toBe(true);
  });

  it("keeps only DEMO_AMBASSADORS slugs once the switch is on", () => {
    const filters: FilterState = { ...EMPTY_FILTERS, isAmbassadorsOnly: true };
    expect(matchesFilters(findMember("beatriz"), filters)).toBe(true);
    expect(matchesFilters(findMember("rui"), filters)).toBe(false);
  });

  it("narrows further by focus area", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: true,
      ambassadorFocusAreas: ["arts_and_culture"],
    };
    // beatriz is the arts_and_culture ambassador; diogo is nightlife_safety.
    expect(matchesFilters(findMember("beatriz"), filters)).toBe(true);
    expect(matchesFilters(findMember("diogo"), filters)).toBe(false);
  });

  it("excludes a staff-badged ambassador even while their own focus area is selected", () => {
    const filters: FilterState = {
      ...EMPTY_FILTERS,
      isAmbassadorsOnly: true,
      ambassadorFocusAreas: ["housing"],
    };
    // ines is the demo's housing ambassador, but she also wears the
    // housing_moderator staff badge, and her card shows only that badge.
    // Staff wins, so she must drop out of the ambassador filter too.
    expect(matchesFilters(findMember("ines"), filters)).toBe(false);
  });
});

describe("directoryFacetCounts: ambassador", () => {
  it("counts one member per focus area, excluding staff-badged ambassadors", () => {
    const counts = directoryFacetCounts(MEMBERS, EMPTY_FILTERS);
    // ines is the housing ambassador but wears the housing_moderator staff
    // badge on her card, so the housing count stays 0 rather than counting a
    // member whose card shows no Ambassador tag.
    expect(counts.ambassador.housing).toBe(0);
    expect(counts.ambassador.arts_and_culture).toBe(1);
    expect(counts.ambassador.nightlife_safety).toBe(1);
    expect(counts.ambassador.work_and_careers).toBe(1);
    expect(counts.ambassador.youth).toBe(0);
  });
});

describe("GET /members: ambassador query params", () => {
  it("sends ambassador=1&focus=housing only while the switch is on", async () => {
    vi.resetModules();
    const apiGet = vi.fn(() =>
      Promise.resolve({ items: [], total: 0, page: 1, pageSize: 20 }),
    );
    vi.doMock("../../shared/api/client", () => ({ apiGet }));
    const { getMembers } = await import("./api/members.api");

    await getMembers({ ambassador: true, focus: ["housing"] });
    expect(apiGet).toHaveBeenLastCalledWith(
      "/members?ambassador=1&focus=housing",
    );

    await getMembers({});
    expect(apiGet).toHaveBeenLastCalledWith("/members");

    // `focus` alone (switch off) must never reach the backend, which is
    // documented to ignore it without `ambassador=1`, but sending it
    // regardless would still be a stray query param that changes the cache
    // key for nothing.
    await getMembers({ focus: ["housing"] });
    expect(apiGet).toHaveBeenLastCalledWith("/members");

    vi.doUnmock("../../shared/api/client");
  });
});
