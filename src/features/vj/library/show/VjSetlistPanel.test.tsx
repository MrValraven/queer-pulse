import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { createVjDemoChannelHub } from "../../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoCreateVjSetlist,
  demoGetVjScenes,
  demoGetVjSetlists,
  resetVjDemoLibrary,
} from "../../demo/vjDemoStore";
import { VjSetlistPanel } from "./VjSetlistPanel";

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

function renderPanel() {
  render(
    <TestProviders>
      <VjSetlistPanel clipsById={CLIPS_BY_ID} />
    </TestProviders>,
  );
}

function savedSetlistNames(): string[] {
  return demoGetVjSetlists().items.map((setlist) => setlist.name);
}

async function findSetlistList(): Promise<HTMLElement> {
  return screen.findByRole("list", { name: "Set lists in order" });
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
  });

  it("lists set lists with their scene counts", async () => {
    renderPanel();
    const list = await findSetlistList();
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(1);
    expect(within(at(rows, 0)).getByText("Friday set")).toBeInTheDocument();
    expect(within(at(rows, 0)).getByText("2 scenes")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Set lists" }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 of 50")).toBeInTheDocument();
  });

  it("creates a set list and opens its scenes", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "New set list" }));
    await user.type(await screen.findByLabelText("Set list name"), "Encore");
    await user.click(screen.getByRole("button", { name: "Create set list" }));

    expect(await screen.findByText("Encore created")).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual(["Friday set", "Encore"]);
    expect(
      await screen.findByRole("list", { name: "Scenes in Encore" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Edit the scenes in Encore" }),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "New set list" })).toHaveFocus();
  });

  it("names a taken set list name", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "New set list" }));
    await user.type(
      await screen.findByLabelText("Set list name"),
      "friday SET",
    );
    await user.click(screen.getByRole("button", { name: "Create set list" }));

    const reasonText = await screen.findByText(
      "Another set list already has this name",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(savedSetlistNames()).toEqual(["Friday set"]);
  });

  it("renames a set list", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "Rename Friday set" }));
    const field = await screen.findByLabelText("Set list name");
    expect(field).toHaveValue("Friday set");
    await user.clear(field);
    await user.type(field, "Late set");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(
      await screen.findByText("Set list renamed to Late set"),
    ).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual(["Late set"]);
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Rename Late set" }),
      ).toHaveFocus();
    });
  });

  it("reorders set lists with the up button", async () => {
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
      "Saturday set is now set list 1",
    );
    expect(announcement).toHaveAttribute("role", "status");
  });

  it("reads the set lists again when the order no longer matches", async () => {
    demoCreateVjSetlist({ name: "Saturday set" });
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    // Another tab adds a set list this tab has not read yet.
    demoCreateVjSetlist({ name: "Sunday set" });
    await user.click(
      screen.getByRole("button", { name: "Move Friday set down" }),
    );

    const reasonText = await screen.findByText(
      "The new order must list every set list once",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(await screen.findByText("Sunday set")).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual([
      "Friday set",
      "Saturday set",
      "Sunday set",
    ]);
  });

  it("deletes a set list and keeps its scenes", async () => {
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    await user.click(screen.getByRole("button", { name: "Delete Friday set" }));
    expect(
      await screen.findByText("The scenes in it stay in the library"),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Delete set list" }));

    expect(await screen.findByText("Friday set deleted")).toBeInTheDocument();
    expect(savedSetlistNames()).toEqual([]);
    expect(demoGetVjScenes().items).toHaveLength(2);
    expect(await screen.findByText("No set lists yet")).toBeInTheDocument();
  });

  it("names the 50 set list cap before sending", async () => {
    for (let setlistIndex = 1; setlistIndex < 50; setlistIndex += 1) {
      demoCreateVjSetlist({ name: `Set ${setlistIndex}` });
    }
    const user = userEvent.setup();
    renderPanel();
    await findSetlistList();
    const opener = screen.getByRole("button", { name: "New set list" });
    expect(opener).toHaveAttribute("aria-disabled", "true");
    await user.click(opener);

    const reasonText = await screen.findByText(
      "The library holds up to 50 set lists",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(screen.queryByLabelText("Set list name")).not.toBeInTheDocument();
    expect(savedSetlistNames()).toHaveLength(50);
  });
});
