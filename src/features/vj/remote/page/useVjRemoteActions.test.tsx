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
  createVjStageState,
  vjSceneLookOf,
  type VjClipDTO,
  type VjEffectId,
  type VjSceneDTO,
  type VjSetlistDTO,
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
const SETLISTS = [
  {
    id: SETLIST_ID,
    items: [
      { id: "item-1", sceneId: SCENE_CALM, position: 0 },
      { id: "item-2", sceneId: SCENE_FLASH, position: 1 },
    ],
  } as VjSetlistDTO,
];

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
    expect(runMock).toHaveBeenCalledExactlyOnceWith("setlistNext");
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
