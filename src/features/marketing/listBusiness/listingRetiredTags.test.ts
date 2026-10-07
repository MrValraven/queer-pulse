import { describe, expect, it } from "vitest";
import { blankDraft } from "./listingFormDraft";
import { draftToDto } from "./draftToDto";
import { normalizeOnlineDetails } from "./listingOnline.data";
import {
  healRetiredOnlineTags,
  knownListingTags,
  RETIRED_ONLINE_TAG_MOVES,
} from "./listingRetiredTags";

describe("healRetiredOnlineTags", () => {
  it("moves all ten retired tags into the online block", () => {
    const legacy = {
      ...blankDraft(),
      online: true,
      tags: [...Object.keys(RETIRED_ONLINE_TAG_MOVES), "Made to order"],
    };
    const healed = healRetiredOnlineTags(legacy);
    expect(healed.tags).toEqual(["Made to order"]);
    expect(healed.onlineDetails?.fulfilment).toEqual([
      "shipsPortugal",
      "shipsEu",
      "shipsWorldwide",
      "digital",
      "pickupLisbon",
    ]);
    expect(healed.onlineDetails?.payments).toEqual([
      "mbway",
      "multibanco",
      "paypal",
    ]);
    expect(healed.onlineDetails?.sessionFormats).toEqual(["video", "phone"]);
  });

  it("keeps what the online block already holds, once each", () => {
    const legacy = {
      ...blankDraft(),
      online: true,
      tags: ["PayPal", "Ships worldwide"],
      onlineDetails: normalizeOnlineDetails({
        mainLink: { url: "fiosolto.pt", kind: "shop" },
        fulfilment: ["shipsWorldwide"],
        payments: ["card"],
      }),
    };
    const healed = healRetiredOnlineTags(legacy);
    expect(healed.tags).toEqual([]);
    expect(healed.onlineDetails?.mainLink.url).toBe("fiosolto.pt");
    expect(healed.onlineDetails?.fulfilment).toEqual(["shipsWorldwide"]);
    expect(healed.onlineDetails?.payments).toEqual(["card", "paypal"]);
  });

  it("returns the same draft for a place and for a draft with nothing to move", () => {
    const place = { ...blankDraft(), tags: ["PayPal"] };
    expect(healRetiredOnlineTags(place)).toBe(place);
    const online = { ...blankDraft(), online: true, tags: ["Gift cards"] };
    expect(healRetiredOnlineTags(online)).toBe(online);
  });
});

describe("tags on a create body", () => {
  it("keeps only the vocabulary's tags", () => {
    expect(
      knownListingTags(["Terrace", "PayPal", "Cosy", "Gift cards"]),
    ).toEqual(["Terrace", "Gift cards"]);
  });

  it("drops a retired tag from both create paths", () => {
    for (const path of ["claim", "suggest"] as const) {
      const draft = { ...blankDraft(), path, tags: ["Terrace", "MB WAY"] };
      expect(draftToDto(draft).tags, path).toEqual(["Terrace"]);
    }
  });
});
