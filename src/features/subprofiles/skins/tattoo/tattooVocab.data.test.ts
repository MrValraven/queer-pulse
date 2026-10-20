import { describe, expect, it } from "vitest";
import { KIND_SECTIONS } from "../../kindSections.data";
import { SECTION_META, sectionsForKind } from "../../subprofile-kinds";
import {
  AVAILABILITY_TO_TATTOO_STATUS,
  TATTOO_BODY_PHOTO_SECTIONS,
  TATTOO_BOOKS_STATUSES,
  TATTOO_ITEM_SECTIONS,
  TATTOO_KIND_SECTIONS,
  TATTOO_NEW_SECTIONS,
  TATTOO_PRICE_PATTERN,
  TATTOO_STATUS_TO_AVAILABILITY,
  isCalendarDate,
  isTattooBodyPhotoSection,
  isTattooItemSection,
} from "./tattooVocab.data";

describe("tattooVocab", () => {
  it("mirrors KIND_SECTIONS.tattoo_artist in order", () => {
    expect(KIND_SECTIONS.tattoo_artist).toEqual([...TATTOO_KIND_SECTIONS]);
    expect(sectionsForKind("tattoo_artist").at(-1)).toBe("gallery");
  });

  it("nests the section lists", () => {
    for (const section of TATTOO_BODY_PHOTO_SECTIONS)
      expect(TATTOO_ITEM_SECTIONS).toContain(section);
    for (const section of TATTOO_ITEM_SECTIONS)
      expect(TATTOO_KIND_SECTIONS).toContain(section);
    expect(isTattooItemSection("gallery")).toBe(false);
    expect(isTattooItemSection("aftercare")).toBe(false);
    expect(isTattooBodyPhotoSection("wanna_dos")).toBe(false);
    expect(isTattooBodyPhotoSection("scar_work")).toBe(true);
  });

  it("maps books status and availability both ways", () => {
    expect(TATTOO_STATUS_TO_AVAILABILITY.waitlist).toBe("booking");
    for (const status of TATTOO_BOOKS_STATUSES)
      expect(
        AVAILABILITY_TO_TATTOO_STATUS[TATTOO_STATUS_TO_AVAILABILITY[status]],
      ).toBe(status);
  });

  it("accepts prices on the money pattern capped at six digits", () => {
    for (const price of ["120", "32,50", "999999.9"])
      expect(TATTOO_PRICE_PATTERN.test(price)).toBe(true);
    for (const price of ["1234567", "12.345", "12,5,0"])
      expect(TATTOO_PRICE_PATTERN.test(price)).toBe(false);
  });

  it("reads only real calendar dates", () => {
    expect(isCalendarDate("2026-02-28")).toBe(true);
    for (const value of ["2026-02-30", "2026-2-1", "2026-13-01"])
      expect(isCalendarDate(value)).toBe(false);
  });

  it("gives every new section its meta", () => {
    for (const section of TATTOO_NEW_SECTIONS)
      expect(SECTION_META[section].labelKey).toBe(
        `subprofiles:section.${section}`,
      );
    expect(SECTION_META.in_progress.fields).toEqual(["title", "description"]);
    expect(SECTION_META.shop.fields).toEqual([
      "title",
      "description",
      "imageUrl",
      "url",
    ]);
    expect(SECTION_META.guest_spots.fields).toEqual([
      "title",
      "subtitle",
      "date",
      "url",
    ]);
  });
});
