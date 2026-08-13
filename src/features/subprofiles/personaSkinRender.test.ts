import { describe, expect, it } from "vitest";
import { isUpcoming, sectionShape } from "./personaSkinRender";
import type { SubprofileItemDTO } from "./api/subprofiles.api";

function makeItem(overrides: Partial<SubprofileItemDTO>): SubprofileItemDTO {
  return {
    id: "item-test",
    section: "gigs",
    title: "Untitled",
    createdAt: "2025-03-01T12:00:00.000Z",
    tags: [],
    isFeatured: false,
    collaborators: [],
    ...overrides,
  };
}

describe("isUpcoming", () => {
  it("is true for a parseable future date", () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(isUpcoming(`14 Mar ${nextYear}`)).toBe(true);
  });

  it("is false for a parseable past date", () => {
    expect(isUpcoming("14 Mar 2000")).toBe(false);
  });

  it("is false for an unparseable/garbage date", () => {
    expect(isUpcoming("not a date")).toBe(false);
  });

  it("is false for a missing date", () => {
    expect(isUpcoming(null)).toBe(false);
    expect(isUpcoming(undefined)).toBe(false);
  });
});

describe("sectionShape", () => {
  it("is stage-split for a musician's gigs section with an upcoming item", () => {
    const nextYear = new Date().getFullYear() + 1;
    const items = [
      makeItem({ section: "gigs", date: `1 Jan ${nextYear}` }),
      makeItem({ section: "gigs", date: "1 Jan 2000" }),
    ];
    expect(sectionShape("gigs", "stage", items)).toBe("stage-split");
  });

  it("is visual for a portfolio section", () => {
    const items = [makeItem({ section: "portfolio", imageUrl: "/a.jpg" })];
    expect(sectionShape("portfolio", "studio", items)).toBe("visual");
  });

  it("is list for a credentials section", () => {
    const items = [makeItem({ section: "credentials" })];
    expect(sectionShape("credentials", "practice", items)).toBe("list");
  });

  it("is list for a stage gigs section with no upcoming items", () => {
    const items = [makeItem({ section: "gigs", date: "1 Jan 2000" })];
    expect(sectionShape("gigs", "stage", items)).toBe("list");
  });

  it("is gallery for the universal gallery section", () => {
    const items = [makeItem({ section: "gallery", imageUrl: "/a.jpg" })];
    expect(sectionShape("gallery", "studio", items)).toBe("gallery");
  });
});
