import { QueryClient } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyMotion, domMax } from "motion/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { TestProviders } from "../../../test/TestProviders";
import { useVjClips } from "../api/useVjClips";
import { useVjPackClips } from "../api/useVjPackClips";
import { useVjPacks } from "../api/useVjPacks";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import {
  configureVjDemoStore,
  demoDeleteVjPack,
  demoGetVjClips,
  demoGetVjPackClips,
  demoGetVjPacks,
  resetVjDemoLibrary,
} from "../demo/vjDemoStore";
import { VjClipGrid } from "./VjClipGrid";
import { VjClipPacks } from "./VjClipPacks";

const PEAK_HOUR_PACK_ID = "00000000-0000-4000-8000-0000000000a2";
const CLOSING_PACK_ID = "00000000-0000-4000-8000-0000000000a3";
const DISCO_DOTS_MEDIA = "/vj-demo/disco-dots.gif";

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

/** Renders the grid for `packName` (null is All clips) and opens Edit clip
 *  on the clip titled `clipTitle`. */
async function openClipDialog(packName: string | null, clipTitle: string) {
  const user = userEvent.setup();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <TestProviders queryClient={queryClient}>
      <LazyMotion features={domMax}>
        <GridHarness packName={packName} />
      </LazyMotion>
    </TestProviders>,
  );
  await user.click(
    await screen.findByRole("button", { name: `Edit ${clipTitle}` }),
  );
  const dialog = await screen.findByRole("dialog", { name: "Edit clip" });
  return { user, dialog };
}

function storedClip(title: string) {
  return demoGetVjClips().items.find((clip) => clip.title === title);
}

function titlesIn(packId: string): string[] {
  return demoGetVjPackClips(packId).items.map((clip) => clip.title);
}

describe("VjClipDialog", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("renames a clip", async () => {
    const { user, dialog } = await openClipDialog(null, "Neon grid");
    const titleInput = within(dialog).getByLabelText("Title");
    await user.clear(titleInput);
    await user.type(titleInput, "Neon grid 2");
    await user.click(
      await within(dialog).findByRole("button", { name: "Save title" }),
    );
    await waitFor(() =>
      expect(
        demoGetVjClips().items.some((clip) => clip.title === "Neon grid 2"),
      ).toBe(true),
    );
    expect(await screen.findByText("Title saved")).toBeInTheDocument();
  });

  it("switches the fit to Fit", async () => {
    const { user, dialog } = await openClipDialog(null, "Neon grid");
    await user.click(within(dialog).getByRole("button", { name: "Fit" }));
    await waitFor(() => expect(storedClip("Neon grid")?.fitMode).toBe("fit"));
    expect(
      await within(dialog).findByText(
        "Shows the whole clip over a blurred copy of itself",
      ),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Fit" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("adds the clip to a pack and removes it from another", async () => {
    const { user, dialog } = await openClipDialog(null, "Static bloom");
    await user.click(
      within(dialog).getByRole("button", { name: "Add to Closing" }),
    );
    await waitFor(() =>
      expect(titlesIn(CLOSING_PACK_ID)).toContain("Static bloom"),
    );
    await user.click(
      await within(dialog).findByRole("button", {
        name: "Remove from Closing",
      }),
    );
    await waitFor(() =>
      expect(titlesIn(CLOSING_PACK_ID)).not.toContain("Static bloom"),
    );
    expect(storedClip("Static bloom")?.packCount).toBe(0);
    expect(storedClip("Static bloom")).toBeDefined();
  });

  it("moves the clip to another pack", async () => {
    const { user, dialog } = await openClipDialog("Peak hour", "Disco dots");
    await user.click(
      within(dialog).getByRole("button", { name: "Move to another pack" }),
    );
    await user.click(await screen.findByRole("option", { name: "Closing" }));
    await user.click(within(dialog).getByRole("button", { name: "Move clip" }));
    await waitFor(() =>
      expect(titlesIn(CLOSING_PACK_ID)).toContain("Disco dots"),
    );
    expect(titlesIn(PEAK_HOUR_PACK_ID)).not.toContain("Disco dots");
  });

  it("names a refusal under the row that sent it", async () => {
    const { user, dialog } = await openClipDialog(null, "Static bloom");
    // Another tab deletes the pack; this tab's cache still lists it.
    demoDeleteVjPack(CLOSING_PACK_ID);
    await user.click(
      within(dialog).getByRole("button", { name: "Add to Closing" }),
    );
    const row = dialog.querySelector(`[data-pack-id="${CLOSING_PACK_ID}"]`);
    expect(row).not.toBeNull();
    expect(
      await within(row as HTMLElement).findByRole("alert"),
    ).toHaveTextContent("This pack was deleted, maybe in another tab");
  });

  it("plays the preview only after Play preview", async () => {
    const { user, dialog } = await openClipDialog("Peak hour", "Disco dots");
    expect(
      document.querySelectorAll(`img[src="${DISCO_DOTS_MEDIA}"]`),
    ).toHaveLength(0);
    await user.click(
      within(dialog).getByRole("button", { name: "Play preview" }),
    );
    await waitFor(() =>
      expect(
        document.querySelectorAll(`img[src="${DISCO_DOTS_MEDIA}"]`),
      ).toHaveLength(1),
    );
  });

  it("says how many packs a clip leaves before deleting it", async () => {
    const { user, dialog } = await openClipDialog(null, "Neon grid");
    await user.click(
      within(dialog).getByRole("button", { name: "Delete clip" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Delete Neon grid",
    });
    expect(confirm).toHaveTextContent(
      "The clip and its files are deleted for good, and it leaves the 2 packs it sits in",
    );
    await user.click(
      within(confirm).getByRole("button", { name: "Delete clip" }),
    );
    await waitFor(() => expect(storedClip("Neon grid")).toBeUndefined());
    expect(
      await screen.findByText("Neon grid was deleted"),
    ).toBeInTheDocument();
  });
});

describe("VjClipPacks", () => {
  beforeEach(() => {
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("swaps the No packs note for the pack list once a pack exists", async () => {
    const clip = storedClip("Static bloom");
    const closing = demoGetVjPacks().items.find(
      (pack) => pack.id === CLOSING_PACK_ID,
    );
    if (clip === undefined || closing === undefined) {
      throw new Error("The demo seed lacks Static bloom or Closing");
    }
    const renderPacks = (packs: VjPackDTO[]) => (
      <TestProviders>
        <LazyMotion features={domMax}>
          <VjClipPacks clip={clip} packs={packs} currentPackId={null} />
        </LazyMotion>
      </TestProviders>
    );
    const { rerender } = render(renderPacks([]));
    expect(
      screen.getByText("No packs yet. Create one in the pack list first"),
    ).toBeInTheDocument();
    rerender(renderPacks([closing]));
    expect(
      await screen.findByRole("button", { name: "Add to Closing" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByText("No packs yet. Create one in the pack list first"),
      ).not.toBeInTheDocument(),
    );
  });
});
