import { describe, expect, it } from "vitest";
import { hasPublishDate, isPieceScheduled } from "./pieceSchedule";

const NOW = Date.parse("2026-09-29T12:00:00.000Z");

describe("isPieceScheduled", () => {
  it("is false with no publish instant", () => {
    expect(isPieceScheduled({ publishedAt: null }, NOW)).toBe(false);
    expect(isPieceScheduled({ publishedAt: undefined }, NOW)).toBe(false);
    expect(isPieceScheduled({}, NOW)).toBe(false);
  });

  it("is false once the instant has passed", () => {
    expect(
      isPieceScheduled({ publishedAt: "2026-09-28T09:00:00.000Z" }, NOW),
    ).toBe(false);
  });

  it("is false at the exact instant, which is already live", () => {
    expect(
      isPieceScheduled({ publishedAt: "2026-09-29T12:00:00.000Z" }, NOW),
    ).toBe(false);
  });

  it("is true for an instant still ahead", () => {
    expect(
      isPieceScheduled({ publishedAt: "2026-09-30T08:00:00.000Z" }, NOW),
    ).toBe(true);
  });

  it("is false for a value that does not parse", () => {
    expect(isPieceScheduled({ publishedAt: "soon" }, NOW)).toBe(false);
    expect(isPieceScheduled({ publishedAt: "" }, NOW)).toBe(false);
  });

  it("reads the real clock when no time is given", () => {
    const nextWeek = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,
    ).toISOString();
    expect(isPieceScheduled({ publishedAt: nextWeek })).toBe(true);
  });
});

describe("hasPublishDate", () => {
  it("is false with no publish instant", () => {
    expect(hasPublishDate({ publishedAt: null })).toBe(false);
    expect(hasPublishDate({ publishedAt: undefined })).toBe(false);
    expect(hasPublishDate({})).toBe(false);
  });

  it("is true for a past instant, which is live", () => {
    expect(hasPublishDate({ publishedAt: "2026-09-28T09:00:00.000Z" })).toBe(
      true,
    );
  });

  it("is true for a future instant, which is scheduled", () => {
    expect(hasPublishDate({ publishedAt: "2099-01-01T09:00:00.000Z" })).toBe(
      true,
    );
  });

  it("is false for a value that does not parse", () => {
    expect(hasPublishDate({ publishedAt: "soon" })).toBe(false);
    expect(hasPublishDate({ publishedAt: "" })).toBe(false);
  });
});
