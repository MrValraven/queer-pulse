import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useVjClips } from "../api/useVjClips";
import { useVjPackClips } from "../api/useVjPackClips";
import { useVjPacks } from "../api/useVjPacks";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoGetVjPackClips,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { VjClipGrid } from "./VjClipGrid";

const WARM_UP_PACK_ID = "00000000-0000-4000-8000-0000000000a1";

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

/** Reads the library the way the page does and renders the grid for one
 *  pack, or for All clips when `packName` is null. */
function GridHarness({ packName }: { packName: string | null }) {
  const packs = useVjPacks();
  const pack =
    packName === null
      ? null
      : (packs.data?.find((candidate) => candidate.name === packName) ?? null);
  const packClips = useVjPackClips(pack?.id ?? null);
  const allClips = useVjClips();
  if (packs.data === undefined) return null;
  const isAllClips = pack === null;
  return (
    <VjClipGrid
      packId={pack?.id ?? null}
      packName={pack?.name ?? null}
      clips={isAllClips ? (allClips.data ?? []) : (packClips.data?.items ?? [])}
      packs={packs.data}
      isLoading={isAllClips ? allClips.isLoading : packClips.isLoading}
    />
  );
}

function renderGrid(packName: string | null) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <TestProviders queryClient={queryClient}>
      <LazyMotion features={domMax}>
        <GridHarness packName={packName} />
      </LazyMotion>
    </TestProviders>,
  );
}

describe("VjClipGrid", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("lists a pack's clips in pack order", async () => {
    renderGrid("Warm-up");
    await screen.findByRole("button", { name: "Edit Neon grid" });
    const editButtons = screen.getAllByRole("button", { name: /^Edit / });
    expect(
      editButtons.map((button) => button.getAttribute("aria-label")),
    ).toEqual(["Edit Neon grid", "Edit Warm haze", "Edit Tall ribbon"]);
    expect(
      screen.getByRole("list", { name: "Clips in Warm-up" }),
    ).toBeInTheDocument();
  });

  it("moves a clip later with the button and saves the order", async () => {
    const user = userEvent.setup();
    renderGrid("Warm-up");
    await user.click(
      await screen.findByRole("button", { name: "Move Neon grid later" }),
    );
    await waitFor(() =>
      expect(
        demoGetVjPackClips(WARM_UP_PACK_ID).items.map((clip) => clip.title),
      ).toEqual(["Warm haze", "Neon grid", "Tall ribbon"]),
    );
    expect(
      await screen.findByText("Neon grid is now number 2"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen
          .getAllByRole("button", { name: /^Edit / })
          .map((button) => button.getAttribute("aria-label")),
      ).toEqual(["Edit Warm haze", "Edit Neon grid", "Edit Tall ribbon"]),
    );
  });

  it("offers no reorder in All clips", async () => {
    renderGrid(null);
    const staticBloom = await screen.findByRole("button", {
      name: "Edit Static bloom",
    });
    expect(
      screen.queryAllByRole("button", { name: /^Move .* (earlier|later)$/ }),
    ).toHaveLength(0);
    const card = staticBloom.closest("article");
    expect(card).not.toBeNull();
    expect(within(card as HTMLElement).getByText("In no pack")).toBeVisible();
  });

  it("opens Edit clip from a card", async () => {
    const user = userEvent.setup();
    renderGrid("Peak hour");
    await user.click(
      await screen.findByRole("button", { name: "Edit Disco dots" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Edit clip" }),
    ).toBeInTheDocument();
  });
});
