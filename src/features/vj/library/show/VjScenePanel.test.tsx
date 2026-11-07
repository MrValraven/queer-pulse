import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { VjClipDTO, VjSceneDTO } from "../../../../shared/contracts/vj";
import { vjKeys } from "../../api/vjKeys";
import { createVjDemoChannelHub } from "../../demo/vjDemoChannel";
import { vjRefusal } from "../../demo/vjDemoRefusals";
import {
  configureVjDemoStore,
  demoDeleteVjScene,
  demoGetVjClips,
  demoGetVjPacks,
  demoGetVjScenes,
  demoReorderVjScenes,
  demoUpdateVjScene,
  resetVjDemoLibrary,
} from "../../demo/vjDemoStore";
import { VjScenePanel } from "./VjScenePanel";

// The writes keep the store's own behaviour; a test swaps one answer when it
// needs a refusal, and reads the calls to see what was sent.
vi.mock("../../demo/vjDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../demo/vjDemoStore")>();
  return {
    ...actual,
    demoUpdateVjScene: vi.fn(actual.demoUpdateVjScene),
    demoReorderVjScenes: vi.fn(actual.demoReorderVjScenes),
    demoDeleteVjScene: vi.fn(actual.demoDeleteVjScene),
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

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderScenePanel(queryClient: QueryClient = createQueryClient()) {
  const clipsById = new Map<string, VjClipDTO>(
    demoGetVjClips().items.map((clip) => [clip.id, clip]),
  );
  render(
    <TestProviders queryClient={queryClient}>
      <VjScenePanel packs={demoGetVjPacks().items} clipsById={clipsById} />
    </TestProviders>,
  );
  return { queryClient };
}

function seededSceneNamed(name: string): VjSceneDTO {
  const scene = demoGetVjScenes().items.find(
    (candidate) => candidate.name === name,
  );
  if (scene === undefined) throw new Error(`No seeded scene named ${name}`);
  return scene;
}

async function findSceneList(): Promise<HTMLElement> {
  return screen.findByRole("list", { name: "Scenes in order" });
}

/** The scene names in the order the list shows them, read from each row's
 *  Edit button. */
function shownSceneNames(list: HTMLElement): string[] {
  return within(list)
    .getAllByRole("listitem")
    .map((row) =>
      within(row)
        .getByRole("button", { name: /^Edit / })
        .getAttribute("aria-label")
        ?.replace(/^Edit /, ""),
    )
    .filter((name): name is string => name !== undefined);
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

describe("VjScenePanel (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
    vi.mocked(demoUpdateVjScene).mockClear();
    vi.mocked(demoReorderVjScenes).mockClear();
    vi.mocked(demoDeleteVjScene).mockClear();
  });

  it("lists scenes with their source and effects", async () => {
    renderScenePanel();
    const list = await findSceneList();
    expect(shownSceneNames(list)).toEqual(["Warm up", "Peak"]);

    const rows = within(list).getAllByRole("listitem");
    const warmUpRow = at(rows, 0);
    const peakRow = at(rows, 1);
    expect(within(warmUpRow).getByText("Clip: Warm haze")).toBeInTheDocument();
    expect(within(warmUpRow).getByText("Tint")).toBeInTheDocument();
    expect(within(warmUpRow).getByText("Warm-up")).toBeInTheDocument();
    expect(
      within(peakRow).getByText("Generator: Pride flag wave"),
    ).toBeInTheDocument();
    expect(
      within(peakRow).getByText("Kaleidoscope and Beat pulse"),
    ).toBeInTheDocument();
    expect(within(peakRow).getByText("Peak hour")).toBeInTheDocument();
    expect(screen.getByText("2 of 200")).toBeInTheDocument();
  });

  it("moves a scene down and saves the full order", async () => {
    const user = userEvent.setup();
    const warmUp = seededSceneNamed("Warm up");
    const peak = seededSceneNamed("Peak");
    renderScenePanel();
    await user.click(
      await screen.findByRole("button", { name: "Move Warm up down" }),
    );

    await waitFor(() => {
      expect(vi.mocked(demoReorderVjScenes)).toHaveBeenCalledWith({
        sceneIds: [peak.id, warmUp.id],
      });
    });
    const announcement = await screen.findByText("Warm up is now scene 2");
    expect(announcement).toHaveAttribute("role", "status");
    expect(demoGetVjScenes().items.map((scene) => scene.name)).toEqual([
      "Peak",
      "Warm up",
    ]);
  });

  it("names a refused reorder and puts the old order back", async () => {
    const user = userEvent.setup();
    vi.mocked(demoReorderVjScenes).mockImplementationOnce(() => {
      throw vjRefusal("VJ_SCENE_REORDER_MISMATCH");
    });
    const queryClient = createQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    renderScenePanel(queryClient);
    await user.click(
      await screen.findByRole("button", { name: "Move Warm up down" }),
    );

    const reasonText = await screen.findByText(
      "The new order must list every scene once",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    await waitFor(async () => {
      expect(shownSceneNames(await findSceneList())).toEqual([
        "Warm up",
        "Peak",
      ]);
    });
    const invalidatedKeys = invalidateSpy.mock.calls.map(
      (call) => (call[0] as { queryKey?: unknown } | undefined)?.queryKey,
    );
    expect(invalidatedKeys).toContainEqual(vjKeys.scenes(true));
  });

  it("renames a scene", async () => {
    const user = userEvent.setup();
    const warmUp = seededSceneNamed("Warm up");
    renderScenePanel();
    await user.click(
      await screen.findByRole("button", { name: "Edit Warm up" }),
    );
    const field = await screen.findByLabelText("Scene name");
    await user.clear(field);
    await user.type(field, "Doors open");
    await user.click(screen.getByRole("button", { name: "Save scene" }));

    expect(await screen.findByText("Scene saved")).toBeInTheDocument();
    expect(vi.mocked(demoUpdateVjScene).mock.calls[0]).toEqual([
      warmUp.id,
      { name: "Doors open" },
    ]);
    const editButton = await screen.findByRole("button", {
      name: "Edit Doors open",
    });
    await waitFor(() => {
      expect(editButton).toHaveFocus();
    });
  });

  it("moves a scene to no pack", async () => {
    const user = userEvent.setup();
    const peak = seededSceneNamed("Peak");
    renderScenePanel();
    await user.click(await screen.findByRole("button", { name: "Edit Peak" }));
    await user.click(await screen.findByRole("button", { name: /^Pack/ }));
    const listbox = await screen.findByRole("listbox");
    await user.click(within(listbox).getByRole("option", { name: /No pack/ }));
    await user.click(screen.getByRole("button", { name: "Save scene" }));

    expect(await screen.findByText("Scene saved")).toBeInTheDocument();
    expect(vi.mocked(demoUpdateVjScene).mock.calls[0]).toEqual([
      peak.id,
      { packId: null },
    ]);
    expect(seededSceneNamed("Peak").packId).toBeNull();
  });

  it("refuses a blank name before sending", async () => {
    const user = userEvent.setup();
    renderScenePanel();
    await user.click(await screen.findByRole("button", { name: "Edit Peak" }));
    const field = await screen.findByLabelText("Scene name");
    await user.clear(field);
    await user.type(field, "   ");
    await user.click(screen.getByRole("button", { name: "Save scene" }));

    const reasonText = await screen.findByText("Give the scene a name");
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(vi.mocked(demoUpdateVjScene)).not.toHaveBeenCalled();
  });

  it("counts the set list spots in the delete dialog", async () => {
    const user = userEvent.setup();
    expect(seededSceneNamed("Warm up").setlistItemCount).toBe(1);
    renderScenePanel();
    await user.click(
      await screen.findByRole("button", { name: "Delete Warm up" }),
    );

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        "The scene leaves the library and 1 spot in a set list",
      ),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: "Cancel" }),
    ).toHaveFocus();
  });

  it("deletes a scene and folds its row away", async () => {
    const user = userEvent.setup();
    const warmUp = seededSceneNamed("Warm up");
    renderScenePanel();
    await user.click(
      await screen.findByRole("button", { name: "Delete Warm up" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete scene" }),
    );

    expect(await screen.findByText("Warm up deleted")).toBeInTheDocument();
    expect(vi.mocked(demoDeleteVjScene)).toHaveBeenCalledWith(warmUp.id);
    await waitFor(async () => {
      expect(shownSceneNames(await findSceneList())).toEqual(["Peak"]);
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  it("shows the empty state with the remote hint", async () => {
    for (const scene of demoGetVjScenes().items) {
      demoDeleteVjScene(scene.id);
    }
    renderScenePanel();

    expect(await screen.findByText("No scenes yet")).toBeInTheDocument();
    expect(
      screen.getByText("Open the remote, set up a look and save it as a scene"),
    ).toBeInTheDocument();
    expect(screen.getByText("0 of 200")).toBeInTheDocument();
  });
});
