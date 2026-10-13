import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import type { DayHours } from "./listBusiness/listBusiness.data";
import {
  cardHighlights,
  directoryCardBadges,
  isOpenLate,
  isOpenSundays,
  priceBandLabel,
} from "./directoryCardFacts";

const t: TFunction = (key) => key;
const open = (from: string, to: string): DayHours => ({
  open: true,
  intervals: [{ from, to }],
});
const closed = (from: string, to: string): DayHours => ({
  open: false,
  intervals: [{ from, to }],
});

describe("isOpenLate", () => {
  it("reads an overnight window as late", () => {
    expect(isOpenLate({ Fri: open("18:00", "02:00") })).toBe(true);
    expect(isOpenLate({ Fri: open("18:00", "00:00") })).toBe(true);
  });

  it("reads a close at 23:00 or later as late, and earlier as not", () => {
    expect(isOpenLate({ Sat: open("12:00", "23:00") })).toBe(true);
    expect(isOpenLate({ Sat: open("12:00", "22:59") })).toBe(false);
  });

  it("ignores closed days, blank windows and unknown hours", () => {
    expect(isOpenLate({ Sat: closed("20:00", "02:00") })).toBe(false);
    expect(isOpenLate({ Sat: open("", "") })).toBe(false);
    expect(isOpenLate(undefined)).toBe(false);
    expect(isOpenLate({})).toBe(false);
  });
});

describe("isOpenSundays", () => {
  it("is true only for an open Sunday", () => {
    expect(isOpenSundays({ Sun: open("10:00", "14:00") })).toBe(true);
    expect(isOpenSundays({ Sun: closed("10:00", "14:00") })).toBe(false);
    expect(isOpenSundays({})).toBe(false);
    expect(isOpenSundays(undefined)).toBe(false);
  });
});

describe("directoryCardBadges", () => {
  const lateWithSundays = {
    Fri: open("18:00", "02:00"),
    Sun: open("16:00", "23:00"),
  };

  it("shows two at most, in order", () => {
    expect(
      directoryCardBadges({
        cat: "food",
        hours: lateWithSundays,
        hostsGatherings: true,
      }),
    ).toEqual(["openLate", "openSundays"]);
  });

  it("never says Open late for nightlife, where late is expected", () => {
    expect(
      directoryCardBadges({
        cat: "nightlife",
        hours: lateWithSundays,
        hostsGatherings: true,
      }),
    ).toEqual(["openSundays", "hostsGatherings"]);
  });

  it("never says Open late when nightlife is a second category", () => {
    expect(
      directoryCardBadges({
        cat: "food",
        cats: ["food", "nightlife"],
        hours: lateWithSundays,
      }),
    ).toEqual(["openSundays"]);
  });

  it("gives an online listing Hosts gatherings only", () => {
    expect(
      directoryCardBadges({
        cat: "classes",
        online: true,
        hours: lateWithSundays,
        hostsGatherings: true,
      }),
    ).toEqual(["hostsGatherings"]);
  });

  it("shows nothing for a listing with no hours and no gatherings", () => {
    expect(directoryCardBadges({ cat: "design" })).toEqual([]);
  });
});

describe("priceBandLabel and cardHighlights", () => {
  it("translates Free, prints a band as its symbols and free text as written", () => {
    expect(priceBandLabel(t, "Free")).toBe("marketing:listBusiness.price.free");
    expect(priceBandLabel(t, "€€")).toBe("€€");
    expect(priceBandLabel(t, "from 20 EUR")).toBe("from 20 EUR");
    expect(priceBandLabel(t, undefined)).toBe("");
  });

  it("keeps three highlights at most", () => {
    expect(cardHighlights(["a", "b", "c", "d"])).toEqual(["a", "b", "c"]);
    expect(cardHighlights(undefined)).toEqual([]);
  });
});
