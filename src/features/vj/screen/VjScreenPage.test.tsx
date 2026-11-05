import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import type { ReactNode } from "react";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ReducedMotionContext } from "../../../app/providers/motionPrefs";
import {
  createVjStageState,
  type VjClipDTO,
  type VjPackDTO,
  type VjScreenClipStatus,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import type { VjStageController } from "../live/useVjStage";
import { INITIAL_VJ_CONNECTION } from "../realtime/vjTransport";
import { VJ_SCREEN_SNAPSHOT_STORAGE_KEY } from "../vj.constants";
import type { VjClipCache } from "./vjClipCache";
import type { VjRenderableClip } from "./vjLayerMachine";
import type { VjScreenPreloadResult } from "./useVjScreenPreload";
import type { VjScreenRecord } from "./vjScreenRecord";
import type { VjStageRendererProps } from "./VjStageRenderer";
import { VJ_SCREEN_DOCUMENT_ATTRIBUTE } from "./useVjScreenDocumentFlag";
import { VjScreenPage } from "./VjScreenPage";

const mocks = vi.hoisted(() => ({
  stage: null as VjStageController | null,
  preload: null as VjScreenPreloadResult | null,
  rendererProps: [] as VjStageRendererProps[],
  wakeLock: vi.fn<(isActive: boolean) => void>(),
  fakeLayers: {
    lastTargetKey: null as string | null,
    front: null as VjRenderableClip | null,
    loading: null as VjRenderableClip | null,
  },
}));

vi.mock("../live/useVjStage", () => ({
  useVjStage: () => {
    if (mocks.stage === null) throw new Error("stage mock not set");
    return mocks.stage;
  },
}));
vi.mock("./useVjScreenPreload", () => ({
  useVjScreenPreload: () => {
    if (mocks.preload === null) throw new Error("preload mock not set");
    return mocks.preload;
  },
}));
vi.mock("./useVjScreenStatusReport", () => ({
  useVjScreenStatusReport: () => undefined,
}));
vi.mock("./useVjScreenRecordSync", () => ({
  useVjScreenRecordSync: () => undefined,
}));
vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: (isActive: boolean) => mocks.wakeLock(isActive),
}));
vi.mock("./VjStageRenderer", () => ({
  VjStageRenderer: (props: VjStageRendererProps) => {
    mocks.rendererProps.push(props);
    const layers = mocks.fakeLayers;
    const target = props.target;
    const targetKey = target ? `${target.clipId}|${target.sourceUrl}` : null;
    if (targetKey !== layers.lastTargetKey) {
      layers.lastTargetKey = targetKey;
      // Like the real renderer: the first clip goes straight to the front,
      // later ones wait in the loading slot (no first frame in jsdom), and a
      // clip already at the front is never adopted again and drops the
      // loading one, whose URL it reports as released.
      if (target === null) {
        layers.front = null;
      } else if (layers.front === null) {
        layers.front = target;
      } else if (layers.front.clipId === target.clipId) {
        if (layers.loading) props.onSourceReleased(layers.loading.sourceUrl);
        layers.loading = null;
      } else {
        if (layers.loading) props.onSourceReleased(layers.loading.sourceUrl);
        layers.loading = target;
      }
    }
    return (
      <div data-testid="vj-renderer" data-target={target?.clipId ?? ""}>
        {layers.front ? <video src={layers.front.sourceUrl} muted /> : null}
        {layers.loading ? <video src={layers.loading.sourceUrl} muted /> : null}
        {props.overlay.isVisible ? <p>{props.overlay.text}</p> : null}
      </div>
    );
  },
}));

const PACK: VjPackDTO = {
  id: "pack-1",
  name: "Warm haze",
  position: 0,
  clipCount: 3,
  totalByteSize: 3000,
  coverThumbnailUrl: null,
  createdBy: null,
  createdAt: "2026-11-01T00:00:00.000Z",
  updatedAt: "2026-11-01T00:00:00.000Z",
};

function clip(clipId: string): VjClipDTO {
  return {
    id: clipId,
    title: `Title ${clipId}`,
    mediaKind: "gif",
    mimeType: "image/gif",
    byteSize: 1000,
    width: 480,
    height: 270,
    durationMs: null,
    fitMode: "fill",
    thumbnailUrl: `/thumbs/${clipId}`,
    mediaUrl: `/files/${clipId}`,
    packIds: ["pack-1"],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
  };
}

const CLIPS = [clip("clip-1"), clip("clip-2"), clip("clip-3")];

function readyStatus(clipId: string): VjScreenClipStatus {
  return { clipId, state: "ready", progress: 1, failure: null };
}

function stageState(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState("epoch-1", 0),
    revision: 1,
    clipSequence: 1,
    activePackId: "pack-1",
    liveClipId: "clip-1",
    ...changes,
  };
}

function stageController(
  changes: Partial<VjStageController> = {},
): VjStageController {
  const noop = () =>
    Promise.resolve({ ok: true as const, revision: 1, isNoop: false });
  return {
    isDemo: true,
    connection: { ...INITIAL_VJ_CONNECTION, status: "attached" },
    isConnected: true,
    state: stageState(),
    lastCause: null,
    lastSourceClientId: null,
    clientId: "client-1",
    screens: [],
    isLead: false,
    refusal: null,
    commands: {
      setPack: noop,
      goClip: noop,
      setTransition: noop,
      setOverlay: noop,
      setEffects: noop,
      setStrobe: noop,
      setShuffle: noop,
    },
    advance: vi.fn(noop),
    sendStatus: vi.fn(),
    subscribeLibrary: () => () => undefined,
    ...changes,
  };
}

/** Never reset, so no two tests mint the same URL (a revoke on unmount waits one task). */
let objectUrlCount = 0;

function clipCache(
  readObjectUrl: VjClipCache["readObjectUrl"] = (clipId) => {
    objectUrlCount += 1;
    return Promise.resolve(`blob:${clipId}-${objectUrlCount}`);
  },
): VjClipCache {
  return {
    isPersistent: true,
    has: () => Promise.resolve(true),
    put: () => Promise.resolve(),
    readObjectUrl: vi.fn(readObjectUrl),
    remove: () => Promise.resolve(),
    keepOnly: () => Promise.resolve(0),
    listClipIds: () => Promise.resolve(CLIPS.map((each) => each.id)),
  };
}

function preloadResult(
  changes: Partial<VjScreenPreloadResult> = {},
): VjScreenPreloadResult {
  return {
    pack: PACK,
    clips: CLIPS,
    statuses: CLIPS.map((each) => readyStatus(each.id)),
    readyClipIds: CLIPS.map((each) => each.id),
    cache: clipCache(),
    clipById: (clipId) => CLIPS.find((each) => each.id === clipId) ?? null,
    markDecodeFailed: vi.fn(),
    ...changes,
  };
}

function page(): ReactNode {
  return (
    <TestProviders initialEntries={["/admin/vj/screen"]}>
      <ReducedMotionContext.Provider value={true}>
        <LazyMotion features={domMax} strict>
          <VjScreenPage />
        </LazyMotion>
      </ReducedMotionContext.Provider>
    </TestProviders>
  );
}

function renderPage() {
  const view = render(page());
  return { ...view, rerenderPage: () => view.rerender(page()) };
}

function lastTarget(): VjRenderableClip | null {
  return mocks.rendererProps.at(-1)?.target ?? null;
}

function screenRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>("main")?.parentElement;
  if (!root) throw new Error("no screen root");
  return root;
}

function enterFullscreen(): void {
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    get: () => document.documentElement,
  });
  act(() => {
    document.dispatchEvent(new Event("fullscreenchange"));
  });
}

/** Lets the lazily loaded vj catalog and the object URL reads settle under fake timers. */
async function settle(steps = 10): Promise<void> {
  for (let step = 0; step < steps; step += 1) {
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
  }
}

const requestFullscreen = vi.fn(() => Promise.resolve());

beforeAll(async () => {
  // Warm the lazy catalog module so fake-timer tests resolve it in microtasks.
  await import("../../../shared/i18n/catalogs/en/vj");
});

beforeEach(() => {
  mocks.rendererProps.length = 0;
  mocks.fakeLayers.lastTargetKey = null;
  mocks.fakeLayers.front = null;
  mocks.fakeLayers.loading = null;
  mocks.wakeLock.mockClear();
  mocks.stage = stageController();
  mocks.preload = preloadResult();
  requestFullscreen.mockClear();
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    configurable: true,
    value: requestFullscreen,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  Reflect.deleteProperty(document.documentElement, "requestFullscreen");
  Reflect.deleteProperty(document, "fullscreenElement");
  Reflect.deleteProperty(navigator, "onLine");
  Reflect.deleteProperty(navigator, "storage");
  localStorage.removeItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
});

describe("VjScreenPage setup", () => {
  it("shows the pack, the preload progress and Go fullscreen before the show", async () => {
    mocks.preload = preloadResult({
      statuses: [
        readyStatus("clip-1"),
        { clipId: "clip-2", state: "loading", progress: 0.4, failure: null },
        { clipId: "clip-3", state: "queued", progress: 0, failure: null },
      ],
      readyClipIds: ["clip-1"],
    });
    renderPage();
    expect(await screen.findByText("Pack: Warm haze")).toBeInTheDocument();
    expect(screen.getByText("1 of 3 clips ready")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Go fullscreen" }),
    ).toBeInTheDocument();
  });

  it("names each preload failure on the setup card", async () => {
    mocks.preload = preloadResult({
      statuses: [
        readyStatus("clip-1"),
        {
          clipId: "clip-2",
          state: "failed",
          progress: 0,
          failure: "url_expired",
        },
        {
          clipId: "clip-3",
          state: "failed",
          progress: 0,
          failure: "storage_full",
        },
      ],
      readyClipIds: ["clip-1"],
    });
    renderPage();
    expect(
      await screen.findByText("2 clips couldn't load"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "The download link ran out twice. Reload the screen to try again",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "This laptop is out of space for clips. Free some space and reload the screen",
      ),
    ).toBeInTheDocument();
  });

  it("asks for fullscreen from the setup card", async () => {
    renderPage();
    fireEvent.click(
      await screen.findByRole("button", { name: "Go fullscreen" }),
    );
    expect(requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("names the refusal before the show", async () => {
    mocks.stage = stageController({
      isConnected: false,
      refusal: "screen_replaced",
      connection: {
        status: "refused",
        refusal: "screen_replaced",
        attach: null,
      },
    });
    renderPage();
    expect(
      await screen.findByText(
        "This screen opened in another tab, so this tab stopped. Use the newer tab, or reload this one to take over",
      ),
    ).toBeInTheDocument();
  });
});

describe("VjScreenPage show", () => {
  it("puts nothing but the visuals on screen once fullscreen", async () => {
    mocks.stage = stageController({
      state: stageState({
        overlay: { text: "Dance with us", style: "big", isVisible: true },
      }),
    });
    const { container } = renderPage();
    await screen.findByRole("button", { name: "Go fullscreen" });
    const root = screenRoot(container);

    enterFullscreen();
    await waitFor(() =>
      expect(
        within(root).queryByRole("heading", { name: "VJ screen" }),
      ).not.toBeInTheDocument(),
    );
    expect(within(root).queryAllByRole("button")).toHaveLength(0);
    expect(root.textContent).toBe("Dance with us");
  });

  it("never shows the connection state on the projector", async () => {
    const { container, rerenderPage } = renderPage();
    await screen.findByRole("button", { name: "Go fullscreen" });
    const root = screenRoot(container);
    enterFullscreen();
    await waitFor(() =>
      expect(
        within(root).queryByRole("heading", { name: "VJ screen" }),
      ).not.toBeInTheDocument(),
    );
    const textBefore = root.textContent;

    mocks.stage = stageController({
      isConnected: false,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    rerenderPage();
    expect(root.textContent).toBe(textBefore);

    mocks.stage = stageController({
      isConnected: false,
      refusal: "screen_replaced",
      connection: {
        status: "refused",
        refusal: "screen_replaced",
        attach: null,
      },
    });
    rerenderPage();
    expect(root.textContent).toBe(textBefore);
    expect(within(root).queryByRole("alert")).not.toBeInTheDocument();
    expect(within(root).queryAllByRole("button")).toHaveLength(0);
  });

  it("hides the cursor after 2 seconds without movement", async () => {
    vi.useFakeTimers();
    const { container } = renderPage();
    await settle();
    const root = screenRoot(container);

    act(() => {
      fireEvent.pointerMove(window);
    });
    expect(root).not.toHaveAttribute("data-cursor-hidden");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999);
    });
    expect(root).not.toHaveAttribute("data-cursor-hidden");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(root).toHaveAttribute("data-cursor-hidden", "true");

    act(() => {
      fireEvent.pointerMove(window);
    });
    expect(root).not.toHaveAttribute("data-cursor-hidden");
  });

  it("stamps data-vj-screen on the document while open and removes it after", () => {
    const { unmount } = renderPage();
    expect(
      document.documentElement.getAttribute(VJ_SCREEN_DOCUMENT_ATTRIBUTE),
    ).toBe("true");
    unmount();
    expect(
      document.documentElement.hasAttribute(VJ_SCREEN_DOCUMENT_ATTRIBUTE),
    ).toBe(false);
  });

  it("holds a wake lock while open", () => {
    renderPage();
    expect(mocks.wakeLock).toHaveBeenCalledWith(true);
  });

  it("keeps the last frame while the next clip is still loading", async () => {
    let resolveNextUrl: (sourceUrl: string) => void = () => undefined;
    const readObjectUrl = vi.fn((clipId: string) =>
      clipId === "clip-2"
        ? new Promise<string | null>((resolve) => {
            resolveNextUrl = resolve;
          })
        : Promise.resolve(`blob:${clipId}-first`),
    );
    mocks.preload = preloadResult({ cache: clipCache(readObjectUrl) });
    const { rerenderPage } = renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));

    mocks.stage = stageController({
      state: stageState({ clipSequence: 2, revision: 2, liveClipId: "clip-2" }),
    });
    rerenderPage();
    await waitFor(() => expect(readObjectUrl).toHaveBeenCalledWith("clip-2"));
    expect(lastTarget()?.clipId).toBe("clip-1");

    act(() => {
      resolveNextUrl("blob:clip-2-next");
    });
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-2"));
    expect(lastTarget()?.sourceUrl).toBe("blob:clip-2-next");
  });

  it("restores the last look and shuffles the cached clips on an offline start", async () => {
    const savedState = stageState({
      liveClipId: "clip-2",
      shuffle: {
        isOn: true,
        intervalKind: "seconds",
        intervalValue: 8,
        bpm: 120,
      },
    });
    const record: VjScreenRecord = {
      savedAt: 1,
      state: savedState,
      pack: PACK,
      clips: CLIPS,
    };
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(record),
    );
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      value: false,
    });
    mocks.stage = stageController({
      state: null,
      isConnected: false,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    vi.useFakeTimers();
    renderPage();
    await settle();

    expect(lastTarget()?.clipId).toBe("clip-2");
    expect(
      screen.getByText(
        "No internet. 3 clips saved on this laptop are ready to play",
      ),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(8000);
    });
    await settle();
    const nextClipId = lastTarget()?.clipId;
    expect(nextClipId).not.toBe("clip-2");
    expect(CLIPS.map((each) => each.id)).toContain(nextClipId);
  });
  it("revokes every object URL it still holds on unmount", async () => {
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");
    const { unmount } = renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));
    const liveUrl = lastTarget()?.sourceUrl;
    expect(liveUrl).toMatch(/^blob:clip-1-/);
    expect(revokeObjectUrl).not.toHaveBeenCalledWith(liveUrl);

    unmount();
    await waitFor(() => expect(revokeObjectUrl).toHaveBeenCalledWith(liveUrl));
  });

  it("releases a new URL the stage did not adopt for the clip it already shows", async () => {
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");
    const { rerenderPage } = renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));
    const frontUrl = lastTarget()?.sourceUrl;

    mocks.stage = stageController({
      state: stageState({ clipSequence: 2, revision: 2, liveClipId: "clip-2" }),
    });
    rerenderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-2"));
    const loadingUrl = lastTarget()?.sourceUrl;

    // Back to the clip at the front before the loading one showed a frame.
    mocks.stage = stageController({
      state: stageState({ clipSequence: 3, revision: 3, liveClipId: "clip-1" }),
    });
    rerenderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));
    const unadoptedUrl = lastTarget()?.sourceUrl;
    expect(unadoptedUrl).not.toBe(frontUrl);

    await waitFor(() =>
      expect(revokeObjectUrl).toHaveBeenCalledWith(unadoptedUrl),
    );
    expect(revokeObjectUrl).toHaveBeenCalledWith(loadingUrl);
    expect(revokeObjectUrl).not.toHaveBeenCalledWith(frontUrl);
  });
});

describe("VjScreenPage safety and storage", () => {
  it("strobes only while this screen is the lead", () => {
    mocks.stage = stageController({ isLead: true });
    const { rerenderPage } = renderPage();
    expect(mocks.rendererProps.at(-1)?.isStrobeEnabled).toBe(true);

    mocks.stage = stageController({ isLead: false });
    rerenderPage();
    expect(mocks.rendererProps.at(-1)?.isStrobeEnabled).toBe(false);
  });

  it("restores the saved look with the strobe off after a reload", async () => {
    const savedState = stageState({
      effects: {
        ...createVjStageState("epoch-1", 0).effects,
        isStrobing: true,
        strobeStartedAt: 5_000,
      },
    });
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({
        savedAt: 1,
        state: savedState,
        pack: PACK,
        clips: CLIPS,
      }),
    );
    mocks.stage = stageController({
      state: null,
      isConnected: false,
      isLead: true,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));

    const effects = mocks.rendererProps.at(-1)?.effects;
    expect(effects?.isStrobing).toBe(false);
    expect(effects?.strobeStartedAt).toBeNull();
  });

  it("asks the browser to keep the clip cache", async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: { persisted: () => Promise.resolve(false), persist },
    });
    renderPage();
    await waitFor(() => expect(persist).toHaveBeenCalledTimes(1));
  });

  it("keeps running when the browser has no storage manager", async () => {
    Object.defineProperty(navigator, "storage", {
      configurable: true,
      value: undefined,
    });
    renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));
  });
});
