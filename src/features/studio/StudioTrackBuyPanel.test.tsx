import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toTrackView, type StudioTrackView } from "./api/studio.adapters";
import type { StudioReleaseType, StudioTrackDTO } from "./api/studio.types";
import { resetDemoPurchases } from "./api/studioDemoPurchaseStore";
import type { StudioLoadState } from "./api/studioLoadState";
import {
  toOfferView,
  type StudioOfferView,
} from "./api/studioPurchases.adapters";
import { StudioTrackBuyPanel } from "./StudioTrackBuyPanel";
import { StudioTrackBuySheetHost } from "./StudioTrackBuySheetHost";

// The studio catalog loads lazily, so the first query of each test waits.

const LOADING: StudioLoadState = {
  isLoading: true,
  isError: false,
  isRetrying: false,
  isNotFound: false,
  isWithdrawn: false,
  isTrackWithheld: false,
  reason: "unknown",
  retry: () => undefined,
};
const LOADED: StudioLoadState = { ...LOADING, isLoading: false };

const mocks: {
  offer: StudioOfferView | null;
  loadState: StudioLoadState | null;
  enabledReads: boolean[];
} = vi.hoisted(() => ({ offer: null, loadState: null, enabledReads: [] }));

vi.mock("./api/useStudioOffer", () => ({
  useStudioOffer: (
    _kind: "release" | "track",
    _itemId: string | null,
    options: { isEnabled: boolean },
  ) => {
    mocks.enabledReads.push(options.isEnabled);
    return options.isEnabled
      ? { offer: mocks.offer, loadState: mocks.loadState ?? LOADING }
      : { offer: null, loadState: LOADING };
  },
}));

function trackOf(releaseType: StudioReleaseType): StudioTrackView {
  const dto: StudioTrackDTO = {
    id: "track-6",
    position: 6,
    title: "Carta para a santa",
    durationSeconds: 258,
    isExplicit: false,
    hasAudio: true,
    releaseId: "release-1",
    credits: [],
    lyrics: null,
    syncedLyrics: null,
    chapters: null,
    release: {
      id: "release-1",
      title: "Cidade dos santos",
      type: releaseType,
      coverUrl: null,
      releasedOn: "2026-04-12",
      trackCount: 11,
      totalDurationSeconds: 2400,
      artist: {
        id: "persona-mariana",
        handle: "mariana-sol",
        name: "Mariana Sol",
        kind: "musician",
        avatarUrl: null,
      },
      publishedAt: "2026-04-12T10:00:00.000Z",
      genre: "fado",
      genres: ["fado"],
      mood: null,
      scene: null,
    },
    personaCredits: [],
  };
  return toTrackView(dto);
}

function trackOffer(overrides: Partial<StudioOfferView> = {}): StudioOfferView {
  const offer = toOfferView({
    item: {
      kind: "track",
      title: "Carta para a santa",
      releaseId: "release-1",
      trackId: "track-6",
      releaseType: "album",
      coverUrl: null,
      isAvailable: true,
    },
    artist: {
      id: "persona-mariana",
      handle: "mariana-sol",
      name: "Mariana Sol",
      kind: "musician",
      avatarUrl: null,
    },
    price: { mode: "fixed", amountCents: 150 },
    viewer: {
      state: "can_buy",
      refusalCode: null,
      pendingPurchase: null,
      ownedPurchase: null,
    },
    paymentMethods: [],
    identityOptions: [],
  });
  if (offer === null) throw new Error("test offer must resolve");
  return { ...offer, ...overrides };
}

function renderWithProviders(children: ReactNode) {
  return render(
    <TestProviders queryClient={new QueryClient()}>{children}</TestProviders>,
  );
}

beforeEach(() => {
  resetDemoPurchases();
  mocks.offer = null;
  mocks.loadState = LOADED;
  mocks.enabledReads = [];
});

describe("StudioTrackBuyPanel", () => {
  it("offers Mariana's track 06 with its format, price and Buy track", async () => {
    mocks.offer = trackOffer();
    renderWithProviders(<StudioTrackBuyPanel track={trackOf("album")} />);
    expect(await screen.findByText("Digital track")).toBeInTheDocument();
    expect(screen.getByText("€1.50")).toBeInTheDocument();
    const buyButton = screen.getByRole("button", {
      name: "Buy track: Carta para a santa by Mariana Sol",
    });
    expect(buyButton).toHaveTextContent("Buy track");
    // The track card leaves the wall choice to the release page.
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("renders nothing for a track on a mix and reads no offer", () => {
    mocks.offer = trackOffer();
    const { container } = renderWithProviders(
      <StudioTrackBuyPanel track={trackOf("mix")} />,
    );
    expect(mocks.enabledReads.length).toBeGreaterThan(0);
    expect(mocks.enabledReads.every((isEnabled) => !isEnabled)).toBe(true);
    expect(container.querySelector("section")).toBeNull();
  });

  it("renders nothing when the offer has nothing to show", () => {
    mocks.offer = trackOffer({
      price: null,
      viewer: {
        state: "refused",
        refusalCode: "studio_purchase_not_for_sale",
        pendingPurchase: null,
        ownedPurchase: null,
      },
    });
    const { container } = renderWithProviders(
      <StudioTrackBuyPanel track={trackOf("album")} />,
    );
    expect(mocks.enabledReads.every((isEnabled) => isEnabled)).toBe(true);
    expect(container.querySelector("section")).toBeNull();
  });

  it("renders nothing while the offer loads", () => {
    mocks.loadState = LOADING;
    const { container } = renderWithProviders(
      <StudioTrackBuyPanel track={trackOf("single")} />,
    );
    expect(container.querySelector("section")).toBeNull();
  });
});

describe("StudioTrackBuySheetHost", () => {
  it("shows the wait until the offer lands, then the sheet, and closes from it", async () => {
    mocks.loadState = LOADING;
    const onClose = vi.fn();
    const onPurchased = vi.fn();
    const host = (
      <StudioTrackBuySheetHost
        trackId="track-6"
        onClose={onClose}
        onPurchased={onPurchased}
      />
    );
    const queryClient = new QueryClient();
    const { rerender } = render(
      <TestProviders queryClient={queryClient}>{host}</TestProviders>,
    );
    expect(
      await screen.findByText("Loading the ways to pay"),
    ).toBeInTheDocument();
    mocks.offer = trackOffer();
    mocks.loadState = LOADED;
    rerender(<TestProviders queryClient={queryClient}>{host}</TestProviders>);
    expect(
      await screen.findByRole("dialog", { name: "Buy Carta para a santa" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Loading the ways to pay")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onPurchased).not.toHaveBeenCalled();
  });

  it("names a track that is no longer offered, with no Retry", async () => {
    mocks.loadState = { ...LOADED, isNotFound: true };
    renderWithProviders(
      <StudioTrackBuySheetHost
        trackId="track-gone"
        onClose={() => undefined}
        onPurchased={() => undefined}
      />,
    );
    expect(
      await screen.findByText("This music is not available to you"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry|try again/i }),
    ).toBeNull();
  });
});
