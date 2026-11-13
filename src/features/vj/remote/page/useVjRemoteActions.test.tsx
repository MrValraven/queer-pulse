import { act, renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type Mock,
} from "vitest";
import {
  createVjSetlistPlayback,
  createVjStageState,
  DEFAULT_VJ_STEP_DURATION,
  vjSceneLookOf,
  type VjClipDTO,
  type VjEffectId,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjSetlistItemDTO,
  type VjSetlistPlayback,
  type VjStageState,
} from "../../../../shared/contracts/vj";
import type {
  VjCommandOutcome,
  VjStageController,
} from "../../live/useVjStage";
import type { VjCueMode } from "../hooks/useVjCueMode";
import type { VjFlashConsent } from "../hooks/useVjFlashConsent";
import type { VjRemoteClock } from "../hooks/useVjRemoteClock";
import { vibrateVj } from "../rules/vjHaptics";
import type { VjRun } from "../useVjCommandRunner";
import {
  useVjRemoteActions,
  useVjSceneRecall,
  VJ_RESET_DONE_KEY,
  type UseVjRemoteActionsOptions,
  type UseVjSceneRecallOptions,
} from "./useVjRemoteActions";

const favoriteMutate = vi.hoisted(() => vi.fn());

vi.mock("../../api/useVjClipFavorite", () => ({
  useVjClipFavorite: () => ({ mutate: favoriteMutate }),
}));
vi.mock("../rules/vjHaptics", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../rules/vjHaptics")>();
  return { ...actual, vibrateVj: vi.fn(() => true) };
});

const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const SYNCED_NOW = 1_700_000_123_456.6;
const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 99,
  isNoop: false,
  applyAt: null,
};
const OFFLINE_OUTCOME: VjCommandOutcome = {
  ok: false,
  code: "offline",
  errorKey: "vj:error.offline",
};
const DOCK_PADS: readonly VjEffectId[] = ["monochrome", "invert", "freeze"];

function clipOf(id: string, title: string): VjClipDTO {
  return { id, title, isFavorite: false } as VjClipDTO;
}

const CLIPS = [clipOf(CLIP_GRID, "Neon grid"), clipOf(CLIP_HAZE, "Warm haze")];

const SCENE_CALM = "00000000-0000-4000-8000-0000000000a1";
const SCENE_FLASH = "00000000-0000-4000-8000-0000000000a2";
const SETLIST_ID = "00000000-0000-4000-8000-0000000000b1";

function sceneOf(id: string, name: string, hasFlash: boolean): VjSceneDTO {
  const look = vjSceneLookOf(createVjStageState("scene-epoch", 0));
  look.effects.settings = hasFlash
    ? { invert: { isOn: true, amount: 1, variant: null } }
    : {};
  return { id, name, look } as VjSceneDTO;
}

const SCENES = [
  sceneOf(SCENE_CALM, "Slow open", false),
  sceneOf(SCENE_FLASH, "Big drop", true),
];
function sceneStepOf(
  id: string,
  sceneId: string,
  position: number,
): VjSetlistItemDTO {
  return {
    id,
    position,
    kind: "scene",
    sceneId,
    clipId: null,
    duration: null,
  };
}

function clipStepOf(
  id: string,
  clipId: string,
  position: number,
): VjSetlistItemDTO {
  return {
    id,
    position,
    kind: "clip",
    sceneId: null,
    clipId,
    duration: null,
  };
}

function setlistOf(
  id: string,
  name: string,
  items: VjSetlistItemDTO[],
): VjSetlistDTO {
  return {
    id,
    name,
    position: 0,
    isLooping: false,
    stepDuration: DEFAULT_VJ_STEP_DURATION,
    items,
    createdBy: null,
    createdAt: "2026-11-13T00:00:00.000Z",
    updatedAt: "2026-11-13T00:00:00.000Z",
  };
}

/** calm scene, flashing scene, clip */
const FLASHING_SETLIST = setlistOf(SETLIST_ID, "Friday set", [
  sceneStepOf("item-1", SCENE_CALM, 0),
  sceneStepOf("item-2", SCENE_FLASH, 1),
  clipStepOf("item-3", CLIP_HAZE, 2),
]);
const CALM_SETLIST_ID = "00000000-0000-4000-8000-0000000000b2";
const CALM_SETLIST = setlistOf(CALM_SETLIST_ID, "Warm up", [
  clipStepOf("item-4", CLIP_GRID, 0),
  sceneStepOf("item-5", SCENE_CALM, 1),
]);
const EMPTY_SETLIST_ID = "00000000-0000-4000-8000-0000000000b3";
const EMPTY_SETLIST = setlistOf(EMPTY_SETLIST_ID, "Empty set", []);
const SETLISTS = [FLASHING_SETLIST, CALM_SETLIST, EMPTY_SETLIST];

function stateWith(changes: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState("dispatch-epoch", 0),
    revision: 2,
    ...changes,
  };
}

function cueOf(changes: Partial<VjCueMode> = {}): VjCueMode {
  return {
    isCueMode: false,
    setCueMode: vi.fn(),
    armedClipId: null,
    arm: vi.fn(),
    clearArmed: vi.fn(),
    ...changes,
  };
}

const clock: VjRemoteClock = {
  serverNow: () => SYNCED_NOW,
  toLocalTime: (serverMs: number) => serverMs,
  isSynced: true,
};

type RunMock = Mock<
  (name: string, ...args: unknown[]) => Promise<VjCommandOutcome>
>;

interface Harness {
  runMock: RunMock;
  onRefused: Mock<(errorKey: string | null) => void>;
  onOpenSheet: Mock<(sheet: "shortcuts") => void>;
  consent: Mock<() => void>;
}

function renderActions(
  overrides: Partial<UseVjRemoteActionsOptions> = {},
  state: VjStageState = stateWith(),
) {
  const runMock: RunMock = vi.fn<
    (name: string, ...args: unknown[]) => Promise<VjCommandOutcome>
  >(() => Promise.resolve(OK_OUTCOME));
  const harness: Harness = {
    runMock,
    onRefused: vi.fn(),
    onOpenSheet: vi.fn(),
    consent: vi.fn(),
  };
  const flashConsent: VjFlashConsent = {
    hasConsented: true,
    consent: harness.consent,
  };
  const stage = { latestState: state, state } as VjStageController;
  const initialProps: UseVjRemoteActionsOptions = {
    stage,
    clock,
    run: runMock as unknown as VjRun,
    visibleClips: CLIPS,
    dockPads: DOCK_PADS,
    cue: cueOf(),
    flashConsent,
    isBlocked: false,
    onRefused: harness.onRefused,
    onOpenSheet: harness.onOpenSheet,
    ...overrides,
  };
  const view = renderHook(
    (props: UseVjRemoteActionsOptions) => useVjRemoteActions(props),
    { initialProps },
  );
  return { ...view, ...harness, initialProps };
}

async function flush() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });
}

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.mocked(vibrateVj).mockClear();
  favoriteMutate.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useVjRemoteActions: clips and cue", () => {
  it("a tap sends goClip and marks the tile pending", async () => {
    const { result, runMock } = renderActions();
    act(() =>
      result.current.dispatch({ kind: "goClip", clipId: CLIP_HAZE }, "press"),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith("goClip", CLIP_HAZE);
    expect(vibrateVj).toHaveBeenCalledWith("press");
    await flush();
    expect(result.current.tileStateOf(CLIP_HAZE).isPending).toBe(true);
  });

  it("a grid slot reads the grid's shown order", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "goClipAt", index: 1 }, "press"));
    act(() => result.current.dispatch({ kind: "goClipAt", index: 7 }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("goClip", CLIP_HAZE);
  });

  it("a refused tap rolls back, vibrates and names the reason", async () => {
    const { result, runMock, onRefused } = renderActions();
    runMock.mockResolvedValueOnce(OFFLINE_OUTCOME);
    act(() =>
      result.current.dispatch({ kind: "goClip", clipId: CLIP_GRID }, "press"),
    );
    await flush();
    expect(result.current.tileStateOf(CLIP_GRID).isPending).toBe(false);
    const refusedCalls = vi
      .mocked(vibrateVj)
      .mock.calls.filter(([kind]) => kind === "refused");
    expect(refusedCalls).toHaveLength(1);
    expect(onRefused).toHaveBeenCalledExactlyOnceWith("vj:error.offline");
  });

  it("cue mode arms and Go sends", () => {
    const cue = cueOf({ isCueMode: true });
    const { result, runMock, rerender, initialProps } = renderActions({ cue });
    act(() =>
      result.current.dispatch({ kind: "goClip", clipId: CLIP_GRID }, "press"),
    );
    expect(cue.arm).toHaveBeenCalledWith(CLIP_GRID);
    expect(runMock).not.toHaveBeenCalled();

    const armedCue = cueOf({ isCueMode: true, armedClipId: CLIP_GRID });
    rerender({ ...initialProps, cue: armedCue });
    expect(result.current.tileStateOf(CLIP_GRID).isArmed).toBe(true);
    act(() => result.current.dispatch({ kind: "go" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("goClip", CLIP_GRID);
    expect(armedCue.clearArmed).toHaveBeenCalled();
  });

  it("Go with nothing armed sends nothing", () => {
    const { result, runMock } = renderActions({
      cue: cueOf({ isCueMode: true }),
    });
    act(() => result.current.dispatch({ kind: "go" }, "press"));
    expect(runMock).not.toHaveBeenCalled();
  });

  it("previous sends the second recent clip", () => {
    const state = stateWith({ recentClipIds: [CLIP_GRID, CLIP_HAZE] });
    const { result, runMock } = renderActions({}, state);
    act(() => result.current.dispatch({ kind: "previous" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("goClip", CLIP_HAZE);
  });
});

describe("useVjRemoteActions: pads", () => {
  it("a keyboard pad press and release after 250 ms sends on then off", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "padSlot", slot: 0 }, "press"));
    advance(300);
    act(() => result.current.dispatch({ kind: "padSlot", slot: 0 }, "release"));
    expect(runMock.mock.calls).toEqual([
      ["setEffects", { settings: { monochrome: { isOn: true } } }],
      ["setEffects", { settings: { monochrome: { isOn: false } } }],
    ]);
  });

  it("a short keyboard pad press latches", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "padSlot", slot: 0 }, "press"));
    advance(100);
    act(() => result.current.dispatch({ kind: "padSlot", slot: 0 }, "release"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setEffects", {
      settings: { monochrome: { isOn: true } },
    });
    expect(vibrateVj).toHaveBeenCalledWith("latch");
    expect(result.current.padIsOn("monochrome", false)).toBe(true);
  });

  it("a release with no held pad sends nothing", () => {
    const { result, runMock } = renderActions();
    act(() =>
      result.current.dispatch({ kind: "pad", padId: "monochrome" }, "release"),
    );
    expect(runMock).not.toHaveBeenCalled();
  });

  it("a flash-capable pad waits for consent and sends after it", () => {
    const { result, runMock, consent } = renderActions({
      flashConsent: { hasConsented: false, consent: vi.fn() },
    });
    act(() =>
      result.current.dispatch({ kind: "pad", padId: "invert" }, "press"),
    );
    act(() =>
      result.current.dispatch({ kind: "pad", padId: "invert" }, "release"),
    );
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toEqual({
      padId: "invert",
      transitionMode: null,
      setlistName: null,
      anchor: null,
    });
    expect(consent).not.toHaveBeenCalled();

    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setEffects", {
      settings: { invert: { isOn: true } },
    });
    expect(result.current.flashConsent).toBeNull();
  });

  it("a touch strobe press asks for consent with its anchor", () => {
    const { result, runMock } = renderActions({
      flashConsent: { hasConsented: false, consent: vi.fn() },
    });
    const anchor = document.createElement("button");
    act(() => result.current.onPadSend("strobe", "on", anchor));
    act(() => result.current.onPadSend("strobe", "off", anchor));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toEqual({
      padId: "strobe",
      transitionMode: null,
      setlistName: null,
      anchor,
    });
  });

  it("a flash-capable transition asks with its mode and sends after consent", () => {
    const giveConsent = vi.fn();
    const { result } = renderActions({
      flashConsent: { hasConsented: false, consent: giveConsent },
    });
    const anchor = document.createElement("button");
    const onConsented = vi.fn();
    act(() =>
      result.current.requestFlashConsent(anchor, onConsented, "dipWhite"),
    );
    expect(result.current.flashConsent).toEqual({
      padId: null,
      transitionMode: "dipWhite",
      setlistName: null,
      anchor,
    });
    expect(onConsented).not.toHaveBeenCalled();

    act(() => result.current.confirmFlash());
    expect(onConsented).toHaveBeenCalledTimes(1);
    expect(giveConsent).toHaveBeenCalledTimes(1);
    expect(result.current.flashConsent).toBeNull();
  });

  it("confirming a transition's warning while offline sends nothing", () => {
    const giveConsent = vi.fn();
    const { result, rerender, initialProps } = renderActions({
      flashConsent: { hasConsented: false, consent: giveConsent },
    });
    const onConsented = vi.fn();
    act(() => result.current.requestFlashConsent(null, onConsented, "glitch"));
    rerender({ ...initialProps, isBlocked: true });
    act(() => result.current.confirmFlash());
    expect(onConsented).not.toHaveBeenCalled();
    expect(giveConsent).toHaveBeenCalledTimes(1);
    expect(result.current.flashConsent).toBeNull();
  });

  it("confirming a pad's warning while offline sends nothing", () => {
    const { result, runMock, rerender, initialProps } = renderActions({
      flashConsent: { hasConsented: false, consent: vi.fn() },
    });
    act(() => result.current.onPadSend("invert", "on", null));
    rerender({ ...initialProps, isBlocked: true });
    act(() => result.current.confirmFlash());
    expect(runMock).not.toHaveBeenCalled();
  });

  it("a touch strobe release stops it at once", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.onPadSend("strobe", "off", null));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setStrobe", false, {
      isImmediate: true,
    });
  });

  it("turning on freeze marks reverse and ping-pong off", async () => {
    const { result } = renderActions();
    act(() => result.current.onPadSend("freeze", "on", null));
    await flush();
    expect(result.current.padIsOn("freeze", false)).toBe(true);
    expect(result.current.padIsOn("reverse", true)).toBe(false);
    expect(result.current.padIsOn("pingPong", true)).toBe(false);
  });

  it("a refused pad names its reason once", async () => {
    const { result, runMock, onRefused } = renderActions();
    runMock.mockResolvedValueOnce(OFFLINE_OUTCOME);
    act(() => result.current.onPadSend("freeze", "on", null));
    await flush();
    expect(result.current.padIsOn("freeze", false)).toBe(false);
    expect(result.current.padIsOn("reverse", true)).toBe(true);
    expect(onRefused).toHaveBeenCalledTimes(1);
  });
});

describe("useVjRemoteActions: dock and tempo", () => {
  it("blackout sends isImmediate", async () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "blackout" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setEffects", {
      isBlackout: true,
      isImmediate: true,
    });
    await flush();
    expect(result.current.isBlackoutPending).toBe(true);
    expect(result.current.blackoutIsOn(false)).toBe(true);
  });

  it("a landed reset look shows its info line for 2.5 s", async () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "resetLook" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("resetLook", {
      isImmediate: true,
    });
    await flush();
    expect(result.current.infoKey).toBe(VJ_RESET_DONE_KEY);
    advance(2_500);
    expect(result.current.infoKey).toBeNull();
  });

  it("the fourth tap sends a tap tempo with the synced downbeat", () => {
    let performanceNow = 1_000;
    vi.spyOn(performance, "now").mockImplementation(() => performanceNow);
    const { result, runMock } = renderActions();
    const tapAt = (tapTime: number) => {
      performanceNow = tapTime;
      act(() => result.current.dispatch({ kind: "tapTempo" }, "press"));
    };
    tapAt(1_000);
    tapAt(1_500);
    tapAt(2_000);
    expect(runMock).not.toHaveBeenCalled();
    tapAt(2_500);
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setTempo", {
      bpm: 120,
      downbeatAt: Math.round(SYNCED_NOW),
      source: "tap",
    });
  });

  it("the 1 sets downbeatAt to the synced server time", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "downbeat" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setTempo", {
      downbeatAt: Math.round(SYNCED_NOW),
    });
    expect(vibrateVj).toHaveBeenCalledWith("downbeat");
  });

  it("quantize cycles from off to beat", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "cycleQuantize" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setTempo", {
      quantize: "beat",
    });
  });

  it("two quick quantize presses before the echo send beat then bar", () => {
    const { result, runMock } = renderActions();
    act(() => result.current.dispatch({ kind: "cycleQuantize" }, "press"));
    act(() => result.current.dispatch({ kind: "cycleQuantize" }, "press"));
    expect(runMock.mock.calls).toEqual([
      ["setTempo", { quantize: "beat" }],
      ["setTempo", { quantize: "bar" }],
    ]);
  });

  it("a refused quantize rolls back and names its reason once", async () => {
    const { result, runMock, onRefused } = renderActions();
    runMock.mockResolvedValueOnce(OFFLINE_OUTCOME);
    act(() => result.current.dispatch({ kind: "cycleQuantize" }, "press"));
    await flush();
    act(() => result.current.dispatch({ kind: "cycleQuantize" }, "press"));
    expect(runMock.mock.calls).toEqual([
      ["setTempo", { quantize: "beat" }],
      ["setTempo", { quantize: "beat" }],
    ]);
    expect(onRefused).toHaveBeenCalledExactlyOnceWith("vj:error.offline");
  });

  it("crossfader values send at most one per 50 ms and the final value", () => {
    const { result, runMock } = renderActions();
    act(() =>
      result.current.dispatch({ kind: "crossfader", amount: 0.1 }, "value"),
    );
    advance(10);
    act(() =>
      result.current.dispatch({ kind: "crossfader", amount: 0.2 }, "value"),
    );
    advance(10);
    act(() =>
      result.current.dispatch({ kind: "crossfader", amount: 0.304 }, "value"),
    );
    expect(runMock).toHaveBeenCalledTimes(1);
    advance(40);
    expect(runMock.mock.calls).toEqual([
      ["setMix", { amount: 0.1 }],
      ["setMix", { amount: 0.3 }],
    ]);
  });

  it("opens the shortcuts sheet", () => {
    const { result, onOpenSheet } = renderActions();
    act(() => result.current.dispatch({ kind: "openShortcuts" }, "press"));
    expect(onOpenSheet).toHaveBeenCalledWith("shortcuts");
  });

  it("blocked dispatches send nothing", () => {
    const { result, runMock } = renderActions({ isBlocked: true });
    act(() => {
      result.current.dispatch({ kind: "goClipAt", index: 0 }, "press");
      result.current.dispatch({ kind: "padSlot", slot: 0 }, "press");
      result.current.dispatch({ kind: "blackout" }, "press");
      result.current.dispatch({ kind: "downbeat" }, "press");
      result.current.dispatch({ kind: "crossfader", amount: 0.5 }, "value");
      result.current.onPadSend("monochrome", "on", null);
    });
    advance(200);
    expect(runMock).not.toHaveBeenCalled();
  });

  it("a refused favorite names its reason", () => {
    const { result, onRefused } = renderActions();
    act(() => result.current.toggleFavorite(CLIP_GRID, true));
    expect(favoriteMutate).toHaveBeenCalledWith(
      { clipId: CLIP_GRID, isFavorite: true },
      expect.any(Object),
    );
    const [, mutateOptions] = favoriteMutate.mock.calls[0] as [
      unknown,
      { onError: (cause: unknown) => void },
    ];
    act(() => mutateOptions.onError(new Error("network down")));
    expect(onRefused).toHaveBeenCalledTimes(1);
    expect(typeof onRefused.mock.calls[0]?.[0]).toBe("string");
  });
});

describe("useVjRemoteActions: scenes and the flash warning", () => {
  const noConsent = () => ({ hasConsented: false, consent: vi.fn() });

  it("a scene whose look flashes waits for the warning, then recalls", () => {
    const giveConsent = vi.fn();
    const { result } = renderActions({
      flashConsent: { hasConsented: false, consent: giveConsent },
    });
    const anchor = document.createElement("button");
    const recall = vi.fn();
    const flashScene = SCENES[1] as VjSceneDTO;
    act(() =>
      result.current.requestSceneFlashConsent(flashScene, anchor, recall),
    );
    expect(recall).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toEqual({
      padId: null,
      transitionMode: null,
      sceneName: "Big drop",
      setlistName: null,
      anchor,
    });

    act(() => result.current.confirmFlash());
    expect(recall).toHaveBeenCalledTimes(1);
    expect(giveConsent).toHaveBeenCalledTimes(1);
  });

  it("a scene with no flash, or a show with consent, recalls at once", () => {
    const calm = renderActions({ flashConsent: noConsent() });
    const recallCalm = vi.fn();
    act(() =>
      calm.result.current.requestSceneFlashConsent(
        SCENES[0] as VjSceneDTO,
        null,
        recallCalm,
      ),
    );
    expect(recallCalm).toHaveBeenCalledTimes(1);
    expect(calm.result.current.flashConsent).toBeNull();
    calm.unmount();

    const consented = renderActions();
    const recallFlash = vi.fn();
    act(() =>
      consented.result.current.requestSceneFlashConsent(
        SCENES[1] as VjSceneDTO,
        null,
        recallFlash,
      ),
    );
    expect(recallFlash).toHaveBeenCalledTimes(1);
  });

  it("a scene whose transition flashes asks too", () => {
    const { result } = renderActions({ flashConsent: noConsent() });
    const scene = sceneOf(SCENE_CALM, "White dip", false);
    scene.look.transition = { ...scene.look.transition, mode: "dipWhite" };
    const recall = vi.fn();
    act(() => result.current.requestSceneFlashConsent(scene, null, recall));
    expect(recall).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneName).toBe("White dip");
  });

  it("set list next to a look that flashes asks first, then steps", () => {
    const state = stateWith({ activeSetlistId: SETLIST_ID, setlistIndex: 0 });
    const { result, runMock } = renderActions(
      { flashConsent: noConsent(), scenes: SCENES, setlists: SETLISTS },
      state,
    );
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneName).toBe("Big drop");

    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext", {
      isFlashConfirmed: true,
    });
  });

  it("set list previous to a calm look steps at once", () => {
    const state = stateWith({ activeSetlistId: SETLIST_ID, setlistIndex: 1 });
    const { result, runMock } = renderActions(
      { flashConsent: noConsent(), scenes: SCENES, setlists: SETLISTS },
      state,
    );
    act(() => result.current.dispatch({ kind: "setlistPrevious" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistPrevious");
    expect(result.current.flashConsent).toBeNull();
  });
});

const noSequenceConsent = () => ({ hasConsented: false, consent: vi.fn() });
const FLASH_REFUSAL: VjCommandOutcome = {
  ok: false,
  code: "vj_setlist_flash_unconfirmed",
  errorKey: "vj:error.socket.setlistFlashUnconfirmed",
};
const STALE_KEY = "vj:error.socket.staleSetlist";
const SCENE_UNLOADED = "00000000-0000-4000-8000-0000000000a9";
/** flashing scene, then calm scene */
const FLASH_FIRST_ID = "00000000-0000-4000-8000-0000000000b4";
const FLASH_FIRST_SETLIST = setlistOf(FLASH_FIRST_ID, "Strobe opener", [
  sceneStepOf("item-6", SCENE_FLASH, 0),
  sceneStepOf("item-7", SCENE_CALM, 1),
]);
/** calm scene, then flashing scene */
const FLASH_LAST_ID = "00000000-0000-4000-8000-0000000000b5";
const FLASH_LAST_SETLIST = setlistOf(FLASH_LAST_ID, "Late drop", [
  sceneStepOf("item-8", SCENE_CALM, 0),
  sceneStepOf("item-9", SCENE_FLASH, 1),
]);
/** calm, flash, flash, calm clip */
const FLASH_RUN_ID = "00000000-0000-4000-8000-0000000000b6";
const FLASH_RUN_SETLIST = setlistOf(FLASH_RUN_ID, "Peak hour", [
  sceneStepOf("item-10", SCENE_CALM, 0),
  sceneStepOf("item-11", SCENE_FLASH, 1),
  sceneStepOf("item-12", SCENE_FLASH, 2),
  clipStepOf("item-13", CLIP_GRID, 3),
]);
/** clip, then a scene this remote has not loaded */
const UNLOADED_STEP_ID = "00000000-0000-4000-8000-0000000000b7";
const UNLOADED_STEP_SETLIST = setlistOf(UNLOADED_STEP_ID, "Guest set", [
  clipStepOf("item-14", CLIP_GRID, 0),
  sceneStepOf("item-15", SCENE_UNLOADED, 1),
]);
/** a scene this remote has not loaded first */
const UNLOADED_FIRST_ID = "00000000-0000-4000-8000-0000000000b8";
const UNLOADED_FIRST_SETLIST = setlistOf(UNLOADED_FIRST_ID, "Borrowed set", [
  sceneStepOf("item-16", SCENE_UNLOADED, 0),
]);
const ALL_SETLISTS = [
  ...SETLISTS,
  FLASH_FIRST_SETLIST,
  FLASH_LAST_SETLIST,
  FLASH_RUN_SETLIST,
  UNLOADED_STEP_SETLIST,
  UNLOADED_FIRST_SETLIST,
];

function activeState(
  setlistId: string,
  setlistIndex: number | null,
  playback: Partial<VjSetlistPlayback> = {},
): VjStageState {
  return stateWith({
    activeSetlistId: setlistId,
    setlistIndex,
    setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
  });
}

function renderSequence(
  overrides: Partial<UseVjRemoteActionsOptions> = {},
  state: VjStageState = stateWith(),
) {
  return renderActions(
    { scenes: SCENES, setlists: ALL_SETLISTS, ...overrides },
    state,
  );
}

type SequenceView = ReturnType<typeof renderSequence>;

/** A newer state lands while the warning is open. */
function receiveState(view: SequenceView, nextState: VjStageState) {
  view.rerender({
    ...view.initialProps,
    stage: {
      latestState: nextState,
      state: nextState,
    } as VjStageController,
  });
}

describe("useVjRemoteActions: sequence Next and Previous keep the per-tap consent", () => {
  it("next to a clip step steps at once", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 1),
    );
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext");
    expect(result.current.flashConsent).toBeNull();
  });

  it("next wraps with Loop to a step 1 that flashes and asks first", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(FLASH_FIRST_ID, 1, { isLooping: true }),
    );
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneName).toBe("Big drop");
    expect(result.current.flashConsent?.setlistName).toBeNull();
  });

  it("next at the last step without Loop sends for the server to name the end", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(FLASH_FIRST_ID, 1),
    );
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext");
  });

  it("previous from step 1 wraps with Loop to a last step that flashes", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(FLASH_LAST_ID, 0, { isLooping: true }),
    );
    act(() => result.current.dispatch({ kind: "setlistPrevious" }, "press"));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneName).toBe("Big drop");
  });

  it("next to a scene the library has not loaded asks, named as a deleted scene", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(UNLOADED_STEP_ID, 0),
    );
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toEqual({
      padId: null,
      transitionMode: null,
      sceneNameKey: "vj:setlistItems.sceneGone",
      setlistName: null,
      anchor: null,
    });
    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext", {
      isFlashConfirmed: true,
    });
  });

  it("a step in a set list this remote has not loaded asks, named by its direction", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent(), setlists: [] },
      activeState(SETLIST_ID, 0),
    );
    act(() => result.current.dispatch({ kind: "setlistPrevious" }, "press"));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneNameKey).toBe(
      "vj:strip.setlistPrevious",
    );
  });

  it("an unloaded step with the show's consent steps at once, confirmed", () => {
    const { result, runMock } = renderSequence(
      {},
      activeState(UNLOADED_STEP_ID, 0),
    );
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext", {
      isFlashConfirmed: true,
    });
  });

  it("with the show's consent a calm step is sent confirmed too", () => {
    const { result, runMock } = renderSequence({}, activeState(SETLIST_ID, 1));
    act(() => result.current.dispatch({ kind: "setlistPrevious" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistPrevious", {
      isFlashConfirmed: true,
    });
  });

  it("a confirm after the step on screen moved names why and sends nothing", () => {
    const view = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0),
    );
    act(() => view.result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(view.result.current.flashConsent?.sceneName).toBe("Big drop");
    receiveState(view, activeState(SETLIST_ID, 1));

    act(() => view.result.current.confirmFlash());
    expect(view.runMock).not.toHaveBeenCalled();
    expect(view.onRefused).toHaveBeenCalledExactlyOnceWith(STALE_KEY);
  });

  it("the touch step places the warning on the pressed button", () => {
    const { result } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0),
    );
    const anchor = document.createElement("button");
    act(() => result.current.setlist.step("next", anchor));
    expect(result.current.flashConsent?.anchor).toBe(anchor);
  });
});

/** Big drop as this remote last loaded it: its look reads calm, though the server's copy flashes. */
const STALE_CALM_SCENES = [
  SCENES[0] as VjSceneDTO,
  sceneOf(SCENE_FLASH, "Big drop", false),
];

describe("useVjRemoteActions: a Next or Previous refused as an unconfirmed flash", () => {
  it("reopens the warning naming the scene and sends again confirmed", async () => {
    const { result, runMock, onRefused } = renderSequence(
      { flashConsent: noSequenceConsent(), scenes: STALE_CALM_SCENES },
      activeState(SETLIST_ID, 0),
    );
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    const anchor = document.createElement("button");
    act(() => result.current.setlist.step("next", anchor));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext");
    await flush();
    expect(onRefused).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toEqual({
      padId: null,
      transitionMode: null,
      sceneName: "Big drop",
      setlistName: null,
      anchor,
    });

    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledTimes(2);
    expect(runMock).toHaveBeenLastCalledWith("setlistNext", {
      isFlashConfirmed: true,
    });
    await flush();
    expect(onRefused).not.toHaveBeenCalled();
  });

  it("a confirmed resend that is refused again names the reason", async () => {
    const { result, runMock, onRefused } = renderSequence(
      { flashConsent: noSequenceConsent(), scenes: STALE_CALM_SCENES },
      activeState(SETLIST_ID, 0),
    );
    runMock
      .mockResolvedValueOnce(FLASH_REFUSAL)
      .mockResolvedValueOnce(FLASH_REFUSAL);
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    await flush();
    act(() => result.current.confirmFlash());
    await flush();
    expect(runMock).toHaveBeenCalledTimes(2);
    expect(onRefused).toHaveBeenCalledExactlyOnceWith(
      "vj:error.socket.setlistFlashUnconfirmed",
    );
    expect(result.current.flashConsent).toBeNull();
  });

  it("a step this remote read as a clip names its direction on the warning", async () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 1),
    );
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext");
    await flush();
    expect(result.current.flashConsent?.sceneNameKey).toBe(
      "vj:strip.setlistNext",
    );
    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenLastCalledWith("setlistNext", {
      isFlashConfirmed: true,
    });
  });

  it("a confirm after the step on screen moved names why and sends nothing", async () => {
    const view = renderSequence(
      { flashConsent: noSequenceConsent(), scenes: STALE_CALM_SCENES },
      activeState(SETLIST_ID, 0),
    );
    view.runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() => view.result.current.dispatch({ kind: "setlistNext" }, "press"));
    await flush();
    expect(view.result.current.flashConsent?.sceneName).toBe("Big drop");
    receiveState(view, activeState(SETLIST_ID, 2));

    act(() => view.result.current.confirmFlash());
    expect(view.runMock).toHaveBeenCalledTimes(1);
    expect(view.onRefused).toHaveBeenCalledExactlyOnceWith(STALE_KEY);
  });

  it("a send confirmed by the per-tap warning names a refusal without asking again", async () => {
    const { result, runMock, onRefused } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0),
    );
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() => result.current.dispatch({ kind: "setlistNext" }, "press"));
    act(() => result.current.confirmFlash());
    await flush();
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext", {
      isFlashConfirmed: true,
    });
    expect(result.current.flashConsent).toBeNull();
    expect(onRefused).toHaveBeenCalledExactlyOnceWith(
      "vj:error.socket.setlistFlashUnconfirmed",
    );
  });
});

describe("useVjRemoteActions: Play sequence on a row", () => {
  it("a sequence with a flashing step asks once, then plays step 1 confirmed", () => {
    const giveConsent = vi.fn();
    const { result, runMock } = renderSequence({
      flashConsent: { hasConsented: false, consent: giveConsent },
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: SETLIST_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toEqual({
      padId: null,
      transitionMode: null,
      setlistName: "Friday set",
      anchor: null,
    });

    act(() => result.current.confirmFlash());
    expect(giveConsent).toHaveBeenCalledTimes(1);
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      SETLIST_ID,
      0,
      { isPlaying: true, isFlashConfirmed: true },
    );
  });

  it("a sequence with a scene this remote has not loaded asks first", () => {
    const { result, runMock } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: UNLOADED_STEP_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.setlistName).toBe("Guest set");
  });

  it("with the show's consent it plays confirmed without asking", () => {
    const { result, runMock } = renderSequence();
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: SETLIST_ID },
        "press",
      ),
    );
    expect(result.current.flashConsent).toBeNull();
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      SETLIST_ID,
      0,
      { isPlaying: true, isFlashConfirmed: true },
    );
  });

  it("a calm sequence plays unconfirmed without asking", () => {
    const { result, runMock } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: CALM_SETLIST_ID },
        "press",
      ),
    );
    expect(result.current.flashConsent).toBeNull();
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      CALM_SETLIST_ID,
      0,
      { isPlaying: true, isFlashConfirmed: false },
    );
  });

  it("an empty sequence sends nothing", () => {
    const { result, runMock } = renderSequence();
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: EMPTY_SETLIST_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
  });

  it("the touch path places the warning on the pressed row button", () => {
    const { result } = renderSequence({ flashConsent: noSequenceConsent() });
    const anchor = document.createElement("button");
    act(() => result.current.setlist.play(SETLIST_ID, anchor));
    expect(result.current.flashConsent?.anchor).toBe(anchor);
    expect(result.current.flashConsent?.setlistName).toBe("Friday set");
  });

  it("a flash refusal reopens the warning for that sequence and sends again confirmed", async () => {
    const { result, runMock, onRefused } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: CALM_SETLIST_ID },
        "press",
      ),
    );
    await flush();
    expect(onRefused).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.setlistName).toBe("Warm up");

    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledTimes(2);
    expect(runMock).toHaveBeenLastCalledWith(
      "setlistSelect",
      CALM_SETLIST_ID,
      0,
      { isPlaying: true, isFlashConfirmed: true },
    );
  });

  it("a confirmed send that is refused again names the reason", async () => {
    const { result, runMock, onRefused } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    runMock
      .mockResolvedValueOnce(FLASH_REFUSAL)
      .mockResolvedValueOnce(FLASH_REFUSAL);
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: CALM_SETLIST_ID },
        "press",
      ),
    );
    await flush();
    act(() => result.current.confirmFlash());
    await flush();
    expect(runMock).toHaveBeenCalledTimes(2);
    expect(onRefused).toHaveBeenCalledExactlyOnceWith(
      "vj:error.socket.setlistFlashUnconfirmed",
    );
    expect(result.current.flashConsent).toBeNull();
  });

  it("a flash refusal for a sequence this remote has not loaded names the reason", async () => {
    const { result, runMock, onRefused } = renderSequence({
      flashConsent: noSequenceConsent(),
      setlists: [],
    });
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() =>
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: SETLIST_ID },
        "press",
      ),
    );
    await flush();
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      SETLIST_ID,
      0,
      { isPlaying: true, isFlashConfirmed: false },
    );
    expect(result.current.flashConsent).toBeNull();
    expect(onRefused).toHaveBeenCalledExactlyOnceWith(
      "vj:error.socket.setlistFlashUnconfirmed",
    );
  });
});

describe("useVjRemoteActions: Step through on a row", () => {
  it("a step 1 that flashes asks the per-tap warning, then selects by hand", () => {
    const { result, runMock } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistStepThrough", setlistId: FLASH_FIRST_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneName).toBe("Big drop");

    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      FLASH_FIRST_ID,
      0,
    );
  });

  it("a step 1 scene the library has not loaded asks, named as a deleted scene", () => {
    const { result, runMock } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistStepThrough", setlistId: UNLOADED_FIRST_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneNameKey).toBe(
      "vj:setlistItems.sceneGone",
    );
    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      UNLOADED_FIRST_ID,
      0,
    );
  });

  it("a set list this remote has not loaded asks first", () => {
    const { result, runMock } = renderSequence({
      flashConsent: noSequenceConsent(),
      setlists: [],
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistStepThrough", setlistId: SETLIST_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent?.sceneNameKey).toBe(
      "vj:strip.setlistNext",
    );
  });

  it("a step 1 that is a clip selects at once", () => {
    const { result, runMock } = renderSequence({
      flashConsent: noSequenceConsent(),
    });
    act(() =>
      result.current.dispatch(
        { kind: "setlistStepThrough", setlistId: CALM_SETLIST_ID },
        "press",
      ),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      CALM_SETLIST_ID,
      0,
    );
  });

  it("an empty sequence sends nothing", () => {
    const { result, runMock } = renderSequence();
    act(() =>
      result.current.dispatch(
        { kind: "setlistStepThrough", setlistId: EMPTY_SETLIST_ID },
        "press",
      ),
    );
    expect(runMock).not.toHaveBeenCalled();
  });
});

describe("useVjRemoteActions: the sequence play button", () => {
  it("pauses while playing", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 1, {
        status: "playing",
        stepStartedAt: 1_000,
        stepEndsAt: 9_000,
        stepDurationMs: 8_000,
      }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistSetPlaying", false);
    expect(result.current.flashConsent).toBeNull();
  });

  it.each([
    "paused",
    "takenOver",
    "needsFlashConsent",
    "finished",
    "manual",
  ] as const)(
    "from %s a flashing sequence asks up front, then sends confirmed",
    (status) => {
      const { result, runMock } = renderSequence(
        { flashConsent: noSequenceConsent() },
        activeState(SETLIST_ID, 0, {
          status,
          stepDurationMs: 8_000,
          pausedRemainingMs: status === "paused" ? 3_000 : null,
        }),
      );
      act(() =>
        result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
      );
      expect(runMock).not.toHaveBeenCalled();
      expect(result.current.flashConsent?.setlistName).toBe("Friday set");

      act(() => result.current.confirmFlash());
      expect(runMock).toHaveBeenCalledExactlyOnceWith(
        "setlistSetPlaying",
        true,
        true,
      );
    },
  );

  it("Play again on a calm finished sequence sends unconfirmed", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(CALM_SETLIST_ID, 1, { status: "finished" }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSetPlaying",
      true,
      false,
    );
  });

  it("Play from manual with the show's consent sends confirmed at once", () => {
    const { result, runMock } = renderSequence(
      {},
      activeState(SETLIST_ID, 1, { status: "manual" }),
    );
    act(() => result.current.setlist.togglePlaying(null));
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSetPlaying",
      true,
      true,
    );
  });

  it("a confirm after another sequence became active names why and sends nothing", () => {
    const view = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0, { status: "takenOver" }),
    );
    act(() =>
      view.result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    expect(view.result.current.flashConsent?.setlistName).toBe("Friday set");
    receiveState(
      view,
      activeState(CALM_SETLIST_ID, 0, { status: "takenOver" }),
    );

    act(() => view.result.current.confirmFlash());
    expect(view.runMock).not.toHaveBeenCalled();
    expect(view.onRefused).toHaveBeenCalledExactlyOnceWith(STALE_KEY);
  });

  it("a confirm after the status changed names why and sends nothing", () => {
    const view = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0, { status: "takenOver" }),
    );
    act(() =>
      view.result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    receiveState(view, activeState(SETLIST_ID, 1, { status: "finished" }));

    act(() => view.result.current.confirmFlash());
    expect(view.runMock).not.toHaveBeenCalled();
    expect(view.onRefused).toHaveBeenCalledExactlyOnceWith(STALE_KEY);
  });

  it("a refusal reopens the warning and a confirm after the sequence moved sends nothing", async () => {
    const view = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(CALM_SETLIST_ID, 0, { status: "takenOver" }),
    );
    view.runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() =>
      view.result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    await flush();
    expect(view.result.current.flashConsent?.setlistName).toBe("Warm up");
    receiveState(view, stateWith());

    act(() => view.result.current.confirmFlash());
    expect(view.runMock).toHaveBeenCalledTimes(1);
    expect(view.onRefused).toHaveBeenCalledExactlyOnceWith(STALE_KEY);
  });

  it("a refusal on Resume reopens the warning and sends again confirmed", async () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(CALM_SETLIST_ID, 0, { status: "takenOver" }),
    );
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() =>
      result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    await flush();
    expect(result.current.flashConsent?.setlistName).toBe("Warm up");
    act(() => result.current.confirmFlash());
    expect(runMock).toHaveBeenLastCalledWith("setlistSetPlaying", true, true);
  });

  it("does nothing with no active sequence", () => {
    const { result, runMock } = renderSequence();
    act(() =>
      result.current.dispatch({ kind: "setlistTogglePlaying" }, "press"),
    );
    expect(runMock).not.toHaveBeenCalled();
  });
});

describe("useVjRemoteActions: the sequence flash panel", () => {
  it("Play the flashing step sends a confirmed play without asking", () => {
    const giveConsent = vi.fn();
    const { result, runMock } = renderSequence(
      { flashConsent: { hasConsented: false, consent: giveConsent } },
      activeState(SETLIST_ID, 0, { status: "needsFlashConsent" }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistPlayFlashing" }, "press"),
    );
    expect(result.current.flashConsent).toBeNull();
    expect(giveConsent).not.toHaveBeenCalled();
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSetPlaying",
      true,
      true,
    );
  });

  it("Play the flashing step outside needsFlashConsent sends nothing", () => {
    const { result, runMock } = renderSequence(
      {},
      activeState(SETLIST_ID, 0, { status: "paused" }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistPlayFlashing" }, "press"),
    );
    expect(runMock).not.toHaveBeenCalled();
  });

  it("Skip plays on from the first step after it that does not flash", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0, { status: "needsFlashConsent" }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistSkipFlashing" }, "press"),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      SETLIST_ID,
      2,
      { isPlaying: true, isFlashConfirmed: false },
    );
  });

  it("Skip passes further flashing steps to a calm one two on", () => {
    const { result, runMock } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(FLASH_RUN_ID, 0, { status: "needsFlashConsent" }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistSkipFlashing" }, "press"),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      FLASH_RUN_ID,
      3,
      { isPlaying: true, isFlashConfirmed: false },
    );
  });

  it("Skip with no step to land on sends nothing", () => {
    const { result, runMock } = renderSequence(
      {},
      activeState(FLASH_LAST_ID, 0, { status: "needsFlashConsent" }),
    );
    act(() =>
      result.current.dispatch({ kind: "setlistSkipFlashing" }, "press"),
    );
    expect(runMock).not.toHaveBeenCalled();
  });

  it("a Skip refused as unconfirmed names the refusal and confirms nothing", async () => {
    const { result, runMock, onRefused } = renderSequence(
      { flashConsent: noSequenceConsent() },
      activeState(SETLIST_ID, 0, { status: "needsFlashConsent" }),
    );
    runMock.mockResolvedValueOnce(FLASH_REFUSAL);
    act(() =>
      result.current.dispatch({ kind: "setlistSkipFlashing" }, "press"),
    );
    await flush();
    expect(result.current.flashConsent).toBeNull();
    expect(runMock).toHaveBeenCalledTimes(1);
    expect(onRefused).toHaveBeenCalledExactlyOnceWith(
      "vj:error.socket.setlistFlashUnconfirmed",
    );
  });
});

describe("useVjRemoteActions: sequence Loop and Stop", () => {
  it("the Loop switch shows its new value at once for that sequence only", () => {
    const { result, runMock } = renderSequence({}, activeState(SETLIST_ID, 0));
    act(() =>
      result.current.dispatch(
        { kind: "setlistSetLooping", isLooping: true },
        "press",
      ),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistSetLooping", true);
    expect(result.current.setlistLoopIsOn(SETLIST_ID, false)).toBe(true);
    expect(result.current.isSetlistLoopPending(SETLIST_ID)).toBe(true);
    expect(result.current.setlistLoopIsOn(CALM_SETLIST_ID, false)).toBe(false);
    expect(result.current.isSetlistLoopPending(CALM_SETLIST_ID)).toBe(false);
  });

  it.each([
    ["vj_setlist_not_found", "vj:error.socket.setlistNotFound"],
    ["vj_server_error", "vj:error.socket.serverError"],
    ["offline", "vj:error.offline"],
  ] as const)(
    "a Loop refused with %s rolls back and names its reason",
    async (code, errorKey) => {
      const { result, runMock, onRefused } = renderSequence(
        {},
        activeState(SETLIST_ID, 0),
      );
      runMock.mockResolvedValueOnce({ ok: false, code, errorKey });
      act(() => result.current.setlist.setLooping(true));
      await flush();
      expect(result.current.setlistLoopIsOn(SETLIST_ID, false)).toBe(false);
      expect(result.current.isSetlistLoopPending(SETLIST_ID)).toBe(false);
      expect(onRefused).toHaveBeenCalledExactlyOnceWith(errorKey);
    },
  );

  it("Loop with no active sequence sends nothing", () => {
    const { result, runMock } = renderSequence();
    act(() => result.current.setlist.setLooping(true));
    expect(runMock).not.toHaveBeenCalled();
  });

  it("Stop clears the selection", () => {
    const { result, runMock } = renderSequence(
      {},
      activeState(SETLIST_ID, 1, { status: "finished" }),
    );
    act(() => result.current.dispatch({ kind: "setlistStop" }, "press"));
    expect(runMock).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      null,
      null,
    );
  });
});

describe("useVjRemoteActions: blocked sequence controls", () => {
  it("blocked sequence controls send nothing", () => {
    const { result, runMock } = renderSequence(
      { isBlocked: true },
      activeState(SETLIST_ID, 0, { status: "needsFlashConsent" }),
    );
    act(() => {
      result.current.dispatch(
        { kind: "setlistPlay", setlistId: SETLIST_ID },
        "press",
      );
      result.current.dispatch(
        { kind: "setlistStepThrough", setlistId: SETLIST_ID },
        "press",
      );
      result.current.dispatch({ kind: "setlistTogglePlaying" }, "press");
      result.current.dispatch(
        { kind: "setlistSetLooping", isLooping: true },
        "press",
      );
      result.current.dispatch({ kind: "setlistStop" }, "press");
      result.current.dispatch({ kind: "setlistPlayFlashing" }, "press");
      result.current.dispatch({ kind: "setlistSkipFlashing" }, "press");
    });
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.flashConsent).toBeNull();
  });
});

describe("useVjSceneRecall", () => {
  function renderRecall(overrides: Partial<UseVjSceneRecallOptions> = {}) {
    const resolvers = new Map<string, (outcome: VjCommandOutcome) => void>();
    const runMock = vi.fn((_name: string, sceneId: string) => {
      return new Promise<VjCommandOutcome>((resolve) => {
        resolvers.set(sceneId, resolve);
      });
    });
    const requestSceneFlashConsent = vi.fn<
      UseVjSceneRecallOptions["requestSceneFlashConsent"]
    >((_scene, _anchor, onConsented) => onConsented());
    const onRefused = vi.fn();
    const view = renderHook(
      (props: UseVjSceneRecallOptions) => useVjSceneRecall(props),
      {
        initialProps: {
          run: runMock as unknown as VjRun,
          isBlocked: false,
          onRefused,
          requestSceneFlashConsent,
          ...overrides,
        },
      },
    );
    return { ...view, runMock, resolvers, requestSceneFlashConsent, onRefused };
  }

  it("asks the flash gate with the tapped chip, then recalls", () => {
    const { result, runMock, requestSceneFlashConsent } = renderRecall();
    const chip = document.createElement("button");
    const scene = SCENES[1] as VjSceneDTO;
    act(() => result.current.recallScene(scene, chip));
    expect(requestSceneFlashConsent).toHaveBeenCalledWith(
      scene,
      chip,
      expect.any(Function),
    );
    expect(runMock).toHaveBeenCalledExactlyOnceWith("recallScene", SCENE_FLASH);
    expect(result.current.pendingSceneId).toBe(SCENE_FLASH);
  });

  it("sends nothing while the gate waits", () => {
    const { result, runMock } = renderRecall({
      requestSceneFlashConsent: vi.fn(),
    });
    act(() => result.current.recallScene(SCENES[1] as VjSceneDTO, null));
    expect(runMock).not.toHaveBeenCalled();
    expect(result.current.pendingSceneId).toBeNull();
  });

  it("an older recall's ack keeps the newer recall pending", async () => {
    const { result, resolvers } = renderRecall();
    act(() => result.current.recallScene(SCENES[0] as VjSceneDTO, null));
    act(() => result.current.recallScene(SCENES[1] as VjSceneDTO, null));
    expect(result.current.pendingSceneId).toBe(SCENE_FLASH);

    resolvers.get(SCENE_CALM)?.(OK_OUTCOME);
    await flush();
    expect(result.current.pendingSceneId).toBe(SCENE_FLASH);

    resolvers.get(SCENE_FLASH)?.(OK_OUTCOME);
    await flush();
    expect(result.current.pendingSceneId).toBeNull();
    expect(result.current.recalledSceneId).toBe(SCENE_FLASH);
  });

  it("a blocked recall sends nothing", () => {
    const { result, runMock, requestSceneFlashConsent } = renderRecall({
      isBlocked: true,
    });
    act(() => result.current.recallScene(SCENES[0] as VjSceneDTO, null));
    expect(requestSceneFlashConsent).not.toHaveBeenCalled();
    expect(runMock).not.toHaveBeenCalled();
  });
});
