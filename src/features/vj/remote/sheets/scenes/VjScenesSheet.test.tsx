import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { ApiError } from "../../../../../shared/api/client";
import {
  createVjSetlistPlayback,
  createVjStageState,
  DEFAULT_VJ_STEP_DURATION,
  vjSceneLookOf,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjSetlistItemInput,
  type VjSetlistPlayback,
  type VjStageState,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import type { VjRemoteClock } from "../../hooks/useVjRemoteClock";
import { VJ_SOCKET_REASON_KEY } from "../../../vjErrors";
import {
  VjRemoteSetlistContext,
  type VjRemoteSetlistControls,
} from "../../page/VjRemoteShell";
import type { VjRun, VjSceneFlashConsentRequest } from "./VjSceneRow";
import { VjScenesSheet } from "./VjScenesSheet";

const libraryMocks = vi.hoisted(() => ({
  scenes: [] as VjSceneDTO[],
  setlists: [] as VjSetlistDTO[],
  clips: [] as VjClipDTO[],
  createScene: vi.fn(),
  updateScene: vi.fn(),
  deleteScene: vi.fn(),
  createSetlist: vi.fn(),
  updateSetlist: vi.fn(),
  setSetlistItems: vi.fn(),
}));

vi.mock("../../../api/useVjScenes", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../../api/useVjScenes")>()),
  useVjScenes: () => ({
    data: libraryMocks.scenes,
    error: null,
    isSuccess: true,
  }),
}));

vi.mock("../../../api/useVjSetlists", () => ({
  useVjSetlists: () => ({ data: libraryMocks.setlists, error: null }),
}));

vi.mock("../../../api/useVjClips", () => ({
  useVjClips: () => ({ data: libraryMocks.clips, error: null }),
}));

vi.mock("../../../api/useVjSceneMutations", () => ({
  useVjSceneMutations: () => ({
    createScene: { mutateAsync: libraryMocks.createScene, isPending: false },
    updateScene: { mutateAsync: libraryMocks.updateScene, isPending: false },
    reorderScenes: { mutateAsync: vi.fn(), isPending: false },
    deleteScene: { mutateAsync: libraryMocks.deleteScene, isPending: false },
  }),
}));

vi.mock("../../../api/useVjSetlistMutations", () => ({
  useVjSetlistMutations: () => ({
    createSetlist: {
      mutateAsync: libraryMocks.createSetlist,
      isPending: false,
    },
    updateSetlist: {
      mutateAsync: libraryMocks.updateSetlist,
      isPending: false,
      error: null,
    },
    setSetlistItems: {
      mutateAsync: libraryMocks.setSetlistItems,
      isPending: false,
    },
  }),
}));

const PACK_ID = "pack-1";
const OK_OUTCOME: VjCommandOutcome = {
  ok: true,
  revision: 5,
  isNoop: false,
  applyAt: null,
};

function stageState(overrides: Partial<VjStageState> = {}): VjStageState {
  return {
    ...createVjStageState("show-scenes", 0),
    activePackId: PACK_ID,
    liveClipId: "clip-9",
    ...overrides,
  };
}

/** The stage with `setlistId` active at `setlistIndex` and the given playback. */
function activeState(
  setlistId: string,
  setlistIndex: number | null,
  playback: Partial<VjSetlistPlayback> = {},
  overrides: Partial<VjStageState> = {},
): VjStageState {
  return stageState({
    activeSetlistId: setlistId,
    setlistIndex,
    setlistPlayback: { ...createVjSetlistPlayback(false), ...playback },
    ...overrides,
  });
}

function makeScene(
  id: string,
  name: string,
  packId: string | null,
  setlistItemCount = 0,
): VjSceneDTO {
  return {
    id,
    name,
    packId,
    position: Number(id.replace(/\D/g, "")) || 0,
    look: vjSceneLookOf(stageState()),
    setlistItemCount,
    createdBy: null,
    createdAt: "2026-11-06T10:00:00.000Z",
    updatedAt: "2026-11-06T10:00:00.000Z",
  };
}

/** A scene whose look flashes: its transition is the flash-capable glitch. */
function makeFlashingScene(id: string, name: string): VjSceneDTO {
  const scene = makeScene(id, name, PACK_ID);
  return {
    ...scene,
    look: {
      ...scene.look,
      transition: { ...scene.look.transition, mode: "glitch" },
    },
  };
}

function makeClip(id: string, title: string): VjClipDTO {
  return { id, title } as VjClipDTO;
}

/** A sequence of scene steps; `clip:<id>` makes a clip step. */
function makeSetlist(
  id: string,
  name: string,
  stepTargets: string[],
  isLooping = false,
): VjSetlistDTO {
  return {
    id,
    name,
    position: 0,
    isLooping,
    stepDuration: DEFAULT_VJ_STEP_DURATION,
    items: stepTargets.map((target, itemIndex) => {
      const isClip = target.startsWith("clip:");
      return {
        id: `${id}-item-${itemIndex}`,
        position: itemIndex,
        kind: isClip ? ("clip" as const) : ("scene" as const),
        sceneId: isClip ? null : target,
        clipId: isClip ? target.slice("clip:".length) : null,
        duration: null,
      };
    }),
    createdBy: null,
    createdAt: "2026-11-06T10:00:00.000Z",
    updatedAt: "2026-11-06T10:00:00.000Z",
  };
}

/** The server's answer to a whole-list save: each body step stored in order, a new one under a fresh id. */
function savedSetlistOf({
  setlistId,
  items,
}: {
  setlistId: string;
  items: VjSetlistItemInput[];
}): VjSetlistDTO {
  return {
    ...makeSetlist(setlistId, "Opening", []),
    items: items.map((item, itemIndex) => ({
      id: item.id ?? `saved-${itemIndex}`,
      position: itemIndex,
      kind: item.kind,
      sceneId: item.kind === "scene" ? item.sceneId : null,
      clipId: item.kind === "clip" ? item.clipId : null,
      duration: item.duration ?? null,
    })),
  };
}

/** A promise the test settles by hand. */
function createDeferred<Value>() {
  let resolve: (value: Value) => void = () => {};
  let reject: (cause: unknown) => void = () => {};
  const promise = new Promise<Value>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

/**
 * A fake runner: a mock to assert on, typed as the runner's generic `run`.
 * The sheet never sends identifyScreen, so one outcome type answers every
 * call it makes.
 */
function createRun(
  outcome: VjCommandOutcome = OK_OUTCOME,
): VjRun & Mock<() => Promise<VjCommandOutcome>> {
  return vi.fn(() => Promise.resolve(outcome)) as unknown as VjRun &
    Mock<() => Promise<VjCommandOutcome>>;
}

const SERVER_NOW = 100_000;
const SHEET_CLOCK: VjRemoteClock = {
  serverNow: () => SERVER_NOW,
  toLocalTime: (serverMs) => serverMs,
  isSynced: true,
};

/** The shell's sequence controls, each action a mock. */
function createControls(
  overrides: Partial<VjRemoteSetlistControls> = {},
): VjRemoteSetlistControls {
  return {
    actions: {
      setlist: {
        play: vi.fn(),
        stepThrough: vi.fn(),
        togglePlaying: vi.fn(),
        step: vi.fn(),
        setLooping: vi.fn(),
        stop: vi.fn(),
        playFlashing: vi.fn(),
        skipFlashing: vi.fn(),
      },
      setlistLoopIsOn: (_setlistId, serverIsOn) => serverIsOn,
      isSetlistLoopPending: () => false,
    },
    clipsById: new Map(
      libraryMocks.clips.map((clip) => [clip.id, clip] as const),
    ),
    isCommandPending: () => false,
    clock: SHEET_CLOCK,
    errorKey: null,
    errorValues: null,
    refusalStamp: null,
    ...overrides,
  };
}

/** Lets every look through at once, as a show that already consented does. */
const passFlashConsent: VjSceneFlashConsentRequest = (
  _scene,
  _anchor,
  onConsented,
) => onConsented();

interface RenderSheetOptions {
  run?: VjRun;
  state?: VjStageState;
  requestSceneFlashConsent?: VjSceneFlashConsentRequest;
  controls?: VjRemoteSetlistControls;
}

function sheetElement(
  options: RenderSheetOptions,
  controls: VjRemoteSetlistControls,
) {
  return (
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjRemoteSetlistContext.Provider value={controls}>
          <VjScenesSheet
            state={options.state ?? stageState()}
            activePackId={PACK_ID}
            run={options.run ?? createRun()}
            isBlocked={false}
            requestSceneFlashConsent={
              options.requestSceneFlashConsent ?? passFlashConsent
            }
            onClose={() => {}}
          />
        </VjRemoteSetlistContext.Provider>
      </LazyMotion>
    </TestProviders>
  );
}

async function renderSheet(options: RenderSheetOptions = {}) {
  const controls = options.controls ?? createControls();
  const renderedView = render(sheetElement(options, controls));
  await awaitCatalog("vj");
  return {
    ...renderedView,
    controls,
    rerenderWith: (nextOptions: RenderSheetOptions) =>
      renderedView.rerender(
        sheetElement(nextOptions, nextOptions.controls ?? controls),
      ),
  };
}

function sceneRow(sceneId: string): HTMLElement {
  const row = document.querySelector<HTMLElement>(
    `[data-vj-scene-row="${sceneId}"]`,
  );
  if (row === null) throw new Error(`no row for ${sceneId}`);
  return row;
}

function setlistRow(setlistId: string): HTMLElement {
  const row = document.querySelector<HTMLElement>(
    `[data-vj-setlist-row="${setlistId}"]`,
  );
  if (row === null) throw new Error(`no row for ${setlistId}`);
  return row;
}

/** A flash warning that holds every request until the test confirms it. */
function createHeldFlashConsent() {
  const held: { confirm: (() => void) | null } = { confirm: null };
  const request = vi.fn<VjSceneFlashConsentRequest>(
    (_scene, _anchor, onConsented) => {
      held.confirm = onConsented;
    },
  );
  return { request, held };
}

/** Clicks, then lets the command's promise settle inside act. */
async function clickAndSettle(element: HTMLElement) {
  fireEvent.click(element);
  await act(() => Promise.resolve());
}

function resetLibrary() {
  libraryMocks.scenes = [
    makeScene("scene-1", "Scene 1", PACK_ID),
    makeScene("scene-2", "Scene 2", null),
  ];
  libraryMocks.setlists = [];
  libraryMocks.clips = [makeClip("clip-9", "Neon rain")];
}

describe("VjScenesSheet", () => {
  beforeEach(() => {
    resetLibrary();
    libraryMocks.createScene.mockResolvedValue(
      makeScene("scene-3", "Scene 3", PACK_ID),
    );
    libraryMocks.updateScene.mockResolvedValue(
      makeScene("scene-1", "Renamed", PACK_ID),
    );
    libraryMocks.deleteScene.mockResolvedValue({
      deletedSceneId: "scene-1",
      removedFromSetlistCount: 0,
    });
    libraryMocks.createSetlist.mockResolvedValue(
      makeSetlist("setlist-1", "Sequence 1", []),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Save scene posts the current look with the next default name", async () => {
    const state = stageState({ liveClipId: "clip-42" });
    await renderSheet({ state });
    await clickAndSettle(screen.getByRole("button", { name: "Save scene" }));
    expect(libraryMocks.createScene).toHaveBeenCalledWith({
      name: "Scene 3",
      packId: PACK_ID,
      look: vjSceneLookOf(state),
    });
    expect(
      within(screen.getByRole("dialog")).getByText("Scene saved"),
    ).toBeInTheDocument();
  });

  it("Recall sends recallScene", async () => {
    const run = createRun();
    await renderSheet({ run });
    await clickAndSettle(
      within(sceneRow("scene-2")).getByRole("button", { name: "Recall scene" }),
    );
    expect(run).toHaveBeenCalledWith("recallScene", "scene-2");
  });

  it("Rename refuses a blank name", async () => {
    await renderSheet();
    const row = sceneRow("scene-1");
    fireEvent.click(within(row).getByRole("button", { name: "Rename scene" }));
    const field = await within(row).findByLabelText("Scene name");
    fireEvent.change(field, { target: { value: "   " } });
    await clickAndSettle(
      within(row).getByRole("button", { name: "Save name" }),
    );
    expect(libraryMocks.updateScene).not.toHaveBeenCalled();
    expect(within(row).getByRole("alert")).toHaveTextContent(
      "Give the scene a name",
    );
  });

  it("Delete asks first, names the step count and deletes on confirm", async () => {
    libraryMocks.scenes = [makeScene("scene-1", "Neon", PACK_ID, 2)];
    await renderSheet();
    fireEvent.click(
      within(sceneRow("scene-1")).getByRole("button", { name: "Delete scene" }),
    );
    expect(libraryMocks.deleteScene).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog", { name: "Delete Neon?" });
    expect(dialog).toHaveTextContent(
      "The scene leaves the library and 2 steps in sequences",
    );
    await clickAndSettle(
      within(dialog).getByRole("button", { name: "Delete scene" }),
    );
    expect(libraryMocks.deleteScene).toHaveBeenCalledWith({
      sceneId: "scene-1",
    });
  });

  it("scenes filed under other packs never read as no scenes at all", async () => {
    libraryMocks.scenes = [makeScene("scene-9", "Elsewhere", "pack-other")];
    await renderSheet();
    expect(
      screen.queryByText("No scenes yet. Save the current look"),
    ).toBeNull();
  });

  it("Make a sequence sends this pack's scene ids", async () => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeScene("scene-2", "Scene 2", "pack-other"),
      makeScene("scene-3", "Scene 3", null),
      makeScene("scene-4", "Scene 4", PACK_ID),
    ];
    await renderSheet();
    await clickAndSettle(
      screen.getByRole("button", { name: "Make a sequence from these scenes" }),
    );
    expect(libraryMocks.createSetlist).toHaveBeenCalledWith({
      name: "Sequence 1",
      sceneIds: ["scene-1", "scene-4", "scene-3"],
    });
  });

  it("a refusal names its reason", async () => {
    libraryMocks.createScene.mockRejectedValue(
      new ApiError(409, "Conflict", { code: "VJ_SCENE_LIMIT_REACHED" }),
    );
    const run = createRun({
      ok: false,
      code: "vj_scene_not_found",
      errorKey: VJ_SOCKET_REASON_KEY.vj_scene_not_found,
    });
    await renderSheet({ run });
    await clickAndSettle(screen.getByRole("button", { name: "Save scene" }));
    expect(
      await screen.findByText(
        "The library holds up to 200 scenes. Delete one to save another",
      ),
    ).toBeInTheDocument();
    await clickAndSettle(
      within(sceneRow("scene-1")).getByRole("button", { name: "Recall scene" }),
    );
    expect(
      await screen.findByText("This scene was deleted"),
    ).toBeInTheDocument();
  });
});

describe("VjScenesSheet sequence rows", () => {
  beforeEach(resetLibrary);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Play sequence plays from step 1 through the sequence actions", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const run = createRun();
    const { controls } = await renderSheet({ run });
    const row = setlistRow("setlist-1");
    expect(row).toHaveTextContent("2 steps");
    const playButton = within(row).getByRole("button", {
      name: "Play sequence",
    });
    expect(playButton).toHaveAccessibleDescription("Opening");
    await clickAndSettle(playButton);
    expect(controls.actions.setlist.play).toHaveBeenCalledWith(
      "setlist-1",
      playButton,
    );
    expect(run).not.toHaveBeenCalled();
  });

  it("Step through starts the sequence by hand", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const { controls } = await renderSheet();
    const stepThroughButton = within(setlistRow("setlist-1")).getByRole(
      "button",
      { name: "Step through" },
    );
    expect(stepThroughButton).toHaveAccessibleDescription("Opening");
    await clickAndSettle(stepThroughButton);
    expect(controls.actions.setlist.stepThrough).toHaveBeenCalledWith(
      "setlist-1",
      stepThroughButton,
    );
  });

  it("an empty sequence holds Play and Step through and says why", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Empty", [])];
    const { controls } = await renderSheet();
    const row = setlistRow("setlist-1");
    const playButton = within(row).getByRole("button", {
      name: "Play sequence",
    });
    expect(playButton).toHaveAttribute("aria-disabled", "true");
    expect(playButton).toHaveAccessibleDescription(
      "Empty Add steps to play this sequence",
    );
    expect(
      within(row).getByRole("button", { name: "Step through" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(row).toHaveTextContent("Add steps to play this sequence");
    await clickAndSettle(playButton);
    expect(controls.actions.setlist.play).not.toHaveBeenCalled();
  });
});

describe("VjScenesSheet active sequence", () => {
  beforeEach(resetLibrary);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the step, pauses while playing and steps through the actions", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2", "scene-1"]),
    ];
    const { controls } = await renderSheet({
      state: activeState("setlist-1", 0, { status: "playing" }),
    });
    const row = setlistRow("setlist-1");
    expect(row).toHaveTextContent("Step 1 of 3");
    const pauseButton = within(row).getByRole("button", {
      name: "Pause sequence",
    });
    await clickAndSettle(pauseButton);
    expect(controls.actions.setlist.togglePlaying).toHaveBeenCalledWith(
      pauseButton,
    );
    const nextButton = within(row).getByRole("button", { name: "Next step" });
    await clickAndSettle(nextButton);
    expect(controls.actions.setlist.step).toHaveBeenCalledWith(
      "next",
      nextButton,
    );
    expect(
      within(row).getByRole("button", { name: "Previous step" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it("with Loop on, Previous steps round while armed with nothing recalled", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const { controls } = await renderSheet({
      state: activeState("setlist-1", null, { isLooping: true }),
    });
    const previousButton = within(setlistRow("setlist-1")).getByRole("button", {
      name: "Previous step",
    });
    expect(previousButton).not.toHaveAttribute("aria-disabled");
    await clickAndSettle(previousButton);
    expect(controls.actions.setlist.step).toHaveBeenCalledWith(
      "previous",
      previousButton,
    );
  });

  it("without Loop, Previous holds while armed with nothing recalled", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const { controls } = await renderSheet({
      state: activeState("setlist-1", null),
    });
    const previousButton = within(setlistRow("setlist-1")).getByRole("button", {
      name: "Previous step",
    });
    expect(previousButton).toHaveAttribute("aria-disabled", "true");
    await clickAndSettle(previousButton);
    expect(controls.actions.setlist.step).not.toHaveBeenCalled();
  });

  it("a sequence taken over names why and offers Resume", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    await renderSheet({
      state: activeState("setlist-1", 0, { status: "takenOver" }),
    });
    const row = setlistRow("setlist-1");
    const reason = "Paused, you picked a clip. Resume plays step 2: Scene 2";
    expect(row).toHaveTextContent(reason);
    expect(
      within(row).getByRole("button", { name: "Resume sequence" }),
    ).toHaveAccessibleDescription(reason);
  });

  it("names the step on stage, counts its time down and drops the step count", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    await renderSheet({
      state: activeState("setlist-1", 1, {
        status: "playing",
        stepStartedAt: SERVER_NOW - 2_000,
        stepEndsAt: SERVER_NOW + 6_000,
        stepDurationMs: 8_000,
      }),
    });
    const row = setlistRow("setlist-1");
    expect(row).toHaveTextContent("Step 2 of 2: Scene 2");
    expect(row).toHaveTextContent("Next step in 6 s");
    expect(row).not.toHaveTextContent("2 steps");
  });

  it("a finished sequence offers Play again", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const { controls } = await renderSheet({
      state: activeState("setlist-1", 1, { status: "finished" }),
    });
    const row = setlistRow("setlist-1");
    expect(row).toHaveTextContent("Sequence finished");
    await clickAndSettle(
      within(row).getByRole("button", { name: "Play again" }),
    );
    expect(controls.actions.setlist.togglePlaying).toHaveBeenCalledTimes(1);
  });

  it("a wait before a flashing step names it with its three choices", async () => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeFlashingScene("scene-flash", "Strobe drop"),
      makeScene("scene-2", "Scene 2", PACK_ID),
    ];
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", [
        "scene-1",
        "scene-flash",
        "scene-2",
      ]),
    ];
    const { controls } = await renderSheet({
      state: activeState("setlist-1", 0, { status: "needsFlashConsent" }),
    });
    const row = setlistRow("setlist-1");
    expect(row).toHaveTextContent("Paused before Strobe drop, which flashes");
    expect(
      within(row).queryByRole("button", { name: "Resume sequence" }),
    ).toBeNull();
    await clickAndSettle(
      within(row).getByRole("button", { name: "Play the flashing step" }),
    );
    expect(controls.actions.setlist.playFlashing).toHaveBeenCalledTimes(1);
    await clickAndSettle(
      within(row).getByRole("button", { name: "Skip the flashing step" }),
    );
    expect(controls.actions.setlist.skipFlashing).toHaveBeenCalledTimes(1);
    for (const button of within(row).getAllByRole("button")) {
      expect(button.closest('[role="status"]')).toBeNull();
    }
    const stopButtons = within(row).getAllByRole("button", {
      name: "Stop sequence",
    });
    expect(stopButtons).toHaveLength(1);
    await clickAndSettle(stopButtons[0]!);
    expect(controls.actions.setlist.stop).toHaveBeenCalledTimes(1);
  });

  it("hides Skip when no later step plays without flashing", async () => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeFlashingScene("scene-flash", "Strobe drop"),
    ];
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-flash"]),
    ];
    await renderSheet({
      state: activeState("setlist-1", 0, { status: "needsFlashConsent" }),
    });
    const row = setlistRow("setlist-1");
    expect(
      within(row).getByRole("button", { name: "Play the flashing step" }),
    ).toBeInTheDocument();
    expect(
      within(row).queryByRole("button", { name: "Skip the flashing step" }),
    ).toBeNull();
  });
});

describe("VjScenesSheet active sequence feedback", () => {
  beforeEach(resetLibrary);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("the Loop switch sends the new value and shows the pressed one", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const pressedLoop = new Map<string, boolean>();
    const baseControls = createControls();
    const setLooping = vi.fn((isLooping: boolean) => {
      pressedLoop.set("setlist-1", isLooping);
    });
    const controls: VjRemoteSetlistControls = {
      ...baseControls,
      actions: {
        ...baseControls.actions,
        setlist: { ...baseControls.actions.setlist, setLooping },
        setlistLoopIsOn: (setlistId, serverIsOn) =>
          pressedLoop.get(setlistId) ?? serverIsOn,
      },
    };
    const state = activeState("setlist-1", 0, { status: "playing" });
    const { rerenderWith } = await renderSheet({ controls, state });
    const loopSwitch = () =>
      within(setlistRow("setlist-1")).getByRole("switch", { name: "Loop" });
    expect(loopSwitch()).toHaveAttribute("aria-checked", "false");
    await clickAndSettle(loopSwitch());
    expect(setLooping).toHaveBeenCalledWith(true);
    // The pressed value shows before the server's Loop changes.
    rerenderWith({ controls, state });
    expect(loopSwitch()).toHaveAttribute("aria-checked", "true");
    await clickAndSettle(loopSwitch());
    expect(setLooping).toHaveBeenLastCalledWith(false);
    rerenderWith({ controls, state });
    expect(loopSwitch()).toHaveAttribute("aria-checked", "false");
  });

  it("names a refusal newer than the press in the row that was pressed", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const state = activeState("setlist-1", 1, { status: "manual" });
    // A refusal already stands on the status line before the press.
    const standingControls = createControls({
      errorKey: VJ_SOCKET_REASON_KEY.vj_setlist_end,
      refusalStamp: {},
    });
    const { rerenderWith } = await renderSheet({
      state,
      controls: standingControls,
    });
    await clickAndSettle(
      within(setlistRow("setlist-1")).getByRole("button", {
        name: "Play sequence",
      }),
    );
    rerenderWith({ state, controls: standingControls });
    expect(
      setlistRow("setlist-1").querySelector("[data-vj-setlist-refusal]"),
    ).toBeNull();
    rerenderWith({
      state,
      controls: {
        ...standingControls,
        errorKey: VJ_SOCKET_REASON_KEY.vj_setlist_empty,
        refusalStamp: {},
      },
    });
    const refusalLine = await within(setlistRow("setlist-1")).findByText(
      "This sequence has no steps yet. Add steps first",
    );
    // The dock's status line announces it; the row line stays quiet.
    expect(refusalLine.closest("[role]")).toBeNull();
  });

  it("an emptied sequence on stage holds its play button and says why", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Opening", [])];
    const { controls } = await renderSheet({
      state: activeState("setlist-1", null, { status: "manual" }),
    });
    const row = setlistRow("setlist-1");
    const playButton = within(row).getByRole("button", {
      name: "Play sequence",
    });
    expect(playButton).toHaveAttribute("aria-disabled", "true");
    expect(playButton).toHaveAccessibleDescription(
      "Add steps to play this sequence",
    );
    await clickAndSettle(playButton);
    expect(controls.actions.setlist.togglePlaying).not.toHaveBeenCalled();
  });
});

/** Opens a sequence's steps panel from its Edit steps button. */
async function openSteps(setlistName: string, setlistId: string) {
  const editButton = within(setlistRow(setlistId)).getByRole("button", {
    name: "Edit steps",
  });
  expect(editButton).toHaveAccessibleDescription(setlistName);
  expect(editButton).toHaveAttribute("aria-expanded", "false");
  fireEvent.click(editButton);
  expect(editButton).toHaveAttribute("aria-expanded", "true");
  return within(
    await screen.findByRole("region", { name: `Steps in ${setlistName}` }),
  );
}

describe("VjScenesSheet steps panel", () => {
  beforeEach(() => {
    resetLibrary();
    libraryMocks.setSetlistItems.mockImplementation(
      (variables: { setlistId: string; items: VjSetlistItemInput[] }) =>
        Promise.resolve(savedSetlistOf(variables)),
    );
    libraryMocks.updateSetlist.mockImplementation(
      ({ setlistId }: { setlistId: string }) =>
        Promise.resolve(makeSetlist(setlistId, "Opening", [])),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Move down saves the whole list with the kept item ids", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "clip:clip-9"]),
    ];
    await renderSheet();
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(
      panel.getByRole("button", { name: "Move Scene 1 down in the sequence" }),
    );
    expect(libraryMocks.setSetlistItems).toHaveBeenCalledWith({
      setlistId: "setlist-1",
      items: [
        {
          id: "setlist-1-item-1",
          kind: "clip",
          clipId: "clip-9",
          duration: null,
        },
        {
          id: "setlist-1-item-0",
          kind: "scene",
          sceneId: "scene-1",
          duration: null,
        },
      ],
    });
  });

  it("Remove leaves the step out of the saved list", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    await renderSheet();
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(
      panel.getByRole("button", { name: "Remove Scene 1 from Opening" }),
    );
    expect(libraryMocks.setSetlistItems).toHaveBeenCalledWith({
      setlistId: "setlist-1",
      items: [
        {
          id: "setlist-1-item-1",
          kind: "scene",
          sceneId: "scene-2",
          duration: null,
        },
      ],
    });
  });

  it("Add live clip appends the clip on screen as a new clip step", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Opening", ["scene-1"])];
    await renderSheet({ state: stageState({ liveClipId: "clip-9" }) });
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(panel.getByRole("button", { name: "Add live clip" }));
    expect(libraryMocks.setSetlistItems).toHaveBeenCalledWith({
      setlistId: "setlist-1",
      items: [
        {
          id: "setlist-1-item-0",
          kind: "scene",
          sceneId: "scene-1",
          duration: null,
        },
        { kind: "clip", clipId: "clip-9", duration: null },
      ],
    });
  });

  it("Add live clip holds with its reason while no clip is on screen", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Opening", ["scene-1"])];
    await renderSheet({ state: stageState({ liveClipId: null }) });
    const panel = await openSteps("Opening", "setlist-1");
    const addButton = panel.getByRole("button", { name: "Add live clip" });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    expect(addButton).toHaveAccessibleDescription(
      "Play a clip first to add it",
    );
    await clickAndSettle(addButton);
    expect(libraryMocks.setSetlistItems).not.toHaveBeenCalled();
  });

  it("Add live look saves the look under a free step name, then appends it", async () => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeScene("scene-2", "Opening step 3", PACK_ID),
    ];
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-1"]),
    ];
    libraryMocks.createScene.mockResolvedValue(
      makeScene("scene-new", "Opening step 4", PACK_ID),
    );
    const state = stageState({ liveClipId: "clip-9" });
    await renderSheet({ state });
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(panel.getByRole("button", { name: "Add live look" }));
    expect(libraryMocks.createScene).toHaveBeenCalledWith({
      name: "Opening step 4",
      packId: PACK_ID,
      look: vjSceneLookOf(state),
    });
    await act(() => Promise.resolve());
    expect(libraryMocks.setSetlistItems).toHaveBeenCalledWith({
      setlistId: "setlist-1",
      items: [
        {
          id: "setlist-1-item-0",
          kind: "scene",
          sceneId: "scene-1",
          duration: null,
        },
        {
          id: "setlist-1-item-1",
          kind: "scene",
          sceneId: "scene-1",
          duration: null,
        },
        { kind: "scene", sceneId: "scene-new", duration: null },
      ],
    });
  });

  it("Add live look keeps the step number whole under the name limit", async () => {
    const longName = "A".repeat(60);
    libraryMocks.setlists = [makeSetlist("setlist-1", longName, ["scene-1"])];
    libraryMocks.createScene.mockResolvedValue(
      makeScene("scene-new", "Long", PACK_ID),
    );
    await renderSheet();
    const panel = await openSteps(longName, "setlist-1");
    await clickAndSettle(panel.getByRole("button", { name: "Add live look" }));
    const [[body]] = libraryMocks.createScene.mock.calls as [
      [{ name: string }],
    ];
    expect(body.name).toHaveLength(60);
    expect(body.name.endsWith(" step 2")).toBe(true);
  });
});

describe("VjScenesSheet steps panel saves", () => {
  beforeEach(() => {
    resetLibrary();
    libraryMocks.setSetlistItems.mockImplementation(
      (variables: { setlistId: string; items: VjSetlistItemInput[] }) =>
        Promise.resolve(savedSetlistOf(variables)),
    );
    libraryMocks.updateSetlist.mockImplementation(
      ({ setlistId }: { setlistId: string }) =>
        Promise.resolve(makeSetlist(setlistId, "Opening", [])),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("a refused Add live look says the saved scene stays in the library", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Opening", ["scene-1"])];
    libraryMocks.createScene.mockResolvedValue(
      makeScene("scene-new", "Opening step 2", PACK_ID),
    );
    libraryMocks.setSetlistItems.mockRejectedValue(
      new ApiError(404, "Not found", { code: "VJ_SETLIST_ITEM_NOT_FOUND" }),
    );
    await renderSheet();
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(panel.getByRole("button", { name: "Add live look" }));
    await act(() => Promise.resolve());
    expect(await panel.findByRole("alert")).toHaveTextContent(
      "A step was removed somewhere else. Load the sequence again",
    );
    expect(
      await panel.findByText(
        "Opening step 2 was saved as a scene and couldn't join the sequence",
      ),
    ).toBeInTheDocument();
  });

  it("the default length shows the picked value while it saves", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Opening", ["scene-1"])];
    const saveAnswer = createDeferred<VjSetlistDTO>();
    libraryMocks.updateSetlist.mockImplementationOnce(() => saveAnswer.promise);
    await renderSheet();
    const panel = await openSteps("Opening", "setlist-1");
    const settingsGroup = panel.getByRole("group", {
      name: "Settings for Opening",
    });
    const lengthGroup = within(settingsGroup).getByRole("group", {
      name: "Default step length",
    });
    fireEvent.click(within(lengthGroup).getByRole("button", { name: "Beats" }));
    expect(libraryMocks.updateSetlist).toHaveBeenCalledWith({
      setlistId: "setlist-1",
      stepDuration: { kind: "beats", value: 16 },
    });
    expect(
      within(lengthGroup).getByRole("button", { name: "Beats" }),
    ).toHaveAttribute("aria-pressed", "true");
    await act(async () => {
      saveAnswer.resolve(makeSetlist("setlist-1", "Opening", ["scene-1"]));
      await Promise.resolve();
    });
  });

  it("a move made while an add saves carries the added item's id", async () => {
    libraryMocks.setlists = [makeSetlist("setlist-1", "Opening", ["scene-1"])];
    const addAnswer = createDeferred<VjSetlistDTO>();
    libraryMocks.setSetlistItems.mockImplementationOnce(
      () => addAnswer.promise,
    );
    await renderSheet({ state: stageState({ liveClipId: "clip-9" }) });
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(panel.getByRole("button", { name: "Add live clip" }));
    await clickAndSettle(
      panel.getByRole("button", { name: "Move Neon rain up in the sequence" }),
    );
    // One save at a time: the move waits for the add's answer.
    expect(libraryMocks.setSetlistItems).toHaveBeenCalledTimes(1);
    await act(async () => {
      addAnswer.resolve(
        savedSetlistOf({
          setlistId: "setlist-1",
          items: [
            { id: "setlist-1-item-0", kind: "scene", sceneId: "scene-1" },
            { id: "item-added", kind: "clip", clipId: "clip-9" },
          ],
        }),
      );
      await Promise.resolve();
    });
    await act(() => Promise.resolve());
    expect(libraryMocks.setSetlistItems).toHaveBeenLastCalledWith({
      setlistId: "setlist-1",
      items: [
        { id: "item-added", kind: "clip", clipId: "clip-9", duration: null },
        {
          id: "setlist-1-item-0",
          kind: "scene",
          sceneId: "scene-1",
          duration: null,
        },
      ],
    });
  });

  it("two overlapping saves name the newest one's refusal", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const firstAnswer = createDeferred<VjSetlistDTO>();
    libraryMocks.setSetlistItems
      .mockImplementationOnce(() => firstAnswer.promise)
      .mockImplementationOnce(() =>
        Promise.reject(
          new ApiError(404, "Not found", { code: "VJ_SETLIST_ITEM_NOT_FOUND" }),
        ),
      );
    await renderSheet();
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(
      panel.getByRole("button", { name: "Remove Scene 1 from Opening" }),
    );
    await clickAndSettle(
      panel.getByRole("button", { name: "Remove Scene 2 from Opening" }),
    );
    await act(async () => {
      firstAnswer.resolve(
        savedSetlistOf({
          setlistId: "setlist-1",
          items: [
            { id: "setlist-1-item-1", kind: "scene", sceneId: "scene-2" },
          ],
        }),
      );
      await Promise.resolve();
    });
    expect(libraryMocks.setSetlistItems).toHaveBeenCalledTimes(2);
    expect(await panel.findByRole("alert")).toHaveTextContent(
      "A step was removed somewhere else. Load the sequence again",
    );
  });

  it("marks the step on screen by its item id", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    await renderSheet({
      state: activeState("setlist-1", 0, {
        status: "playing",
        itemId: "setlist-1-item-1",
      }),
    });
    await openSteps("Opening", "setlist-1");
    expect(
      document.querySelector('[data-vj-setlist-step="setlist-1-item-1"]'),
    ).toHaveAttribute("aria-current", "step");
    expect(
      document.querySelector('[data-vj-setlist-step="setlist-1-item-0"]'),
    ).not.toHaveAttribute("aria-current");
  });

  it("a refused save names its reason in the panel", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    libraryMocks.setSetlistItems.mockRejectedValue(
      new ApiError(404, "Not found", { code: "VJ_SETLIST_ITEM_NOT_FOUND" }),
    );
    await renderSheet();
    const panel = await openSteps("Opening", "setlist-1");
    await clickAndSettle(
      panel.getByRole("button", { name: "Remove Scene 1 from Opening" }),
    );
    expect(await panel.findByRole("alert")).toHaveTextContent(
      "A step was removed somewhere else. Load the sequence again",
    );
  });
});

describe("VjScenesSheet flash warning", () => {
  beforeEach(resetLibrary);

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Recall asks first, anchored on the tapped button, and sends once confirmed", async () => {
    const run = createRun();
    const consent = createHeldFlashConsent();
    await renderSheet({ run, requestSceneFlashConsent: consent.request });
    const recallButton = within(sceneRow("scene-2")).getByRole("button", {
      name: "Recall scene",
    });
    await clickAndSettle(recallButton);
    expect(consent.request).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scene-2", name: "Scene 2" }),
      recallButton,
      expect.any(Function),
    );
    expect(run).not.toHaveBeenCalled();
    await act(async () => {
      consent.held.confirm?.();
      await Promise.resolve();
    });
    expect(run).toHaveBeenCalledExactlyOnceWith("recallScene", "scene-2");
  });

  it("a Recall left unconfirmed sends nothing", async () => {
    const run = createRun();
    const consent = createHeldFlashConsent();
    await renderSheet({ run, requestSceneFlashConsent: consent.request });
    await clickAndSettle(
      within(sceneRow("scene-1")).getByRole("button", {
        name: "Recall scene",
      }),
    );
    expect(consent.request).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();
  });
});
