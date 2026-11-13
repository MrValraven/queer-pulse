import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMemo } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiError } from "../../../../shared/api/client";
import { TestProviders } from "../../../../test/TestProviders";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { useVjClips } from "../../api/useVjClips";
import { createVjDemoChannelHub } from "../../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoCreateVjSetlist,
  demoGetVjClips,
  demoGetVjScenes,
  demoGetVjSetlists,
  resetVjDemoLibrary,
} from "../../demo/vjDemoStore";
import { vjRefusal } from "../../demo/vjDemoRefusals";
import { VjClipDeleteDialog } from "../VjClipDeleteDialog";
import { VjSetlistPanel } from "./VjSetlistPanel";

/** While `refusal` is set, the next settings save waits for `held` (when
 *  set) and then throws it the way the API would, so a test can see the
 *  value sent and then the roll back. */
const updateGate = vi.hoisted(() => ({
  held: null as Promise<void> | null,
  refusal: null as ApiError | null,
}));

vi.mock("../../demo/vjDemoStore", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../demo/vjDemoStore")>();
  return {
    ...actual,
    demoUpdateVjSetlist: (
      ...args: Parameters<typeof actual.demoUpdateVjSetlist>
    ) => {
      const refusal = updateGate.refusal;
      if (refusal === null) return actual.demoUpdateVjSetlist(...args);
      updateGate.refusal = null;
      return (updateGate.held ?? Promise.resolve()).then(() => {
        throw refusal;
      });
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

/** Feeds the panel the clip map the way the library page does. */
function PanelHarness() {
  const clips = useVjClips().data;
  const clipsById = useMemo(
    () =>
      new Map<string, VjClipDTO>((clips ?? []).map((clip) => [clip.id, clip])),
    [clips],
  );
  return <VjSetlistPanel clipsById={clipsById} />;
}

function renderPanel() {
  render(
    <TestProviders>
      <PanelHarness />
    </TestProviders>,
  );
}

function fridaySet() {
  const setlist = demoGetVjSetlists().items.find(
    (candidate) => candidate.name === "Friday set",
  );
  if (setlist === undefined) throw new Error("No seeded Friday set");
  return setlist;
}

function seededClip(title: string): VjClipDTO {
  const clip = demoGetVjClips().items.find(
    (candidate) => candidate.title === title,
  );
  if (clip === undefined) throw new Error(`No seeded clip named ${title}`);
  return clip;
}

function savedSetlistNames(): string[] {
  return demoGetVjSetlists().items.map((setlist) => setlist.name);
}

async function findSetlistList(): Promise<HTMLElement> {
  return screen.findByRole("list", { name: "Sequences in order" });
}

function at<Item>(items: readonly Item[], index: number): Item {
  const item = items[index];
  if (item === undefined) throw new Error(`no element at index ${index}`);
  return item;
}

describe("VjSetlistPanel (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
    updateGate.held = null;
    updateGate.refusal = null;
  });

  it("lists sequences with their step counts", async () => {
    renderPanel();
    const list = await findSetlistList();
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(within(at(rows, 0)).getByText("Friday set")).toBeInTheDocument();
    expect(within(at(rows, 0)).getByText("4 steps")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Sequences" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 50")).toBeInTheDocument();
  });

  it("creates a sequence and opens its steps", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "New sequence" }));
    await user.type(await screen.findByLabelText("Sequence name"), "Encore");
    await user.click(screen.getByRole("button", { name: "Create sequence" }));

    expect(await screen.findByText("Encore created")).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual(["Friday set", "Encore"]);
    expect(
      await screen.findByRole("list", { name: "Steps in Encore" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit the steps in Encore" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "New sequence" })).toHaveFocus();
  });

  it("names a taken sequence name", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "New sequence" }));
    await user.type(
      await screen.findByLabelText("Sequence name"),
      "friday SET",
    );
    await user.click(screen.getByRole("button", { name: "Create sequence" }));

    const reasonText = await screen.findByText(
      "Another sequence already has this name",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(savedSetlistNames()).toEqual(["Friday set"]);
  });

  it("renames a sequence", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "Rename Friday set" }));
    const field = await screen.findByLabelText("Sequence name");
    expect(field).toHaveValue("Friday set");
    await user.clear(field);
    await user.type(field, "Late set");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(
      await screen.findByText("Sequence renamed to Late set"),
    ).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual(["Late set"]);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Rename Late set" }),
      ).toHaveFocus();
    });
  });

  it("reorders sequences with the up button", async () => {
    demoCreateVjSetlist({ name: "Saturday set" });
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(
      await screen.findByRole("button", { name: "Move Saturday set up" }),
    );

    await waitFor(() => {
      expect(savedSetlistNames()).toEqual(["Saturday set", "Friday set"]);
    });
    const announcement = await screen.findByText(
      "Saturday set is now sequence 1",
    );
    expect(announcement).toHaveAttribute("role", "status");
  });

  it("reads the sequences again when the order no longer matches", async () => {
    demoCreateVjSetlist({ name: "Saturday set" });
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    // Another tab adds a sequence this tab has not read yet.
    demoCreateVjSetlist({ name: "Sunday set" });
    await user.click(
      screen.getByRole("button", { name: "Move Friday set down" }),
    );

    const reasonText = await screen.findByText(
      "The new order must list every sequence once",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(await screen.findByText("Sunday set")).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual([
      "Friday set",
      "Saturday set",
      "Sunday set",
    ]);
  });

  it("deletes a sequence and keeps its clips and scenes", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "Delete Friday set" }));
    expect(
      await screen.findByText("The clips and scenes in it stay in the library"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete sequence" }));

    expect(await screen.findByText("Friday set deleted")).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual([]);
    expect(demoGetVjScenes().items).toHaveLength(2);
    expect(demoGetVjClips().items).toHaveLength(8);
    expect(await screen.findByText("No sequences yet")).toBeInTheDocument();
  });

  it("names the 50 sequence cap before sending", async () => {
    for (let setlistIndex = 1; setlistIndex < 50; setlistIndex += 1) {
      demoCreateVjSetlist({ name: `Set ${setlistIndex}` });
    }
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    const opener = screen.getByRole("button", { name: "New sequence" });
    expect(opener).toHaveAttribute("aria-disabled", "true");
    await user.click(opener);

    const reasonText = await screen.findByText(
      "The library holds up to 50 sequences",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(screen.queryByLabelText("Sequence name")).not.toBeInTheDocument();
    expect(savedSetlistNames()).toHaveLength(50);
  });
  it("turns Loop off from the sequence settings", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(
      screen.getByRole("button", { name: "Edit the steps in Friday set" }),
    );
    expect(
      await screen.findByRole("heading", { name: "Settings for Friday set" }),
    ).toBeInTheDocument();
    const loopSwitch = await screen.findByRole("switch", { name: "Loop" });
    expect(loopSwitch).toHaveAttribute("aria-checked", "true");
    await user.click(loopSwitch);

    await waitFor(() => {
      expect(fridaySet().isLooping).toBe(false);
    });
    expect(await screen.findByText("Sequence settings saved")).toHaveAttribute(
      "role",
      "status",
    );
    expect(screen.getByRole("switch", { name: "Loop" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("sets the default step length to beats", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(
      screen.getByRole("button", { name: "Edit the steps in Friday set" }),
    );
    const defaultLength = await screen.findByRole("group", {
      name: "Default step length",
    });
    await user.click(
      within(defaultLength).getByRole("button", { name: "Beats" }),
    );
    await waitFor(() => {
      expect(fridaySet().stepDuration).toEqual({ kind: "beats", value: 16 });
    });
    await user.click(await screen.findByRole("button", { name: "8 beats" }));
    await waitFor(() => {
      expect(fridaySet().stepDuration).toEqual({ kind: "beats", value: 8 });
    });
    // Steps on the default length now read the new default.
    expect(
      await screen.findByRole("button", {
        name: "Length of Warm up: Default (8 beats)",
      }),
    ).toBeInTheDocument();
  });
});

describe("VjSetlistSettings refusals (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
    updateGate.held = null;
    updateGate.refusal = null;
  });

  async function openFridaySteps(user: ReturnType<typeof userEvent.setup>) {
    renderPanel();
    await findSetlistList();
    await user.click(
      screen.getByRole("button", { name: "Edit the steps in Friday set" }),
    );
  }

  function holdSaves(): () => void {
    let release = () => {};
    updateGate.held = new Promise<void>((resolve) => {
      release = resolve;
    });
    return () => release();
  }

  it("rolls Loop back and names a refusal", async () => {
    const user = userEvent.setup();
    await openFridaySteps(user);
    const releaseSaves = holdSaves();
    updateGate.refusal = vjRefusal("VJ_SETLIST_LOOP_INVALID");
    await user.click(await screen.findByRole("switch", { name: "Loop" }));
    // The value sent shows while the save runs.
    expect(screen.getByRole("switch", { name: "Loop" })).toHaveAttribute(
      "aria-checked",
      "false",
    );

    releaseSaves();
    const reasonText = await screen.findByText("Loop has to be on or off");
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    await waitFor(() => {
      expect(screen.getByRole("switch", { name: "Loop" })).toHaveAttribute(
        "aria-checked",
        "true",
      );
    });
    expect(fridaySet().isLooping).toBe(true);
  });

  it("rolls the default length back and names a refusal", async () => {
    const user = userEvent.setup();
    await openFridaySteps(user);
    const releaseSaves = holdSaves();
    updateGate.refusal = vjRefusal("VJ_SETLIST_STEP_DURATION_INVALID");
    const defaultLength = await screen.findByRole("group", {
      name: "Default step length",
    });
    await user.click(
      within(defaultLength).getByRole("button", { name: "Beats" }),
    );
    expect(
      within(defaultLength).getByRole("button", { name: "Beats" }),
    ).toHaveAttribute("aria-pressed", "true");

    releaseSaves();
    const reasonText = await screen.findByText(
      "Step lengths run from 2 to 600 seconds, or 4, 8, 16, 32 or 64 beats",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    await waitFor(() => {
      expect(
        within(defaultLength).getByRole("button", { name: "Seconds" }),
      ).toHaveAttribute("aria-pressed", "true");
    });
    expect(fridaySet().stepDuration).toEqual({ kind: "seconds", value: 8 });
  });
});

describe("VjClipDeleteDialog (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  function renderDialog(clip: VjClipDTO) {
    render(
      <TestProviders>
        <VjClipDeleteDialog
          clip={clip}
          onClose={() => {}}
          onDeleted={() => {}}
        />
      </TestProviders>,
    );
  }

  it("says how many sequence steps the clip leaves", async () => {
    const pinkTunnel = seededClip("Pink tunnel");
    expect(pinkTunnel.setlistItemCount).toBe(1);
    renderDialog(pinkTunnel);
    expect(
      await screen.findByText(/It's also removed from Friday set \(1 step\)/),
    ).toBeInTheDocument();
  });

  it("leaves the sequence note out for a clip in no sequence", async () => {
    const neonGrid = seededClip("Neon grid");
    expect(neonGrid.setlistItemCount).toBe(0);
    renderDialog(neonGrid);
    expect(
      await screen.findByRole("button", { name: "Delete clip" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/also removed from|also leaves/)).toBeNull();
  });
});
