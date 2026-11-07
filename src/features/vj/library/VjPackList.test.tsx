import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { useVjPacks } from "../api/useVjPacks";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjPacks,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { VjPackHeader } from "./VjPackHeader";
import { VjPackList } from "./VjPackList";
import { VjPackPicker } from "./VjPackPicker";

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

/** Reads the packs the way the page does and hands them to the rail. */
function PackListHarness({
  onSelect,
}: {
  onSelect: (packId: string | null) => void;
}) {
  const packsQuery = useVjPacks();
  if (packsQuery.data === undefined) return null;
  return (
    <VjPackList
      packs={packsQuery.data}
      selectedPackId={null}
      libraryClipCount={8}
      onSelect={onSelect}
    />
  );
}

function renderPackList() {
  const onSelect = vi.fn<(packId: string | null) => void>();
  render(
    <TestProviders>
      <PackListHarness onSelect={onSelect} />
    </TestProviders>,
  );
  return { onSelect };
}

function seededPackNamed(name: string): VjPackDTO {
  const pack = demoGetVjPacks().items.find(
    (candidate) => candidate.name === name,
  );
  if (pack === undefined) throw new Error(`No seeded pack named ${name}`);
  return pack;
}

describe("VjPackList (demo)", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("creates a pack and selects it", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPackList();
    await user.click(await screen.findByRole("button", { name: "New pack" }));
    await user.type(await screen.findByLabelText("Pack name"), "Encore");
    await user.click(screen.getByRole("button", { name: "Create pack" }));

    expect(
      await screen.findByText("Encore is ready for clips"),
    ).toBeInTheDocument();
    const encore = seededPackNamed("Encore");
    expect(onSelect).toHaveBeenCalledWith(encore.id);
    expect(screen.getByRole("button", { name: "New pack" })).toHaveFocus();
  });

  it("names a taken pack name", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPackList();
    await user.click(await screen.findByRole("button", { name: "New pack" }));
    await user.type(await screen.findByLabelText("Pack name"), "peak hour");
    await user.click(screen.getByRole("button", { name: "Create pack" }));

    const reasonText = await screen.findByText(
      "Another pack already has this name",
    );
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
    expect(demoGetVjPacks().items).toHaveLength(3);
  });

  it("names a blank pack name without sending it", async () => {
    const user = userEvent.setup();
    renderPackList();
    await user.click(await screen.findByRole("button", { name: "New pack" }));
    await user.type(await screen.findByLabelText("Pack name"), "   ");
    await user.click(screen.getByRole("button", { name: "Create pack" }));

    const reasonText = await screen.findByText("Give the pack a name");
    expect(reasonText.closest('[role="alert"]')).not.toBeNull();
    expect(demoGetVjPacks().items).toHaveLength(3);
  });

  it("moves a pack down with the button and saves the order", async () => {
    const user = userEvent.setup();
    renderPackList();
    await user.click(
      await screen.findByRole("button", { name: "Move Warm-up down" }),
    );

    await waitFor(() => {
      expect(demoGetVjPacks().items.map((pack) => pack.name)).toEqual([
        "Peak hour",
        "Warm-up",
        "Closing",
      ]);
    });
    const announcement = await screen.findByText("Warm-up is now number 2");
    expect(announcement).toHaveAttribute("role", "status");
  });

  it("keeps the end buttons blocked", async () => {
    const user = userEvent.setup();
    renderPackList();
    const firstUp = await screen.findByRole("button", {
      name: "Move Warm-up up",
    });
    const lastDown = screen.getByRole("button", { name: "Move Closing down" });
    expect(firstUp).toHaveAttribute("aria-disabled", "true");
    expect(lastDown).toHaveAttribute("aria-disabled", "true");

    await user.click(firstUp);
    await user.click(lastDown);
    expect(demoGetVjPacks().items.map((pack) => pack.name)).toEqual([
      "Warm-up",
      "Peak hour",
      "Closing",
    ]);
  });

  it("selects All clips and a pack", async () => {
    const user = userEvent.setup();
    const { onSelect } = renderPackList();
    await user.click(
      await screen.findByRole("button", { name: "Show Closing" }),
    );
    expect(onSelect).toHaveBeenLastCalledWith(seededPackNamed("Closing").id);
    const allClips = screen.getByRole("button", { name: /All clips/ });
    expect(allClips).toHaveAttribute("aria-current", "page");
    await user.click(allClips);
    expect(onSelect).toHaveBeenLastCalledWith(null);
  });

  it("renames a pack and hands focus back to Rename pack", async () => {
    const user = userEvent.setup();
    const closing = seededPackNamed("Closing");
    render(
      <TestProviders>
        <VjPackHeader
          pack={closing}
          libraryClipCount={8}
          onPackDeleted={vi.fn()}
        />
      </TestProviders>,
    );
    await user.click(screen.getByRole("button", { name: "Rename pack" }));
    const field = await screen.findByLabelText("Pack name");
    await user.clear(field);
    await user.type(field, "Last call");
    await user.click(screen.getByRole("button", { name: "Save name" }));

    expect(
      await screen.findByText("The pack is now called Last call"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rename pack" })).toHaveFocus();
  });

  it("holds the All clips count until it is known", async () => {
    const { rerender } = render(
      <TestProviders>
        <VjPackHeader
          pack={null}
          libraryClipCount={null}
          onPackDeleted={vi.fn()}
        />
      </TestProviders>,
    );
    expect(screen.queryByText(/\d+ clips?$/)).not.toBeInTheDocument();
    rerender(
      <TestProviders>
        <VjPackHeader
          pack={null}
          libraryClipCount={8}
          onPackDeleted={vi.fn()}
        />
      </TestProviders>,
    );
    expect(await screen.findByText("8 clips")).toBeInTheDocument();
  });

  it("labels the phone picker with the catalog's count line", () => {
    const closing = seededPackNamed("Closing");
    const { rerender } = render(
      <TestProviders>
        <VjPackPicker
          packs={[closing]}
          selectedPackId={null}
          libraryClipCount={8}
          onSelect={vi.fn()}
          onManage={vi.fn()}
        />
      </TestProviders>,
    );
    expect(screen.getByText("All clips (8)")).toBeInTheDocument();
    rerender(
      <TestProviders>
        <VjPackPicker
          packs={[closing]}
          selectedPackId={closing.id}
          libraryClipCount={8}
          onSelect={vi.fn()}
          onManage={vi.fn()}
        />
      </TestProviders>,
    );
    expect(
      screen.getByText(`Closing (${closing.clipCount})`),
    ).toBeInTheDocument();
  });

  it("deletes a pack and says its clips stay", async () => {
    const user = userEvent.setup();
    const closing = seededPackNamed("Closing");
    const onPackDeleted = vi.fn<(packId: string) => void>();
    render(
      <TestProviders>
        <VjPackHeader
          pack={closing}
          libraryClipCount={8}
          onPackDeleted={onPackDeleted}
        />
      </TestProviders>,
    );
    await user.click(screen.getByRole("button", { name: "Delete pack" }));

    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).getByText(
        "The pack goes and its 2 clips stay in the library",
      ),
    ).toBeInTheDocument();
    await user.click(
      within(dialog).getByRole("button", { name: "Delete pack" }),
    );

    await waitFor(() => {
      expect(onPackDeleted).toHaveBeenCalledWith(closing.id);
    });
    expect(demoGetVjPacks().items.some((pack) => pack.id === closing.id)).toBe(
      false,
    );
  });
});

describe("VjPackHeader layout", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("gives the pack's event its own row after the pack buttons", () => {
    const closing = seededPackNamed("Closing");
    render(
      <TestProviders>
        <VjPackHeader
          pack={closing}
          libraryClipCount={8}
          onPackDeleted={vi.fn()}
        />
      </TestProviders>,
    );
    const deleteButton = screen.getByRole("button", { name: "Delete pack" });
    const eventButton = screen.getByRole("button", {
      name: closing.event === null ? "Link event" : "Change event",
    });
    // The event comes after the pack buttons in reading and tab order, and
    // sits outside their row.
    expect(
      deleteButton.compareDocumentPosition(eventButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(deleteButton.parentElement?.contains(eventButton)).toBe(false);
  });
});
