import { describe, expect, it } from "vitest";
import type {
  SkinBlockControl,
  SkinChapterDescriptor,
} from "./skinBlockFields.data";
import {
  chapterFill,
  isControlFilled,
  isControlVisible,
} from "./skinChapterFill";

function readerOf(
  values: Record<string, unknown>,
  rowCounts: Record<string, number> = {},
) {
  return {
    getValue: (path: string) => values[path],
    sectionRowCount: (section: string) => rowCounts[section] ?? 0,
  };
}

const galleryControl: SkinBlockControl = {
  path: "section:gallery",
  kind: "sectionList",
  section: "gallery",
  labelKey: "subprofiles:section.gallery",
};

const calendarControl: SkinBlockControl = {
  path: "availability",
  kind: "grid",
  labelKey: "subprofiles:skinBlock.practice.availability.title",
};

describe("isControlFilled", () => {
  it("counts a section list with one image-only photo as filled", () => {
    expect(isControlFilled(galleryControl, readerOf({}, { gallery: 1 }))).toBe(
      true,
    );
  });

  it("counts an empty section list as unfilled", () => {
    expect(isControlFilled(galleryControl, readerOf({}, { gallery: 0 }))).toBe(
      false,
    );
  });

  it("counts a calendar with a start date as filled", () => {
    const reader = readerOf({
      availability: { startDate: "2026-10-01", cells: [] },
    });
    expect(isControlFilled(calendarControl, reader)).toBe(true);
  });

  it("counts a calendar without a start date as unfilled", () => {
    expect(
      isControlFilled(
        calendarControl,
        readerOf({ availability: { startDate: "" } }),
      ),
    ).toBe(false);
  });
});

const retiredFeeControl: SkinBlockControl = {
  path: "practical.fee",
  kind: "text",
  labelKey: "subprofiles:skinBlock.practice.practical.fee",
  helperKey: "subprofiles:skinBlock.practice.practical.feeRetiredHelper",
  isRetired: true,
};

const retiredTrainingControl: SkinBlockControl = {
  path: "training",
  kind: "lines",
  labelKey: "subprofiles:skinBlock.practice.training.title",
  isRetired: true,
  moveToSection: "credentials",
};

const lengthControl: SkinBlockControl = {
  path: "practical.length",
  kind: "text",
  labelKey: "subprofiles:skinBlock.practice.practical.length",
};

const feesChapter: SkinChapterDescriptor = {
  key: "fees",
  titleKey: "subprofiles:skinChapter.derived.fees.title",
  ledeKey: "subprofiles:skinChapter.derived.fees.lede",
  groups: [{ controls: [retiredFeeControl, lengthControl] }],
};

describe("isControlVisible for a retired control", () => {
  const chapters = [feesChapter];

  it("shows a retired text field while it holds an older answer", () => {
    const reader = readerOf({ "practical.fee": "60 € a session" });
    expect(isControlVisible(retiredFeeControl, reader, chapters)).toBe(true);
  });

  it("hides a retired text field once it is empty or blank", () => {
    expect(isControlVisible(retiredFeeControl, readerOf({}), chapters)).toBe(
      false,
    );
    const blank = readerOf({ "practical.fee": "   " });
    expect(isControlVisible(retiredFeeControl, blank, chapters)).toBe(false);
  });

  it("shows a retired list only while one line has text", () => {
    const filled = readerOf({ training: ["", "Two-year training, Lisbon"] });
    expect(isControlVisible(retiredTrainingControl, filled, chapters)).toBe(
      true,
    );
    const blankLines = readerOf({ training: ["", " "] });
    expect(isControlVisible(retiredTrainingControl, blankLines, chapters)).toBe(
      false,
    );
  });

  it("leaves an empty retired field out of the chapter's fill count", () => {
    expect(chapterFill(feesChapter, readerOf({}), chapters)).toEqual({
      filled: 0,
      total: 1,
    });
    const withOlderFee = readerOf({ "practical.fee": "60 €" });
    expect(chapterFill(feesChapter, withOlderFee, chapters)).toEqual({
      filled: 1,
      total: 2,
    });
  });
});
