import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import {
  useEffect,
  useImperativeHandle,
  type JSX,
  type ReactNode,
} from "react";
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
  type VjScreenIdentifyFrame,
  type VjStageState,
} from "../../../shared/contracts/vj";
import { installVjFakeWebGl2 } from "../../../test/vjFakeWebGl2";
import { TestProviders } from "../../../test/TestProviders";
import { resetVjWebGl2ProbeForTests } from "../engine/gl/vjGlContext";
import type { VjStageController } from "../live/useVjStage";
import { INITIAL_VJ_CONNECTION } from "../realtime/vjTransport";
import {
  VJ_SCREEN_ID_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
  VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
} from "../vj.constants";
import type { VjMicTempoState } from "./useVjMicTempo";
import type { VjScreenEventCard } from "./useVjScreenEventCard";
import type { VjRendererHealth } from "./useVjScreenHealth";
import type {
  VjScreenPreloadInput,
  VjScreenPreloadResult,
} from "./useVjScreenPreload";
import type { VjScreenStatusReportInput } from "./useVjScreenStatusReport";
import { VJ_SCREEN_DOCUMENT_ATTRIBUTE } from "./useVjScreenDocumentFlag";
import type { VjClipCache } from "./vjClipCache";
import type { VjRenderableSource } from "./vjLayerMachine";
import type { VjRendererState } from "./vjRendererKind";
import type { VjScreenRecord } from "./vjScreenRecord";
import type { VjScreenStageProps } from "./VjScreenStage";
import { VjScreenPage } from "./VjScreenPage";

const mocks = vi.hoisted(() => ({
  stage: null as VjStageController | null,
  preload: null as VjScreenPreloadResult | null,
  preloadInputs: [] as VjScreenPreloadInput[],
  statusInputs: [] as VjScreenStatusReportInput[],
  stageProps: [] as VjScreenStageProps[],
  isRealStage: false,
  rendererState: null as VjRendererState | null,
  rendererHealth: null as VjRendererHealth | null,
  mic: null as VjMicTempoState | null,
  eventCard: null as VjScreenEventCard | null,
  identifyListener: null as ((frame: unknown) => void) | null,
  renderModeListener: null as ((frame: unknown) => void) | null,
  wakeLock: vi.fn<(isActive: boolean) => void>(),
  fakeLayers: {
    lastTargetKey: null as string | null,
    front: null as { clipId: string; sourceUrl: string } | null,
    loading: null as { clipId: string; sourceUrl: string } | null,
  },
}));

vi.mock("../live/useVjStage", () => ({
  useVjStage: () => {
    if (mocks.stage === null) throw new Error("stage mock not set");
    return mocks.stage;
  },
}));
vi.mock("./useVjScreenPreload", () => ({
  useVjScreenPreload: (input: VjScreenPreloadInput) => {
    mocks.preloadInputs.push(input);
    if (mocks.preload === null) throw new Error("preload mock not set");
    return mocks.preload;
  },
}));
vi.mock("./useVjScreenStatusReport", () => ({
  useVjScreenStatusReport: (input: VjScreenStatusReportInput) => {
    mocks.statusInputs.push(input);
  },
}));
vi.mock("./useVjScreenRecordSync", () => ({
  useVjScreenRecordSync: () => undefined,
}));
vi.mock("./useVjScreenSetlistClips", () => ({
  useVjScreenSetlistClips: () => [],
}));
vi.mock("./useVjScreenEventCard", () => ({
  useVjScreenEventCard: () => mocks.eventCard,
}));
vi.mock("./useVjMicTempo", () => ({
  useVjMicTempo: () => mocks.mic,
}));
vi.mock("../../../shared/hooks/useScreenWakeLock", () => ({
  useScreenWakeLock: (isActive: boolean) => mocks.wakeLock(isActive),
}));
/** Engine sources stand in for the decoders jsdom lacks (as in VjScreenStage.test). */
vi.mock("../engine/sources/vjSourceFactory", () => ({
  createVjEngineSource: (renderable: VjRenderableSource) => ({
    key: `${renderable.clipId}|${renderable.sourceUrl}`,
    kind: renderable.mediaKind === "generator" ? "generator" : "video",
    isReady: false,
    playheadMs: 0,
    update: () => undefined,
    bindDraw: () => ({
      programKey: "source.clip",
      uniforms: {},
      hasBackdrop: false,
    }),
    holdsSourceUrl: (sourceUrl: string) =>
      sourceUrl !== "" && sourceUrl === renderable.sourceUrl,
    byteSize: () => 0,
    restore: () => undefined,
    dispose: () => undefined,
  }),
}));
vi.mock("./VjScreenStage", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./VjScreenStage")>();
  return {
    VjScreenStage: (props: VjScreenStageProps) =>
      mocks.isRealStage ? (
        <actual.VjScreenStage {...props} />
      ) : (
        <FakeVjScreenStage {...props} />
      ),
  };
});

function latestStageProps(): VjScreenStageProps | null {
  return mocks.stageProps.at(-1) ?? null;
}

/** True while the fake stage shows, loads, pre-rolls or mixes this URL. */
function isHeldByFakeStage(sourceUrl: string): boolean {
  const props = latestStageProps();
  const layers = mocks.fakeLayers;
  return [
    layers.front,
    layers.loading,
    props?.upcomingLive ?? null,
    props?.mix ?? null,
    props?.upcomingMix ?? null,
  ].some((source) => source !== null && source.sourceUrl === sourceUrl);
}

/**
 * The fake's layer bookkeeping, like the real renderers: the first clip goes
 * straight to the front, later ones wait in the loading slot (no first frame
 * in jsdom), and a clip already at the front is never adopted again and drops
 * the loading one, whose URL it reports as released.
 */
function recordFakeStageRender(props: VjScreenStageProps): void {
  mocks.stageProps.push(props);
  const layers = mocks.fakeLayers;
  const target = props.live;
  const targetKey = target ? `${target.clipId}|${target.sourceUrl}` : null;
  if (targetKey === layers.lastTargetKey) return;
  layers.lastTargetKey = targetKey;
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

/** Records its props, answers holdsSource, and reports the renderer and its health on mount. */
function FakeVjScreenStage(props: VjScreenStageProps): JSX.Element {
  recordFakeStageRender(props);
  const layers = mocks.fakeLayers;
  const target = props.live;
  useImperativeHandle(props.handleRef, () => ({
    holdsSource: isHeldByFakeStage,
  }));
  const { onRendererChange, onHealth } = props;
  useEffect(() => {
    if (mocks.rendererState !== null) onRendererChange(mocks.rendererState);
    if (mocks.rendererHealth !== null) {
      onHealth(mocks.rendererHealth);
    }
  }, [onRendererChange, onHealth]);
  return (
    <div data-testid="vj-fake-stage" data-target={target?.clipId ?? ""}>
      {layers.front ? <video src={layers.front.sourceUrl} muted /> : null}
      {layers.loading ? <video src={layers.loading.sourceUrl} muted /> : null}
    </div>
  );
}

const SCREEN_ID = "22222222-2222-4222-8222-222222222222";
const SERVER_NOW = () => 1_000_000;
const TO_LOCAL_TIME = (serverMs: number) => serverMs + 100;
const seedClockOffset = vi.fn<(offsetMs: number | null) => void>();
const micStart = vi.fn();
const micStop = vi.fn();

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
  event: null,
};

function clip(clipId: string, packId = "pack-1"): VjClipDTO {
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
    packIds: [packId],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-01T00:00:00.000Z",
    updatedAt: "2026-11-01T00:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
    setlistItemCount: 0,
  };
}

const CLIPS = [clip("clip-1"), clip("clip-2"), clip("clip-3")];
const BASE_STATE = createVjStageState("epoch-1", 0);

function readyStatus(clipId: string): VjScreenClipStatus {
  return { clipId, state: "ready", progress: 1, failure: null };
}

function stageState(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...BASE_STATE,
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
    Promise.resolve({
      ok: true as const,
      revision: 1,
      isNoop: false,
      applyAt: null,
    });
  const state = changes.state === undefined ? stageState() : changes.state;
  return {
    isDemo: true,
    connection: { ...INITIAL_VJ_CONNECTION, status: "attached" },
    isConnected: true,
    state,
    lastCause: null,
    lastSourceClientId: null,
    latestState: state,
    upcoming: null,
    clock: {} as VjStageController["clock"],
    serverNow: SERVER_NOW,
    toLocalTime: TO_LOCAL_TIME,
    isClockSynced: true,
    clockOffsetMs: 0,
    seedClockOffset,
    clientId: "client-1",
    screens: [],
    isLead: false,
    screenNumber: 1,
    refusal: null,
    commands: {} as VjStageController["commands"],
    advance: vi.fn(noop),
    sendStatus: vi.fn(),
    subscribeLibrary: () => () => undefined,
    subscribeIdentify: (listener) => {
      mocks.identifyListener = listener as (frame: unknown) => void;
      return () => undefined;
    },
    subscribeRenderMode: (listener) => {
      mocks.renderModeListener = listener as (frame: unknown) => void;
      return () => undefined;
    },
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
  const readyClipIds = changes.readyClipIds ?? CLIPS.map((each) => each.id);
  return {
    pack: PACK,
    clips: CLIPS,
    statuses: CLIPS.map((each) => readyStatus(each.id)),
    readyClipIds,
    cache: clipCache(),
    clipById: (clipId) => CLIPS.find((each) => each.id === clipId) ?? null,
    markDecodeFailed: vi.fn(),
    extraClips: [],
    extraStatuses: [],
    playableClipIds: readyClipIds,
    ...changes,
  };
}

function micState(changes: Partial<VjMicTempoState> = {}): VjMicTempoState {
  return {
    status: "off",
    failure: null,
    level: 0,
    levelRef: { current: null },
    report: null,
    start: micStart,
    stop: micStop,
    release: vi.fn(),
    ...changes,
  };
}

function v2Record(state: VjStageState): VjScreenRecord {
  return {
    version: 2,
    savedAt: 1,
    state,
    pack: PACK,
    clips: CLIPS,
    liveClip: null,
    extraClips: [],
    eventCard: null,
    clockOffsetMs: null,
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

function lastTarget(): VjRenderableSource | null {
  return latestStageProps()?.live ?? null;
}

function lastStatusInput(): VjScreenStatusReportInput | null {
  return mocks.statusInputs.at(-1) ?? null;
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

function goOffline(): void {
  Object.defineProperty(navigator, "onLine", {
    configurable: true,
    value: false,
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

/** The real stage with the fake WebGL2 (or none); no animation frame runs. */
function mountRealStage(options: { isContextAvailable?: boolean } = {}): void {
  mocks.isRealStage = true;
  installVjFakeWebGl2(options);
  vi.spyOn(window, "requestAnimationFrame").mockImplementation(() => 1);
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
}

const requestFullscreen = vi.fn(() => Promise.resolve());

beforeAll(async () => {
  // Warm the lazy catalog module so fake-timer tests resolve it in microtasks.
  await import("../../../shared/i18n/catalogs/en/vj");
});

beforeEach(() => {
  mocks.stageProps.length = 0;
  mocks.preloadInputs.length = 0;
  mocks.statusInputs.length = 0;
  mocks.fakeLayers.lastTargetKey = null;
  mocks.fakeLayers.front = null;
  mocks.fakeLayers.loading = null;
  mocks.isRealStage = false;
  mocks.rendererState = {
    phase: "webgl2",
    reason: null,
    lossCount: 0,
    retiredReason: null,
    handOffFrom: null,
  };
  mocks.rendererHealth = null;
  mocks.identifyListener = null;
  mocks.renderModeListener = null;
  mocks.mic = micState();
  mocks.eventCard = {
    card: null,
    unavailableReason: null,
    isUnlinked: false,
  } satisfies VjScreenEventCard;
  mocks.wakeLock.mockClear();
  seedClockOffset.mockClear();
  micStart.mockClear();
  micStop.mockClear();
  mocks.stage = stageController();
  mocks.preload = preloadResult();
  resetVjWebGl2ProbeForTests();
  sessionStorage.setItem(VJ_SCREEN_ID_STORAGE_KEY, SCREEN_ID);
  window.history.replaceState(null, "", "/admin/vj/screen");
  requestFullscreen.mockClear();
  Object.defineProperty(document.documentElement, "requestFullscreen", {
    configurable: true,
    value: requestFullscreen,
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", "/admin/vj/screen");
  Reflect.deleteProperty(document.documentElement, "requestFullscreen");
  Reflect.deleteProperty(document, "fullscreenElement");
  Reflect.deleteProperty(navigator, "onLine");
  Reflect.deleteProperty(navigator, "storage");
  localStorage.removeItem(VJ_SCREEN_SNAPSHOT_STORAGE_KEY);
  localStorage.removeItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY);
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
        "The screen's computer is out of space for clips. Free some space on it and reload the screen",
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

  it("starts the microphone only from the setup card button", async () => {
    renderPage();
    const listenButton = await screen.findByRole("button", {
      name: "Listen for the tempo",
    });
    expect(micStart).not.toHaveBeenCalled();

    fireEvent.click(listenButton);
    expect(micStart).toHaveBeenCalledTimes(1);
    expect(micStop).not.toHaveBeenCalled();
  });

  it("names the linked event the card will show", async () => {
    mocks.eventCard = {
      card: {
        eventId: "event-1",
        title: "Queer Supper Club",
        startAt: "2026-11-07T21:30:00.000Z",
        endAt: null,
        timezone: "Europe/Lisbon",
        area: "Mouraria",
        isOnline: false,
        publicUrl: null,
      },
      unavailableReason: null,
      isUnlinked: false,
    } satisfies VjScreenEventCard;
    renderPage();
    expect(
      await screen.findByText("Event card: Queer Supper Club"),
    ).toBeInTheDocument();
  });

  it("says why the event card stays hidden", async () => {
    mocks.eventCard = {
      card: null,
      unavailableReason: "cancelled",
      isUnlinked: false,
    } satisfies VjScreenEventCard;
    renderPage();
    expect(
      await screen.findByText(
        "The linked event was cancelled, so the event card stays hidden",
      ),
    ).toBeInTheDocument();
  });
});

describe("VjScreenPage renderer", () => {
  it("draws the stage on a canvas when WebGL2 works", async () => {
    mountRealStage();
    const { container } = renderPage();
    expect(await screen.findByText("Effects engine ready")).toBeInTheDocument();
    expect(container.querySelector("[data-vj-engine-canvas]")).toBeInstanceOf(
      HTMLCanvasElement,
    );
    expect(container.querySelector("[data-vj-stage]")).toBeNull();
  });

  it("falls back to the DOM stage and says why on the setup card", async () => {
    mountRealStage({ isContextAvailable: false });
    const { container } = renderPage();
    expect(
      await screen.findByText(
        "Simple renderer: this browser has no WebGL2, so only the simple effects run",
      ),
    ).toBeInTheDocument();
    expect(container.querySelector("[data-vj-engine-canvas]")).toBeNull();
    expect(container.querySelector("[data-vj-stage]")).not.toBeNull();
  });

  it("names the forced DOM renderer from the screen link", async () => {
    mountRealStage();
    window.history.replaceState(null, "", "/admin/vj/screen?vjRenderer=dom");
    const { container } = renderPage();
    expect(
      await screen.findByText(
        "Simple renderer: the screen link asks for the simple renderer",
      ),
    ).toBeInTheDocument();
    expect(container.querySelector("[data-vj-engine-stage]")).toBeNull();
  });

  it("keeps the overlay text in the DOM above the canvas", async () => {
    mountRealStage();
    mocks.stage = stageController({
      state: stageState({
        overlay: {
          ...BASE_STATE.overlay,
          text: "Dance with us",
          style: "big",
          isVisible: true,
        },
      }),
    });
    const { container } = renderPage();
    await screen.findByText("Effects engine ready");
    const canvas = container.querySelector("[data-vj-engine-canvas]");
    const overlayLayer = container.querySelector(
      '[data-vj-overlay-layer="screen"]',
    );
    if (canvas === null || overlayLayer === null) {
      throw new Error("no canvas or overlay layer");
    }
    expect(overlayLayer.textContent).toContain("Dance with us");
    expect(
      canvas.compareDocumentPosition(overlayLayer) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(overlayLayer.contains(canvas)).toBe(false);
  });

  it("reports renderer, fps, the next clip and the mic in screen:status", async () => {
    mocks.rendererHealth = {
      renderer: "webgl2",
      frames: { fps: 59.6, droppedFrames: 2 },
      isEffectLoadHigh: false,
    } satisfies VjRendererHealth;
    const micReport = { level: 0.4, bpm: 124, confidence: 0.9, beatAt: 999 };
    mocks.mic = micState({ status: "listening", report: micReport });
    mocks.stage = stageController({
      isLead: true,
      state: stageState({ shuffle: { ...BASE_STATE.shuffle, isOn: true } }),
    });
    renderPage();
    expect(
      await screen.findByText("60 fps, 2 dropped frames in the last 5 s"),
    ).toBeInTheDocument();

    const statusInput = lastStatusInput();
    expect(statusInput?.health).toEqual({
      renderer: "webgl2",
      fps: 59.6,
      droppedFrames: 2,
      cacheBytes: 3000,
      isEffectLoadHigh: false,
    });
    expect(typeof statusInput?.nextClipId).toBe("string");
    expect(statusInput?.mic).toEqual(micReport);
    expect(statusInput?.statuses).toBe(mocks.preload?.statuses);
  });
});

describe("VjScreenPage show", () => {
  it("puts nothing but the visuals on screen once fullscreen", async () => {
    mocks.stage = stageController({
      state: stageState({
        overlay: {
          ...BASE_STATE.overlay,
          text: "Dance with us",
          style: "big",
          isVisible: true,
        },
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

  it("shows the screen number for durationMs on identify", async () => {
    vi.useFakeTimers();
    const { container } = renderPage();
    await settle();
    const identifyLayer = container.querySelector("[data-vj-identify]");
    expect(identifyLayer).toHaveAttribute("data-vj-identify", "hidden");

    const frame: VjScreenIdentifyFrame = { number: 2, durationMs: 3000 };
    act(() => {
      mocks.identifyListener?.(frame);
    });
    expect(identifyLayer).toHaveAttribute("data-vj-identify", "shown");
    expect(identifyLayer?.textContent).toContain("Screen");
    expect(
      identifyLayer?.querySelector("[data-vj-identify-number]")?.textContent,
    ).toBe("2");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2999);
    });
    expect(identifyLayer).toHaveAttribute("data-vj-identify", "shown");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(identifyLayer).toHaveAttribute("data-vj-identify", "hidden");
  });

  it("passes the remote's render mode to the stage", async () => {
    vi.useFakeTimers();
    renderPage();
    await settle();
    expect(latestStageProps()?.renderMode).toBe("effects");

    act(() => {
      mocks.renderModeListener?.({ mode: "simple" });
    });
    expect(latestStageProps()?.renderMode).toBe("simple");

    act(() => {
      mocks.renderModeListener?.({ mode: "effects" });
    });
    expect(latestStageProps()?.renderMode).toBe("effects");
  });

  it("keeps the render mode across a reconnect", async () => {
    vi.useFakeTimers();
    const { rerenderPage } = renderPage();
    await settle();
    act(() => {
      mocks.renderModeListener?.({ mode: "simple" });
    });
    expect(latestStageProps()?.renderMode).toBe("simple");

    mocks.stage = stageController({
      isConnected: false,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    rerenderPage();
    expect(latestStageProps()?.renderMode).toBe("simple");

    mocks.stage = stageController();
    rerenderPage();
    expect(latestStageProps()?.renderMode).toBe("simple");
  });

  it("ignores a render mode it does not know", async () => {
    vi.useFakeTimers();
    renderPage();
    await settle();
    act(() => {
      mocks.renderModeListener?.({ mode: "dom" });
    });
    expect(latestStageProps()?.renderMode).toBe("effects");
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
});

describe("VjScreenPage sources", () => {
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

  it("pre-rolls the upcoming clip before applyAt", async () => {
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");
    const upcomingState = stageState({
      revision: 2,
      clipSequence: 2,
      liveClipId: "clip-2",
    });
    mocks.stage = stageController({
      upcoming: { state: upcomingState, applyAt: 5_000 },
    });
    renderPage();
    await waitFor(() =>
      expect(latestStageProps()?.upcomingLive?.clipId).toBe("clip-2"),
    );
    const stageProps = latestStageProps();
    expect(stageProps?.live?.clipId).toBe("clip-1");
    expect(stageProps?.upcoming).toEqual({
      state: upcomingState,
      applyAt: 5_000,
    });
    const preRolledUrl = stageProps?.upcomingLive?.sourceUrl;
    expect(preRolledUrl).toMatch(/^blob:clip-2-/);
    expect(revokeObjectUrl).not.toHaveBeenCalledWith(preRolledUrl);
  });

  it("reveals a quantized clip change at applyAt on the synced clock", async () => {
    const revokeObjectUrl = vi.spyOn(URL, "revokeObjectURL");
    const upcomingState = stageState({
      revision: 2,
      clipSequence: 2,
      liveClipId: "clip-2",
      tempo: { ...BASE_STATE.tempo, quantize: "beat" },
    });
    mocks.stage = stageController({
      upcoming: { state: upcomingState, applyAt: 5_000 },
    });
    const { rerenderPage } = renderPage();
    await waitFor(() =>
      expect(latestStageProps()?.upcomingLive?.clipId).toBe("clip-2"),
    );
    // The engine reads applyAt through the synced clock, in performance.now() time.
    expect(latestStageProps()?.clock.toLocalTime(5_000)).toBeCloseTo(
      TO_LOCAL_TIME(5_000) - performance.timeOrigin,
    );
    const preRolled = latestStageProps()?.upcomingLive;

    // The queue applies the frame: the live source is the one the engine pre-rolled.
    mocks.stage = stageController({ state: upcomingState, upcoming: null });
    rerenderPage();
    expect(latestStageProps()?.live).toBe(preRolled);
    // The page's own URL for the same clip goes unadopted and is released; the cut stays.
    await waitFor(() =>
      expect(
        revokeObjectUrl.mock.calls.some(
          ([sourceUrl]) =>
            sourceUrl.startsWith("blob:clip-2-") &&
            sourceUrl !== preRolled?.sourceUrl,
        ),
      ).toBe(true),
    );
    expect(latestStageProps()?.live).toBe(preRolled);
    expect(revokeObjectUrl).not.toHaveBeenCalledWith(preRolled?.sourceUrl);
  });

  it("shows this screen's override clip while the main look keeps shuffling", async () => {
    mocks.stage = stageController({
      isLead: true,
      state: stageState({
        shuffle: { ...BASE_STATE.shuffle, isOn: true },
        screenOverrides: {
          [SCREEN_ID]: {
            clipId: "clip-3",
            generatorId: null,
            generatorVariant: null,
          },
        },
      }),
    });
    renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-3"));
    expect(typeof lastStatusInput()?.nextClipId).toBe("string");
  });

  it("keeps a mix clip from another pack in the cache", async () => {
    const otherClip = clip("clip-other", "pack-2");
    mocks.preload = preloadResult({
      extraClips: [otherClip],
      extraStatuses: [readyStatus("clip-other")],
      playableClipIds: [...CLIPS.map((each) => each.id), "clip-other"],
      clipById: (clipId) =>
        [...CLIPS, otherClip].find((each) => each.id === clipId) ?? null,
    });
    const mixState = stageState({
      mix: { ...BASE_STATE.mix, clipId: "clip-other", amount: 0.5 },
    });
    mocks.stage = stageController({ state: mixState });
    renderPage();
    await waitFor(() =>
      expect(latestStageProps()?.mix?.clipId).toBe("clip-other"),
    );
    const preloadInput = mocks.preloadInputs.at(-1);
    expect(preloadInput?.screenId).toBe(SCREEN_ID);
    expect(preloadInput?.stage.state).toBe(mixState);
    expect(preloadInput?.setlistClipIds).toEqual([]);
  });
});

describe("VjScreenPage object URLs", () => {
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

describe("VjScreenPage offline and storage", () => {
  it("restores the last look and shuffles the cached clips on an offline start", async () => {
    const savedState = stageState({
      liveClipId: "clip-2",
      shuffle: {
        ...BASE_STATE.shuffle,
        isOn: true,
        intervalKind: "seconds",
        intervalValue: 8,
      },
    });
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify({ ...v2Record(savedState), clockOffsetMs: 42 }),
    );
    goOffline();
    mocks.stage = stageController({
      state: null,
      isConnected: false,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    vi.useFakeTimers();
    renderPage();
    await settle();

    expect(lastTarget()?.clipId).toBe("clip-2");
    expect(seedClockOffset).toHaveBeenCalledWith(42);
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

  it("restores a v1 snapshot offline as a v2 look", async () => {
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY,
      JSON.stringify({
        savedAt: 9_000,
        state: {
          stageEpoch: "epoch-1",
          revision: 4,
          clipSequence: 2,
          activePackId: "pack-1",
          liveClipId: "clip-1",
          transition: { mode: "fade", fadeMs: 1200 },
          overlay: { text: "Welcome in", style: "big", isVisible: true },
          effects: {
            speed: 0.5,
            isMonochrome: false,
            isMirrored: true,
            isHueCycling: true,
            isStrobing: true,
            isBlackout: false,
            strobeStartedAt: 8_500,
          },
          shuffle: {
            isOn: false,
            intervalKind: "beats",
            intervalValue: 16,
            bpm: 128,
          },
          updatedAt: 8_800,
        },
        pack: {
          id: "pack-1",
          name: "Warm haze",
          position: 0,
          clipCount: 3,
          totalByteSize: 3000,
          coverThumbnailUrl: null,
          createdBy: null,
          createdAt: "2026-11-01T00:00:00.000Z",
          updatedAt: "2026-11-01T00:00:00.000Z",
        },
        clips: [],
        liveClip: null,
      }),
    );
    goOffline();
    mocks.stage = stageController({
      state: null,
      isConnected: false,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    const { container } = renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));

    const preloadInput = mocks.preloadInputs.at(-1);
    expect(preloadInput?.record?.version).toBe(2);
    const restoredState = latestStageProps()?.state;
    expect(restoredState?.effects.isStrobing).toBe(false);
    expect(restoredState?.mix.clipId).toBeNull();
    expect(restoredState?.overlay.style).toBe("big");
    expect(
      container.querySelector('[data-vj-overlay-layer="screen"]')?.textContent,
    ).toContain("Welcome in");
    expect(localStorage.getItem(VJ_SCREEN_SNAPSHOT_V1_STORAGE_KEY)).toBeNull();
  });

  it("restores the saved look with the strobe off after a reload", async () => {
    const savedState = stageState({
      effects: { ...BASE_STATE.effects, isStrobing: true, strobeStartedAt: 5 },
    });
    localStorage.setItem(
      VJ_SCREEN_SNAPSHOT_STORAGE_KEY,
      JSON.stringify(v2Record(savedState)),
    );
    mocks.stage = stageController({
      state: null,
      isConnected: false,
      isLead: true,
      connection: { status: "reconnecting", refusal: null, attach: null },
    });
    renderPage();
    await waitFor(() => expect(lastTarget()?.clipId).toBe("clip-1"));

    const effects = latestStageProps()?.state.effects;
    expect(effects?.isStrobing).toBe(false);
    expect(effects?.strobeStartedAt).toBeNull();
  });

  it("strobes only while this screen is the lead", () => {
    mocks.stage = stageController({ isLead: true });
    const { rerenderPage } = renderPage();
    expect(latestStageProps()?.isStrobeEnabled).toBe(true);

    mocks.stage = stageController({ isLead: false });
    rerenderPage();
    expect(latestStageProps()?.isStrobeEnabled).toBe(false);
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
