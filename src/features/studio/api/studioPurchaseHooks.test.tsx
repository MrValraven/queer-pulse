import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { StrictMode, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  DEMO_ARTIST_LATE_BLOOMERS,
  DEMO_ARTIST_MARIANA,
  DEMO_DEFAULT_RELEASE_ID,
} from "./studioDemoMe.data";
import { resetDemoPurchases } from "./studioDemoPurchases";
import { studioKeys } from "./studioQueryKeys";
import { navigateToDownload } from "./studioPurchaseDownloadNavigation";
import { useStudioOffer } from "./useStudioOffer";
import { useStudioPaymentMethods } from "./useStudioPaymentMethods";
import {
  useStudioMyPurchases,
  useStudioPurchaseInbox,
  useStudioSales,
  useStudioSalesTotals,
} from "./useStudioPurchaseLists";
import {
  useStudioPurchaseDecisions,
  useStudioPurchaseDownload,
  useStudioPurchaseMutations,
} from "./useStudioPurchaseMutations";
import { useStudioPurchaseReference } from "./useStudioPurchaseReference";
import { useStudioSalesPendingCount } from "./useStudioSalesPendingCount";

const mocks: { isDemoMode: boolean } = vi.hoisted(() => ({ isDemoMode: true }));
const client = vi.hoisted(() => ({
  apiGet: vi.fn(),
  apiPost: vi.fn(),
  apiPut: vi.fn(),
}));
const showToast = vi.hoisted(() => vi.fn());

vi.mock("../../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../shared/api/client")>()),
  ...client,
}));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemoMode }),
}));
vi.mock("../../../app/providers/authContext", () => ({
  useAuth: () => ({ user: { id: "demo-user" } }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true, uploadablePersonas: [] }),
}));
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("./studioPurchaseDownloadNavigation", () => ({
  navigateToDownload: vi.fn(),
}));

const { apiGet, apiPost, apiPut } = client;
const DEMO_RELEASE_ID = "demo-release-home-1";
const DEMO_REFERENCE_TOKEN = "demo-reference-token";

function wrapperWith(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

// One fresh client per test, held across that test's renders.
let wrapper = wrapperWith(new QueryClient());
beforeEach(() => {
  mocks.isDemoMode = true;
  resetDemoPurchases();
  apiGet.mockReset();
  apiPost.mockReset();
  apiPut.mockReset();
  showToast.mockClear();
  vi.mocked(navigateToDownload).mockClear();
  wrapper = wrapperWith(
    new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    }),
  );
});

describe("Studio purchase reads in demo", () => {
  it("reads every demo surface without touching the API", async () => {
    const { result } = renderHook(
      () => [
        useStudioOffer("release", DEMO_RELEASE_ID, { isEnabled: true }),
        useStudioMyPurchases("all"),
        useStudioSalesPendingCount(),
        useStudioPaymentMethods(DEMO_ARTIST_MARIANA.id),
      ],
      { wrapper },
    );
    await waitFor(() => {
      const [offer, myPurchases, pending, methods] = result.current;
      expect((offer as { offer: unknown }).offer).not.toBeNull();
      expect(
        (myPurchases as { items: unknown[] }).items.length,
      ).toBeGreaterThan(0);
      expect((pending as { count: number }).count).toBeGreaterThan(0);
      expect(
        (methods as { paymentMethods: unknown }).paymentMethods,
      ).not.toBeNull();
    });
    expect(apiGet).not.toHaveBeenCalled();
    expect(apiPost).not.toHaveBeenCalled();
    expect(apiPut).not.toHaveBeenCalled();
  });

  it("offers Rita's single to the demo viewer at 3 euros and refuses Mariana's own album", async () => {
    const single = renderHook(
      () => useStudioOffer("release", DEMO_RELEASE_ID, { isEnabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(single.result.current.offer).not.toBeNull());
    expect(single.result.current.offer?.viewer.state).toBe("can_buy");
    expect(single.result.current.offer?.price).toEqual({
      mode: "fixed",
      amountCents: 300,
    });
    const own = renderHook(
      () =>
        useStudioOffer("release", DEMO_DEFAULT_RELEASE_ID, { isEnabled: true }),
      { wrapper },
    );
    await waitFor(() => expect(own.result.current.offer).not.toBeNull());
    expect(own.result.current.offer?.viewer).toMatchObject({
      state: "refused",
      refusalCode: "studio_purchase_own_persona",
    });
  });

  it("counts Mariana's three pending payments and answers zero for Late Bloomers", async () => {
    const { result } = renderHook(() => useStudioSalesPendingCount(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.count).toBe(3));
    expect(result.current.countFor(DEMO_ARTIST_MARIANA.id)).toBe(3);
    expect(result.current.countFor(DEMO_ARTIST_LATE_BLOOMERS.id)).toBe(0);
  });
});

describe("Studio purchase payment codes", () => {
  it("gets a fresh payment code on every mount", async () => {
    const demo = renderHook(() => useStudioPurchaseReference(), { wrapper });
    await waitFor(() => expect(demo.result.current.status).toBe("ready"));
    expect(demo.result.current.reference?.referenceCode).toBe("QP4M7R");
    expect(apiPost).not.toHaveBeenCalled();

    mocks.isDemoMode = false;
    apiPost.mockResolvedValue({
      referenceCode: "QP7K3F",
      referenceToken: "live-token",
      expiresAt: "2026-11-04T10:00:00.000Z",
    });
    const first = renderHook(() => useStudioPurchaseReference(), { wrapper });
    await waitFor(() => expect(first.result.current.status).toBe("ready"));
    const second = renderHook(() => useStudioPurchaseReference(), { wrapper });
    await waitFor(() => expect(second.result.current.status).toBe("ready"));
    expect(apiPost).toHaveBeenCalledTimes(2);
    expect(apiPost).toHaveBeenLastCalledWith(
      "/studio/purchases/reference-code",
      {},
    );
  });

  it("resolves a payment code inside StrictMode with one request in live", async () => {
    mocks.isDemoMode = false;
    apiPost.mockResolvedValue({
      referenceCode: "QP7K3F",
      referenceToken: "live-token",
      expiresAt: "2026-11-04T10:00:00.000Z",
    });
    const { result } = renderHook(() => useStudioPurchaseReference(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <StrictMode>{wrapper({ children })}</StrictMode>
      ),
    });
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(result.current.reference?.referenceCode).toBe("QP7K3F");
    expect(apiPost).toHaveBeenCalledTimes(1);
  });

  it("reads a failed payment code as failed and asks again on request", async () => {
    mocks.isDemoMode = false;
    apiPost.mockRejectedValueOnce(new Error("offline")).mockResolvedValue({
      referenceCode: "QP7K3F",
      referenceToken: "live-token",
      expiresAt: "2026-11-04T10:00:00.000Z",
    });
    const { result } = renderHook(() => useStudioPurchaseReference(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.status).toBe("failed"));
    expect(result.current.reference).toBeNull();
    act(() => result.current.requestNew());
    await waitFor(() => expect(result.current.status).toBe("ready"));
    expect(apiPost).toHaveBeenCalledTimes(2);
  });
});

describe("Studio purchase wall save", () => {
  it("reloads the wall, the purchase rows and the cached offers", async () => {
    mocks.isDemoMode = false;
    apiPut.mockResolvedValue({
      isOnWall: true,
      shownAsSubprofileId: null,
      shownAs: null,
      needsNewIdentity: false,
      options: [],
    });
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    const { result } = renderHook(() => useStudioPurchaseMutations(), {
      wrapper: wrapperWith(queryClient),
    });
    await act(async () => {
      await result.current.saveWall("purchase-1", "release-1", {
        isOnWall: true,
        shownAsSubprofileId: null,
      });
    });
    const keys = invalidate.mock.calls.map((call) => call[0]?.queryKey);
    expect(keys).toContainEqual(studioKeys.releaseWall(false, "release-1"));
    expect(keys).toContainEqual(studioKeys.purchaseWall(false, "purchase-1"));
    expect(keys).toContainEqual(studioKeys.offersAll(false));
  });
});

describe("Studio purchase writes in demo", () => {
  it("turns a created claim into the offer's pending state", async () => {
    const { result } = renderHook(
      () => ({
        offer: useStudioOffer("release", DEMO_RELEASE_ID, { isEnabled: true }),
        mutations: useStudioPurchaseMutations(),
      }),
      { wrapper },
    );
    await waitFor(() =>
      expect(result.current.offer.offer?.viewer.state).toBe("can_buy"),
    );
    await act(async () => {
      await result.current.mutations.create({
        releaseId: DEMO_RELEASE_ID,
        amountCents: 300,
        payerName: null,
        isOnWall: false,
        shownAsSubprofileId: null,
        referenceCode: "QP4M7R",
        referenceToken: DEMO_REFERENCE_TOKEN,
      });
    });
    await waitFor(() =>
      expect(result.current.offer.offer?.viewer.state).toBe("pending"),
    );
    expect(
      result.current.offer.offer?.viewer.pendingPurchase?.referenceCode,
    ).toBe("QP4M7R");
  });

  it("drops a confirmed claim from the inbox and adds it to sales and the totals", async () => {
    const { result } = renderHook(
      () => ({
        inbox: useStudioPurchaseInbox(DEMO_ARTIST_MARIANA.id),
        sales: useStudioSales(DEMO_ARTIST_MARIANA.id),
        totals: useStudioSalesTotals(DEMO_ARTIST_MARIANA.id),
        pending: useStudioSalesPendingCount(),
        decisions: useStudioPurchaseDecisions(DEMO_ARTIST_MARIANA.id),
      }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.inbox.items).toHaveLength(3));
    await waitFor(() => expect(result.current.totals.totals).not.toBeNull());
    const oldestClaimId = result.current.inbox.items[0]?.id ?? "";
    const countBefore = result.current.totals.totals?.last28Days.count ?? 0;
    await act(async () => {
      await result.current.decisions.confirm(oldestClaimId);
    });
    await waitFor(() => expect(result.current.inbox.items).toHaveLength(2));
    await waitFor(() =>
      expect(result.current.sales.items[0]?.id).toBe(oldestClaimId),
    );
    await waitFor(() =>
      expect(result.current.totals.totals?.last28Days.count).toBe(
        countBefore + 1,
      ),
    );
    await waitFor(() => expect(result.current.pending.count).toBe(2));
  });
});

describe("Studio purchase live calls and downloads", () => {
  it("reads a failed pending count as zero", async () => {
    mocks.isDemoMode = false;
    apiGet.mockRejectedValue(new Error("offline"));
    const { result } = renderHook(() => useStudioSalesPendingCount(), {
      wrapper,
    });
    await waitFor(() => expect(apiGet).toHaveBeenCalledTimes(1));
    expect(apiGet).toHaveBeenCalledWith("/studio/sales/pending-count");
    expect(result.current.count).toBe(0);
    expect(result.current.countFor(DEMO_ARTIST_MARIANA.id)).toBe(0);
    expect(showToast).not.toHaveBeenCalled();
  });

  it("downloads in live by navigating to the signed link", async () => {
    mocks.isDemoMode = false;
    apiGet.mockResolvedValue({
      url: "https://x/f.mp3",
      expiresAt: "2026-10-29T10:00:00.000Z",
      fileName: "f.mp3",
    });
    const { result } = renderHook(() => useStudioPurchaseDownload(), {
      wrapper,
    });
    await act(async () => {
      await result.current.download("p1", "kept-1");
    });
    expect(apiGet).toHaveBeenCalledWith(
      "/studio/purchases/p1/tracks/kept-1/download",
    );
    expect(navigateToDownload).toHaveBeenCalledWith("https://x/f.mp3");
    expect(result.current.busyTrackKey).toBeNull();
    expect(showToast).not.toHaveBeenCalled();
  });

  it("never navigates to a link that is not https", async () => {
    mocks.isDemoMode = false;
    apiGet.mockResolvedValue({
      url: "javascript:alert(1)",
      expiresAt: "2026-10-29T10:00:00.000Z",
      fileName: "f.mp3",
    });
    const { result } = renderHook(() => useStudioPurchaseDownload(), {
      wrapper,
    });
    await act(async () => {
      await expect(result.current.download("p1", "kept-1")).rejects.toThrow(
        /protocol/,
      );
    });
    expect(navigateToDownload).not.toHaveBeenCalled();
    expect(result.current.busyTrackKey).toBeNull();
  });

  it("keeps overlapping downloads busy apart", async () => {
    mocks.isDemoMode = false;
    let resolveFirst: (link: unknown) => void = () => {};
    apiGet
      .mockImplementationOnce(
        () => new Promise((resolve) => (resolveFirst = resolve)),
      )
      .mockResolvedValueOnce({
        url: "https://x/b.mp3",
        expiresAt: "2026-10-29T10:00:00.000Z",
        fileName: "b.mp3",
      });
    const { result } = renderHook(() => useStudioPurchaseDownload(), {
      wrapper,
    });
    let firstDownload: Promise<void> = Promise.resolve();
    act(() => {
      firstDownload = result.current.download("p1", "a");
    });
    await act(async () => {
      await result.current.download("p1", "b");
    });
    expect(result.current.busyTrackKeys.has("p1:a")).toBe(true);
    expect(result.current.busyTrackKeys.has("p1:b")).toBe(false);
    await act(async () => {
      resolveFirst({
        url: "https://x/a.mp3",
        expiresAt: "2026-10-29T10:00:00.000Z",
        fileName: "a.mp3",
      });
      await firstDownload;
    });
    expect(result.current.busyTrackKeys.size).toBe(0);
  });

  it("reads a pending count with unreadable numbers and rows as whole counts", async () => {
    mocks.isDemoMode = false;
    apiGet.mockResolvedValue({
      count: Number.NaN,
      byPersona: [
        { subprofileId: "sp1", count: 2.7 },
        { subprofileId: null, count: 5 },
        { subprofileId: "sp2", count: Number.NaN },
      ],
    });
    const { result } = renderHook(() => useStudioSalesPendingCount(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.countFor("sp1")).toBe(2));
    expect(result.current.count).toBe(0);
    expect(result.current.countFor("sp2")).toBe(0);
  });

  it("shows the demo line when a track downloads in demo", async () => {
    const purchases = renderHook(() => useStudioMyPurchases("confirmed"), {
      wrapper,
    });
    await waitFor(() =>
      expect(purchases.result.current.items.length).toBeGreaterThan(0),
    );
    const purchase = purchases.result.current.items.find((row) =>
      row.downloads.some((track) => track.unavailableReason === null),
    );
    const track = purchase?.downloads.find(
      (row) => row.unavailableReason === null,
    );
    expect(purchase).toBeDefined();
    const { result } = renderHook(() => useStudioPurchaseDownload(), {
      wrapper,
    });
    await act(async () => {
      await result.current.download(purchase?.id ?? "", track?.trackId ?? "");
    });
    expect(showToast).toHaveBeenLastCalledWith(
      "studio:purchase.downloads.demoToast",
      "info",
    );
    expect(navigateToDownload).not.toHaveBeenCalled();
    expect(apiGet).not.toHaveBeenCalled();
  });
});
