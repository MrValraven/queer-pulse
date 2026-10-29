import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPurchases } from "../studio/api/studioDemoPurchases";
import type { StudioBuyerPurchaseDTO } from "../studio/api/studioPurchases.types";
import { MusicPurchasesPage } from "./MusicPurchasesPage";

const mocks: { isLive: boolean } = vi.hoisted(() => ({ isLive: false }));
const client = vi.hoisted(() => ({ apiGet: vi.fn() }));

vi.mock("../../shared/api/client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../shared/api/client")>()),
  ...client,
}));
vi.mock("../../app/providers/DemoModeProvider", async (importOriginal) => {
  const original =
    await importOriginal<
      typeof import("../../app/providers/DemoModeProvider")
    >();
  return {
    ...original,
    useDemoMode: () => {
      const value = original.useDemoMode();
      return mocks.isLive ? { ...value, demoMode: false } : value;
    },
  };
});
vi.mock("../../app/providers/authContext", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("../../app/providers/authContext")>();
  return {
    ...original,
    useAuth: () => {
      const value = original.useAuth();
      return mocks.isLive ? { ...value, user: { id: "member-1" } } : value;
    },
  };
});
// A member whose Studio access was removed.
vi.mock("../studio/api/useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: false, uploadablePersonas: [] }),
}));

const CONFIRMED_ROW: StudioBuyerPurchaseDTO = {
  id: "purchase-live-1",
  status: "confirmed",
  item: {
    kind: "release",
    title: "Noites de Vidro",
    releaseId: "release-live-1",
    trackId: null,
    releaseType: "album",
    coverUrl: null,
    isAvailable: true,
  },
  artist: {
    name: "Rita Cinza",
    subprofileId: "persona-live-1",
    handle: "rita-cinza",
    isLinkable: true,
  },
  amountCents: 800,
  referenceCode: "LIVE42",
  payerName: "Member",
  declineReason: null,
  declineNote: null,
  createdAt: "2026-10-01T10:00:00.000Z",
  decidedAt: "2026-10-02T10:00:00.000Z",
  wall: { isOnWall: false, shownAs: null, needsNewIdentity: false },
  downloads: [
    {
      trackId: "track-live-1",
      position: 1,
      title: "Primeira",
      durationSeconds: 180,
      format: "mp3",
      unavailableReason: null,
    },
  ],
};

function renderAt(path: string) {
  render(
    <TestProviders initialEntries={[path]}>
      <MusicPurchasesPage />
    </TestProviders>,
  );
}

beforeEach(() => {
  mocks.isLive = false;
  resetDemoPurchases();
  client.apiGet.mockReset();
});

describe("MusicPurchasesPage (demo)", () => {
  it("lists every purchase, so a declined or expired one shows its reason", async () => {
    renderAt("/account/music-purchases");
    expect(
      await screen.findByRole("heading", { name: "Your music purchases" }),
    ).toBeInTheDocument();
    expect(await screen.findByText("Cassete perdida")).toBeInTheDocument();
    expect(screen.getByText("Declined")).toBeInTheDocument();
    expect(screen.getByText(/received a different amount/)).toBeInTheDocument();
    expect(screen.getByText("Expired")).toBeInTheDocument();
    expect(
      screen.getByText(/did not answer within 30 days/),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(5);
  });

  it("keeps the account list free of Studio links, cancel and the wall switch", async () => {
    renderAt("/account/music-purchases");
    await screen.findByText("Cassete perdida");
    const pendingRow = screen.getByText("Último elétrico").closest("li")!;
    expect(pendingRow).toHaveTextContent("Waiting for Lua Cardoso to confirm");
    expect(
      screen.queryByRole("button", { name: "Cancel this purchase" }),
    ).toBeNull();
    expect(
      screen.queryByRole("switch", { name: "Show me on the supporter wall" }),
    ).toBeNull();
    const list = screen.getByRole("list", { name: "Your purchases" });
    expect(list.querySelector("a")).toBeNull();
  });
});

describe("MusicPurchasesPage (live)", () => {
  it("works for a member without Studio access", async () => {
    mocks.isLive = true;
    client.apiGet.mockImplementation((path: string) =>
      path.startsWith("/me/studio-purchases")
        ? Promise.resolve({
            items: [CONFIRMED_ROW],
            pageInfo: { nextCursor: null, hasMore: false },
          })
        : Promise.reject(new ApiError(404, "not mocked")),
    );
    renderAt("/account/music-purchases");
    expect(await screen.findByText("Noites de Vidro")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Download tracks/ }),
    ).toBeInTheDocument();
    expect(client.apiGet).toHaveBeenCalledWith("/me/studio-purchases");
    const row = screen.getByText("Noites de Vidro").closest("li")!;
    expect(row.querySelector("a")).toBeNull();
  });

  it("shows the reason of a declined purchase the live list returns", async () => {
    mocks.isLive = true;
    client.apiGet.mockImplementation((path: string) =>
      path.startsWith("/me/studio-purchases")
        ? Promise.resolve({
            items: [
              {
                ...CONFIRMED_ROW,
                id: "purchase-live-2",
                status: "declined",
                declineReason: "payment_not_found",
                declineNote: null,
                decidedAt: "2026-10-03T10:00:00.000Z",
                downloads: [],
              },
              CONFIRMED_ROW,
            ],
            pageInfo: { nextCursor: null, hasMore: false },
          })
        : Promise.reject(new ApiError(404, "not mocked")),
    );
    renderAt("/account/music-purchases");
    expect(
      await screen.findByText("Rita Cinza could not find your payment"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Download tracks/ }),
    ).toHaveLength(1);
  });

  it("names a load failure with its reason", async () => {
    mocks.isLive = true;
    client.apiGet.mockRejectedValue(new ApiError(503, "unavailable"));
    renderAt("/account/music-purchases");
    expect(await screen.findByText("your purchases")).toBeInTheDocument();
  });
});
