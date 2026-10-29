import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getMyStudioPurchases,
  getStudioOffer,
  getStudioPurchaseDownload,
  getStudioPurchaseInbox,
  getStudioReleaseWall,
  getStudioSales,
  getStudioSalesPendingCount,
  getStudioSalesTotals,
  postStudioPurchase,
  postStudioPurchaseCancel,
  postStudioPurchaseConfirm,
  postStudioPurchaseDecline,
  postStudioPurchaseReference,
  putStudioPaymentMethods,
  putStudioPurchaseWall,
} from "./studioPurchases.api";

const client = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));

vi.mock("../../../shared/api/client", () => client);

const { apiGet, apiPost, apiPut } = client;

describe("Studio purchases calls", () => {
  beforeEach(() => {
    apiGet.mockReset().mockResolvedValue({});
    apiPost.mockReset().mockResolvedValue({});
    apiPut.mockReset().mockResolvedValue({});
  });

  it("reads an offer per kind", async () => {
    await getStudioOffer("release", "r 1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/releases/r%201/offer");
    await getStudioOffer("track", "t1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/tracks/t1/offer");
  });

  it("reads the buyer list outside the Studio gate, confirmed only when asked", async () => {
    await getMyStudioPurchases("all", null);
    expect(apiGet).toHaveBeenLastCalledWith("/me/studio-purchases");
    await getMyStudioPurchases("confirmed", "c2");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/me/studio-purchases?status=confirmed&cursor=c2",
    );
    await getMyStudioPurchases("all", "c3");
    expect(apiGet).toHaveBeenLastCalledWith("/me/studio-purchases?cursor=c3");
  });

  it("posts the claim, the cancel, the decisions and the wall to their routes", async () => {
    const claim = {
      releaseId: "r1",
      amountCents: 300,
      payerName: null,
      isOnWall: false,
      shownAsSubprofileId: null,
      referenceCode: "QP4M7R",
      referenceToken: "token",
    };
    await postStudioPurchase(claim);
    expect(apiPost).toHaveBeenLastCalledWith("/studio/purchases", claim);
    await postStudioPurchaseCancel("p1");
    expect(apiPost).toHaveBeenLastCalledWith("/studio/purchases/p1/cancel");
    await postStudioPurchaseConfirm("sp1", "p1");
    expect(apiPost).toHaveBeenLastCalledWith(
      "/studio/artists/sp1/purchases/p1/confirm",
    );
    await postStudioPurchaseDecline("sp1", "p1", {
      reason: "amount_different",
      note: null,
    });
    expect(apiPost).toHaveBeenLastCalledWith(
      "/studio/artists/sp1/purchases/p1/decline",
      { reason: "amount_different", note: null },
    );
    await putStudioPurchaseWall("p1", {
      isOnWall: true,
      shownAsSubprofileId: null,
    });
    expect(apiPut).toHaveBeenLastCalledWith("/studio/purchases/p1/wall", {
      isOnWall: true,
      shownAsSubprofileId: null,
    });
  });

  it("replaces the payment methods of one persona", async () => {
    await putStudioPaymentMethods("sp 1", { methods: [] });
    expect(apiPut).toHaveBeenLastCalledWith(
      "/studio/artists/sp%201/payment-methods",
      { methods: [] },
    );
  });

  it("asks for a payment code with an empty body", async () => {
    await postStudioPurchaseReference();
    expect(apiPost).toHaveBeenLastCalledWith(
      "/studio/purchases/reference-code",
      {},
    );
  });

  it("reads a download link for one track", async () => {
    await getStudioPurchaseDownload("p1", "kept-1");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/studio/purchases/p1/tracks/kept-1/download",
    );
  });

  it("puts a cursor on a list only when there is one", async () => {
    await getStudioPurchaseInbox("sp1", null);
    expect(apiGet).toHaveBeenLastCalledWith("/studio/artists/sp1/purchases");
    await getStudioPurchaseInbox("sp1", "c 2");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/studio/artists/sp1/purchases?cursor=c+2",
    );
    await getStudioSales("sp1", "c2");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/studio/artists/sp1/sales?cursor=c2",
    );
    await getStudioReleaseWall("r1", null);
    expect(apiGet).toHaveBeenLastCalledWith("/studio/releases/r1/wall");
    await getStudioReleaseWall("r1", "w2");
    expect(apiGet).toHaveBeenLastCalledWith(
      "/studio/releases/r1/wall?cursor=w2",
    );
  });

  it("reads the totals and the pending count", async () => {
    await getStudioSalesTotals("sp1");
    expect(apiGet).toHaveBeenLastCalledWith("/studio/artists/sp1/sales/totals");
    await getStudioSalesPendingCount();
    expect(apiGet).toHaveBeenLastCalledWith("/studio/sales/pending-count");
  });
});
