import { describe, expect, it } from "vitest";
import type { TFunction } from "../../shared/i18n/types";
import { DIRECTORY_PLACES, type DirectoryPlace } from "./directoryPlaces";
import {
  gettingInRows,
  policyHref,
  whatsHereGroups,
} from "./directoryGettingIn.data";

const t: TFunction = (key, options) =>
  options?.time === undefined ? key : `${key}|${String(options.time)}`;
const BASE: DirectoryPlace = {
  ...DIRECTORY_PLACES[0]!,
  online: false,
  mobile: false,
  entryMode: null,
  coverPolicy: null,
  payments: [],
  issuesNifInvoices: null,
  langs: [],
  langsOther: "",
};

describe("gettingInRows", () => {
  it("lists the way in, entry, ways to pay, NIF and languages in that order", () => {
    const rows = gettingInRows(t, {
      ...BASE,
      entryMode: "membersOnly",
      coverPolicy: "freeBefore",
      coverFreeBefore: "23:00",
      payments: ["cash"],
      issuesNifInvoices: true,
      langs: ["pt", "en"],
      langsOther: "Galego",
    });
    expect(rows.map((row) => [row.key, row.value])).toEqual([
      ["entry", "marketing:listingFacts.entry.membersOnly"],
      ["cover", "marketing:listingFacts.cover.freeBefore|23:00"],
      ["payments", "marketing:listingFacts.payment.cashOnly"],
      ["nif", "marketing:listingFacts.nif.yes"],
      [
        "languages",
        "marketing:listingFacts.language.pt · marketing:listingFacts.language.en · Galego",
      ],
    ]);
  });

  it("joins several ways to pay with the same separator as the languages", () => {
    const rows = gettingInRows(t, {
      ...BASE,
      payments: ["card", "mbway", "cash"],
      langs: ["en"],
    });
    expect(rows.map((row) => [row.key, row.value])).toEqual([
      [
        "payments",
        "marketing:listingFacts.payment.card · marketing:listingFacts.payment.mbway · marketing:listingFacts.payment.cash",
      ],
      ["languages", "marketing:listingFacts.language.en"],
    ]);
  });

  it("says Just turn up for an out-and-about walk-in, and only the NIF and languages online", () => {
    expect(
      gettingInRows(t, { ...BASE, mobile: true, entryMode: "walkIn" })[0]
        ?.value,
    ).toBe("marketing:listingFacts.entry.walkInMobile");
    expect(
      gettingInRows(t, {
        ...BASE,
        online: true,
        entryMode: "walkIn",
        payments: ["card"],
        issuesNifInvoices: false,
        langs: ["en"],
      }).map((row) => row.key),
    ).toEqual(["nif", "languages"]);
  });

  it("answers nothing for a listing that said nothing", () => {
    expect(gettingInRows(t, BASE)).toEqual([]);
  });
});

describe("whatsHereGroups", () => {
  it("puts a shared slug under the listing's own category heading", () => {
    const bar: DirectoryPlace = {
      ...BASE,
      cat: "nightlife",
      cats: ["nightlife"],
      attributes: ["alcohol-free-drinks", "dj-nights"],
    };
    expect(whatsHereGroups(bar)).toEqual([
      {
        groupId: "nightlife",
        attributes: ["dj-nights", "alcohol-free-drinks"],
      },
    ]);
    expect(
      whatsHereGroups({
        ...bar,
        cat: "food",
        cats: ["food"],
        attributes: ["alcohol-free-drinks"],
      }),
    ).toEqual([{ groupId: "food", attributes: ["alcohol-free-drinks"] }]);
  });

  it("reads the primary category when the listing carries no category list", () => {
    expect(
      whatsHereGroups({
        ...BASE,
        cat: "nightlife",
        cats: undefined,
        attributes: ["alcohol-free-drinks"],
      }),
    ).toEqual([{ groupId: "nightlife", attributes: ["alcohol-free-drinks"] }]);
  });
});

describe("policyHref", () => {
  it("adds https:// to a link typed without one", () => {
    expect(policyHref("lume.pt/policy")).toBe("https://lume.pt/policy");
    expect(policyHref("http://lume.pt")).toBe("http://lume.pt");
  });
});
