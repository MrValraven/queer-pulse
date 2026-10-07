import { describe, expect, it } from "vitest";
import {
  emptyOnlineDetailsDraft,
  toPublicOnlineDetails,
} from "./listBusiness/listingOnline.data";
import {
  INLINE_ORDERING_FACT_IDS,
  hasOrderingContent,
  isSessionsOnly,
  orderingFacts,
} from "./directoryOrdering.data";

const empty = toPublicOnlineDetails(emptyOnlineDetailsDraft());

describe("orderingFacts", () => {
  it("says nothing for an empty block", () => {
    expect(orderingFacts(empty)).toEqual([]);
  });

  it("explains VAT and fees for a seller outside the EU that leaves them out", () => {
    const facts = orderingFacts({
      ...empty,
      fulfilment: ["shipsWorldwide"],
      shipsFrom: "outsideEu",
      isVatIncluded: false,
    });
    const shipping = facts.find((fact) => fact.id === "shipping");
    expect(shipping?.lines).toEqual([
      {
        kind: "key",
        key: "marketing:directory.detail.ordering.shipsFrom.outsideEu",
      },
      { kind: "note", key: "marketing:directory.detail.ordering.vatExtra" },
    ]);
  });

  it("says VAT is included for a seller outside the EU that ticked the box", () => {
    const facts = orderingFacts({
      ...empty,
      fulfilment: ["shipsWorldwide"],
      shipsFrom: "outsideEu",
      isVatIncluded: true,
    });
    expect(facts.find((fact) => fact.id === "shipping")?.lines).toEqual([
      {
        kind: "key",
        key: "marketing:directory.detail.ordering.shipsFrom.outsideEu",
      },
      { kind: "note", key: "marketing:directory.detail.ordering.vatIncluded" },
    ]);
  });

  it("says nothing about VAT for a seller inside the EU", () => {
    const facts = orderingFacts({
      ...empty,
      fulfilment: ["shipsEu"],
      shipsFrom: "eu",
    });
    expect(facts.find((fact) => fact.id === "shipping")?.lines).toHaveLength(1);
  });

  it("states a registration as the business gave it", () => {
    const facts = orderingFacts({
      ...empty,
      registration: { body: "opp", number: "12345" },
    });
    expect(facts.find((fact) => fact.id === "registration")?.lines).toEqual([
      {
        kind: "key",
        key: "marketing:directory.detail.ordering.registration.opp",
        values: { number: "12345" },
      },
      {
        kind: "key",
        key: "marketing:directory.detail.ordering.registrationNote",
      },
    ]);
  });

  it("leaves out a registration body given without a number", () => {
    const facts = orderingFacts({
      ...empty,
      registration: { body: "opp", number: "   " },
    });
    expect(facts.find((fact) => fact.id === "registration")).toBeUndefined();
  });

  it("shows the business's own words trimmed", () => {
    const facts = orderingFacts({
      ...empty,
      pickupNote: "  Saturdays at the market  ",
    });
    expect(facts).toEqual([
      {
        id: "pickup",
        labelKey: "marketing:directory.detail.ordering.pickup",
        lines: [{ kind: "text", text: "Saturdays at the market" }],
      },
    ]);
  });

  it("keeps the facts in the page's order", () => {
    const facts = orderingFacts({
      ...empty,
      fulfilment: ["pickupLisbon"],
      pickupNote: "Saturdays",
      payments: ["mbway"],
      sessionFormats: ["video"],
      replyNote: "Within a day",
    });
    expect(facts.map((fact) => fact.id)).toEqual([
      "howGet",
      "pickup",
      "payments",
      "sessions",
      "replyNote",
    ]);
  });
});

describe("the sessions variant", () => {
  it("is a business that names session formats and no way to get a product", () => {
    expect(isSessionsOnly({ ...empty, sessionFormats: ["video"] })).toBe(true);
  });

  it("is not a business that also ships", () => {
    expect(
      isSessionsOnly({
        ...empty,
        sessionFormats: ["video"],
        fulfilment: ["shipsPortugal"],
      }),
    ).toBe(false);
  });

  it("is not a business with no session formats", () => {
    expect(isSessionsOnly(empty)).toBe(false);
  });

  it("labels the reply note without dispatch for a sessions-only business", () => {
    const facts = orderingFacts({
      ...empty,
      sessionFormats: ["video"],
      replyNote: "Within a day",
    });
    expect(facts.find((fact) => fact.id === "replyNote")?.labelKey).toBe(
      "marketing:directory.detail.ordering.replyNoteSessions",
    );
  });

  it("keeps the dispatch label for a business that ships", () => {
    const facts = orderingFacts({
      ...empty,
      fulfilment: ["shipsPortugal"],
      replyNote: "Within a day",
    });
    expect(facts.find((fact) => fact.id === "replyNote")?.labelKey).toBe(
      "marketing:directory.detail.ordering.replyNote",
    );
  });
});

describe("INLINE_ORDERING_FACT_IDS", () => {
  it("reads ways to pay as one inline list and keeps other facts stacked", () => {
    expect(INLINE_ORDERING_FACT_IDS.has("payments")).toBe(true);
    expect(INLINE_ORDERING_FACT_IDS.has("howGet")).toBe(false);
    expect(INLINE_ORDERING_FACT_IDS.has("shipping")).toBe(false);
  });
});

describe("hasOrderingContent", () => {
  it("is false for an empty block", () => {
    expect(hasOrderingContent(empty)).toBe(false);
  });

  it("is true for a main link alone", () => {
    expect(
      hasOrderingContent({
        ...empty,
        mainLink: { url: "shop.example.pt", kind: "shop" },
      }),
    ).toBe(true);
  });

  it("is true for another link alone", () => {
    expect(
      hasOrderingContent({
        ...empty,
        moreLinks: [{ url: "etsy.com/shop/example", platform: "etsy" }],
      }),
    ).toBe(true);
  });

  it("is false for a registration body without a number", () => {
    expect(
      hasOrderingContent({
        ...empty,
        registration: { body: "opp", number: "" },
      }),
    ).toBe(false);
  });
});
