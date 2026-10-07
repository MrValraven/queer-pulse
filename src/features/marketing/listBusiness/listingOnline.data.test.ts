import { describe, expect, it } from "vitest";
import {
  emptyOnlineDetailsDraft,
  isOnlineLinkValid,
  newOnlineMoreLinkRow,
  normalizeOnlineDetails,
  normalizeOnlineSummary,
  onlineDetailsForPayload,
  shouldAskRegistration,
  shouldAskSessionFormats,
  toPublicOnlineDetails,
} from "./listingOnline.data";

const filled = normalizeOnlineDetails({
  mainLink: { url: " fiosolto.pt ", kind: "shop" },
  moreLinks: [
    { url: "etsy.com/shop/fiosolto", platform: "etsy" },
    { url: "", platform: "kofi" },
  ],
  fulfilment: ["pickupLisbon", "shipsPortugal", "bogus", "shipsPortugal"],
  pickupNote: " At Livraria Rosa ",
  shipsFrom: "outsideEu",
  isVatIncluded: true,
  payments: ["paypal", "mbway"],
  sessionFormats: ["video"],
  registration: { body: "opp", number: " 12345 " },
  replyNote: " Packed Tuesdays ",
});
const therapyOnline = { online: true, cats: ["therapy"] };

describe("normalizeOnlineDetails", () => {
  it("reads a missing or empty value as the empty block", () => {
    expect(normalizeOnlineDetails(undefined)).toEqual(
      emptyOnlineDetailsDraft(),
    );
    expect(normalizeOnlineDetails({})).toEqual(emptyOnlineDetailsDraft());
  });

  it("keeps known values once each, in canonical order", () => {
    expect(filled.fulfilment).toEqual(["shipsPortugal", "pickupLisbon"]);
    expect(filled.payments).toEqual(["mbway", "paypal"]);
  });

  it("reads an unknown kind as website and an unknown platform as unanswered", () => {
    const healed = normalizeOnlineDetails({
      mainLink: { url: "x.pt", kind: "blog" },
      moreLinks: [{ url: "a.pt", platform: "myspace" }],
    });
    expect(healed.mainLink.kind).toBe("website");
    expect(healed.moreLinks[0]?.platform).toBe("");
  });

  it("falls back to the same main link kind as the card summary", () => {
    const summary = normalizeOnlineSummary({ mainLink: { url: "x.pt" } });
    const details = normalizeOnlineDetails({ mainLink: { url: "x.pt" } });
    expect(details.mainLink.kind).toBe(summary?.mainLink?.kind);
    expect(details.mainLink.kind).toBe("website");
  });

  it("keeps link row ids, so healing an editor draft changes nothing", () => {
    expect(normalizeOnlineDetails(filled)).toEqual(filled);
  });

  it("keeps the ids a resumed draft carries and mints only where one is missing", () => {
    const resumed = normalizeOnlineDetails({
      moreLinks: [
        { id: "online-link-1", url: "etsy.com/a", platform: "etsy" },
        { id: "online-link-2", url: "ko-fi.com/a", platform: "kofi" },
        { url: "patreon.com/a", platform: "patreon" },
      ],
    });
    const ids = resumed.moreLinks.map((row) => row.id);
    expect(ids.slice(0, 2)).toEqual(["online-link-1", "online-link-2"]);
    expect(ids[2]).toMatch(/[0-9a-f-]{36}/);
    expect(new Set(ids).size).toBe(3);
  });

  it("never gives a newly added row an id an existing row holds", () => {
    const resumed = normalizeOnlineDetails({
      moreLinks: [{ id: "online-link-1", url: "etsy.com/a", platform: "etsy" }],
    });
    const added = newOnlineMoreLinkRow();
    expect(resumed.moreLinks.map((row) => row.id)).not.toContain(added.id);
    expect(added.id).not.toBe(newOnlineMoreLinkRow().id);
  });

  it("gives a repeated id a fresh one, so each row stays addressable", () => {
    const healed = normalizeOnlineDetails({
      moreLinks: [
        { id: "online-link-1", url: "etsy.com/a", platform: "etsy" },
        { id: "online-link-1", url: "ko-fi.com/a", platform: "kofi" },
      ],
    });
    expect(healed.moreLinks[0]?.id).toBe("online-link-1");
    expect(healed.moreLinks[1]?.id).not.toBe("online-link-1");
  });
});

describe("onlineDetailsForPayload", () => {
  it("sends the empty block for a place that sells nothing online", () => {
    expect(
      onlineDetailsForPayload(filled, {
        online: false,
        hasOnlineShop: false,
        cats: ["health"],
      }),
    ).toEqual(toPublicOnlineDetails(emptyOnlineDetailsDraft()));
  });

  it("strips pick-up from a place that also sells online", () => {
    const payload = onlineDetailsForPayload(filled, {
      online: false,
      hasOnlineShop: true,
      cats: ["culture"],
    });
    expect(payload.fulfilment).toEqual(["shipsPortugal"]);
    expect(payload.pickupNote).toBe("");
  });

  it("keeps pick-up and trims its note for an online listing", () => {
    const payload = onlineDetailsForPayload(filled, therapyOnline);
    expect(payload.fulfilment).toEqual(["shipsPortugal", "pickupLisbon"]);
    expect(payload.pickupNote).toBe("At Livraria Rosa");
  });

  it("blanks ships-from with no shipping, and the IOSS box unless outside the EU", () => {
    const digitalOnly = normalizeOnlineDetails({
      ...filled,
      fulfilment: ["digital"],
    });
    expect(onlineDetailsForPayload(digitalOnly, therapyOnline)).toMatchObject({
      shipsFrom: "",
      isVatIncluded: false,
    });
    const fromEu = normalizeOnlineDetails({ ...filled, shipsFrom: "eu" });
    expect(onlineDetailsForPayload(fromEu, therapyOnline).isVatIncluded).toBe(
      false,
    );
  });

  it("sends session formats and a registration only when a category asks", () => {
    const apparel = onlineDetailsForPayload(filled, {
      online: true,
      cats: ["apparel"],
    });
    expect(apparel.sessionFormats).toEqual([]);
    expect(apparel.registration).toEqual({ body: "", number: "" });
    const therapy = onlineDetailsForPayload(filled, therapyOnline);
    expect(therapy.sessionFormats).toEqual(["video"]);
    expect(therapy.registration).toEqual({ body: "opp", number: "12345" });
  });

  it("trims the main link and drops a half-filled extra link", () => {
    const payload = onlineDetailsForPayload(filled, therapyOnline);
    expect(payload.mainLink).toEqual({ url: "fiosolto.pt", kind: "shop" });
    expect(payload.moreLinks).toEqual([
      { url: "etsy.com/shop/fiosolto", platform: "etsy" },
    ]);
  });
});

describe("which questions the categories ask", () => {
  it("asks session formats for therapy, classes, services, and a place's health or fitness", () => {
    expect(shouldAskSessionFormats(["intimacy"])).toBe(false);
    expect(shouldAskSessionFormats(["intimacy", "classes"])).toBe(true);
    expect(shouldAskSessionFormats(["fitness"])).toBe(true);
  });

  it("asks a registration for therapy and a place's health only", () => {
    expect(shouldAskRegistration(["health"])).toBe(true);
    expect(shouldAskRegistration(["classes"])).toBe(false);
  });
});

describe("isOnlineLinkValid", () => {
  it("accepts an empty value and a domain with or without a protocol", () => {
    for (const url of ["", "fiosolto.pt", "https://fiosolto.pt/zines"]) {
      expect(isOnlineLinkValid(url), url).toBe(true);
    }
  });

  it("refuses text that is no web address", () => {
    for (const url of ["not a link", "javascript:alert(1)"]) {
      expect(isOnlineLinkValid(url), url).toBe(false);
    }
  });

  it("refuses a backslash or whitespace inside the link, as the server does", () => {
    for (const url of ["fiosolto.pt/zines\\old", "fiosolto.pt/a\tb"]) {
      expect(isOnlineLinkValid(url), url).toBe(false);
    }
  });
});

describe("normalizeOnlineSummary", () => {
  it("keeps null for a listing that sells nothing online", () => {
    expect(normalizeOnlineSummary(null)).toBeNull();
    expect(normalizeOnlineSummary(undefined)).toBeNull();
  });

  it("heals a partial summary", () => {
    expect(normalizeOnlineSummary({ fulfilment: ["digital", "x"] })).toEqual({
      mainLink: null,
      fulfilment: ["digital"],
      sessionFormats: [],
    });
  });
});
