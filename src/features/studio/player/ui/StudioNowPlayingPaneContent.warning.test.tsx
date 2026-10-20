import { useState } from "react";
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StudioQueueItem } from "../studioPlayerContext";
import { StudioNowPlayingPaneContent } from "./StudioNowPlayingPaneContent";
import {
  createStudioPlayerValue,
  queueItem,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

/** The pane as Now playing shows it, with a press that moves it on to the
 *  next track inside the same providers. */
function ItemSwitch({
  first,
  second,
}: {
  first: StudioQueueItem;
  second: StudioQueueItem;
}) {
  const [item, setItem] = useState(first);
  return (
    <>
      <button type="button" onClick={() => setItem(second)}>
        Next track
      </button>
      <StudioNowPlayingPaneContent tab="lyrics" item={item} />
    </>
  );
}

const SYNCED_LINES = [
  { ms: 0, text: "First warned line" },
  { ms: 4000, text: "Second warned line" },
];

/** Spec 6.2 in Now playing: a warned track's words stay covered, also while
 *  the player waits on its warning (spec 6.3). Each test uses its own track
 *  id, as reveals hold for the life of the tab. */
describe("Now playing lyrics of a warned track", () => {
  it("covers the timed lyrics while the warned track waits", () => {
    const warned = queueItem({
      trackId: "np-warned-waiting",
      contentWarnings: ["self-harm"],
    });
    const player = createStudioPlayerValue({
      currentItem: warned,
      pendingWarning: warned,
      currentSyncedLyrics: SYNCED_LINES,
    });
    renderWithPlayer(
      <StudioNowPlayingPaneContent tab="lyrics" item={warned} />,
      { player },
    );
    expect(screen.queryByText("First warned line")).toBeNull();
    const reveal = screen.getByRole("button", { expanded: false });
    fireEvent.click(reveal);
    expect(screen.getByText("First warned line")).toBeTruthy();
  });

  it("starts the next warned track covered after one was uncovered", () => {
    const first = queueItem({
      trackId: "np-warned-first",
      contentWarnings: ["self-harm"],
    });
    const second = queueItem({
      trackId: "np-warned-second",
      contentWarnings: ["police"],
    });
    const player = createStudioPlayerValue({
      currentItem: first,
      currentSyncedLyrics: SYNCED_LINES,
    });
    renderWithPlayer(<ItemSwitch first={first} second={second} />, {
      player,
    });
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("First warned line")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Next track" }));
    expect(screen.queryByText("First warned line")).toBeNull();
  });

  it("shows an unwarned track's lyrics with no reveal", () => {
    const plain = queueItem({ trackId: "np-plain", contentWarnings: [] });
    const player = createStudioPlayerValue({
      currentItem: plain,
      currentSyncedLyrics: SYNCED_LINES,
    });
    renderWithPlayer(
      <StudioNowPlayingPaneContent tab="lyrics" item={plain} />,
      { player },
    );
    expect(screen.getByText("First warned line")).toBeTruthy();
  });
});
