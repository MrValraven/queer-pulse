import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import {
  createVjStageState,
  type VjClipDTO,
  type VjPackClipsDTO,
  type VjPackDTO,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { useScreenWakeLock } from "../../../shared/hooks/useScreenWakeLock";
import { TestProviders } from "../../../test/TestProviders";
import { useVjPackClips } from "../api/useVjPackClips";
import { useVjPacks } from "../api/useVjPacks";
import {
  useVjStage,
  type VjCommandOutcome,
  type VjStageCommands,
  type VjStageController,
} from "../live/useVjStage";
import { AdminVjRemotePage } from "./AdminVjRemotePage";
import { VJ_SPLIT_QUERY } from "./hooks/useVjRemoteLayout";

const harness = vi.hoisted(() => ({
  controller: null as VjStageController | null,
}));

vi.mock("../live/useVjStage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../live/useVjStage")>();
  return {
    ...actual,
    useVjStage: vi.fn(() => {
      if (harness.controller === null) throw new Error("no stage controller");
      return harness.controller;
    }),
  };
});
vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: vi.fn(),
}));
vi.mock("../api/useVjPacks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/useVjPacks")>();
  return { ...actual, useVjPacks: vi.fn() };
});
vi.mock("../api/useVjPackClips", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/useVjPackClips")>();
  return { ...actual, useVjPackClips: vi.fn() };
});
vi.mock("../api/useVjClips", () => ({
  useVjClips: () => ({ data: undefined }),
}));
vi.mock("../api/useVjScenes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/useVjScenes")>();
  return { ...actual, useVjScenes: () => ({ data: [], error: null }) };
});
vi.mock("../api/useVjSetlists", () => ({
  useVjSetlists: () => ({ data: [], error: null }),
}));
vi.mock("../api/useVjPackEvent", () => ({
  useVjPackEvent: () => ({ data: undefined }),
}));
vi.mock("../api/useVjClipFavorite", () => ({
  useVjClipFavorite: () => ({ mutate: vi.fn() }),
}));
vi.mock("../api/useVjSceneMutations", () => ({
  useVjSceneMutations: () => ({
    createScene: { isPending: false, mutateAsync: vi.fn() },
  }),
}));
// The mirror draws through the engine's DOM pieces; their own tests cover them.
vi.mock("../screen/VjEffectsFrame", () => ({
  VjEffectsFrame: (props: { children: ReactNode }) => (
    <div data-testid="vj-effects-frame">{props.children}</div>
  ),
}));
vi.mock("../screen/overlay/VjOverlayLayer", () => ({
  VjOverlayLayer: () => <div data-testid="vj-overlay-layer" />,
}));

const EPOCH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIP_RIBBON = "00000000-0000-4000-8000-0000000000c3";
const CREATED_AT = "2026-11-01T20:00:00.000Z";
const SERVER_NOW = 1_800_000_000_000;

const PACK: VjPackDTO = {
  id: PACK_WARM,
  name: "Warm-up",
  position: 0,
  clipCount: 3,
  totalByteSize: 3_000_000,
  coverThumbnailUrl: null,
  createdBy: null,
  createdAt: CREATED_AT,
  updatedAt: CREATED_AT,
  event: null,
};

function clipOf(id: string, title: string): VjClipDTO {
  return {
    id,
    title,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1_000_000,
    width: 1280,
    height: 720,
    durationMs: 8_000,
    fitMode: "fill",
    thumbnailUrl: `https://files.example/thumbnails/${id}.webp`,
    mediaUrl: `https://files.example/clips/${id}.mp4`,
    packIds: [PACK_WARM],
    packCount: 1,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
  };
}

const CLIPS = [
  clipOf(CLIP_GRID, "Neon grid"),
  clipOf(CLIP_HAZE, "Warm haze"),
  clipOf(CLIP_RIBBON, "Tall ribbon"),
];

function queryOf<Data>(data: Data): UseQueryResult<Data, Error> {
  return { data, error: null } as unknown as UseQueryResult<Data, Error>;
}

const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 3,
  isNoop: false,
  applyAt: null,
};

function createCommands() {
  const answer = () => Promise.resolve(OK_OUTCOME);
  return {
    setPack: vi.fn<VjStageCommands["setPack"]>(answer),
    goClip: vi.fn<VjStageCommands["goClip"]>(answer),
    setEffects: vi.fn<VjStageCommands["setEffects"]>(answer),
    setStrobe: vi.fn<VjStageCommands["setStrobe"]>(answer),
    setMix: vi.fn<VjStageCommands["setMix"]>(answer),
    setTempo: vi.fn<VjStageCommands["setTempo"]>(answer),
    setTransition: vi.fn<VjStageCommands["setTransition"]>(answer),
  };
}

type FakeCommands = ReturnType<typeof createCommands>;

function stateWith(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState(EPOCH, SERVER_NOW),
    revision: 2,
    clipSequence: 1,
    activePackId: PACK_WARM,
    liveClipId: CLIP_GRID,
    liveSince: SERVER_NOW - 5_000,
    recentClipIds: [CLIP_GRID],
    ...changes,
  };
}

function controllerWith(
  commands: FakeCommands,
  changes: Partial<VjStageController> = {},
): VjStageController {
  const state = stateWith();
  return {
    isDemo: false,
    connection: { status: "attached", refusal: null, attach: null },
    isConnected: true,
    state,
    latestState: state,
    upcoming: null,
    serverNow: () => SERVER_NOW,
    toLocalTime: (serverMs: number) => serverMs,
    isClockSynced: true,
    clockOffsetMs: 0,
    seedClockOffset: () => undefined,
    lastCause: null,
    lastSourceClientId: null,
    clientId: "remote-client",
    screens: [],
    isLead: false,
    screenNumber: null,
    refusal: null,
    commands: commands as unknown as VjStageCommands,
    advance: () => Promise.resolve(OK_OUTCOME),
    sendStatus: () => undefined,
    subscribeLibrary: () => () => undefined,
    subscribeIdentify: () => () => undefined,
    ...changes,
  } as VjStageController;
}

function renderPage() {
  const tree = () => (
    <TestProviders initialEntries={[routes.adminVjRemote]}>
      <AdminVjRemotePage />
    </TestProviders>
  );
  const view = render(tree());
  return { ...view, rerenderPage: () => view.rerender(tree()) };
}

function clipTile(title: string): HTMLElement {
  return screen.getByRole("button", { name: `Show ${title} on the screen` });
}

/** jsdom reads navigator.onLine from the prototype; an own property shadows it. */
function setDeviceOnline(isOnline: boolean) {
  if (isOnline) {
    Reflect.deleteProperty(navigator, "onLine");
    return;
  }
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    get: () => false,
  });
}

/** Every media query answers `matches` for the split query and no for the rest. */
function stubMatchMedia(isSplit: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: isSplit && query === VJ_SPLIT_QUERY,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

beforeEach(() => {
  vi.mocked(useVjPacks).mockImplementation(() => queryOf([PACK]));
  vi.mocked(useVjPackClips).mockImplementation((packId) =>
    queryOf<VjPackClipsDTO>(
      packId === PACK_WARM
        ? { pack: PACK, items: CLIPS }
        : (undefined as unknown as VjPackClipsDTO),
    ),
  );
  stubMatchMedia(false);
});

afterEach(() => {
  setDeviceOnline(true);
  harness.controller = null;
  vi.restoreAllMocks();
});

describe("AdminVjRemotePage v2", () => {
  it("renders the top row, mirror band, strips, grid and dock", () => {
    harness.controller = controllerWith(createCommands());
    renderPage();
    expect(vi.mocked(useVjStage)).toHaveBeenCalledWith({ role: "remote" });
    expect(document.querySelector("[data-vj-remote]")).not.toBeNull();
    expect(document.querySelector("[data-vj-top-row]")).not.toBeNull();
    expect(document.querySelector("[data-vj-mirror-band]")).not.toBeNull();
    expect(document.querySelector("[data-vj-scenes-strip]")).not.toBeNull();
    expect(document.querySelector("[data-vj-history-strip]")).not.toBeNull();
    expect(document.querySelector("[data-vj-remote-grid]")).not.toBeNull();
    const dock = document.querySelector('[data-vj-remote-dock="phone"]');
    expect(dock).not.toBeNull();
    const dockElement = dock as HTMLElement;
    expect(dockElement.querySelector("[data-vj-tempo-bar]")).not.toBeNull();
    expect(
      dockElement.querySelector("[data-vj-transition-row]"),
    ).not.toBeNull();
    expect(dockElement.querySelector("[data-vj-pads-row]")).not.toBeNull();
    expect(dockElement.querySelector("[data-vj-dock-actions]")).not.toBeNull();
    // The phone dock keeps the crossfader in the Mix sheet.
    expect(dockElement.querySelector("[data-vj-crossfader]")).toBeNull();
    expect(clipTile("Neon grid")).toBeInTheDocument();
  });

  it("keeps the screen awake while open", () => {
    harness.controller = controllerWith(createCommands());
    renderPage();
    expect(vi.mocked(useScreenWakeLock)).toHaveBeenCalledWith(true);
  });

  it("a tile tap sends goClip and shows it pending", async () => {
    const commands = createCommands();
    commands.goClip.mockImplementation(() => new Promise(() => undefined));
    harness.controller = controllerWith(commands);
    renderPage();
    const user = userEvent.setup();
    await user.click(clipTile("Warm haze"));
    expect(commands.goClip).toHaveBeenCalledWith(CLIP_HAZE);
    await waitFor(() =>
      expect(
        document.querySelector(`[data-vj-tile][data-pending="true"]`),
      ).not.toBeNull(),
    );
  });

  it("a refused tap names the reason in the status line", async () => {
    const commands = createCommands();
    commands.goClip.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        code: "vj_clip_not_found",
        errorKey: "vj:error.socket.clipNotFound",
      } as VjCommandOutcome),
    );
    harness.controller = controllerWith(commands);
    renderPage();
    const user = userEvent.setup();
    await user.click(clipTile("Tall ribbon"));
    expect(
      await screen.findByText("That clip was deleted, maybe in another tab"),
    ).toBeInTheDocument();
  });

  it("Digit2 on the keyboard sends the second clip", () => {
    const commands = createCommands();
    harness.controller = controllerWith(commands);
    renderPage();
    fireEvent.keyDown(window, { code: "Digit2", key: "2" });
    expect(commands.goClip).toHaveBeenCalledWith(CLIP_HAZE);
  });

  it("a quantized change keeps the mirror's live clip until applyAt", () => {
    const commands = createCommands();
    const shown = stateWith();
    const latest = stateWith({
      revision: 3,
      liveClipId: CLIP_HAZE,
      tempo: { ...shown.tempo, quantize: "bar" },
    });
    harness.controller = controllerWith(commands, {
      state: shown,
      latestState: latest,
      upcoming: { state: latest, applyAt: SERVER_NOW + 1_500 },
    });
    const view = renderPage();
    const band = document.querySelector("[data-vj-mirror-band]") as HTMLElement;
    expect(
      band
        .querySelector("[data-vj-mirror-clip]")
        ?.getAttribute("data-vj-mirror-clip"),
    ).toBe(CLIP_GRID);
    expect(within(band).getByText("On the next bar")).toBeInTheDocument();

    harness.controller = controllerWith(commands, {
      state: latest,
      latestState: latest,
      upcoming: null,
    });
    view.rerenderPage();
    expect(
      band
        .querySelector("[data-vj-mirror-clip]")
        ?.getAttribute("data-vj-mirror-clip"),
    ).toBe(CLIP_HAZE);
  });

  it("More opens the sheet list and Mix opens the mix sheet", async () => {
    harness.controller = controllerWith(createCommands());
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "More controls" }));
    const moreSheet = await screen.findByRole("dialog");
    await user.click(within(moreSheet).getByRole("button", { name: /^Mix/ }));
    await waitFor(() =>
      expect(document.querySelector("[data-vj-mix-sheet]")).not.toBeNull(),
    );
  });

  it("the split layout shows the crossfader in the dock column", () => {
    stubMatchMedia(true);
    harness.controller = controllerWith(createCommands());
    renderPage();
    const column = document.querySelector('[data-vj-remote-dock="split"]');
    expect(column).not.toBeNull();
    expect(
      (column as HTMLElement).querySelector("[data-vj-crossfader]"),
    ).not.toBeNull();
    expect(document.querySelector('[data-vj-remote-dock="phone"]')).toBeNull();
  });

  it("while offline every control is aria-disabled and the status line names the reason", async () => {
    setDeviceOnline(false);
    const commands = createCommands();
    harness.controller = controllerWith(commands);
    renderPage();
    const reason = await screen.findByText(
      "Can't reach the server. Check your connection",
    );
    const statusRegion = reason.closest("[role='status']") as HTMLElement;
    const tile = clipTile("Neon grid");
    expect(tile).toHaveAttribute("aria-disabled", "true");
    expect(tile.getAttribute("aria-describedby")).toContain(statusRegion.id);
    const blackout = screen.getByRole("button", { name: /Blackout/ });
    expect(blackout).toHaveAttribute("aria-disabled", "true");
    const user = userEvent.setup();
    await user.click(tile);
    expect(commands.goClip).not.toHaveBeenCalled();
  });

  it("a flash-capable pad asks for consent once per show", async () => {
    const commands = createCommands();
    harness.controller = controllerWith(commands);
    renderPage();
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /^Invert\./ }));
    expect(commands.setEffects).not.toHaveBeenCalled();
    await user.click(
      await screen.findByRole("button", { name: "Turn on Invert now" }),
    );
    expect(commands.setEffects).toHaveBeenCalledWith({
      settings: { invert: { isOn: true } },
    });

    await user.click(screen.getByRole("button", { name: /^Strobe\./ }));
    await act(async () => {
      await Promise.resolve();
    });
    expect(commands.setStrobe).toHaveBeenCalledWith(true);
    expect(
      screen.queryByRole("button", { name: "Turn on Strobe now" }),
    ).toBeNull();
  });

  it("a flash-capable transition names its mode on the consent", async () => {
    const commands = createCommands();
    harness.controller = controllerWith(commands);
    renderPage();
    const user = userEvent.setup();
    await user.click(
      screen.getByRole("button", { name: "Transition: Fade. Change it" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Dip to white" }),
    );
    expect(commands.setTransition).not.toHaveBeenCalled();
    await user.click(
      await screen.findByRole("button", { name: "Turn on Dip to white now" }),
    );
    expect(commands.setTransition).toHaveBeenCalledWith({ mode: "dipWhite" });
  });
});
