import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ApiError } from "../../../../shared/api/client";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type {
  VjClipDTO,
  VjSceneDTO,
  VjSetlistDTO,
} from "../../../../shared/contracts/vj";
import { useVjScenes } from "../../api/useVjScenes";
import { useVjSetlists } from "../../api/useVjSetlists";
import { createVjDemoChannelHub } from "../../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjScenes,
  demoGetVjSetlists,
  demoSetVjSetlistItems,
  resetVjDemoLibrary,
} from "../../demo/vjDemoStore";
import { vjRefusal } from "../../demo/vjDemoRefusals";
import { VjSetlistItemsEditor } from "./VjSetlistItemsEditor";

/** While `held` is set, item saves from the editor wait for it, so a test can
 *  click again before the first save answers. While `refusal` is set, the
 *  next item save throws it the way the API would. */
const saveGate = vi.hoisted(() => ({
  held: null as Promise<void> | null,
  refusal: null as ApiError | null,
}));

vi.mock("../../demo/vjDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../demo/vjDemoStore")>();
  return {
    ...actual,
    demoSetVjSetlistItems: (
      ...args: Parameters<typeof actual.demoSetVjSetlistItems>
    ) => {
      const refusal = saveGate.refusal;
      if (refusal !== null) {
        saveGate.refusal = null;
        throw refusal;
      }
      const held = saveGate.held;
      if (held === null) return actual.demoSetVjSetlistItems(...args);
      return held.then(() => actual.demoSetVjSetlistItems(...args));
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

const CLIPS_BY_ID = new Map<string, VjClipDTO>();

function seededScene(name: string): VjSceneDTO {
  const scene = demoGetVjScenes().items.find(
    (candidate) => candidate.name === name,
  );
  if (scene === undefined) throw new Error(`No seeded scene named ${name}`);
  return scene;
}

function fridaySet(): VjSetlistDTO {
  const setlist = demoGetVjSetlists().items.find(
    (candidate) => candidate.name === "Friday set",
  );
  if (setlist === undefined) throw new Error("No seeded Friday set");
  return setlist;
}

function savedSceneNames(): string[] {
  const nameById = new Map(
    demoGetVjScenes().items.map((scene) => [scene.id, scene.name]),
  );
  return fridaySet().items.map((item) => nameById.get(item.sceneId) ?? "");
}

/** Reads the set lists and scenes the way the panel does and shows the
 *  Friday set's editor. */
function EditorHarness() {
  const setlistsQuery = useVjSetlists();
  const scenesQuery = useVjScenes();
  const setlist = setlistsQuery.data?.find(
    (candidate) => candidate.name === "Friday set",
  );
  if (setlist === undefined || scenesQuery.data === undefined) return null;
  return (
    <VjSetlistItemsEditor
      setlist={setlist}
      scenes={scenesQuery.data}
      clipsById={CLIPS_BY_ID}
    />
  );
}

function renderEditor() {
  render(
    <TestProviders>
      <EditorHarness />
    </TestProviders>,
  );
}

async function findItemRows(): Promise<HTMLElement[]> {
  const list = await screen.findByRole("list", {
    name: "Scenes in Friday set",
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

describe("VjSetlistItemsEditor (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
    saveGate.held = null;
    saveGate.refusal = null;
  });

  it("shows the scenes in order with their numbers", async () => {
    renderEditor();
    const rows = await findItemRows();
    expect(rows).toHaveLength(2);
    expect(within(at(rows, 0)).getByText("1")).toBeInTheDocument();
    expect(within(at(rows, 0)).getByText("Warm up")).toBeInTheDocument();
    expect(within(at(rows, 1)).getByText("2")).toBeInTheDocument();
    expect(within(at(rows, 1)).getByText("Peak")).toBeInTheDocument();
    expect(screen.getByText("2 of 100 scenes")).toBeInTheDocument();
  });

  it("moves a scene down and saves the full scene list", async () => {
    const user = userEvent.setup();
    renderEditor();
    await user.click(
      await screen.findByRole("button", {
        name: "Move Warm up down in the set list",
      }),
    );

    await waitFor(() => {
      expect(savedSceneNames()).toEqual(["Peak", "Warm up"]);
    });
    const announcement = await screen.findByText("Warm up is now number 2");
    expect(announcement).toHaveAttribute("role", "status");
  });

  it("adds a scene to the end", async () => {
    const user = userEvent.setup();
    renderEditor();
    await findItemRows();
    await addScene(user, "Warm up");

    await waitFor(() => {
      expect(savedSceneNames()).toEqual(["Warm up", "Peak", "Warm up"]);
    });
    expect(
      await screen.findByText("Warm up added as number 3"),
    ).toHaveAttribute("role", "status");
    expect(await findItemRows()).toHaveLength(3);
  });

  it("adds the same scene twice", async () => {
    const user = userEvent.setup();
    renderEditor();
    await findItemRows();
    await addScene(user, "Peak");
    await waitFor(() => {
      expect(savedSceneNames()).toHaveLength(3);
    });
    await addScene(user, "Peak");

    await waitFor(() => {
      expect(savedSceneNames()).toEqual(["Warm up", "Peak", "Peak", "Peak"]);
    });
    const rows = await findItemRows();
    expect(rows).toHaveLength(4);
    expect(
      rows.filter((row) => within(row).queryByText("Peak") !== null),
    ).toHaveLength(3);
  });

  it("removes one of two copies of a scene", async () => {
    const warmUp = seededScene("Warm up");
    const peak = seededScene("Peak");
    demoSetVjSetlistItems(fridaySet().id, {
      sceneIds: [warmUp.id, peak.id, warmUp.id],
    });
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(3);

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove Warm up from Friday set",
    });
    expect(removeButtons).toHaveLength(2);
    await user.click(at(removeButtons, 1));

    await waitFor(() => {
      expect(savedSceneNames()).toEqual(["Warm up", "Peak"]);
    });
    expect(
      await screen.findByText("Warm up removed from Friday set"),
    ).toHaveAttribute("role", "status");
    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(2);
    });
  });

  it("hides the scene count while the set list is empty", async () => {
    demoSetVjSetlistItems(fridaySet().id, { sceneIds: [] });
    renderEditor();

    expect(
      await screen.findByRole("list", { name: "Scenes in Friday set" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/of 100 scenes/)).toBeNull();
  });

  it("blocks adding at 100 scenes and says why", async () => {
    const warmUp = seededScene("Warm up");
    demoSetVjSetlistItems(fridaySet().id, {
      sceneIds: Array.from({ length: 100 }, () => warmUp.id),
    });
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(100);

    expect(
      screen.getByText("This set list is full. Remove a scene to add another"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Add a scene/ }));
    await user.click(await screen.findByRole("option", { name: /^Peak/ }));
    const addButton = screen.getByRole("button", { name: "Add scene" });
    expect(addButton).toHaveAttribute("aria-disabled", "true");
    await user.click(addButton);
    expect(fridaySet().items).toHaveLength(100);
  });

  it("names VJ_SETLIST_FULL from the server", async () => {
    const user = userEvent.setup();
    renderEditor();
    expect(await findItemRows()).toHaveLength(2);
    // Each save sends the whole list and the editor never sends past 100, so
    // the server's own limit is the only way this refusal comes back.
    saveGate.refusal = vjRefusal("VJ_SETLIST_FULL", {
      setlistId: fridaySet().id,
    });
    await addScene(user, "Peak");

    const reasonText = await screen.findByText(
      "A set list holds up to 100 scenes",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(fridaySet().items).toHaveLength(2);
    expect(await findItemRows()).toHaveLength(2);
  });

  it("keeps rows in place after a save returns new item ids", async () => {
    const user = userEvent.setup();
    renderEditor();
    const rowsBefore = await findItemRows();
    const itemIdsBefore = fridaySet().items.map((item) => item.id);
    await addScene(user, "Peak");

    await waitFor(async () => {
      expect(await findItemRows()).toHaveLength(3);
    });
    const itemIdsAfter = fridaySet().items.map((item) => item.id);
    expect(itemIdsAfter.slice(0, 2)).not.toEqual(itemIdsBefore);
    // The same nodes: no row folded out and back in.
    const rowsAfter = await findItemRows();
    expect(rowsAfter[0]).toBe(rowsBefore[0]);
    expect(rowsAfter[1]).toBe(rowsBefore[1]);
  });

  it("removes two scenes in a row before the first save answers", async () => {
    const warmUp = seededScene("Warm up");
    const peak = seededScene("Peak");
    demoSetVjSetlistItems(fridaySet().id, {
      sceneIds: [warmUp.id, peak.id, warmUp.id],
    });
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
      expect(savedSceneNames()).toEqual(["Peak"]);
    });
    expect(await findItemRows()).toHaveLength(1);
  });
});
