import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toReleaseView } from "./api/studio.adapters";
import {
  toOfferView,
  type StudioBuyerPurchaseView,
  type StudioOfferView,
} from "./api/studioPurchases.adapters";
import { StudioPlayerContext } from "./player/studioPlayerContext";
import { StudioAlbumTracklist } from "./StudioAlbumTracklist";

vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => false,
}));

const offerMocks: { releaseOffer: StudioOfferView | null } = vi.hoisted(() => ({
  releaseOffer: null,
}));
vi.mock("./api/useStudioOffer", () => ({
  useStudioOffer: () => ({
    offer: offerMocks.releaseOffer,
    loadState: {
      isLoading: false,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => undefined,
    },
  }),
}));

// The sheet host stands in for the buy sheet: its one button reports the
// purchase the way "I've paid" does.
vi.mock("./StudioTrackBuySheetHost", () => ({
  StudioTrackBuySheetHost: ({
    onPurchased,
  }: {
    onPurchased: (purchase: StudioBuyerPurchaseView) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onPurchased({
          artist: { name: "Lua Cardoso", href: null, subprofileId: null },
        } as StudioBuyerPurchaseView)
      }
    >
      Report the purchase
    </button>
  ),
}));

const LUA_ARTIST = {
  id: "demo-persona-lua-cardoso",
  handle: "lua-cardoso",
  name: "Lua Cardoso",
  kind: "musician",
  avatarUrl: null,
} as const;

const luaRelease = toReleaseView({
  id: "demo-release-lua-ultimo-eletrico",
  title: "Último elétrico",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 1,
  totalDurationSeconds: 184,
  artist: LUA_ARTIST,
  description: null,
  genre: null,
  genres: [],
  mood: null,
  scene: null,
  status: "published",
  publishedAt: null,
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
  tracks: [
    {
      id: "demo-track-lua-01",
      position: 1,
      title: "Paragem",
      durationSeconds: 184,
      isExplicit: false,
      hasAudio: true,
    },
  ],
});

function luaReleaseOffer(): StudioOfferView {
  const offer = toOfferView({
    item: {
      kind: "release",
      title: "Último elétrico",
      releaseId: "demo-release-lua-ultimo-eletrico",
      trackId: null,
      releaseType: "ep",
      coverUrl: null,
      isAvailable: true,
    },
    artist: LUA_ARTIST,
    price: { mode: "fixed", amountCents: 500 },
    viewer: {
      state: "can_buy",
      refusalCode: null,
      pendingPurchase: null,
      ownedPurchase: null,
    },
    paymentMethods: [],
    identityOptions: [],
    trackOffers: [
      {
        trackId: "demo-track-lua-01",
        position: 1,
        title: "Paragem",
        price: { mode: "fixed", amountCents: 100 },
        state: "can_buy",
        refusalCode: null,
        pendingPurchaseId: null,
        ownedPurchaseId: null,
      },
    ],
  });
  if (offer === null) throw new Error("test offer must resolve");
  return offer;
}

describe("StudioAlbumTracklist: after buying a track from the row menu", () => {
  it("says who confirms the payment in a status region", async () => {
    offerMocks.releaseOffer = luaReleaseOffer();
    render(
      <TestProviders>
        <StudioPlayerContext.Provider value={createStudioPlayerTestValue()}>
          <StudioAlbumTracklist release={luaRelease} />
        </StudioPlayerContext.Provider>
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "More actions for Paragem" }),
    );
    const menu = await screen.findByRole("menu");
    fireEvent.click(
      await within(menu).findByRole("menuitem", { name: "Buy track" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: "Report the purchase" }),
    );
    const line = await screen.findByText(
      "Lua Cardoso will confirm your payment. Follow it in your purchases",
    );
    expect(line.closest('[role="status"]')).not.toBeNull();
    expect(
      screen.queryByRole("button", { name: "Report the purchase" }),
    ).toBeNull();
  });
});
