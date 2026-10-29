import { describe, expect, it } from "vitest";
import {
  toBuyerPurchaseView,
  type StudioBuyerPurchaseView,
} from "./api/studioPurchases.adapters";
import {
  STUDIO_QUICK_PICK_STEPS_CENTS,
  amountErrorKeyOf,
  centsFromEuroText,
  euroTextFromCents,
  isSellableReleaseType,
  offerPanelStateOf,
  priceErrorKeyOf,
  quickPickAmountsCents,
} from "./studioPurchaseRules";

describe("centsFromEuroText", () => {
  it.each([
    ["3", 300],
    ["3.5", 350],
    ["3,50", 350],
    [" 3 € ", 300],
    ["0", 0],
    ["500", 50000],
    ["500.01", 50001],
  ])("reads %s as %i cents", (text, cents) => {
    expect(centsFromEuroText(text)).toBe(cents);
  });

  it.each([
    "",
    "3.505",
    "-1",
    "abc",
    "1.2.3",
    "3,5,0",
    " 3 € 5",
    "1 000",
    "3 €5",
  ])("reads %s as nothing", (text) => {
    expect(centsFromEuroText(text)).toBeNull();
  });
});

it("writes cents back in the separator asked for", () => {
  expect(euroTextFromCents(300, ".")).toBe("3");
  expect(euroTextFromCents(350, ",")).toBe("3,50");
  expect(euroTextFromCents(350, ".")).toBe("3.50");
  expect(euroTextFromCents(5, ".")).toBe("0.05");
});

it("climbs the quick pick steps in ascending order", () => {
  const sortedSteps = [...STUDIO_QUICK_PICK_STEPS_CENTS].sort(
    (left, right) => left - right,
  );
  expect(STUDIO_QUICK_PICK_STEPS_CENTS).toEqual(sortedSteps);
  expect(STUDIO_QUICK_PICK_STEPS_CENTS).toHaveLength(20);
});

describe("quickPickAmountsCents", () => {
  it.each([
    [0, [0, 100, 200]],
    [300, [300, 500, 800]],
    [250, [250, 300, 500]],
    [49900, [49900, 50000]],
    [50000, [50000]],
  ])("from %i", (minimum, picks) => {
    expect(quickPickAmountsCents(minimum)).toEqual(picks);
  });
});

it("sells albums, EPs and singles only", () => {
  expect(["album", "ep", "single"].every(isSellableReleaseType)).toBe(true);
  expect(
    ["mix", "edit", "lip_sync", "podcast", "x"].some(isSellableReleaseType),
  ).toBe(false);
});

it("names the reason a price or an amount is refused", () => {
  expect(priceErrorKeyOf("fixed", 99)).toBe(
    "studio:errors.reason.studio_price_out_of_range",
  );
  expect(priceErrorKeyOf("fixed", 50001)).toBe(
    "studio:errors.reason.studio_price_out_of_range",
  );
  expect(priceErrorKeyOf("name_your_price", 0)).toBeNull();
  expect(priceErrorKeyOf("fixed", 100)).toBeNull();
  expect(priceErrorKeyOf("fixed", null)).toBe(
    "studio:purchase.price.amountRequired",
  );
  expect(
    amountErrorKeyOf({ mode: "name_your_price", amountCents: 300 }, 299),
  ).toBe("studio:errors.reason.studio_purchase_amount_below_minimum");
  expect(
    amountErrorKeyOf({ mode: "name_your_price", amountCents: 0 }, 50001),
  ).toBe("studio:errors.reason.studio_purchase_amount_above_cap");
  expect(
    amountErrorKeyOf({ mode: "name_your_price", amountCents: 0 }, 0),
  ).toBeNull();
  expect(amountErrorKeyOf({ mode: "fixed", amountCents: 300 }, null)).toBe(
    "studio:purchase.sheet.amountRequired",
  );
  expect(amountErrorKeyOf({ mode: "fixed", amountCents: 300 }, 400)).toBe(
    "studio:errors.reason.studio_purchase_price_changed",
  );
  expect(amountErrorKeyOf({ mode: "fixed", amountCents: 300 }, 300)).toBeNull();
});

function ownedPurchaseFixture(): StudioBuyerPurchaseView {
  const purchase = toBuyerPurchaseView({
    id: "pur-1",
    status: "confirmed",
    item: {
      kind: "release",
      title: "Água-forte",
      releaseId: "rel-1",
      trackId: null,
      releaseType: "album",
      coverUrl: null,
      isAvailable: true,
    },
    artist: {
      name: "Rita Ferreira",
      subprofileId: "sp-rita",
      handle: "rita-ferreira",
      isLinkable: true,
    },
    amountCents: 300,
    referenceCode: "QP4M7R",
    payerName: null,
    declineReason: null,
    declineNote: null,
    createdAt: "2026-10-28T12:00:00Z",
    decidedAt: "2026-10-28T13:00:00Z",
    wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
    downloads: [],
  });
  if (purchase === null) throw new Error("test purchase must resolve");
  return purchase;
}
const OWNED = ownedPurchaseFixture();

describe("offerPanelStateOf", () => {
  it("lets the viewer's own persona win over an owned or pending purchase", () => {
    expect(
      offerPanelStateOf({
        state: "refused",
        refusalCode: "studio_purchase_own_persona",
        ownedPurchase: OWNED,
      }),
    ).toBe("refused");
    expect(
      offerPanelStateOf({
        state: "refused",
        refusalCode: "studio_purchase_own_persona",
        ownedPurchase: null,
      }),
    ).toBe("refused");
  });

  it("lets an owned purchase win over any other refusal or a pending claim", () => {
    expect(
      offerPanelStateOf({
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        ownedPurchase: OWNED,
      }),
    ).toBe("owned");
    expect(
      offerPanelStateOf({
        state: "pending",
        refusalCode: null,
        ownedPurchase: OWNED,
      }),
    ).toBe("owned");
  });

  it("keeps the server's state when nothing is owned", () => {
    expect(
      offerPanelStateOf({
        state: "can_buy",
        refusalCode: null,
        ownedPurchase: null,
      }),
    ).toBe("can_buy");
    expect(
      offerPanelStateOf({
        state: "pending",
        refusalCode: null,
        ownedPurchase: null,
      }),
    ).toBe("pending");
    expect(
      offerPanelStateOf({
        state: "refused",
        refusalCode: null,
        ownedPurchase: null,
      }),
    ).toBe("refused");
  });
});
