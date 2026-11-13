import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMemo } from "react";
import type { ApiError } from "../../../../shared/api/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  VjClipDTO,
  VjSceneDTO,
  VjSetlistDTO,
  VjSetlistItemInput,
  VjTempo,
} from "../../../../shared/contracts/vj";
import { useVjClips } from "../../api/useVjClips";
import { useVjScenes } from "../../api/useVjScenes";
import { useVjSetlists } from "../../api/useVjSetlists";
import { createVjDemoChannelHub } from "../../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjClips,
  demoGetVjScenes,
  demoGetVjSetlists,
  demoSetVjSetlistItems,
  resetVjDemoLibrary,
} from "../../demo/vjDemoStore";
import { vjRefusal } from "../../demo/vjDemoRefusals";
import { VjSetlistItemsEditor } from "./VjSetlistItemsEditor";
import { useVjSetlistItemsSender } from "./vjSetlistSlots";

/** While `held` is set, step saves from the editor wait for it, so a test can
 *  click again before the first save answers. While `refusal` is set, the
 *  next step save throws it the way the API would. Every body sent is kept
 *  in `sentBodies` and every answer in `answers`, so a test can read what
 *  left the browser and what came back. */
const saveGate = vi.hoisted(() => ({
  held: null as Promise<void> | null,
  refusal: null as ApiError | null,
  sentBodies: [] as unknown[],
  answers: [] as VjSetlistDTO[],
}));

vi.mock("../../demo/vjDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../demo/vjDemoStore")>();
  return {
    ...actual,
    demoSetVjSetlistItems: (
      ...args: Parameters<typeof actual.demoSetVjSetlistItems>
    ) => {
      saveGate.sentBodies.push(args[1]);
      const refusal = saveGate.refusal;
      if (refusal !== null) {
        saveGate.refusal = null;
        throw refusal;
      }
      const answerOf = () => {
        const answer = actual.demoSetVjSetlistItems(...args);
        saveGate.answers.push(answer);
        return answer;
      };
      const held = saveGate.held;
      if (held === null) return answerOf();
      return held.then(answerOf);
    },
  };
});

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();
  get length(): number {
    return this.entries.size;
  }
  clear(): void {
    this.entries.clear();
  }
  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.entries.delete(key);
  }
  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

const TEMPO_120: VjTempo = {
  bpm: 120,
  downbeatAt: 0,
  quantize: "off",
  source: "manual",
};

function seededScene(name: string): VjSceneDTO {
  const scene = demoGetVjScenes().items.find(
    (candidate) => candidate.name === name,
  );
  if (scene === undefined) throw new Error(`No seeded scene named ${name}`);
  return scene;
}

function seededClip(title: string): VjClipDTO {
  const clip = demoGetVjClips().items.find(
    (candidate) => candidate.title === title,
  );
  if (clip === undefined) throw new Error(`No seeded clip named ${title}`);
  return clip;
}

function fridaySet(): VjSetlistDTO {
  const setlist = demoGetVjSetlists().items.find(
    (candidate) => candidate.name === "Friday set",
  );
  if (setlist === undefined) throw new Error("No seeded Friday set");
  return setlist;
}

/** The saved steps by name: scene names and clip titles. */
function savedStepNames(): string[] {
  const nameById = new Map<string, string>([
    ...demoGetVjScenes().items.map((scene): [string, string] => [
      scene.id,
      scene.name,
    ]),
    ...demoGetVjClips().items.map((clip): [string, string] => [
      clip.id,
      clip.title,
    ]),
  ]);
  return fridaySet().items.map(
    (item) => nameById.get(item.sceneId ?? item.clipId ?? "") ?? "",
  );
}

function setFridaySteps(items: VjSetlistItemInput[]) {
  demoSetVjSetlistItems(fridaySet().id, { items });
  saveGate.sentBodies = [];
  saveGate.answers = [];
  saveGate.answers = [];
}

function sceneSteps(sceneIds: string[]): VjSetlistItemInput[] {
  return sceneIds.map((sceneId): VjSetlistItemInput => ({
    kind: "scene",
    sceneId,
  }));
}

/** Reads the sequences, scenes and clips the way the panel does and shows
 *  the Friday set's editor. */
function EditorHarness({ tempo }: { tempo: VjTempo | null }) {
  const setlistsQuery = useVjSetlists();
  const scenesQuery = useVjScenes();
  const clipsQuery = useVjClips();
  const clips = clipsQuery.data;
  const clipsById = useMemo(
    () => new Map((clips ?? []).map((clip) => [clip.id, clip])),
    [clips],
  );
  const setlist = setlistsQuery.data?.find(
    (candidate) => candidate.name === "Friday set",
  );
  if (
    setlist === undefined ||
    scenesQuery.data === undefined ||
    clips === undefined
  ) {
    return null;
  }
  return (
    <LoadedEditor
      setlist={setlist}
      scenes={scenesQuery.data}
      clips={clips}
      clipsById={clipsById}
      tempo={tempo}
    />
  );
}

/** The editor with the step sender the row would hand it. */
function LoadedEditor({
  setlist,
  scenes,
  clips,
  clipsById,
  tempo,
}: {
  setlist: VjSetlistDTO;
  scenes: VjSceneDTO[];
  clips: VjClipDTO[];
  clipsById: ReadonlyMap<string, VjClipDTO>;
  tempo: VjTempo | null;
}) {
  const sender = useVjSetlistItemsSender(setlist);
  return (
    <VjSetlistItemsEditor
      setlist={setlist}
      sender={sender}
      stepDuration={setlist.stepDuration}
      scenes={scenes}
      clips={clips}
      clipsById={clipsById}
      tempo={tempo}
    />
  );
}

function renderEditor(tempo: VjTempo | null = null) {
  render(
    <TestProviders>
      <EditorHarness tempo={tempo} />
    </TestProviders>,
  );
}

async function findItemRows(): Promise<HTMLElement[]> {
  const list = await screen.findByRole("list", {
    name: "Steps in Friday set",
  });
  return within(list).getAllByRole("listitem");
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

async function addScene(
  user: ReturnType<typeof userEvent.setup>,
  name: string,
) {
  await user.click(screen.getByRole("button", { name: /Add a scene/ }));
  await user.click(
    await screen.findByRole("option", { name: new RegExp(`^${name}`) }),
  );
  await user.click(screen.getByRole("button", { name: "Add scene" }));
}

async function addClip(
  user: ReturnType<typeof userEvent.setup>,
  title: string,
) {
  await user.click(screen.getByRole("button", { name: /Add a clip/ }));
  await user.click(
    await screen.findByRole("option", { name: new RegExp(`^${title}`) }),
  );
  await user.click(screen.getByRole("button", { name: "Add clip" }));
}

/** The items of the body sent at this index. */
function sentItems(bodyIndex: number): Record<string, unknown>[] {
  return (
    at(saveGate.sentBodies, bodyIndex) as { items: Record<string, unknown>[] }
  ).items;
}

async function openCustomLength(
  user: ReturnType<typeof userEvent.setup>,
  row?: HTMLElement,
) {
  const scope = row === undefined ? screen : within(row);
  await user.click(
    await scope.findByRole("button", {
      name: "Length of Warm up: Default (8 s)",
    }),
  );
  await user.click(
    await screen.findByRole("button", { name: "Custom length" }),
  );
}

function resetEditorDemo() {
  configureVjDemoStore({
    storage: new MemoryStorage(),
    channel: createVjDemoChannelHub().open(),
  });
  resetVjDemoLibrary();
  saveGate.held = null;
  saveGate.refusal = null;
  saveGate.sentBodies = [];
}

describe("VjSetlistItemsEditor rows and adds (demo)", () => {
  beforeEach(resetEditorDemo);

  it("shows each step with its number, kind and length", async () => {
    renderEditor();
    const rows = await findItemRows();
    expect(rows).toHaveLength(4);
    expect(within(at(rows, 0)).getByText("1")).toBeInTheDocument();
    expect(within(at(rows, 0)).getByText("Warm up")).toBeInTheDocument();
    expect(within(at(rows, 0)).getByText("Scene")).toBeInTheDocument();
    expect(within(at(rows, 1)).getByText("Pink tunnel")).toBeInTheDocument();
    expect(within(at(rows, 1)).getByText("Clip")).toBeInTheDocument();
    expect(
      within(at(rows, 0)).getByRole("button", {
        name: "Length of Warm up: Default (8 s)",
      }),
    ).toBeInTheDocument();
    expect(
      within(at(rows, 2)).getByRole("button", {
        name: "Length of Peak: 16 beats",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("4 of 100 steps")).toBeInTheDocument();
    // A step in beats with no tempo known leaves the run time out.
    expect(screen.queryByText(/^Runs /)).toBeNull();
    expect(screen.queryByText(/^About /)).toBeNull();
  });

  it("shows the run time when every step is in seconds", async () => {
    setFridaySteps([
      { kind: "scene", sceneId: seededScene("Warm up").id },
      {
        kind: "clip",
        clipId: seededClip("Pink tunnel").id,
        duration: { kind: "seconds", value: 60 },
      },
    ]);
    renderEditor();
    expect(await screen.findByText("Runs 1 min 8 s")).toBeInTheDocument();
  });

  it("gives a run time under a minute in seconds", async () => {
    setFridaySteps([
      { kind: "scene", sceneId: seededScene("Warm up").id },
      { kind: "clip", clipId: seededClip("Pink tunnel").id },
    ]);
    renderEditor();
    expect(await screen.findByText("Runs 16 s")).toBeInTheDocument();
  });

  it("says why Add scene and Add clip wait for a choice", async () => {
    renderEditor();
    await findItemRows();
    expect(
      screen.getByRole("button", { name: "Add scene" }),
    ).toHaveAccessibleDescription("Choose a scene first");
    expect(
      screen.getByRole("button", { name: "Add clip" }),
    ).toHaveAccessibleDescription("Choose a clip first");
  });

  it("shows the run time at the live tempo for a step in beats", async () => {
    renderEditor(TEMPO_120);
    // 8 s + 8 s + 16 beats at 120 BPM (8 s) + 8 s.
    expect(
      await screen.findByText("About 1 min at 120 BPM"),
    ).toBeInTheDocument();
  });

  it("moves a step down and keeps every item id", async () => {
    const itemIdsBefore = fridaySet().items.map((item) => item.id);
    const user = userEvent.setup();
    renderEditor();
    await user.click(
      await screen.findByRole("button", {
        name: "Move Warm up down in the sequence",
      }),
    );

    await waitFor(() => {
      expect(savedStepNames()).toEqual([
        "Pink tunnel",
        "Warm up",
        "Peak",
        "Disco dots",
      ]);
    });
    const itemIdsAfter = fridaySet().items.map((item) => item.id);
    expect(itemIdsAfter).toEqual([
      itemIdsBefore[1],
      itemIdsBefore[0],
      itemIdsBefore[2],
      itemIdsBefore[3],
    ]);
    const announcement = await screen.findByText("Warm up is now step 2");
    expect(announcement).toHaveAttribute("role", "status");
  });

  it("adds a clip to the end, sending no id for it", async () => {
    const itemIdsBefore = fridaySet().items.map((item) => item.id);
    const user = userEvent.setup();
    renderEditor();
    await findItemRows();
    await addClip(user, "Neon grid");

    await waitFor(() => {
      expect(savedStepNames()).toEqual([
        "Warm up",
        "Pink tunnel",
        "Peak",
        "Disco dots",
        "Neon grid",
      ]);
    });
    expect(
      fridaySet()
        .items.slice(0, 4)
        .map((item) => item.id),
    ).toEqual(itemIdsBefore);
    expect(at(fridaySet().items, 4)).toMatchObject({
      kind: "clip",
      clipId: seededClip("Neon grid").id,
      duration: null,
    });
    const sentBody = at(saveGate.sentBodies, 0) as {
      items: Record<string, unknown>[];
    };
    expect(Object.keys(at(sentBody.items, 4))).not.toContain("id");
    expect(at(sentBody.items, 0)).toHaveProperty("id", itemIdsBefore[0]);
    expect(
      await screen.findByText("Neon grid added as step 5"),
    ).toHaveAttribute("role", "status");
    expect(await findItemRows()).toHaveLength(5);
  });

  it("adds the same scene twice", async () => {
    const user = userEvent.setup();
    renderEditor();
    await findItemRows();
    await addScene(user, "Peak");
    await waitFor(() => {
      expect(savedStepNames()).toHaveLength(5);
    });
    await addScene(user, "Peak");

    await waitFor(() => {
      expect(savedStepNames()).toEqual([
        "Warm up",
        "Pink tunnel",
        "Peak",
        "Disco dots",
        "Peak",
        "Peak",
      ]);
    });
    const rows = await findItemRows();
    expect(rows).toHaveLength(6);
    expect(
      rows.filter((row) => within(row).queryByText("Peak") !== null),
    ).toHaveLength(3);
  });
});

describe("VjSetlistItemsEditor removes and lengths (demo)", () => {
  beforeEach(resetEditorDemo);
  it("removes one of two copies of a scene", async () => {
    const warmUp = seededScene("Warm up");
    const peak = seededScene("Peak");
    setFridaySteps(sceneSteps([warmUp.id, peak.id, warmUp.id]));
    const keptItemId = at(fridaySet().items, 0).id;
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(3);

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove Warm up from Friday set",
    });
    expect(removeButtons).toHaveLength(2);
    await user.click(at(removeButtons, 1));

    await waitFor(() => {
      expect(savedStepNames()).toEqual(["Warm up", "Peak"]);
    });
    expect(at(fridaySet().items, 0).id).toBe(keptItemId);
    expect(
      await screen.findByText("Warm up removed from Friday set"),
    ).toHaveAttribute("role", "status");
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(2);
    });
  });

  it("changes a step's length to seconds, beats and back to default", async () => {
    const warmUpItemId = at(fridaySet().items, 0).id;
    const user = userEvent.setup();
    renderEditor();
    await user.click(
      await screen.findByRole("button", {
        name: "Length of Warm up: Default (8 s)",
      }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Custom length" }),
    );
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toEqual({
        kind: "seconds",
        value: 8,
      });
    });

    const field = await screen.findByRole("textbox", { name: "Length" });
    await user.clear(field);
    await user.type(field, "20{Enter}");
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toEqual({
        kind: "seconds",
        value: 20,
      });
    });

    const kindGroup = screen.getByRole("group", { name: "Length in" });
    await user.click(within(kindGroup).getByRole("button", { name: "Beats" }));
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toEqual({
        kind: "beats",
        value: 16,
      });
    });
    await user.click(await screen.findByRole("button", { name: "32 beats" }));
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toEqual({
        kind: "beats",
        value: 32,
      });
    });

    await user.click(screen.getByRole("button", { name: "Default (8 s)" }));
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toBeNull();
    });
    // Every save kept the step's item.
    expect(at(fridaySet().items, 0).id).toBe(warmUpItemId);
  });

  it("names the range for seconds out of range and sends nothing", async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(
      await screen.findByRole("button", {
        name: "Length of Warm up: Default (8 s)",
      }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Custom length" }),
    );
    await waitFor(() => {
      expect(saveGate.sentBodies).toHaveLength(1);
    });
    const field = await screen.findByRole("textbox", { name: "Length" });
    await user.clear(field);
    await user.type(field, "1{Enter}");

    const reasonText = await screen.findByText(
      "Step lengths run from 2 to 600 seconds, or 4, 8, 16, 32 or 64 beats",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(saveGate.sentBodies).toHaveLength(1);
  });
});

describe("VjSetlistItemsEditor limits and saves (demo)", () => {
  beforeEach(resetEditorDemo);
  it("hides the step count while the sequence is empty", async () => {
    setFridaySteps([]);
    renderEditor();

    expect(
      await screen.findByRole("list", { name: "Steps in Friday set" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/of 100 steps/)).toBeNull();
    expect(
      screen.getByText(
        "No steps in this sequence yet. Add a clip or a scene below",
      ),
    ).toBeInTheDocument();
  });

  it("blocks adding at 100 steps and says why", async () => {
    const warmUp = seededScene("Warm up");
    setFridaySteps(sceneSteps(Array.from({ length: 100 }, () => warmUp.id)));
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(100);

    expect(
      screen.getByText("This sequence is full. Remove a step to add another"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Add a clip/ }));
    await user.click(await screen.findByRole("option", { name: /^Neon grid/ }));
    const addButton = screen.getByRole("button", { name: "Add clip" });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    await user.click(addButton);
    expect(fridaySet().items).toHaveLength(100);
  });

  it("names VJ_SETLIST_FULL from the server", async () => {
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(4);
    // Each save sends the whole list and the editor never sends past 100, so
    // the server's own limit is the only way this refusal comes back.
    saveGate.refusal = vjRefusal("VJ_SETLIST_FULL", {
      setlistId: fridaySet().id,
    });
    await addScene(user, "Peak");

    const reasonText = await screen.findByText(
      "A sequence holds up to 100 steps",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(fridaySet().items).toHaveLength(4);
    expect(await findItemRows()).toHaveLength(4);
  });

  it("keeps every row in place across a save, the new one too", async () => {
    let releaseSaves = () => {};
    const user = userEvent.setup();
    renderEditor();
    const rowsBefore = await findItemRows();
    saveGate.held = new Promise<void>((resolve) => {
      releaseSaves = resolve;
    });
    await addScene(user, "Peak");
    // The new row shows at once, before the server answers.
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(5);
    });
    const rowsWhileSaving = await findItemRows();

    releaseSaves();
    await waitFor(() => {
      expect(fridaySet().items).toHaveLength(5);
    });
    await screen.findByText("Peak added as step 5");
    // The same nodes: no row folded out and back in, the new one included.
    const rowsAfter = await findItemRows();
    rowsBefore.forEach((row, rowIndex) => {
      expect(rowsAfter[rowIndex]).toBe(row);
    });
    expect(rowsAfter[4]).toBe(rowsWhileSaving[4]);
  });

  it("removes two steps in a row before the first save answers", async () => {
    const warmUp = seededScene("Warm up");
    const peak = seededScene("Peak");
    setFridaySteps(sceneSteps([warmUp.id, peak.id, warmUp.id]));
    const peakItemId = at(fridaySet().items, 1).id;
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(3);

    let releaseSaves = () => {};
    saveGate.held = new Promise<void>((resolve) => {
      releaseSaves = resolve;
    });
    await user.click(
      at(
        screen.getAllByRole("button", {
          name: "Remove Warm up from Friday set",
        }),
        0,
      ),
    );
    // The row leaves at once, before the server answers.
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(2);
    });
    const remainingWarmUps = screen.getAllByRole("button", {
      name: "Remove Warm up from Friday set",
    });
    await user.click(at(remainingWarmUps, remainingWarmUps.length - 1));
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(1);
    });

    releaseSaves();
    await waitFor(() => {
      expect(savedStepNames()).toEqual(["Peak"]);
    });
    expect(at(fridaySet().items, 0).id).toBe(peakItemId);
    expect(await findItemRows()).toHaveLength(1);
  });
});

describe("VjSetlistItemsEditor ids across saves (demo)", () => {
  beforeEach(resetEditorDemo);

  it("sends a swap of two same steps, then the right ids for an edit", async () => {
    const warmUp = seededScene("Warm up");
    setFridaySteps(sceneSteps([warmUp.id, warmUp.id, seededScene("Peak").id]));
    const [firstId, secondId, thirdId] = fridaySet().items.map(
      (item) => item.id,
    );
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(3);
    await user.click(
      at(
        screen.getAllByRole("button", {
          name: "Move Warm up down in the sequence",
        }),
        0,
      ),
    );
    await waitFor(() => {
      expect(saveGate.sentBodies).toHaveLength(1);
    });
    expect(sentItems(0).map((entry) => entry.id)).toEqual([
      secondId,
      firstId,
      thirdId,
    ]);
    await waitFor(() => {
      expect(fridaySet().items.map((item) => item.id)).toEqual([
        secondId,
        firstId,
        thirdId,
      ]);
    });

    // The step now first is the one stored second: its length changes.
    await openCustomLength(user, at(await findItemRows(), 0));
    await waitFor(() => {
      expect(saveGate.sentBodies).toHaveLength(2);
    });
    expect(at(sentItems(1), 0)).toMatchObject({
      id: secondId,
      duration: { kind: "seconds", value: 8 },
    });
    expect(at(sentItems(1), 1)).toMatchObject({ id: firstId, duration: null });
    await waitFor(() => {
      expect(at(fridaySet().items, 0)).toMatchObject({
        id: secondId,
        duration: { kind: "seconds", value: 8 },
      });
    });
  });

  it("keeps an added clip's item when a length changes while it saves", async () => {
    let releaseSaves = () => {};
    saveGate.held = new Promise<void>((resolve) => {
      releaseSaves = resolve;
    });
    const user = userEvent.setup();
    renderEditor();
    await findItemRows();
    await addClip(user, "Neon grid");
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(5);
    });
    await openCustomLength(user);
    // The length change waits for the add to answer.
    expect(saveGate.sentBodies).toHaveLength(1);

    releaseSaves();
    await waitFor(() => {
      expect(saveGate.sentBodies).toHaveLength(2);
    });
    const addedItemId = at(at(saveGate.answers, 0).items, 4).id;
    expect(at(sentItems(1), 4)).toMatchObject({
      id: addedItemId,
      kind: "clip",
    });
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toEqual({
        kind: "seconds",
        value: 8,
      });
    });
    expect(at(fridaySet().items, 4).id).toBe(addedItemId);
    expect(
      await screen.findByText("Warm up now plays for 8 s"),
    ).toHaveAttribute("role", "status");
  });

  it("sends a second remove only once the first answers", async () => {
    const warmUp = seededScene("Warm up");
    const peak = seededScene("Peak");
    setFridaySteps(sceneSteps([warmUp.id, peak.id, warmUp.id]));
    const peakItemId = at(fridaySet().items, 1).id;
    let releaseSaves = () => {};
    saveGate.held = new Promise<void>((resolve) => {
      releaseSaves = resolve;
    });
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(3);
    const removeButtons = screen.getAllByRole("button", {
      name: "Remove Warm up from Friday set",
    });
    await user.click(at(removeButtons, 0));
    await user.click(at(removeButtons, 1));
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(1);
    });
    // One save runs at a time, so the answers can only land in order.
    expect(saveGate.sentBodies).toHaveLength(1);

    releaseSaves();
    await waitFor(() => {
      expect(saveGate.sentBodies).toHaveLength(2);
    });
    expect(sentItems(1)).toEqual([
      { id: peakItemId, kind: "scene", sceneId: peak.id, duration: null },
    ]);
    await waitFor(() => {
      expect(savedStepNames()).toEqual(["Peak"]);
    });
    expect(at(saveGate.answers, 1).items.map((item) => item.id)).toEqual([
      peakItemId,
    ]);
  });
});

describe("VjStepDurationPicker seconds field (demo)", () => {
  beforeEach(resetEditorDemo);

  async function openSecondsField(user: ReturnType<typeof userEvent.setup>) {
    await openCustomLength(user);
    await waitFor(() => {
      expect(saveGate.sentBodies).toHaveLength(1);
    });
    return screen.findByRole("textbox", { name: "Length" });
  }

  it("commits the seconds on blur", async () => {
    const user = userEvent.setup();
    renderEditor();
    const field = await openSecondsField(user);
    await user.clear(field);
    await user.type(field, "30");
    await user.tab();
    await waitFor(() => {
      expect(at(fridaySet().items, 0).duration).toEqual({
        kind: "seconds",
        value: 30,
      });
    });
  });

  it("puts the saved seconds back on Escape and sends nothing", async () => {
    const user = userEvent.setup();
    renderEditor();
    const field = await openSecondsField(user);
    await user.clear(field);
    await user.type(field, "45{Escape}");
    expect(field).toHaveValue("8");
    expect(saveGate.sentBodies).toHaveLength(1);
  });

  it("puts the saved seconds back on a blur out of range and names it", async () => {
    const user = userEvent.setup();
    renderEditor();
    const field = await openSecondsField(user);
    await user.clear(field);
    await user.type(field, "1");
    await user.tab();

    expect(field).toHaveValue("8");
    expect(field).not.toHaveAttribute("aria-invalid", "true");
    const reasonText = await screen.findByText(
      "Step lengths run from 2 to 600 seconds, or 4, 8, 16, 32 or 64 beats",
    );
    const reasonLine = reasonText.closest('[role="alert"]');
    expect(reasonLine).not.toBeNull();
    expect(field.getAttribute("aria-describedby")).toContain(
      reasonLine?.id ?? "missing",
    );
    expect(saveGate.sentBodies).toHaveLength(1);
  });

  it("marks the field invalid when Enter sends a value out of range", async () => {
    const user = userEvent.setup();
    renderEditor();
    const field = await openSecondsField(user);
    await user.clear(field);
    await user.type(field, "900{Enter}");
    expect(field).toHaveValue("900");
    expect(field).toHaveAttribute("aria-invalid", "true");
    expect(saveGate.sentBodies).toHaveLength(1);
  });
});
