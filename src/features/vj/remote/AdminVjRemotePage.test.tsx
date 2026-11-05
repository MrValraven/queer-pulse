import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { UseQueryResult } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { routes } from "../../../app/routeMap";
import {
  createVjStageState,
  type VjClipDTO,
  type VjPackClipsDTO,
  type VjPackDTO,
  type VjScreenClipStatus,
  type VjScreenStatus,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { useVjClips } from "../api/useVjClips";
import { useVjPackClips } from "../api/useVjPackClips";
import { useVjPacks } from "../api/useVjPacks";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import type { VjDemoLockSeam } from "../demo/vjDemoHosting";
import { configureVjDemoStore, resetVjDemoLibrary } from "../demo/vjDemoStore";
import { VjDemoTransport } from "../demo/vjDemoTransport";
import {
  useVjStage,
  type VjCommandOutcome,
  type VjStageCommands,
  type VjStageController,
} from "../live/useVjStage";
import type {
  VjConnectionState,
  VjTransportOptions,
} from "../realtime/vjTransport";
import { vjErrorKeyOf } from "../vjErrors";
import { AdminVjRemotePage } from "./AdminVjRemotePage";

const harness = vi.hoisted(() => ({
  controller: null as VjStageController | null,
  transportFactory: null as null | ((options: unknown) => unknown),
}));

vi.mock("../live/useVjStage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../live/useVjStage")>();
  return { ...actual, useVjStage: vi.fn(actual.useVjStage) };
});
vi.mock("../api/useVjPacks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/useVjPacks")>();
  return { ...actual, useVjPacks: vi.fn(actual.useVjPacks) };
});
vi.mock("../api/useVjPackClips", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/useVjPackClips")>();
  return { ...actual, useVjPackClips: vi.fn(actual.useVjPackClips) };
});
vi.mock("../api/useVjClips", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../api/useVjClips")>();
  return { ...actual, useVjClips: vi.fn(actual.useVjClips) };
});
vi.mock("../realtime/createVjTransport", () => ({
  createVjTransport: (options: unknown) => {
    if (harness.transportFactory === null) {
      throw new Error("no transport factory");
    }
    return harness.transportFactory(options);
  },
}));

const EPOCH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const PACK_PEAK = "00000000-0000-4000-8000-0000000000a2";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIP_RIBBON = "00000000-0000-4000-8000-0000000000c3";
const CREATED_AT = "2026-11-01T20:00:00.000Z";

function packOf(id: string, name: string, position: number): VjPackDTO {
  return {
    id,
    name,
    position,
    clipCount: 3,
    totalByteSize: 3_000_000,
    coverThumbnailUrl: null,
    createdBy: null,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  };
}

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
  };
}

const PACKS = [
  packOf(PACK_WARM, "Warm-up", 0),
  packOf(PACK_PEAK, "Peak hour", 1),
];
const WARM_CLIPS = [
  clipOf(CLIP_GRID, "Neon grid"),
  clipOf(CLIP_HAZE, "Warm haze"),
  clipOf(CLIP_RIBBON, "Tall ribbon"),
];

function queryOf<Data>(data: Data | undefined): UseQueryResult<Data, Error> {
  return {
    data,
    isLoading: data === undefined,
    isPending: data === undefined,
    isSuccess: data !== undefined,
    isError: false,
    error: null,
  } as unknown as UseQueryResult<Data, Error>;
}

function okOutcome(): Promise<VjCommandOutcome> {
  return Promise.resolve({ ok: true, revision: 3, isNoop: false });
}

function createCommands() {
  return {
    setPack: vi.fn<VjStageCommands["setPack"]>(() => okOutcome()),
    goClip: vi.fn<VjStageCommands["goClip"]>(() => okOutcome()),
    setTransition: vi.fn<VjStageCommands["setTransition"]>(() => okOutcome()),
    setOverlay: vi.fn<VjStageCommands["setOverlay"]>(() => okOutcome()),
    setEffects: vi.fn<VjStageCommands["setEffects"]>(() => okOutcome()),
    setStrobe: vi.fn<VjStageCommands["setStrobe"]>(() => okOutcome()),
    setShuffle: vi.fn<VjStageCommands["setShuffle"]>(() => okOutcome()),
  };
}

type FakeCommands = ReturnType<typeof createCommands>;

function stateWith(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState(EPOCH, 0),
    revision: 2,
    clipSequence: 1,
    activePackId: PACK_WARM,
    liveClipId: CLIP_GRID,
    ...changes,
  };
}

const ATTACHED: VjConnectionState = {
  status: "attached",
  refusal: null,
  attach: null,
};

function controllerWith(
  commands: FakeCommands,
  changes: Partial<VjStageController> = {},
): VjStageController {
  return {
    isDemo: false,
    connection: ATTACHED,
    isConnected: true,
    state: stateWith(),
    lastCause: null,
    lastSourceClientId: null,
    clientId: "remote-client",
    screens: [],
    isLead: false,
    refusal: null,
    commands,
    advance: () => okOutcome(),
    sendStatus: () => undefined,
    subscribeLibrary: () => () => undefined,
    ...changes,
  };
}

function screenStatus(
  number: number,
  isConnected: boolean,
  clips: VjScreenClipStatus[] = [],
): VjScreenStatus {
  return {
    screenId: `33333333-3333-4333-8333-33333333333${number}`,
    number,
    isConnected,
    isLead: isConnected && number === 1,
    isFullscreen: true,
    connectedAt: isConnected ? 1_000 : null,
    lastSeenAt: 2_000,
    preload: { packId: PACK_WARM, clips },
  };
}

function renderPage() {
  const view = render(
    <TestProviders initialEntries={[routes.adminVjRemote]}>
      <AdminVjRemotePage />
    </TestProviders>,
  );
  const rerenderPage = () =>
    view.rerender(
      <TestProviders initialEntries={[routes.adminVjRemote]}>
        <AdminVjRemotePage />
      </TestProviders>,
    );
  return { ...view, rerenderPage };
}

function setController(controller: VjStageController) {
  harness.controller = controller;
}

function useFakeLibrary() {
  vi.mocked(useVjStage).mockImplementation(() => {
    if (harness.controller === null) throw new Error("no stage controller");
    return harness.controller;
  });
  vi.mocked(useVjPacks).mockImplementation(() => queryOf(PACKS));
  vi.mocked(useVjPackClips).mockImplementation((packId) =>
    queryOf<VjPackClipsDTO>(
      packId === PACK_WARM
        ? { pack: packOf(PACK_WARM, "Warm-up", 0), items: WARM_CLIPS }
        : packId === PACK_PEAK
          ? { pack: packOf(PACK_PEAK, "Peak hour", 1), items: [] }
          : undefined,
    ),
  );
  vi.mocked(useVjClips).mockImplementation(() => queryOf(WARM_CLIPS));
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

beforeEach(() => {
  harness.transportFactory = null;
  useFakeLibrary();
});

afterEach(() => {
  setDeviceOnline(true);
  vi.useRealTimers();
});

describe("AdminVjRemotePage live view", () => {
  it("mirrors the live clip with its effects and the overlay text", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(1_800_000_000_000);
    const commands = createCommands();
    const baseEffects = stateWith().effects;
    setController(
      controllerWith(commands, {
        state: stateWith({
          effects: { ...baseEffects, isMonochrome: true, isMirrored: true },
          overlay: { text: "Hello Lisbon", style: "big", isVisible: true },
        }),
      }),
    );
    const view = renderPage();

    expect(await screen.findByText("Hello Lisbon")).toBeInTheDocument();
    const mirror = document.querySelector("[data-vj-remote-mirror]");
    expect(mirror).not.toBeNull();
    const mirrorElement = mirror as HTMLElement;
    expect(
      mirrorElement.querySelector(`[data-vj-mirror-clip="${CLIP_GRID}"]`),
    ).not.toBeNull();
    expect(
      mirrorElement.querySelector('[data-vj-monochrome="true"]'),
    ).not.toBeNull();
    expect(
      mirrorElement.querySelector('[data-vj-mirrored="true"]'),
    ).not.toBeNull();
    expect(mirrorElement.querySelector("[data-vj-mirror-blackout]")).toBeNull();
    expect(screen.getByText("On the screen now")).toBeInTheDocument();

    setController(
      controllerWith(commands, {
        state: stateWith({
          revision: 3,
          effects: {
            ...baseEffects,
            isBlackout: true,
            isStrobing: true,
            strobeStartedAt: Date.now() - 3_000,
          },
        }),
      }),
    );
    view.rerenderPage();

    expect(
      mirrorElement.querySelector("[data-vj-mirror-blackout]"),
    ).not.toBeNull();
    const strobeChip = mirrorElement.querySelector("[data-vj-strobe-chip]");
    expect(strobeChip).toHaveTextContent("Strobe");
    expect(strobeChip).toHaveTextContent("7 s left");
  });

  it("says how many screens are live and when they are offline", async () => {
    const commands = createCommands();
    setController(controllerWith(commands, { screens: [] }));
    const view = renderPage();
    expect(await screen.findByText("No screen open")).toBeInTheDocument();

    setController(
      controllerWith(commands, {
        screens: [screenStatus(1, true), screenStatus(2, true)],
      }),
    );
    view.rerenderPage();
    expect(screen.getByText("2 screens live")).toBeInTheDocument();
    expect(screen.getByText("2 screens live")).toHaveAttribute(
      "role",
      "status",
    );

    setController(
      controllerWith(commands, {
        screens: [screenStatus(1, true), screenStatus(2, false)],
      }),
    );
    view.rerenderPage();
    expect(screen.getByText("1 of 2 screens live")).toBeInTheDocument();

    setController(
      controllerWith(commands, {
        screens: [screenStatus(1, false), screenStatus(2, false)],
      }),
    );
    view.rerenderPage();
    expect(screen.getByText("Screens offline")).toBeInTheDocument();
  });

  it("switches the pack from the picker", async () => {
    const commands = createCommands();
    setController(controllerWith(commands));
    renderPage();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: /^(Pack|Warm-up)/ }),
    );
    await user.click(screen.getByRole("option", { name: "Peak hour" }));

    expect(commands.setPack).toHaveBeenCalledTimes(1);
    expect(commands.setPack).toHaveBeenCalledWith(PACK_PEAK);
  });

  it("sends a clip live on tap and outlines the live one in coral", async () => {
    const commands = createCommands();
    setController(controllerWith(commands));
    renderPage();
    const user = userEvent.setup();

    await screen.findByRole("button", { name: "Show Neon grid on the screen" });
    const liveTile = clipTile("Neon grid");
    expect(liveTile).toHaveAttribute("aria-current", "true");
    expect(liveTile).toHaveAttribute("data-live", "true");
    expect(within(liveTile).getByText("Live")).toBeInTheDocument();
    expect(clipTile("Warm haze")).not.toHaveAttribute("data-live");

    await user.click(clipTile("Warm haze"));
    expect(commands.goClip).toHaveBeenCalledTimes(1);
    expect(commands.goClip).toHaveBeenCalledWith(CLIP_HAZE);
  });

  it("dims clips the screen has not loaded with their progress and names a failure", async () => {
    const commands = createCommands();
    setController(
      controllerWith(commands, {
        screens: [
          screenStatus(1, true, [
            { clipId: CLIP_GRID, state: "ready", progress: 1, failure: null },
            {
              clipId: CLIP_HAZE,
              state: "loading",
              progress: 0.4,
              failure: null,
            },
            {
              clipId: CLIP_RIBBON,
              state: "failed",
              progress: 0,
              failure: "decode_failed",
            },
          ]),
        ],
      }),
    );
    renderPage();

    await screen.findByRole("button", { name: "Show Warm haze on the screen" });
    expect(clipTile("Neon grid")).not.toHaveAttribute("data-dimmed");

    const loadingTile = clipTile("Warm haze");
    expect(loadingTile).toHaveAttribute("data-dimmed", "true");
    expect(loadingTile).toHaveAttribute("data-readiness", "loading");
    expect(
      within(loadingTile).getByText("Loading on the screen, 40%"),
    ).toBeInTheDocument();
    const progressFill =
      loadingTile.querySelector<HTMLElement>("[data-vj-progress]");
    expect(progressFill?.style.transform).toBe("scaleX(0.4)");

    const failedTile = clipTile("Tall ribbon");
    expect(failedTile).toHaveAttribute("data-dimmed", "true");
    expect(
      within(failedTile).getByText("Couldn't load on the screen"),
    ).toBeInTheDocument();
    expect(
      within(failedTile).getByText("The screen's browser can't play this clip"),
    ).toBeInTheDocument();
  });
});

describe("AdminVjRemotePage controls", () => {
  it("clears the screen", async () => {
    const commands = createCommands();
    setController(controllerWith(commands));
    const view = renderPage();
    const user = userEvent.setup();

    const clearButton = await screen.findByRole("button", {
      name: "Clear the screen",
    });
    expect(clearButton).toHaveAttribute("aria-disabled", "false");
    await user.click(clearButton);
    expect(commands.goClip).toHaveBeenCalledWith(null);

    setController(
      controllerWith(commands, {
        state: stateWith({ revision: 3, liveClipId: null }),
      }),
    );
    view.rerenderPage();
    expect(
      screen.getByRole("button", { name: "Clear the screen" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(await screen.findByText("The screen is black")).toBeInTheDocument();
  });

  it("keeps the grid browsable and the controls unavailable while offline, with the reason", async () => {
    const commands = createCommands();
    setDeviceOnline(false);
    setController(
      controllerWith(commands, {
        connection: { status: "reconnecting", refusal: null, attach: null },
        isConnected: false,
      }),
    );
    const view = renderPage();
    const user = userEvent.setup();

    expect(
      await screen.findByText("Can't reach the server. Check your connection"),
    ).toBeInTheDocument();
    const tiles = screen.getAllByRole("button", {
      name: /^Show .* on the screen$/,
    });
    expect(tiles).toHaveLength(3);
    for (const tile of tiles) {
      expect(tile).toHaveAttribute("aria-disabled", "true");
    }
    await user.click(clipTile("Warm haze"));
    expect(commands.goClip).not.toHaveBeenCalled();
    const blackout = screen.getByRole("button", { name: "Blackout" });
    expect(blackout).toHaveAttribute("aria-disabled", "true");
    await user.click(blackout);
    expect(commands.setEffects).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Effects" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );

    setDeviceOnline(true);
    setController(
      controllerWith(commands, {
        connection: { status: "refused", refusal: "not_admin", attach: null },
        isConnected: false,
        refusal: "not_admin",
      }),
    );
    view.rerenderPage();
    expect(
      await screen.findByText(
        "VJ is open to admins only, and this account isn't an admin anymore",
      ),
    ).toBeInTheDocument();
    expect(clipTile("Neon grid")).toHaveAttribute("aria-disabled", "true");
  });

  it("names a refused command above the bar", async () => {
    const commands = createCommands();
    commands.goClip.mockResolvedValue({
      ok: false,
      code: "vj_clip_not_in_pack",
      errorKey: vjErrorKeyOf({ ok: false, code: "vj_clip_not_in_pack" }),
    });
    setController(controllerWith(commands));
    renderPage();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", {
        name: "Show Tall ribbon on the screen",
      }),
    );

    const reason = await screen.findByText(
      "That clip isn't in the active pack anymore",
    );
    expect(reason.closest('[role="status"]')).not.toBeNull();
  });

  it("opens the effects, text and shuffle sheets", async () => {
    const commands = createCommands();
    setController(controllerWith(commands));
    renderPage();
    const user = userEvent.setup();

    await user.click(await screen.findByRole("button", { name: "Effects" }));
    expect(
      await screen.findByRole("dialog", { name: "Effects" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close effects" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Text" }));
    expect(
      await screen.findByRole("dialog", { name: "Text on screen" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close text" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());

    await user.click(screen.getByRole("button", { name: "Shuffle" }));
    expect(
      await screen.findByRole("dialog", { name: "Shuffle" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Close shuffle" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});

describe("AdminVjRemotePage taps, offline lines and the pack hint", () => {
  it("sends both clips when tapped twice before the first ack", async () => {
    const commands = createCommands();
    commands.goClip.mockImplementation(
      () => new Promise<VjCommandOutcome>(() => undefined),
    );
    setController(controllerWith(commands));
    renderPage();
    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", {
        name: "Show Warm haze on the screen",
      }),
    );
    await user.click(clipTile("Tall ribbon"));

    expect(commands.goClip).toHaveBeenCalledTimes(2);
    expect(commands.goClip.mock.calls.map(([clipId]) => clipId)).toEqual([
      CLIP_HAZE,
      CLIP_RIBBON,
    ]);
  });

  it("reads the screens as unknown while offline", async () => {
    const commands = createCommands();
    setController(
      controllerWith(commands, {
        connection: { status: "reconnecting", refusal: null, attach: null },
        isConnected: false,
        screens: [screenStatus(1, true)],
      }),
    );
    const view = renderPage();

    const unknownLine = await screen.findByText(
      "Screens unknown until the remote reconnects",
    );
    expect(unknownLine).toHaveAttribute("data-vj-screens", "unknown");
    expect(screen.queryByText("1 screen live")).toBeNull();

    setController(
      controllerWith(commands, { screens: [screenStatus(1, true)] }),
    );
    view.rerenderPage();
    expect(screen.getByText("1 screen live")).toHaveAttribute(
      "data-vj-screens",
      "live",
    );
  });

  it("dims the pack picker while blocked and names the reason on its trigger", async () => {
    const commands = createCommands();
    setController(
      controllerWith(commands, {
        connection: { status: "reconnecting", refusal: null, attach: null },
        isConnected: false,
      }),
    );
    renderPage();

    const reason = await screen.findByText("Reconnecting to the server");
    const statusRegion = reason.closest('[role="status"]');
    expect(statusRegion).not.toBeNull();
    expect(reason.closest("[data-vj-remote-bar]")).not.toBeNull();
    const trigger = screen.getByRole("button", { name: /^(Pack|Warm-up)/ });
    expect(trigger).toHaveAttribute(
      "aria-describedby",
      statusRegion?.getAttribute("id"),
    );
    expect(trigger.closest('[data-blocked="true"]')).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Clear the screen" }),
    ).toHaveAttribute("aria-describedby", statusRegion?.getAttribute("id"));
  });

  it("points at the picker once when no pack is picked", async () => {
    const commands = createCommands();
    setController(
      controllerWith(commands, {
        state: stateWith({ activePackId: null, liveClipId: null }),
      }),
    );
    renderPage();

    expect(
      await screen.findByText("Choose a pack above to see its clips"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Pick a pack")).toHaveLength(1);
  });

  it("moves the live tag with the live clip", async () => {
    const commands = createCommands();
    setController(controllerWith(commands));
    const view = renderPage();

    await screen.findByRole("button", { name: "Show Neon grid on the screen" });
    expect(
      clipTile("Neon grid").querySelector("[data-vj-live-tag]"),
    ).not.toBeNull();

    setController(
      controllerWith(commands, {
        state: stateWith({ revision: 3, liveClipId: CLIP_HAZE }),
      }),
    );
    view.rerenderPage();

    expect(
      clipTile("Warm haze").querySelector("[data-vj-live-tag]"),
    ).not.toBeNull();
    await waitFor(() =>
      expect(
        clipTile("Neon grid").querySelector("[data-vj-live-tag]"),
      ).toBeNull(),
    );
  });
});

function createMemoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => [...values.keys()][index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}

/** A Web Lock stand-in: the first request hosts at once, later ones wait. */
function createGrantFirstLock(): VjDemoLockSeam {
  let isHeld = false;
  return {
    request(onGranted) {
      if (isHeld) return () => undefined;
      isHeld = true;
      onGranted();
      return () => {
        isHeld = false;
      };
    },
  };
}

describe("AdminVjRemotePage in demo", () => {
  it("renders in demo with the demo transport", async () => {
    const actualStage =
      await vi.importActual<typeof import("../live/useVjStage")>(
        "../live/useVjStage",
      );
    const actualPacks =
      await vi.importActual<typeof import("../api/useVjPacks")>(
        "../api/useVjPacks",
      );
    const actualPackClips = await vi.importActual<
      typeof import("../api/useVjPackClips")
    >("../api/useVjPackClips");
    const actualClips =
      await vi.importActual<typeof import("../api/useVjClips")>(
        "../api/useVjClips",
      );
    vi.mocked(useVjStage).mockImplementation(actualStage.useVjStage);
    vi.mocked(useVjPacks).mockImplementation(actualPacks.useVjPacks);
    vi.mocked(useVjPackClips).mockImplementation(
      actualPackClips.useVjPackClips,
    );
    vi.mocked(useVjClips).mockImplementation(actualClips.useVjClips);

    const hub = createVjDemoChannelHub();
    const lock = createGrantFirstLock();
    configureVjDemoStore({
      storage: createMemoryStorage(),
      channel: hub.open(),
    });
    resetVjDemoLibrary();
    const transportModes: boolean[] = [];
    harness.transportFactory = (options) => {
      const { isDemoMode, ...transportOptions } =
        options as VjTransportOptions & {
          isDemoMode: boolean;
        };
      transportModes.push(isDemoMode);
      return new VjDemoTransport({
        ...transportOptions,
        tabId: "demo-remote-tab",
        channelFactory: () => hub.open(),
        lock,
      });
    };

    renderPage();
    const user = userEvent.setup();

    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: "Blackout" }),
        ).toHaveAttribute("aria-disabled", "false"),
      { timeout: 4_000 },
    );
    expect(transportModes).toEqual([true]);

    await user.click(screen.getByRole("button", { name: /^(Pack|Warm-up)/ }));
    await user.click(await screen.findByRole("option", { name: "Warm-up" }));

    const tile = await screen.findByRole(
      "button",
      { name: "Show Neon grid on the screen" },
      { timeout: 4_000 },
    );
    await act(async () => {
      await user.click(tile);
    });
    await waitFor(
      () =>
        expect(
          screen.getByRole("button", { name: "Show Neon grid on the screen" }),
        ).toHaveAttribute("aria-current", "true"),
      { timeout: 4_000 },
    );
  });
});
