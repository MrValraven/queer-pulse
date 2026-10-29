import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioPageDTO } from "./studio.types";
import {
  demoMyStudioPurchases,
  demoReleasePriceOf,
  demoStudioOffer,
  demoStudioReleaseWall,
  demoStudioSales,
  demoStudioSalesPendingCount,
  demoStudioSalesTotals,
  resetDemoPurchases,
} from "./studioDemoPurchases";
import {
  demoCancelStudioPurchase,
  demoConfirmStudioPurchase,
  demoCreateStudioPurchase,
  demoPutStudioPaymentMethods,
  demoStudioPurchaseDownload,
  demoStudioPurchaseReference,
} from "./studioDemoPurchaseWrites";
import { demoSetReleasePrice } from "./studioDemoPurchasePrices";
import {
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
} from "./studioDemoMe.data";

const FIXED_NOW = new Date("2026-10-28T12:00:00.000Z");

function collectAllPages<Item>(
  readPage: (cursor: string | null) => StudioPageDTO<Item>,
): Item[] {
  const collected: Item[] = [];
  let cursor: string | null = null;
  do {
    const page: StudioPageDTO<Item> = readPage(cursor);
    collected.push(...page.items);
    cursor = page.pageInfo.nextCursor;
  } while (cursor !== null);
  return collected;
}

const demoReference = () => demoStudioPurchaseReference();
const claimOfRitaSingle = (
  fields: Partial<Parameters<typeof demoCreateStudioPurchase>[0]> = {},
) => {
  const { referenceCode, referenceToken } = demoReference();
  return demoCreateStudioPurchase({
    releaseId: "demo-release-home-1",
    amountCents: 300,
    payerName: null,
    isOnWall: false,
    shownAsSubprofileId: null,
    referenceCode,
    referenceToken,
    ...fields,
  });
};

describe("studioDemoPurchases", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
    resetDemoPurchases();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("prices the seeded items and leaves mixes and lip-sync unpriced", () => {
    expect(demoReleasePriceOf("demo-release-home-1")).toEqual({
      mode: "fixed",
      amountCents: 300,
    });
    expect(demoReleasePriceOf("demo-release-lua-ultimo-eletrico")).toEqual({
      mode: "name_your_price",
      amountCents: 500,
    });
    expect(demoReleasePriceOf("demo-release-vanda-sunday-mass")).toBeNull();
  });

  it("answers the offer states in the contract's order", () => {
    expect(
      demoStudioOffer("release", DEMO_DEFAULT_RELEASE_ID).viewer,
    ).toMatchObject({
      state: "refused",
      refusalCode: "studio_purchase_own_persona",
    });
    expect(demoStudioOffer("release", "demo-release-home-1").viewer.state).toBe(
      "can_buy",
    );
    expect(demoStudioOffer("release", "demo-release-home-3").viewer.state).toBe(
      "owned",
    );
    expect(
      demoStudioOffer("release", "demo-release-lua-ultimo-eletrico").viewer
        .state,
    ).toBe("pending");
    expect(
      demoStudioOffer("release", "demo-release-vanda-sunday-mass").viewer,
    ).toMatchObject({
      state: "refused",
      refusalCode: "studio_purchase_not_for_sale",
    });
  });

  it("sends payment methods only while the viewer can buy or waits", () => {
    expect(
      demoStudioOffer("release", "demo-release-home-1").paymentMethods.length,
    ).toBeGreaterThan(0);
    expect(
      demoStudioOffer("release", "demo-release-home-3").paymentMethods,
    ).toEqual([]);
  });

  it("keeps Mariana's totals equal to her confirmed rows", () => {
    const rows = collectAllPages((cursor) =>
      demoStudioSales(DEMO_ARTIST_MARIANA.id, cursor),
    );
    const totals = demoStudioSalesTotals(DEMO_ARTIST_MARIANA.id);
    expect(totals.allTime.count).toBe(rows.length);
    expect(totals.allTime.amountCents).toBe(
      rows.reduce((sum, row) => sum + row.amountCents, 0),
    );
    expect(rows.some((row) => row.buyer === null)).toBe(true);
  });

  it("shows more than 24 wall entries on Mariana's album, newest first, none of them amounts", () => {
    const first = demoStudioReleaseWall(DEMO_DEFAULT_RELEASE_ID, null);
    expect(first.items).toHaveLength(24);
    expect(first.pageInfo.hasMore).toBe(true);
    // Newest confirmed purchase first: Ana Lopes (1 day), Tomás Reis (4),
    // Carla Pinto (7), then Vanda Diesel (10, shown as her persona).
    expect(first.items.map((entry) => entry.key.split(":")[0])).toEqual(
      expect.arrayContaining(["account", "persona"]),
    );
    const names = first.items
      .slice(0, 4)
      .map((entry) =>
        entry.identity.kind === "account"
          ? entry.identity.member.displayName
          : entry.identity.persona.name,
      );
    expect(names).toEqual([
      "Ana Lopes",
      "Tomás Reis",
      "Carla Pinto",
      "Vanda Diesel",
    ]);
    expect(first.items[3]!.key).toBe("persona:sp-ines-fonseca-vanda-diesel");
    expect(JSON.stringify(first)).not.toMatch(/amountCents/);
  });

  it("hands out the fixed demo payment code", () => {
    expect(demoReference()).toMatchObject({
      referenceCode: "QP4M7R",
      referenceToken: "demo-reference-token",
    });
  });

  it("hands out a fresh code on every later call and takes it at I've paid", () => {
    expect(demoReference().referenceCode).toBe("QP4M7R");
    const fresh = demoReference();
    expect(fresh.referenceCode).toMatch(/^[2-9A-HJKMNP-Z]{6}$/);
    expect(fresh.referenceCode).not.toBe("QP4M7R");
    expect(demoReference().referenceCode).not.toBe(fresh.referenceCode);
    const purchase = demoCreateStudioPurchase({
      releaseId: "demo-release-home-1",
      amountCents: 300,
      payerName: null,
      isOnWall: false,
      shownAsSubprofileId: null,
      referenceCode: fresh.referenceCode,
      referenceToken: fresh.referenceToken,
    });
    expect(purchase.referenceCode).toBe(fresh.referenceCode);
  });

  it("refuses a fixed amount that differs from the price with the new price in the body", () => {
    const storedBefore = demoMyStudioPurchases("all", null).items.length;
    expect(() => claimOfRitaSingle({ amountCents: 250 })).toThrow(
      expect.objectContaining({
        status: 409,
        data: expect.objectContaining({
          price: { mode: "fixed", amountCents: 300 },
        }),
      }),
    );
    // The refusal stored nothing: the offer is still open to buy.
    expect(demoMyStudioPurchases("all", null).items).toHaveLength(storedBefore);
    expect(demoStudioOffer("release", "demo-release-home-1").viewer.state).toBe(
      "can_buy",
    );
  });

  it("refuses a payment code with a token it did not issue", () => {
    expect(() => claimOfRitaSingle({ referenceToken: "forged" })).toThrow(
      expect.objectContaining({
        status: 400,
        data: expect.objectContaining({
          code: "studio_purchase_reference_invalid",
        }),
      }),
    );
  });

  it("stores the claim under the code the buyer paid with, then cancels it, and takes the same demo code again", () => {
    const purchase = claimOfRitaSingle({ payerName: " ", isOnWall: true });
    expect(purchase.referenceCode).toBe("QP4M7R");
    expect(purchase.payerName).toBeNull();
    demoCancelStudioPurchase(purchase.id);
    expect(demoStudioOffer("release", "demo-release-home-1").viewer.state).toBe(
      "can_buy",
    );
    expect(claimOfRitaSingle().status).toBe("pending");
  });

  it("keeps the unlinked artist's purchase and names a file still being prepared", () => {
    const unlinked = demoMyStudioPurchases("all", null).items.find(
      (row) => row.artist.subprofileId === null,
    )!;
    expect(unlinked.item.isAvailable).toBe(false);
    expect(unlinked.downloads.map((track) => track.unavailableReason)).toEqual([
      null,
      "studio_download_track_preparing",
    ]);
    expect(() =>
      demoStudioPurchaseDownload(unlinked.id, unlinked.downloads[1]!.trackId),
    ).toThrow(expect.objectContaining({ status: 409 }));
  });

  it("refuses to remove Mariana's last way to get paid while her album is for sale", () => {
    expect(() =>
      demoPutStudioPaymentMethods(DEMO_ARTIST_MARIANA.id, { methods: [] }),
    ).toThrow(expect.objectContaining({ status: 409 }));
  });

  it("moves a confirmed claim from the inbox count to the sales", () => {
    expect(demoStudioSalesPendingCount().count).toBe(3);
    const before = demoStudioSalesTotals(DEMO_ARTIST_MARIANA.id);
    demoConfirmStudioPurchase(DEMO_ARTIST_MARIANA.id, "demo-claim-rui");
    expect(demoStudioSalesPendingCount().count).toBe(2);
    expect(demoStudioSales(DEMO_ARTIST_MARIANA.id, null).items[0]!.id).toBe(
      "demo-claim-rui",
    );
    expect(demoStudioSalesTotals(DEMO_ARTIST_MARIANA.id).last28Days.count).toBe(
      before.last28Days.count + 1,
    );
  });

  it("refuses a price on a mix", () => {
    expect(() =>
      demoSetReleasePrice("demo-release-home-2", {
        mode: "fixed",
        amountCents: 300,
      }),
    ).toThrow(expect.objectContaining({ status: 409 }));
  });
});
