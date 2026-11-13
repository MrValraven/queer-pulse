import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { awaitCatalog } from "../../../../test/awaitCatalog";
import {
  createVjStageState,
  DEFAULT_VJ_STEP_DURATION,
  vjSceneLookOf,
  type VjClipDTO,
  type VjSceneDTO,
  type VjSetlistDTO,
} from "../../../../shared/contracts/vj";
import {
  VjStrips,
  type VjHistoryStripProps,
  type VjScenesStripProps,
} from "./VjStrips";

const LOOK = vjSceneLookOf(createVjStageState("epoch-1", 1000));

function makeScene(id: string, name: string, position: number): VjSceneDTO {
  return {
    id,
    name,
    packId: null,
    position,
    look: LOOK,
    setlistItemCount: 0,
    createdBy: null,
    createdAt: "2026-11-06T20:00:00.000Z",
    updatedAt: "2026-11-06T20:00:00.000Z",
  };
}

function makeClip(id: string, title: string): VjClipDTO {
  return {
    id,
    title,
    mediaKind: "video",
    mimeType: "video/mp4",
    byteSize: 1000,
    width: 1920,
    height: 1080,
    durationMs: 8000,
    fitMode: "fill",
    thumbnailUrl: `/files/${id}.jpg`,
    mediaUrl: `/files/${id}.mp4`,
    packIds: ["disco"],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-06T20:00:00.000Z",
    updatedAt: "2026-11-06T20:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
    setlistItemCount: 0,
  };
}

function makeSetlist(itemCount: number): VjSetlistDTO {
  return {
    id: "setlist-1",
    name: "Friday",
    position: 0,
    isLooping: false,
    stepDuration: DEFAULT_VJ_STEP_DURATION,
    items: Array.from({ length: itemCount }, (_, itemIndex) => ({
      id: `item-${itemIndex}`,
      position: itemIndex,
      kind: "scene" as const,
      sceneId: itemIndex % 2 === 0 ? "scene-a" : "scene-b",
      clipId: null,
      duration: null,
    })),
    createdBy: null,
    createdAt: "2026-11-06T20:00:00.000Z",
    updatedAt: "2026-11-06T20:00:00.000Z",
  };
}

const SCENES = [
  makeScene("scene-a", "Warm up", 0),
  makeScene("scene-b", "Peak", 1),
];
const CLIPS = [
  makeClip("clip-1", "Glitter rain"),
  makeClip("clip-2", "Neon hearts"),
  makeClip("clip-3", "Disco ball"),
];
const CLIPS_BY_ID = new Map(CLIPS.map((clip) => [clip.id, clip]));

function scenesPropsWith(
  overrides: Partial<VjScenesStripProps> = {},
): VjScenesStripProps {
  return {
    scenes: SCENES,
    activeSetlist: null,
    setlistIndex: null,
    pendingSceneId: null,
    isBlocked: false,
    isSaving: false,
    onRecall: vi.fn(),
    onSaveScene: vi.fn(),
    onSetlistNext: vi.fn(),
    onSetlistPrevious: vi.fn(),
    setlistStatus: "manual",
    isSetlistLooping: false,
    isSetlistPlayPending: false,
    onSetlistTogglePlaying: vi.fn(),
    ...overrides,
  };
}

function historyPropsWith(
  overrides: Partial<VjHistoryStripProps> = {},
): VjHistoryStripProps {
  return {
    recentClipIds: ["clip-1", "clip-2"],
    clipsById: CLIPS_BY_ID,
    isBlocked: false,
    onPrevious: vi.fn(),
    onGoClip: vi.fn(),
    ...overrides,
  };
}

async function renderStrips(
  scenesProps: VjScenesStripProps,
  historyProps: VjHistoryStripProps,
  isCompact = false,
) {
  const renderedView = render(
    <TestProviders>
      <VjStrips
        isCompact={isCompact}
        scenesProps={scenesProps}
        historyProps={historyProps}
      />
    </TestProviders>,
  );
  await awaitCatalog("vj");
  return renderedView;
}

function scenesStrip() {
  return within(screen.getByRole("group", { name: "Scenes" }));
}

function historyStrip() {
  return within(screen.getByRole("group", { name: "Recent" }));
}

describe("VjStrips", () => {
  it("recalls a scene on tap", async () => {
    const scenesProps = scenesPropsWith();
    await renderStrips(scenesProps, historyPropsWith());
    fireEvent.click(
      scenesStrip().getByRole("button", { name: "Recall scene Peak" }),
    );
    expect(scenesProps.onRecall).toHaveBeenCalledWith("scene-b");
  });

  it("marks the pending recall and sends nothing while blocked", async () => {
    const scenesProps = scenesPropsWith({
      pendingSceneId: "scene-a",
      isBlocked: true,
    });
    await renderStrips(scenesProps, historyPropsWith());
    const warmUp = scenesStrip().getByRole("button", {
      name: "Recall scene Warm up",
    });
    expect(warmUp).toHaveAttribute("data-pending", "true");
    expect(warmUp).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(warmUp);
    expect(scenesProps.onRecall).not.toHaveBeenCalled();
  });

  it("blocked scene, set list and recent chips point at the reason", async () => {
    await renderStrips(
      scenesPropsWith({
        isBlocked: true,
        blockedReasonId: "status-line",
        activeSetlist: makeSetlist(4),
        setlistIndex: 1,
      }),
      historyPropsWith({ isBlocked: true, blockedReasonId: "status-line" }),
    );
    for (const name of [
      "Recall scene Peak",
      "Previous step",
      "Play sequence",
      "Next step",
    ]) {
      expect(scenesStrip().getByRole("button", { name })).toHaveAttribute(
        "aria-describedby",
        "status-line",
      );
    }
    for (const chip of historyStrip().getAllByRole("button")) {
      expect(chip).toHaveAttribute("aria-describedby", "status-line");
    }
  });

  it("an open strip names no reason", async () => {
    await renderStrips(
      scenesPropsWith({ blockedReasonId: "status-line" }),
      historyPropsWith({ blockedReasonId: "status-line" }),
    );
    expect(
      scenesStrip().getByRole("button", { name: "Recall scene Peak" }),
    ).not.toHaveAttribute("aria-describedby");
  });

  it("Save scene calls onSaveScene", async () => {
    const scenesProps = scenesPropsWith();
    await renderStrips(scenesProps, historyPropsWith());
    fireEvent.click(scenesStrip().getByRole("button", { name: "Save scene" }));
    expect(scenesProps.onSaveScene).toHaveBeenCalledTimes(1);
  });

  it("says no scenes yet beside the Save chip", async () => {
    await renderStrips(scenesPropsWith({ scenes: [] }), historyPropsWith());
    expect(
      scenesStrip().getByText("No scenes yet. Save the current look"),
    ).toBeInTheDocument();
    expect(
      scenesStrip().getByRole("button", { name: "Save scene" }),
    ).toBeInTheDocument();
  });

  it("Previous sends the second recent clip", async () => {
    const historyProps = historyPropsWith();
    await renderStrips(scenesPropsWith(), historyProps);
    const previous = historyStrip().getByRole("button", {
      name: "Go back to Neon hearts",
    });
    expect(previous).not.toHaveAttribute("aria-disabled");
    fireEvent.click(previous);
    expect(historyProps.onPrevious).toHaveBeenCalledTimes(1);
  });

  it("Previous is aria-disabled with one entry", async () => {
    const historyProps = historyPropsWith({ recentClipIds: ["clip-1"] });
    await renderStrips(scenesPropsWith(), historyProps);
    const previous = historyStrip().getByRole("button", { name: "Previous" });
    expect(previous).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(previous);
    expect(historyProps.onPrevious).not.toHaveBeenCalled();
  });

  it("marks the newest clip live and replays a recent clip on tap", async () => {
    const historyProps = historyPropsWith();
    await renderStrips(scenesPropsWith(), historyProps);
    expect(
      historyStrip().getByRole("button", { name: "Show Glitter rain again" }),
    ).toHaveAttribute("aria-current", "true");
    fireEvent.click(
      historyStrip().getByRole("button", { name: "Show Neon hearts again" }),
    );
    expect(historyProps.onGoClip).toHaveBeenCalledWith("clip-2");
  });

  it("says clips you play show here with no history", async () => {
    await renderStrips(
      scenesPropsWith(),
      historyPropsWith({ recentClipIds: [] }),
    );
    expect(
      historyStrip().getByText("Clips you play show here"),
    ).toBeInTheDocument();
  });

  it("compact mode shows one strip and switches", async () => {
    await renderStrips(scenesPropsWith(), historyPropsWith(), true);
    const switchGroup = within(
      screen.getByRole("group", { name: "Show scenes or recent clips" }),
    );
    expect(switchGroup.getByRole("button", { name: "Scenes" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("group", { name: "Scenes" })).toBeInTheDocument();
    expect(
      screen.queryByRole("group", { name: "Recent" }),
    ).not.toBeInTheDocument();
    fireEvent.click(switchGroup.getByRole("button", { name: "Recent" }));
    expect(
      await screen.findByRole("group", { name: "Recent" }),
    ).toBeInTheDocument();
    expect(switchGroup.getByRole("button", { name: "Recent" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("a new recent clip animates in at the front", async () => {
    const scenesProps = scenesPropsWith();
    const { rerender } = await renderStrips(
      scenesProps,
      historyPropsWith({ recentClipIds: ["clip-1", "clip-2"] }),
    );
    const glitterBefore = historyStrip().getByRole("button", {
      name: "Show Glitter rain again",
    });
    rerender(
      <TestProviders>
        <VjStrips
          isCompact={false}
          scenesProps={scenesProps}
          historyProps={historyPropsWith({
            recentClipIds: ["clip-3", "clip-1", "clip-2"],
          })}
        />
      </TestProviders>,
    );
    const recentChips = historyStrip()
      .getAllByRole("button")
      .filter((button) => button.hasAttribute("data-vj-recent-chip"));
    expect(recentChips.map((chip) => chip.dataset.vjRecentChip)).toEqual([
      "clip-3",
      "clip-1",
      "clip-2",
    ]);
    // The neighbours keep their nodes and slide along; only the new chip mounts.
    expect(recentChips[1]).toBe(glitterBefore);
    expect(recentChips[0]).toHaveAttribute("aria-current", "true");
  });
});

describe("VjStrips sequence group", () => {
  it("sequence group shows 3 of 12 and steps both ways", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(12),
      setlistIndex: 2,
    });
    await renderStrips(scenesProps, historyPropsWith());
    expect(scenesStrip().getByText("3 of 12")).toBeInTheDocument();
    fireEvent.click(scenesStrip().getByRole("button", { name: "Next step" }));
    fireEvent.click(
      scenesStrip().getByRole("button", { name: "Previous step" }),
    );
    expect(scenesProps.onSetlistNext).toHaveBeenCalledTimes(1);
    expect(scenesProps.onSetlistPrevious).toHaveBeenCalledTimes(1);
    // Item index 2 names scene-a, so its chip reads as live.
    expect(
      scenesStrip().getByRole("button", { name: "Recall scene Warm up" }),
    ).toHaveAttribute("aria-current", "true");
  });

  it("the play chip plays, pauses and resumes as the status asks", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(4),
      setlistIndex: 1,
    });
    const { rerender } = await renderStrips(scenesProps, historyPropsWith());
    const playChip = scenesStrip().getByRole("button", {
      name: "Play sequence",
    });
    fireEvent.click(playChip);
    expect(scenesProps.onSetlistTogglePlaying).toHaveBeenCalledWith(playChip);
    const rerenderWithStatus = (
      setlistStatus: VjScenesStripProps["setlistStatus"],
    ) =>
      rerender(
        <TestProviders>
          <VjStrips
            isCompact={false}
            scenesProps={{ ...scenesProps, setlistStatus }}
            historyProps={historyPropsWith()}
          />
        </TestProviders>,
      );
    rerenderWithStatus("playing");
    expect(
      scenesStrip().getByRole("button", { name: "Pause sequence" }),
    ).toHaveAttribute("data-live", "true");
    rerenderWithStatus("takenOver");
    expect(
      scenesStrip().getByRole("button", { name: "Resume sequence" }),
    ).toBeInTheDocument();
    rerenderWithStatus("finished");
    expect(
      scenesStrip().getByRole("button", { name: "Play again" }),
    ).toBeInTheDocument();
  });

  it("the play chip holds while its command waits and keeps the popover anchor", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(4),
      setlistIndex: 0,
      isSetlistPlayPending: true,
    });
    await renderStrips(scenesProps, historyPropsWith());
    expect(
      document.querySelector('[data-vj-setlist-group="setlist-1"]'),
    ).not.toBeNull();
    const playChip = scenesStrip().getByRole("button", {
      name: "Play sequence",
    });
    expect(playChip).toHaveAttribute("aria-disabled", "true");
    expect(playChip).toHaveAttribute("aria-busy", "true");
    fireEvent.click(playChip);
    expect(scenesProps.onSetlistTogglePlaying).not.toHaveBeenCalled();
  });

  it("pins the group in Save scene's place, outside the scrolling chips", async () => {
    await renderStrips(
      scenesPropsWith({
        activeSetlist: makeSetlist(4),
        setlistIndex: 0,
        onOpenScenesSheet: vi.fn(),
      }),
      historyPropsWith(),
    );
    const group = document.querySelector<HTMLElement>(
      '[data-vj-setlist-group="setlist-1"]',
    );
    expect(group).not.toBeNull();
    // The scroller marks its fade edges; the pinned group sits outside it.
    expect(group?.closest("[data-vj-fade-start]")).toBeNull();
    expect(
      scenesStrip().queryByRole("button", { name: "Save scene" }),
    ).toBeNull();
    expect(
      scenesStrip().getByRole("button", { name: "Open scenes and sequences" }),
    ).toBeInTheDocument();
  });

  it("brings Save scene back once no sequence is active", async () => {
    await renderStrips(scenesPropsWith(), historyPropsWith());
    expect(
      scenesStrip().getByRole("button", { name: "Save scene" }),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-vj-setlist-group]")).toBeNull();
  });

  it("with Loop on, Next from the last step goes round", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(3),
      setlistIndex: 2,
      isSetlistLooping: true,
    });
    await renderStrips(scenesProps, historyPropsWith());
    const nextChip = scenesStrip().getByRole("button", { name: "Next step" });
    expect(nextChip).not.toHaveAttribute("aria-disabled");
    fireEvent.click(nextChip);
    expect(scenesProps.onSetlistNext).toHaveBeenCalledTimes(1);
  });

  it("without Loop, Next holds at the last step", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(3),
      setlistIndex: 2,
    });
    await renderStrips(scenesProps, historyPropsWith());
    const nextChip = scenesStrip().getByRole("button", { name: "Next step" });
    expect(nextChip).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(nextChip);
    expect(scenesProps.onSetlistNext).not.toHaveBeenCalled();
  });

  it("with Loop on, Previous goes round from nothing recalled yet", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(3),
      setlistIndex: null,
      isSetlistLooping: true,
    });
    await renderStrips(scenesProps, historyPropsWith());
    const previousChip = scenesStrip().getByRole("button", {
      name: "Previous step",
    });
    expect(previousChip).not.toHaveAttribute("aria-disabled");
    fireEvent.click(previousChip);
    expect(scenesProps.onSetlistPrevious).toHaveBeenCalledTimes(1);
  });

  it("without Loop, Previous holds while nothing is recalled yet", async () => {
    const scenesProps = scenesPropsWith({
      activeSetlist: makeSetlist(3),
      setlistIndex: null,
    });
    await renderStrips(scenesProps, historyPropsWith());
    const previousChip = scenesStrip().getByRole("button", {
      name: "Previous step",
    });
    expect(previousChip).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(previousChip);
    expect(scenesProps.onSetlistPrevious).not.toHaveBeenCalled();
  });
});
