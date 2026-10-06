import { describe, expect, it } from "vitest";
import {
  hasShippedWithoutAnnouncement,
  isIssueAnnouncePending,
  isShipDateAnnounceable,
  magazineIssueVisibleThroughDate,
  magazineTodayIsoDate,
} from "./issueAnnounceRule";

// August is summer time in Lisbon (UTC+1), so 08:00Z is 09:00 there.
const LISBON_0830_SUMMER = new Date("2026-08-12T07:30:00Z");
const LISBON_0900_SUMMER = new Date("2026-08-12T08:00:00Z");

describe("magazineTodayIsoDate", () => {
  it("reads today in Lisbon, past UTC midnight", () => {
    expect(magazineTodayIsoDate(new Date("2026-08-12T23:30:00Z"))).toBe(
      "2026-08-13",
    );
  });
});

describe("magazineIssueVisibleThroughDate", () => {
  it("is yesterday before 09:00 Lisbon and today from 09:00", () => {
    expect(magazineIssueVisibleThroughDate(LISBON_0830_SUMMER)).toBe(
      "2026-08-11",
    );
    expect(magazineIssueVisibleThroughDate(LISBON_0900_SUMMER)).toBe(
      "2026-08-12",
    );
  });

  it("rolls back across a month boundary", () => {
    expect(
      magazineIssueVisibleThroughDate(new Date("2026-09-01T07:00:00Z")),
    ).toBe("2026-08-31");
  });

  it("follows winter time, when Lisbon sits on UTC", () => {
    expect(
      magazineIssueVisibleThroughDate(new Date("2026-01-15T08:30:00Z")),
    ).toBe("2026-01-14");
    expect(
      magazineIssueVisibleThroughDate(new Date("2026-01-15T09:00:00Z")),
    ).toBe("2026-01-15");
  });
});

describe("isShipDateAnnounceable", () => {
  it("announces an issue shipped on its date from 09:00 Lisbon", () => {
    expect(isShipDateAnnounceable("2026-08-12", LISBON_0900_SUMMER)).toBe(true);
  });

  it("goes out quietly on its date before 09:00 Lisbon", () => {
    expect(isShipDateAnnounceable("2026-08-12", LISBON_0830_SUMMER)).toBe(
      false,
    );
  });

  it("goes out quietly for a future date", () => {
    expect(isShipDateAnnounceable("2026-08-13", LISBON_0900_SUMMER)).toBe(
      false,
    );
  });

  it("announces a past-dated issue at any hour", () => {
    expect(isShipDateAnnounceable("2026-08-01", LISBON_0830_SUMMER)).toBe(true);
  });

  it("dates an undated issue today, as the ship does", () => {
    expect(isShipDateAnnounceable(null, LISBON_0830_SUMMER)).toBe(false);
    expect(isShipDateAnnounceable(null, LISBON_0900_SUMMER)).toBe(true);
  });
});

describe("isIssueAnnouncePending", () => {
  it("is pending only with the toggle on and no announcement yet", () => {
    expect(isIssueAnnouncePending(true, null)).toBe(true);
    expect(isIssueAnnouncePending(true, "2026-08-12T08:00:00Z")).toBe(false);
    expect(isIssueAnnouncePending(false, null)).toBe(false);
  });
});

describe("hasShippedWithoutAnnouncement", () => {
  const STAMPED = { publishedAt: "2026-09-01T08:00:00.000Z" };
  const UNSTAMPED = { publishedAt: null };

  it("is true once a ship stamped pieces and the bell never rang", () => {
    expect(
      hasShippedWithoutAnnouncement(true, { publishedPieceIds: ["p5"] }, [
        STAMPED,
        UNSTAMPED,
      ]),
    ).toBe(true);
  });

  it("stays true after a quiet ship and then an empty re-ship", () => {
    expect(
      hasShippedWithoutAnnouncement(true, { publishedPieceIds: [] }, [
        STAMPED,
        UNSTAMPED,
      ]),
    ).toBe(true);
  });

  it("counts a future-dated stamp as spent", () => {
    expect(
      hasShippedWithoutAnnouncement(true, { publishedPieceIds: [] }, [
        { publishedAt: "2099-01-01T09:00:00.000Z" },
      ]),
    ).toBe(true);
  });

  it("is false after a ship that never stamped anything", () => {
    expect(
      hasShippedWithoutAnnouncement(true, { publishedPieceIds: [] }, [
        UNSTAMPED,
      ]),
    ).toBe(false);
  });

  it("is false before any ship", () => {
    expect(hasShippedWithoutAnnouncement(true, null, [STAMPED])).toBe(false);
    expect(hasShippedWithoutAnnouncement(true, undefined, [STAMPED])).toBe(
      false,
    );
  });

  it("is false when nothing is pending", () => {
    expect(
      hasShippedWithoutAnnouncement(false, { publishedPieceIds: ["p5"] }, [
        STAMPED,
      ]),
    ).toBe(false);
  });
});
