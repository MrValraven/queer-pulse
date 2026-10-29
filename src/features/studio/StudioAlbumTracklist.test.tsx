import { fireEvent, render, screen, within } from "@testing-library/react";
import { QueryClient } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toReleaseView } from "./api/studio.adapters";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioAlbumTracklist } from "./StudioAlbumTracklist";
import type { StudioLoadState } from "./api/studioLoadState";
import {
  toOfferView,
  type StudioOfferView,
} from "./api/studioPurchases.adapters";
import type { StudioTrackOfferDTO } from "./api/studioPurchases.types";

const playback = vi.hoisted(() => ({ hideExplicit: false }));
vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => playback.hideExplicit,
}));

// The release offer feeds the row menus; the track offer feeds the sheet
// host. Both stay empty unless a test fills them.
const offerMocks: {
  releaseOffer: StudioOfferView | null;
  trackOffer: StudioOfferView | null;
  trackLoadState: StudioLoadState;
} = vi.hoisted(() => ({
  releaseOffer: null,
  trackOffer: null,
  trackLoadState: {
    isLoading: true,
    isError: false,
    isRetrying: false,
    isNotFound: false,
    isWithdrawn: false,
    isTrackWithheld: false,
    reason: "unknown",
    retry: () => undefined,
  },
}));
vi.mock("./api/useStudioOffer", () => ({
  useStudioOffer: (
    kind: "release" | "track",
    _itemId: string | null,
    options: { isEnabled: boolean },
  ) => {
    if (!options.isEnabled)
      return { offer: null, loadState: offerMocks.trackLoadState };
    return kind === "release"
      ? { offer: offerMocks.releaseOffer, loadState: offerMocks.trackLoadState }
      : { offer: offerMocks.trackOffer, loadState: offerMocks.trackLoadState };
  },
}));

const release = toReleaseView({
  id: "r1",
  title: "Salt water",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 3,
  totalDurationSeconds: 400,
  artist: {
    id: "p1",
    handle: "nightform",
    name: "NIGHTFORM",
    kind: "musician",
    avatarUrl: null,
  },
  description: null,
  genre: null,
  genres: [],
  mood: null,
  scene: null,
  status: "published",
  publishedAt: null,
  tracks: [
    {
      id: "t1",
      position: 1,
      title: "Tide",
      durationSeconds: 200,
      isExplicit: false,
      hasAudio: true,
    },
    {
      id: "t2",
      position: 2,
      title: "Pier",
      durationSeconds: 200,
      isExplicit: true,
      hasAudio: true,
    },
    {
      id: "t3",
      position: 3,
      title: "Pending",
      durationSeconds: null,
      isExplicit: false,
      hasAudio: false,
    },
  ],
  isOwner: false,
  rightsConfirmedAt: null,
  takedownReason: null,
  sceneId: null,
  personaCredits: [],
});

function renderTracklist(
  overrides: Partial<StudioPlayerValue> = {},
  tracklistRelease = release,
) {
  const value: StudioPlayerValue = {
    ...createStudioPlayerTestValue(),
    status: "idle",
    radio: null,
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease: vi.fn(() => Promise.resolve()),
    playReleases: vi.fn(() => Promise.resolve()),
    playTracks: vi.fn(() => Promise.resolve()),
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    retry: vi.fn(),
    stop: vi.fn(),
    isCurrentRelease: () => false,
    isCurrentTrack: () => false,
    ...overrides,
  };
  render(
    <TestProviders>
      <StudioPlayerContext.Provider value={value}>
        <StudioAlbumTracklist release={tracklistRelease} />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return value;
}

describe("StudioAlbumTracklist", () => {
  it("plays the row that was pressed, inside its release", async () => {
    const value = renderTracklist();
    fireEvent.click(await screen.findByRole("button", { name: /play pier/i }));
    expect(value.playRelease).toHaveBeenCalledWith("r1", "t2");
  });

  it("marks the playing row with aria-current and pauses it in place", async () => {
    const value = renderTracklist({
      status: "playing",
      isCurrentTrack: (trackId) => trackId === "t1",
      isCurrentRelease: () => true,
    });
    const rows = await screen.findAllByRole("listitem");
    expect(rows[0]).toHaveAttribute("aria-current", "true");
    expect(rows[1]).not.toHaveAttribute("aria-current");
    fireEvent.click(
      within(rows[0]!).getByRole("button", { name: /pause tide/i }),
    );
    expect(value.togglePlay).toHaveBeenCalled();
    expect(value.playRelease).not.toHaveBeenCalled();
  });

  it("links each title to its track page and holds back a track still processing", async () => {
    renderTracklist();
    expect(await screen.findByRole("link", { name: "Tide" })).toHaveAttribute(
      "href",
      "/studio/track?id=t1",
    );
    expect(
      screen.getByRole("button", { name: /play pending/i }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});

describe("StudioAlbumTracklist: add to playlist", () => {
  it("offers Add to playlist on each row of a published release, disabled when there is no audio", () => {
    renderTracklist();
    expect(
      screen.getByRole("button", { name: "Add Tide to a playlist" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add Pending to a playlist" }),
    ).toHaveAttribute("aria-disabled", "true");
  });
});

describe("StudioAlbumTracklist: like", () => {
  it("offers a heart on each playable row of a published release", () => {
    renderTracklist();
    const heart = screen.getByRole("button", { name: "Like Tide" });
    expect(heart).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "Like Pier" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Like Pending" })).toBeNull();
  });

  it("leaves the heart off a preview read through its private link", () => {
    renderTracklist({}, { ...release, isPreview: true });
    expect(screen.queryByRole("button", { name: /^like /i })).toBeNull();
  });
});

describe("StudioAlbumTracklist: hidden explicit tracks", () => {
  afterEach(() => {
    playback.hideExplicit = false;
  });

  it("greys an explicit track with no play button while it is hidden", async () => {
    playback.hideExplicit = true;
    renderTracklist();
    expect(
      await screen.findByText("Hidden by your settings"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /play pier/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /play tide/i }),
    ).toBeInTheDocument();
  });

  it("brings the play button back when the setting is off", async () => {
    renderTracklist();
    expect(
      await screen.findByRole("button", { name: /play pier/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Hidden by your settings"),
    ).not.toBeInTheDocument();
  });
});

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
  trackCount: 3,
  totalDurationSeconds: 668,
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
    {
      id: "demo-track-lua-02",
      position: 2,
      title: "Bilhete",
      durationSeconds: 221,
      isExplicit: false,
      hasAudio: true,
    },
    {
      id: "demo-track-lua-03",
      position: 3,
      title: "Fim da linha",
      durationSeconds: 263,
      isExplicit: false,
      hasAudio: true,
    },
  ],
});

function luaTrackOffer(
  trackId: string,
  position: number,
  title: string,
  state: string,
): StudioTrackOfferDTO {
  return {
    trackId,
    position,
    title,
    price: { mode: "fixed", amountCents: 100 },
    state,
    refusalCode: null,
    pendingPurchaseId: state === "pending" ? "demo-purchase-pending" : null,
    ownedPurchaseId: null,
  };
}

function luaOffer(
  kind: "release" | "track",
  trackOffers: StudioTrackOfferDTO[],
): StudioOfferView {
  const offer = toOfferView({
    item: {
      kind,
      title: kind === "release" ? "Último elétrico" : "Paragem",
      releaseId: "demo-release-lua-ultimo-eletrico",
      trackId: kind === "release" ? null : "demo-track-lua-01",
      releaseType: "ep",
      coverUrl: null,
      isAvailable: true,
    },
    artist: LUA_ARTIST,
    price: { mode: "fixed", amountCents: kind === "release" ? 500 : 100 },
    viewer: {
      state: "can_buy",
      refusalCode: null,
      pendingPurchase: null,
      ownedPurchase: null,
    },
    paymentMethods: [],
    identityOptions: [],
    trackOffers,
  });
  if (offer === null) throw new Error("test offer must resolve");
  return offer;
}

/** Renders Lua's EP and returns a rerender that builds fresh elements on
 *  the same query client, so the sheet host reads the offer holder again. */
function renderLuaTracklist() {
  const value: StudioPlayerValue = createStudioPlayerTestValue();
  const queryClient = new QueryClient();
  const buildTree = () => (
    <TestProviders queryClient={queryClient}>
      <StudioPlayerContext.Provider value={value}>
        <StudioAlbumTracklist release={luaRelease} />
      </StudioPlayerContext.Provider>
    </TestProviders>
  );
  const { rerender } = render(buildTree());
  return () => rerender(buildTree());
}

async function openRowMenu(title: string) {
  fireEvent.click(
    await screen.findByRole("button", { name: `More actions for ${title}` }),
  );
  return screen.findByRole("menu");
}

describe("StudioAlbumTracklist: buying a track from the row menu", () => {
  afterEach(() => {
    offerMocks.releaseOffer = null;
    offerMocks.trackOffer = null;
    offerMocks.trackLoadState = {
      ...offerMocks.trackLoadState,
      isLoading: true,
    };
  });

  it("offers Buy track on a track for sale and opens its sheet after the wait", async () => {
    offerMocks.releaseOffer = luaOffer("release", [
      luaTrackOffer("demo-track-lua-01", 1, "Paragem", "can_buy"),
    ]);
    const rerenderTracklist = renderLuaTracklist();
    const menu = await openRowMenu("Paragem");
    fireEvent.click(
      await within(menu).findByRole("menuitem", { name: "Buy track" }),
    );
    expect(
      await screen.findByText("Loading the ways to pay"),
    ).toBeInTheDocument();
    offerMocks.trackOffer = luaOffer("track", []);
    offerMocks.trackLoadState = {
      ...offerMocks.trackLoadState,
      isLoading: false,
    };
    rerenderTracklist();
    expect(
      await screen.findByRole("dialog", { name: "Buy Paragem" }),
    ).toBeInTheDocument();
  });

  it("points a pending track to the buyer's purchases", async () => {
    offerMocks.releaseOffer = luaOffer("release", [
      luaTrackOffer("demo-track-lua-01", 1, "Paragem", "pending"),
    ]);
    renderLuaTracklist();
    const menu = await openRowMenu("Paragem");
    expect(
      await within(menu).findByRole("menuitem", {
        name: "Open your purchases",
      }),
    ).toHaveAttribute("href", "/studio/library?tab=purchases");
    expect(
      within(menu).queryByRole("menuitem", { name: "Buy track" }),
    ).toBeNull();
  });

  it("leaves the buy item off a row with no track offer", async () => {
    offerMocks.releaseOffer = luaOffer("release", [
      luaTrackOffer("demo-track-lua-01", 1, "Paragem", "can_buy"),
    ]);
    renderLuaTracklist();
    const menu = await openRowMenu("Bilhete");
    expect(
      await within(menu).findByRole("menuitem", { name: "Play next" }),
    ).toBeInTheDocument();
    expect(
      within(menu).queryByRole("menuitem", { name: "Buy track" }),
    ).toBeNull();
    expect(
      within(menu).queryByRole("menuitem", { name: "Open your purchases" }),
    ).toBeNull();
  });
});
