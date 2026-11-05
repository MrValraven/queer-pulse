import { expect, it } from "vitest";
import { isSectionShownForKind, itemsShownForKind } from "./subprofile-kinds";

it("always shows links and gallery", () => {
  expect(isSectionShownForKind("links", "dj")).toBe(true);
  expect(isSectionShownForKind("gallery", "dj")).toBe(true);
});

it("hides a section the kind does not use", () => {
  expect(isSectionShownForKind("discography", "dj")).toBe(false);
});

it("keeps shown items in order and drops hidden ones", () => {
  const items = [
    { section: "discography" },
    { section: "mixes" },
    { section: "links" },
    { section: "gigs" },
  ] as const;
  expect(itemsShownForKind(items, "dj").map((item) => item.section)).toEqual([
    "mixes",
    "links",
    "gigs",
  ]);
});
