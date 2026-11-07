import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { ApiError } from "../../../../../shared/api/client";
import {
  createVjStageState,
  vjSceneLookOf,
  type VjSceneDTO,
  type VjSetlistDTO,
  type VjStageState,
} from "../../../../../shared/contracts/vj";
import { TestProviders } from "../../../../../test/TestProviders";
import { awaitCatalog } from "../../../../../test/awaitCatalog";
import type { VjCommandOutcome } from "../../../live/vjStageCommands";
import { VJ_SOCKET_REASON_KEY } from "../../../vjErrors";
import type { VjRun, VjSceneFlashConsentRequest } from "./VjSceneRow";
import { VjScenesSheet } from "./VjScenesSheet";

const libraryMocks = vi.hoisted(() => ({
  scenes: [] as VjSceneDTO[],
  setlists: [] as VjSetlistDTO[],
  createScene: vi.fn(),
  updateScene: vi.fn(),
  deleteScene: vi.fn(),
  createSetlist: vi.fn(),
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

function makeSetlist(id: string, name: string, sceneIds: string[]) {
  return {
    id,
    name,
    position: 0,
    items: sceneIds.map((sceneId, itemIndex) => ({
      id: `${id}-item-${itemIndex}`,
      sceneId,
      position: itemIndex,
    })),
    createdBy: null,
    createdAt: "2026-11-06T10:00:00.000Z",
    updatedAt: "2026-11-06T10:00:00.000Z",
  } satisfies VjSetlistDTO;
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

/** Lets every look through at once, as a show that already consented does. */
const passFlashConsent: VjSceneFlashConsentRequest = (
  _scene,
  _anchor,
  onConsented,
) => onConsented();

async function renderSheet(
  run: VjRun,
  state: VjStageState = stageState(),
  requestSceneFlashConsent: VjSceneFlashConsentRequest = passFlashConsent,
) {
  const renderedView = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjScenesSheet
          state={state}
          activePackId={PACK_ID}
          run={run}
          isBlocked={false}
          requestSceneFlashConsent={requestSceneFlashConsent}
          onClose={() => {}}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return renderedView;
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

describe("VjScenesSheet", () => {
  beforeEach(() => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeScene("scene-2", "Scene 2", null),
    ];
    libraryMocks.setlists = [];
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
      makeSetlist("setlist-1", "Set list 1", []),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Save scene posts the current look with the next default name", async () => {
    const state = stageState({ liveClipId: "clip-42" });
    await renderSheet(createRun(), state);
    await clickAndSettle(screen.getByRole("button", { name: "Save scene" }));
    expect(libraryMocks.createScene).toHaveBeenCalledWith({
      name: "Scene 3",
      packId: PACK_ID,
      look: vjSceneLookOf(state),
    });
    expect(
      within(screen.getByRole("dialog")).getByRole("status"),
    ).toHaveTextContent("Scene saved");
  });

  it("Recall sends recallScene", async () => {
    const run = createRun();
    await renderSheet(run);
    await clickAndSettle(
      within(sceneRow("scene-2")).getByRole("button", { name: "Recall scene" }),
    );
    expect(run).toHaveBeenCalledWith("recallScene", "scene-2");
  });

  it("Rename refuses a blank name", async () => {
    await renderSheet(createRun());
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

  it("Delete asks first, names the set list count and deletes on confirm", async () => {
    libraryMocks.scenes = [makeScene("scene-1", "Neon", PACK_ID, 2)];
    await renderSheet(createRun());
    fireEvent.click(
      within(sceneRow("scene-1")).getByRole("button", { name: "Delete scene" }),
    );
    expect(libraryMocks.deleteScene).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("dialog", { name: "Delete Neon?" });
    expect(dialog).toHaveTextContent(
      "The scene leaves the library and 2 spots in set lists",
    );
    await clickAndSettle(
      within(dialog).getByRole("button", { name: "Delete scene" }),
    );
    expect(libraryMocks.deleteScene).toHaveBeenCalledWith({
      sceneId: "scene-1",
    });
  });

  it("Start set list selects index 0", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const run = createRun();
    await renderSheet(run);
    expect(setlistRow("setlist-1")).toHaveTextContent("2 scenes");
    await clickAndSettle(
      within(setlistRow("setlist-1")).getByRole("button", {
        name: "Start set list",
      }),
    );
    expect(run).toHaveBeenCalledWith("setlistSelect", "setlist-1", 0);
  });

  it("Next scene sends setlistNext", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2", "scene-1"]),
    ];
    const run = createRun();
    await renderSheet(
      run,
      stageState({ activeSetlistId: "setlist-1", setlistIndex: 0 }),
    );
    const row = setlistRow("setlist-1");
    expect(row).toHaveTextContent("1 of 3");
    await clickAndSettle(
      within(row).getByRole("button", { name: "Next scene" }),
    );
    expect(run).toHaveBeenCalledWith("setlistNext");
  });

  it("Stop set list selects null", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const run = createRun();
    await renderSheet(
      run,
      stageState({ activeSetlistId: "setlist-1", setlistIndex: 1 }),
    );
    await clickAndSettle(
      within(setlistRow("setlist-1")).getByRole("button", {
        name: "Stop set list",
      }),
    );
    expect(run).toHaveBeenCalledWith("setlistSelect", null, null);
  });

  it("Make a set list sends this pack's scene ids", async () => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeScene("scene-2", "Scene 2", "pack-other"),
      makeScene("scene-3", "Scene 3", null),
      makeScene("scene-4", "Scene 4", PACK_ID),
    ];
    await renderSheet(createRun());
    await clickAndSettle(
      screen.getByRole("button", { name: "Make a set list from these scenes" }),
    );
    expect(libraryMocks.createSetlist).toHaveBeenCalledWith({
      name: "Set list 1",
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
    await renderSheet(run);
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

describe("VjScenesSheet flash warning", () => {
  beforeEach(() => {
    libraryMocks.scenes = [
      makeScene("scene-1", "Scene 1", PACK_ID),
      makeScene("scene-2", "Scene 2", null),
    ];
    libraryMocks.setlists = [];
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Recall asks first, anchored on the tapped button, and sends once confirmed", async () => {
    const run = createRun();
    const consent = createHeldFlashConsent();
    await renderSheet(run, stageState(), consent.request);
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
    await renderSheet(run, stageState(), consent.request);
    await clickAndSettle(
      within(sceneRow("scene-1")).getByRole("button", {
        name: "Recall scene",
      }),
    );
    expect(consent.request).toHaveBeenCalledTimes(1);
    expect(run).not.toHaveBeenCalled();
  });

  it("Start set list checks item 0's scene before it selects", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-2", "scene-1"]),
    ];
    const run = createRun();
    const consent = createHeldFlashConsent();
    await renderSheet(run, stageState(), consent.request);
    const startButton = within(setlistRow("setlist-1")).getByRole("button", {
      name: "Start set list",
    });
    await clickAndSettle(startButton);
    expect(consent.request).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scene-2" }),
      startButton,
      expect.any(Function),
    );
    expect(run).not.toHaveBeenCalled();
    await act(async () => {
      consent.held.confirm?.();
      await Promise.resolve();
    });
    expect(run).toHaveBeenCalledExactlyOnceWith(
      "setlistSelect",
      "setlist-1",
      0,
    );
  });

  it("Next scene checks the scene it lands on", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-1", "scene-2"]),
    ];
    const run = createRun();
    const consent = createHeldFlashConsent();
    await renderSheet(
      run,
      stageState({ activeSetlistId: "setlist-1", setlistIndex: 0 }),
      consent.request,
    );
    await clickAndSettle(
      within(setlistRow("setlist-1")).getByRole("button", {
        name: "Next scene",
      }),
    );
    expect(consent.request).toHaveBeenCalledWith(
      expect.objectContaining({ id: "scene-2" }),
      expect.any(HTMLElement),
      expect.any(Function),
    );
    expect(run).not.toHaveBeenCalled();
    await act(async () => {
      consent.held.confirm?.();
      await Promise.resolve();
    });
    expect(run).toHaveBeenCalledExactlyOnceWith("setlistNext");
  });

  it("a set list scene the library has not loaded starts at once", async () => {
    libraryMocks.setlists = [
      makeSetlist("setlist-1", "Opening", ["scene-missing"]),
    ];
    const run = createRun();
    const consent = createHeldFlashConsent();
    await renderSheet(run, stageState(), consent.request);
    await clickAndSettle(
      within(setlistRow("setlist-1")).getByRole("button", {
        name: "Start set list",
      }),
    );
    expect(consent.request).not.toHaveBeenCalled();
    expect(run).toHaveBeenCalledWith("setlistSelect", "setlist-1", 0);
  });
});
