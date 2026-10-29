import { describe, expect, it } from "vitest";
import { ApiError } from "../../../shared/api/client";
import {
  buyerPurchaseViewsPageOf,
  isBuyPanelShown,
  isPaymentCodeRefusal,
  paymentMethodErrorIndexOf,
  priceChangedPriceOf,
  purchaseFormatLabelKey,
  sellerPurchaseViewsPageOf,
  toBuyerPurchaseView,
  toDownloadRefusalCode,
  toOfferView,
  toPaymentMethodsView,
  toPriceView,
  toPurchaseReferenceView,
  toSalesTotalsView,
  toSellerPurchaseView,
  toWallEntryView,
} from "./studioPurchases.adapters";
import type {
  StudioBuyerPurchaseDTO,
  StudioOfferDTO,
  StudioPaymentMethodDTO,
  StudioPaymentMethodsDTO,
  StudioSellerPurchaseDTO,
  StudioTrackOfferDTO,
  StudioWallEntryDTO,
} from "./studioPurchases.types";

function purchaseDto(
  overrides: Partial<StudioBuyerPurchaseDTO> = {},
): StudioBuyerPurchaseDTO {
  return {
    id: "pur-1",
    status: "confirmed",
    item: {
      kind: "release",
      title: "Mare Funda",
      releaseId: "rel-1",
      trackId: null,
      releaseType: "album",
      coverUrl: null,
      isAvailable: true,
    },
    artist: {
      name: "Mare Funda",
      subprofileId: "sp-1",
      handle: "marefunda",
      isLinkable: true,
    },
    amountCents: 500,
    referenceCode: "QP4M7R",
    payerName: "Sara",
    declineReason: null,
    declineNote: null,
    createdAt: "2026-10-20T10:00:00.000Z",
    decidedAt: "2026-10-21T10:00:00.000Z",
    wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
    downloads: [],
    ...overrides,
  };
}

function trackOfferDto(
  overrides: Partial<StudioTrackOfferDTO> = {},
): StudioTrackOfferDTO {
  return {
    trackId: "trk-1",
    position: 1,
    title: "Lado A",
    price: { mode: "fixed", amountCents: 200 },
    state: "can_buy",
    refusalCode: null,
    pendingPurchaseId: null,
    ownedPurchaseId: null,
    ...overrides,
  };
}

function offerDto(overrides: Partial<StudioOfferDTO> = {}): StudioOfferDTO {
  return {
    item: purchaseDto().item,
    artist: {
      id: "sp-1",
      handle: "marefunda",
      name: "Mare Funda",
      kind: "musician",
      avatarUrl: null,
    },
    price: { mode: "fixed", amountCents: 500 },
    viewer: {
      state: "can_buy",
      refusalCode: null,
      pendingPurchase: null,
      ownedPurchase: null,
    },
    paymentMethods: [],
    identityOptions: [],
    ...overrides,
  };
}

function methodDto(kind: string): StudioPaymentMethodDTO {
  return {
    id: `method-${kind}`,
    kind,
    label: null,
    value: "912345678",
    note: null,
    position: 0,
  };
}

function sellerDto(
  overrides: Partial<StudioSellerPurchaseDTO> = {},
): StudioSellerPurchaseDTO {
  return {
    id: "pur-2",
    status: "pending",
    item: purchaseDto().item,
    amountCents: 500,
    referenceCode: "QP4M7R",
    payerName: "Sara",
    buyer: { slug: "sara", displayName: " Sara Marques ", avatarUrl: null },
    createdAt: "2026-10-20T10:00:00.000Z",
    decidedAt: null,
    ...overrides,
  };
}

function wallEntryDto(): StudioWallEntryDTO {
  return {
    key: "account:abc",
    identity: {
      kind: "account",
      member: { slug: "sara", displayName: "Sara", avatarUrl: null },
    },
  };
}

it("reads a known price and drops an unknown mode or an out-of-range amount", () => {
  expect(toPriceView({ mode: "fixed", amountCents: 300 })).toEqual({
    mode: "fixed",
    amountCents: 300,
  });
  expect(toPriceView({ mode: "pay_later", amountCents: 300 })).toBeNull();
  expect(toPriceView({ mode: "fixed", amountCents: 50 })).toBeNull();
  expect(toPriceView({ mode: "name_your_price", amountCents: 0 })).toEqual({
    mode: "name_your_price",
    amountCents: 0,
  });
  expect(toPriceView(null)).toBeNull();
  expect(toPriceView(undefined)).toBeNull();
});

it("names the format from the release type", () => {
  expect(purchaseFormatLabelKey("release", "ep")).toBe(
    "studio:purchase.format.ep",
  );
  expect(purchaseFormatLabelKey("track", "album")).toBe(
    "studio:purchase.format.track",
  );
  expect(purchaseFormatLabelKey("release", null)).toBe(
    "studio:purchase.format.release",
  );
});

it("links a live item and artist, and leaves an unlinked artist and a gone item as text with their downloads", () => {
  const live = toBuyerPurchaseView(purchaseDto())!;
  expect(live.item.href).toBe("/studio/album?id=rel-1");
  expect(live.artist.href).toBe("/studio/artist?id=sp-1");
  const unlinked = toBuyerPurchaseView(
    purchaseDto({
      item: {
        kind: "release",
        title: "Cassete",
        releaseId: null,
        trackId: null,
        releaseType: null,
        coverUrl: null,
        isAvailable: false,
      },
      artist: {
        name: "Mare Funda",
        subprofileId: null,
        handle: null,
        isLinkable: false,
      },
      downloads: [
        {
          trackId: "kept-1",
          position: 1,
          title: "Lado A",
          durationSeconds: 200,
          format: "mp3",
          unavailableReason: null,
        },
        {
          trackId: "kept-2",
          position: 2,
          title: "Lado B",
          durationSeconds: null,
          format: "m4a",
          unavailableReason: "studio_download_track_preparing",
        },
      ],
    }),
  )!;
  expect([
    unlinked.item.href,
    unlinked.artist.href,
    unlinked.artist.subprofileId,
    unlinked.artist.name,
  ]).toEqual([null, null, null, "Mare Funda"]);
  expect(
    unlinked.downloads.map((track) => [
      track.trackId,
      track.durationLabel,
      track.unavailableReason,
    ]),
  ).toEqual([
    ["kept-1", "3:20", null],
    ["kept-2", null, "studio_download_track_preparing"],
  ]);
});

it("reads an unknown download refusal as not ready (fail closed) and drops an unknown status", () => {
  expect(toDownloadRefusalCode("studio_download_future_reason")).toBe(
    "studio_download_track_not_ready",
  );
  expect(toDownloadRefusalCode(null)).toBeNull();
  expect(toBuyerPurchaseView(purchaseDto({ status: "refunded" }))).toBeNull();
  expect(
    toBuyerPurchaseView(
      purchaseDto({ declineReason: "rude", status: "declined" }),
    )?.declineReason,
  ).toBe("other");
});

it("shows the panel only with something to show, an owned item off sale included", () => {
  const ownedOffSale = toOfferView(
    offerDto({
      price: null,
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        pendingPurchase: null,
        ownedPurchase: purchaseDto({ status: "confirmed" }),
      },
    }),
  )!;
  expect(isBuyPanelShown(ownedOffSale)).toBe(true);
  const nothing = toOfferView(
    offerDto({
      price: null,
      trackOffers: [],
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        pendingPurchase: null,
        ownedPurchase: null,
      },
    }),
  )!;
  expect(isBuyPanelShown(nothing)).toBe(false);
  expect(
    isBuyPanelShown(
      toOfferView(offerDto({ price: null, trackOffers: [trackOfferDto()] }))!,
    ),
  ).toBe(true);
});

it("keeps a refusal code this build knows and drops an unknown one to the generic state", () => {
  expect(
    toOfferView(
      offerDto({
        viewer: {
          state: "refused",
          refusalCode: "studio_purchase_unavailable",
          pendingPurchase: null,
          ownedPurchase: null,
        },
      }),
    )!.viewer.refusalCode,
  ).toBe("studio_purchase_unavailable");
  const futureRefusal = toOfferView(
    offerDto({
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_from_the_future",
        pendingPurchase: null,
        ownedPurchase: null,
      },
    }),
  )!;
  expect([
    futureRefusal.viewer.state,
    futureRefusal.viewer.refusalCode,
  ]).toEqual(["refused", null]);
  expect(
    toOfferView(
      offerDto({
        viewer: {
          state: "dreaming",
          refusalCode: null,
          pendingPurchase: null,
          ownedPurchase: null,
        },
      }),
    ),
  ).toBeNull();
});

describe("rows this build cannot read", () => {
  it("drops payment methods of an unknown kind and unreadable pages rows", () => {
    expect(
      toPaymentMethodsView({
        methods: [methodDto("mbway"), methodDto("crypto")],
        hasItemsForSale: true,
        updatedAt: null,
      }).methods.map((method) => method.kind),
    ).toEqual(["mbway"]);
    const page = buyerPurchaseViewsPageOf({
      items: [purchaseDto(), purchaseDto({ status: "refunded" })],
      pageInfo: { nextCursor: "c", hasMore: true },
    });
    expect(page.items).toHaveLength(1);
    expect(page.pageInfo).toEqual({ nextCursor: "c", hasMore: true });
    expect(
      sellerPurchaseViewsPageOf({
        items: [sellerDto(), sellerDto({ createdAt: "not a date" })],
        pageInfo: { nextCursor: null, hasMore: false },
      }).items,
    ).toHaveLength(1);
  });
});

it("reads the new price and the refused row from an error body", () => {
  expect(
    priceChangedPriceOf(
      new ApiError(409, "x", {
        code: "studio_purchase_price_changed",
        price: { mode: "fixed", amountCents: 400 },
      }),
    ),
  ).toEqual({ mode: "fixed", amountCents: 400 });
  expect(priceChangedPriceOf(new Error("x"))).toBeNull();
  expect(
    paymentMethodErrorIndexOf(
      new ApiError(400, "x", { code: "studio_payment_iban_invalid", index: 2 }),
    ),
  ).toBe(2);
  expect(paymentMethodErrorIndexOf(new Error("x"))).toBeNull();
});

it("knows an expired or taken payment code from any other refusal", () => {
  expect(
    isPaymentCodeRefusal(
      new ApiError(400, "x", { code: "studio_purchase_reference_invalid" }),
    ),
  ).toBe(true);
  expect(
    isPaymentCodeRefusal(
      new ApiError(409, "x", { code: "studio_purchase_reference_taken" }),
    ),
  ).toBe(true);
  expect(
    isPaymentCodeRefusal(
      new ApiError(409, "x", { code: "studio_purchase_price_changed" }),
    ),
  ).toBe(false);
  expect(isPaymentCodeRefusal(new Error("x"))).toBe(false);
});

it("reads a payment code only in the unambiguous alphabet", () => {
  expect(
    toPurchaseReferenceView({
      referenceCode: "QP4M7R",
      referenceToken: "t",
      expiresAt: "2026-11-04T10:00:00.000Z",
    })?.referenceCode,
  ).toBe("QP4M7R");
  expect(
    toPurchaseReferenceView({
      referenceCode: "QP0O1I",
      referenceToken: "t",
      expiresAt: "2026-11-04T10:00:00.000Z",
    }),
  ).toBeNull();
});

it("shows a deleted buyer as nobody and never carries amounts on a wall entry", () => {
  expect(toSellerPurchaseView(sellerDto({ buyer: null }))!.buyer).toBeNull();
  expect(toSellerPurchaseView(sellerDto())!.buyer).toMatchObject({
    name: "Sara Marques",
    href: "/members/sara",
  });
  expect(Object.keys(toWallEntryView(wallEntryDto())!)).toEqual([
    "key",
    "identity",
  ]);
});

it("reads sales totals as whole numbers", () => {
  expect(
    toSalesTotalsView({
      last28Days: { amountCents: 1500, count: 3 },
      allTime: { amountCents: 4200, count: 9 },
    }),
  ).toEqual({
    last28Days: { amountCents: 1500, count: 3 },
    allTime: { amountCents: 4200, count: 9 },
  });
});

describe("review fixes: unreadable and missing fields", () => {
  it("drops a purchase row whose amount is unreadable", () => {
    expect(
      toBuyerPurchaseView(purchaseDto({ amountCents: Number.NaN })),
    ).toBeNull();
    expect(toBuyerPurchaseView(purchaseDto({ amountCents: -5 }))).toBeNull();
    expect(toBuyerPurchaseView(purchaseDto({ amountCents: 1.5 }))).toBeNull();
    expect(
      toSellerPurchaseView(sellerDto({ amountCents: Number.NaN })),
    ).toBeNull();
    expect(toSellerPurchaseView(sellerDto({ amountCents: 0 }))).not.toBeNull();
  });

  it("reads owned or pending without a readable purchase as refused with no code", () => {
    const unreadable = purchaseDto({ status: "refunded" });
    const ownedWithoutPurchase = toOfferView(
      offerDto({
        viewer: {
          state: "owned",
          refusalCode: null,
          pendingPurchase: null,
          ownedPurchase: unreadable,
        },
      }),
    )!;
    expect([
      ownedWithoutPurchase.viewer.state,
      ownedWithoutPurchase.viewer.refusalCode,
    ]).toEqual(["refused", null]);
    const pendingWithoutPurchase = toOfferView(
      offerDto({
        viewer: {
          state: "pending",
          refusalCode: null,
          pendingPurchase: null,
          ownedPurchase: null,
        },
      }),
    )!;
    expect(pendingWithoutPurchase.viewer.state).toBe("refused");
    const ownedWithPurchase = toOfferView(
      offerDto({
        viewer: {
          state: "owned",
          refusalCode: null,
          pendingPurchase: null,
          ownedPurchase: purchaseDto(),
        },
      }),
    )!;
    expect(ownedWithPurchase.viewer.state).toBe("owned");
  });

  it("reads a missing array or wall as empty without throwing", () => {
    const sparseOffer = offerDto() as unknown as Record<string, unknown>;
    delete sparseOffer.paymentMethods;
    delete sparseOffer.identityOptions;
    const offer = toOfferView(sparseOffer as unknown as StudioOfferDTO)!;
    expect([
      offer.paymentMethods,
      offer.identityOptions,
      offer.trackOffers,
    ]).toEqual([[], [], []]);
    const sparsePurchase = purchaseDto() as unknown as Record<string, unknown>;
    delete sparsePurchase.downloads;
    delete sparsePurchase.wall;
    const purchase = toBuyerPurchaseView(
      sparsePurchase as unknown as StudioBuyerPurchaseDTO,
    )!;
    expect(purchase.downloads).toEqual([]);
    expect(purchase.wall).toEqual({
      isOnWall: false,
      shownAs: null,
      needsNewIdentity: false,
    });
    const sparseMethods = toPaymentMethodsView({
      hasItemsForSale: false,
      updatedAt: null,
    } as unknown as StudioPaymentMethodsDTO);
    expect(sparseMethods.methods).toEqual([]);
  });

  it("accepts only the offer refusal codes of contract 3.1", () => {
    const refusedWith = (refusalCode: string) =>
      toOfferView(
        offerDto({
          viewer: {
            state: "refused",
            refusalCode,
            pendingPurchase: null,
            ownedPurchase: null,
          },
        }),
      )!.viewer.refusalCode;
    expect(refusedWith("studio_release_type_not_for_sale")).toBe(
      "studio_release_type_not_for_sale",
    );
    expect(refusedWith("studio_purchase_no_payment_methods")).toBe(
      "studio_purchase_no_payment_methods",
    );
    expect(refusedWith("studio_purchase_wall_not_available")).toBeNull();
    expect(refusedWith("studio_download_track_preparing")).toBeNull();
    expect(
      toOfferView(
        offerDto({
          trackOffers: [
            trackOfferDto({
              state: "refused",
              refusalCode: "studio_purchase_not_found",
            }),
          ],
        }),
      )!.trackOffers[0]!.refusalCode,
    ).toBeNull();
  });

  it("requires a non-empty reference token", () => {
    const base = {
      referenceCode: "QP4M7R",
      expiresAt: "2026-11-04T10:00:00.000Z",
    };
    expect(toPurchaseReferenceView({ ...base, referenceToken: "" })).toBeNull();
    expect(
      toPurchaseReferenceView({ ...base, referenceToken: "   " }),
    ).toBeNull();
    expect(
      toPurchaseReferenceView({ ...base, referenceToken: "token" })
        ?.referenceToken,
    ).toBe("token");
  });
});
