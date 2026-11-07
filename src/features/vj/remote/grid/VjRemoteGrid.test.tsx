import { readFileSync } from "node:fs";
import type { ComponentProps } from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { LazyMotion, domMax } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { VjClipDTO } from "../../../../shared/contracts/vj";
import { PointerEventStub } from "../../../../test/pointerEventStub";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalogUnderFakeTimers } from "../../../../test/awaitCatalogUnderFakeTimers";
import { VjRemoteGrid, type VjTileState } from "./VjRemoteGrid";

const css = readFileSync(
  "src/features/vj/remote/grid/VjGrid.module.css",
  "utf8",
);

function clipOf(id: string, title: string, overrides: Partial<VjClipDTO> = {}) {
  const clip: VjClipDTO = {
    id,
    title,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1_000_000,
    width: 1280,
    height: 720,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: `/files/${id}.jpg`,
    mediaUrl: `/files/${id}.mp4`,
    packIds: ["pack-1"],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-01T20:00:00.000Z",
    updatedAt: "2026-11-01T20:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: `/files/${id}-preview.mp4`,
    ...overrides,
  };
  return clip;
}

const CLIPS = [
  clipOf("clip-1", "Neon rain"),
  clipOf("clip-2", "Disco ball", { previewUrl: null }),
  clipOf("clip-3", "Neon hearts"),
  clipOf("clip-4", "Glitter storm"),
];

const READY_STATE: VjTileState = {
  isLive: false,
  isPending: false,
  isArmed: false,
  pendingQuantize: null,
  readiness: { state: "ready", progress: 1, failure: null },
};

type GridProps = ComponentProps<typeof VjRemoteGrid>;

async function renderGrid(overrides: Partial<GridProps> = {}) {
  const onTapClip = vi.fn<GridProps["onTapClip"]>();
  const onToggleFavorite = vi.fn<GridProps["onToggleFavorite"]>();
  const onGoGenerator = vi.fn<GridProps["onGoGenerator"]>();
  const onQuery = vi.fn<(query: string) => void>();
  const onClose = vi.fn<() => void>();
  const view = render(
    <TestProviders>
      <LazyMotion features={domMax}>
        <VjRemoteGrid
          source="pack"
          clips={CLIPS}
          tileStateOf={() => READY_STATE}
          liveGeneratorId={null}
          liveGeneratorVariant={null}
          isCueMode={false}
          isBlocked={false}
          emptyKey={null}
          search={{ isOpen: false, query: "", onQuery, onClose }}
          onTapClip={onTapClip}
          onToggleFavorite={onToggleFavorite}
          onShowClipFailure={vi.fn()}
          onGoGenerator={onGoGenerator}
          {...overrides}
        />
      </LazyMotion>
    </TestProviders>,
  );
  await awaitCatalogUnderFakeTimers("vj");
  return {
    ...view,
    onTapClip,
    onToggleFavorite,
    onGoGenerator,
    onQuery,
    onClose,
  };
}

function tileButton(title: string): HTMLElement {
  return screen.getByRole("button", { name: `Show ${title} on the screen` });
}

/** The grid's own root: the providers around it hold live regions too. */
function gridRoot(container: HTMLElement): HTMLElement {
  const root = container.querySelector<HTMLElement>("[data-vj-remote-grid]");
  if (root === null) throw new Error("grid root not rendered");
  return root;
}

function tileTitles(): string[] {
  return within(screen.getByRole("list", { name: "Clips" }))
    .getAllByRole("listitem")
    .map((item) => item.querySelector("[data-vj-grid-item]"))
    .map((button) => button?.getAttribute("aria-label") ?? "");
}

const touch = { pointerId: 5, pointerType: "touch", button: 0 } as const;

function advance(milliseconds: number) {
  act(() => {
    vi.advanceTimersByTime(milliseconds);
  });
}

beforeEach(() => {
  vi.stubGlobal("PointerEvent", PointerEventStub);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("VjRemoteGrid", () => {
  it("three columns of square tiles hold the pack's clips in order", async () => {
    // 390px phone: 354px of content, a 108px track minimum and a 6px gap.
    // The minimum grows as 16cqi up to 176px; at 354px it keeps 108px.
    expect(css).toMatch(
      /--vj-tile-grow-min:\s*clamp\(var\(--vj-tile-min\),\s*16cqi,\s*176px\)/,
    );
    expect(css).toMatch(
      /grid-template-columns:\s*repeat\(\s*auto-fill,\s*minmax\(var\(--vj-tile-grow-min\),\s*1fr\)\s*\)/,
    );
    expect(css).toMatch(/--vj-tile-min:\s*108px/);
    expect(css).toMatch(/--vj-tile-gap:\s*6px/);
    expect(css).toMatch(/\.tile\s*\{[^}]*aspect-ratio:\s*1;/);
    const contentWidth = 354;
    const columnCount = Math.floor((contentWidth + 6) / (108 + 6));
    expect(columnCount).toBe(3);
    expect((contentWidth - 2 * 6) / columnCount).toBe(114);

    const { container } = await renderGrid();
    expect(container.querySelector("[data-vj-remote-grid]")).toHaveAttribute(
      "data-source",
      "pack",
    );
    expect(container.querySelectorAll("[data-vj-tile]")).toHaveLength(4);
    expect(tileTitles()).toEqual([
      "Show Neon rain on the screen",
      "Show Disco ball on the screen",
      "Show Neon hearts on the screen",
      "Show Glitter storm on the screen",
    ]);
  });

  it("tap calls onTapClip with the clip and its index", async () => {
    const { onTapClip } = await renderGrid();
    fireEvent.click(tileButton("Neon hearts"));
    expect(onTapClip).toHaveBeenCalledWith("clip-3", 2);
  });

  it("long press opens the preview and the release sends nothing", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { onTapClip } = await renderGrid();
    const button = tileButton("Neon rain");
    fireEvent.pointerDown(button, touch);
    advance(449);
    expect(document.querySelector("[data-vj-tile-preview]")).toBeNull();
    advance(1);
    const preview = document.querySelector("[data-vj-tile-preview]");
    expect(preview).toHaveAccessibleName("Preview of Neon rain");
    const video = preview?.querySelector("video");
    expect(video).toHaveAttribute("src", "/files/clip-1-preview.mp4");
    expect(video).toHaveProperty("muted", true);
    expect(video).toHaveProperty("loop", true);
    fireEvent.pointerUp(button, touch);
    fireEvent.click(button);
    expect(onTapClip).not.toHaveBeenCalled();
  });

  it("the preview shows the thumbnail and the note when previewUrl is null", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    await renderGrid();
    fireEvent.pointerDown(tileButton("Disco ball"), touch);
    advance(450);
    const preview = document.querySelector<HTMLElement>(
      "[data-vj-tile-preview]",
    );
    if (!preview) throw new Error("preview missing");
    expect(preview.querySelector("video")).toBeNull();
    expect(preview.querySelector("img")).toHaveAttribute(
      "src",
      "/files/clip-2.jpg",
    );
    expect(
      within(preview).getByText(
        "No moving preview yet. Make previews in the VJ library",
      ),
    ).toBeInTheDocument();
  });

  it("the grid never plays a moving preview before a long press", async () => {
    const { container } = await renderGrid();
    expect(container.querySelector("video")).toBeNull();
    expect(document.querySelector("[data-vj-tile-preview]")).toBeNull();
  });

  it("the star toggles without touching the tile", async () => {
    const { onTapClip, onToggleFavorite } = await renderGrid();
    fireEvent.click(
      screen.getByRole("button", { name: "Add Glitter storm to favorites" }),
    );
    expect(onToggleFavorite).toHaveBeenCalledWith("clip-4", true);
    expect(onTapClip).not.toHaveBeenCalled();
  });

  it("search filters and Escape closes it", async () => {
    const onQuery = vi.fn<(query: string) => void>();
    const onClose = vi.fn<() => void>();
    await renderGrid({
      search: { isOpen: true, query: "neon", onQuery, onClose },
    });
    expect(tileTitles()).toEqual([
      "Show Neon rain on the screen",
      "Show Neon hearts on the screen",
    ]);
    const field = screen.getByRole("searchbox", { name: "Search this pack" });
    expect(field).toHaveFocus();
    fireEvent.change(field, { target: { value: "neon h" } });
    expect(onQuery).toHaveBeenCalledWith("neon h");
    const isNotHandled = fireEvent.keyDown(field, { key: "Escape" });
    expect(isNotHandled).toBe(false);
    expect(onClose).toHaveBeenCalledOnce();
    // The focus goes back to the grid's tab stop.
    expect(tileButton("Neon rain")).toHaveFocus();
  });

  it("a closed search shows every clip whatever the query", async () => {
    await renderGrid({
      search: {
        isOpen: false,
        query: "neon",
        onQuery: vi.fn(),
        onClose: vi.fn(),
      },
    });
    expect(tileTitles()).toHaveLength(4);
  });

  it("a search with no match says so where the grid would be", async () => {
    const view = await renderGrid({
      search: {
        isOpen: true,
        query: "zebra",
        onQuery: vi.fn(),
        onClose: vi.fn(),
      },
    });
    // The empty line fades from the blank pre-catalog copy to its text.
    await waitFor(() =>
      expect(
        within(gridRoot(view.container)).getByRole("status"),
      ).toHaveTextContent('No clip in this pack matches "zebra"'),
    );
  });

  it("an empty pack shows the caller's empty line", async () => {
    const view = await renderGrid({
      clips: [],
      emptyKey: "vj:remote.packEmpty",
    });
    // The empty line fades from the blank pre-catalog copy to its text.
    await waitFor(() =>
      expect(
        within(gridRoot(view.container)).getByRole("status"),
      ).toHaveTextContent(
        "This pack has no clips yet. Add some in the VJ library",
      ),
    );
  });

  it("generators source shows five generators and a long press on the flag wave offers the flags", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { container, onGoGenerator } = await renderGrid({
      source: "generators",
      liveGeneratorId: "prideFlagWave",
      liveGeneratorVariant: "rainbow",
    });
    expect(container.querySelectorAll("[data-vj-generator-tile]")).toHaveLength(
      5,
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Show the Plasma generator on the screen",
      }),
    );
    expect(onGoGenerator).toHaveBeenLastCalledWith("plasma", null);

    const flagWave = screen.getByRole("button", {
      name: "Show the Pride flag wave generator on the screen",
    });
    expect(flagWave).toHaveAttribute("aria-current", "true");
    fireEvent.pointerDown(flagWave, touch);
    advance(450);
    fireEvent.pointerUp(flagWave, touch);
    fireEvent.click(flagWave);
    expect(onGoGenerator).toHaveBeenCalledTimes(1);

    const chooser = screen.getByRole("dialog", { name: "Pride flag wave" });
    expect(
      within(chooser).getByRole("button", { name: "Rainbow" }),
    ).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(within(chooser).getByRole("button", { name: "Trans" }));
    expect(onGoGenerator).toHaveBeenLastCalledWith("prideFlagWave", "trans");
  });

  it("a tap on the flag wave sends its default flag", async () => {
    const { onGoGenerator } = await renderGrid({ source: "generators" });
    fireEvent.click(
      screen.getByRole("button", {
        name: "Show the Pride flag wave generator on the screen",
      }),
    );
    expect(onGoGenerator).toHaveBeenCalledWith("prideFlagWave", "rainbow");
  });

  it("a generator waiting for its ack shows the pending ring", async () => {
    const { container } = await renderGrid({
      source: "generators",
      generatorIsPending: (generatorId) => generatorId === "plasma",
    });
    const plasmaTile = container.querySelector(
      '[data-vj-generator-tile="plasma"]',
    );
    const starfieldTile = container.querySelector(
      '[data-vj-generator-tile="starfield"]',
    );
    expect(plasmaTile).toHaveAttribute("data-pending", "true");
    expect(plasmaTile?.querySelector("[data-vj-pending-ring]")).not.toBeNull();
    expect(starfieldTile).toHaveAttribute("data-pending", "false");
    expect(starfieldTile?.querySelector("[data-vj-pending-ring]")).toBeNull();
  });
});
