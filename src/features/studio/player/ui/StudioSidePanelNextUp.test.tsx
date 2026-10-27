import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { StudioQueueView } from "../studioPlayerContext";
import { StudioSidePanelNextUp } from "./StudioSidePanelNextUp";
import {
  createStudioPlayerValue,
  queueItem,
  queueView,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const YOUR_NEXT = queueItem({
  trackId: "t-yours",
  title: "B",
  artistName: "X",
});
const SOURCE_NEXT = queueItem({
  trackId: "t-source",
  title: "Pier",
  artistName: "NIGHTFORM",
});

function renderNextUp(queue: Partial<StudioQueueView>) {
  const onOpenQueue = vi.fn();
  const player = createStudioPlayerValue({ queue: queueView(queue) });
  const rendered = renderWithPlayer(
    <StudioSidePanelNextUp onOpenQueue={onOpenQueue} />,
    { player },
  );
  return { ...rendered, onOpenQueue };
}

describe("Side panel Next in queue", () => {
  it("shows your queue's first item ahead of the source", () => {
    renderNextUp({
      userItems: [YOUR_NEXT],
      upcomingSourceItems: [SOURCE_NEXT],
    });
    expect(screen.getByRole("heading", { name: "Next in queue" })).toBeTruthy();
    expect(screen.getByText("B")).toBeTruthy();
    expect(screen.queryByText("Pier")).toBeNull();
  });

  it("shows the source's next item when your queue is empty", () => {
    renderNextUp({ upcomingSourceItems: [SOURCE_NEXT] });
    expect(
      screen.getByRole("button", { name: "Play Pier by NIGHTFORM" }),
    ).toBeTruthy();
  });

  it("plays the next item on click", () => {
    const { player } = renderNextUp({ userItems: [YOUR_NEXT] });
    fireEvent.click(screen.getByRole("button", { name: "Play B by X" }));
    expect(player.playEntry).toHaveBeenCalledWith(YOUR_NEXT.queueEntryId);
  });

  it("switches the panel to the queue from Open queue", () => {
    const { onOpenQueue } = renderNextUp({ userItems: [YOUR_NEXT] });
    const heading = screen.getByRole("heading", { name: "Next in queue" });
    // Open queue sits in the section's head row, beside the title.
    fireEvent.click(
      within(heading.parentElement as HTMLElement).getByRole("button", {
        name: "Open queue",
      }),
    );
    expect(onOpenQueue).toHaveBeenCalledTimes(1);
  });

  it("folds away at the end of the queue", () => {
    renderNextUp({ userItems: [], upcomingSourceItems: [] });
    expect(screen.queryByRole("heading", { name: "Next in queue" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Open queue" })).toBeNull();
  });
});
