import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioQueueList } from "./StudioQueueList";
import {
  createStudioPlayerValue,
  queueItem,
  queueView,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

type Reorder = (fromIndex: number, toIndex: number) => void;

/** jsdom 25 has no PointerEvent; the grips read `isPrimary` and `button`. */
class PointerEventStub extends MouseEvent {
  readonly isPrimary: boolean;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.isPrimary = init.isPrimary ?? false;
  }
}

/** A primary press (mouse, first finger or pen) on a row's grip. */
function pressGrip(gripIndex: number, init: PointerEventInit = {}) {
  const grip = screen.getAllByTitle("Drag to reorder")[gripIndex];
  fireEvent.pointerDown(grip as HTMLElement, {
    isPrimary: true,
    button: 0,
    ...init,
  });
}

// The drag engine stands in here: a press on a grip hands the test that
// group's latest swap callback, which plays the engine's swaps.
const dragHolder = vi.hoisted(() => ({
  mounts: 0,
  draggingIndex: null as number | null,
  reorder: null as Reorder | null,
}));
vi.mock("../../../subprofiles/useRowDragReorder", async () => {
  const React = await import("react");
  return {
    useRowDragReorder: (onReorder: Reorder) => {
      React.useState(() => {
        dragHolder.mounts += 1;
        return 0;
      });
      const latestRef = React.useRef(onReorder);
      React.useLayoutEffect(() => {
        latestRef.current = onReorder;
      });
      return {
        containerRef: { current: null },
        draggingIndex: dragHolder.draggingIndex,
        gripHandlers: () => ({
          onPointerDown: () => {
            dragHolder.reorder = (fromIndex, toIndex) =>
              latestRef.current(fromIndex, toIndex);
          },
        }),
      };
    },
  };
});

const alpha = queueItem({ trackId: "a", title: "Alpha" });
const bravo = queueItem({ trackId: "b", title: "Bravo" });
const charlie = queueItem({ trackId: "c", title: "Charlie" });
const delta = queueItem({ trackId: "d", title: "Delta" });

beforeEach(() => {
  dragHolder.mounts = 0;
  dragHolder.draggingIndex = null;
  dragHolder.reorder = null;
  vi.stubGlobal("PointerEvent", PointerEventStub);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function playerWith(
  userItems = [bravo, charlie],
  upcomingSourceItems = [delta],
) {
  return createStudioPlayerValue({
    currentItem: alpha,
    queue: queueView({ current: alpha, userItems, upcomingSourceItems }),
  });
}

describe("StudioQueueList", () => {
  it("shows the three groups with their rows", async () => {
    renderWithPlayer(<StudioQueueList headingLevel={2} />, {
      player: playerWith(),
    });
    expect(
      await screen.findByRole("heading", { name: "Now playing" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Your queue" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Next from Salt water" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play Charlie" }),
    ).toBeInTheDocument();
  });

  it("marks a hidden explicit track disabled and keeps move and remove", async () => {
    const explicit = queueItem({
      trackId: "x",
      title: "Xenon",
      isExplicit: true,
    });
    const base = createStudioPlayerValue({
      currentItem: alpha,
      queue: queueView({ current: alpha, userItems: [explicit, bravo] }),
    });
    const player = {
      ...base,
      playbackSettings: { ...base.playbackSettings, hideExplicit: true },
    };
    renderWithPlayer(<StudioQueueList headingLevel={2} />, { player });
    const play = await screen.findByRole("button", { name: "Play Xenon" });
    expect(play).toHaveAttribute("aria-disabled", "true");
    expect(play).toHaveAccessibleDescription("Hidden by your settings");
    fireEvent.click(play);
    expect(player.playEntry).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Move Xenon down" }));
    expect(player.moveUserItem).toHaveBeenCalledWith(0, 1);
    fireEvent.click(
      screen.getByRole("button", { name: "Remove Xenon from the queue" }),
    );
    expect(player.removeEntry).toHaveBeenCalledWith("entry-x");
    expect(
      screen.getByRole("button", { name: "Play Bravo" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("moves with the buttons and keeps focus on the pressed one", async () => {
    const { player, rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      {
        player: playerWith(),
      },
    );
    const moveDown = await screen.findByRole("button", {
      name: "Move Bravo down",
    });
    moveDown.focus();
    fireEvent.click(moveDown);
    expect(player.moveUserItem).toHaveBeenCalledWith(0, 1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Bravo is now number 2",
    );
    // The player commits the new order: Bravo is now the last row.
    rerenderWith({ player: playerWith([charlie, bravo]) });
    const movedDown = screen.getByRole("button", { name: "Move Bravo down" });
    await waitFor(() => expect(movedDown).toHaveFocus());
    expect(movedDown).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", { name: "Move Bravo up" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("removes a row by its entry id and offers Undo in a toast", async () => {
    const { player } = renderWithPlayer(<StudioQueueList headingLevel={2} />, {
      player: playerWith(),
    });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Delta from the queue",
      }),
    );
    expect(player.removeEntry).toHaveBeenCalledWith("entry-d");
    expect(
      await screen.findByText("Removed Delta from the queue"),
    ).toBeInTheDocument();
    // Undo adds the track back; a "Next from" row returns after Your queue.
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() => expect(player.addToQueue).toHaveBeenCalledWith("d"));
  });

  it("offers Undo inside Now playing and runs it once", async () => {
    const { player } = renderWithPlayer(
      <StudioQueueList headingLevel={3} isInDialog />,
      { player: playerWith() },
    );
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Delta from the queue",
      }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Removed Delta from the queue",
    );
    const undo = await screen.findByRole("button", { name: "Undo" });
    fireEvent.click(undo);
    fireEvent.click(undo);
    await waitFor(() => expect(player.addToQueue).toHaveBeenCalledTimes(1));
  });

  it("puts a removed row of Your queue back where it was on Undo", async () => {
    const { player } = renderWithPlayer(<StudioQueueList headingLevel={2} />, {
      player: playerWith(),
    });
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Remove Bravo from the queue",
      }),
    );
    fireEvent.click(await screen.findByRole("button", { name: "Undo" }));
    await waitFor(() => expect(player.addToQueue).toHaveBeenCalledWith("b"));
    // The harness keeps both rows, so the re-added one sits at index 2.
    await waitFor(() => expect(player.moveUserItem).toHaveBeenCalledWith(2, 0));
  });

  it("clears your queue and shows the hint when it is empty", async () => {
    const { player, rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      { player: playerWith() },
    );
    fireEvent.click(await screen.findByRole("button", { name: "Clear queue" }));
    expect(player.clearUserQueue).toHaveBeenCalled();
    expect(
      await screen.findByText("Cleared 2 tracks from your queue"),
    ).toBeInTheDocument();
    rerenderWith({ player: playerWith([]) });
    await waitFor(() =>
      expect(screen.getByText(/Add tracks with Play next/)).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.queryByRole("button", { name: "Clear queue" })).toBeNull(),
    );
  });

  it("shows a private preview's title and artist as plain text", async () => {
    const preview = queueItem({
      trackId: "p",
      title: "Echo",
      artistName: "Unreleased",
      previewToken: "token-1",
    });
    renderWithPlayer(<StudioQueueList headingLevel={2} />, {
      player: createStudioPlayerValue({
        currentItem: preview,
        queue: queueView({
          current: preview,
          userItems: [{ ...preview, queueEntryId: "entry-p2" }],
        }),
      }),
    });
    await screen.findByRole("heading", { name: "Your queue" });
    for (const title of screen.getAllByText("Echo"))
      expect(title.closest("a")).toBeNull();
    for (const artist of screen.getAllByText("Unreleased"))
      expect(artist.closest("a")).toBeNull();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});

describe("StudioQueueList drags and focus", () => {
  it("cancels a drag when the playing entry changes", async () => {
    const { rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      { player: playerWith() },
    );
    await screen.findByRole("heading", { name: "Your queue" });
    const mountsAtRest = dragHolder.mounts;
    // A track change with no drag remounts nothing.
    rerenderWith({
      player: createStudioPlayerValue({
        currentItem: bravo,
        queue: queueView({
          current: bravo,
          userItems: [charlie],
          upcomingSourceItems: [delta],
        }),
      }),
    });
    expect(dragHolder.mounts).toBe(mountsAtRest);
    // The same handover during a drag remounts the groups.
    dragHolder.draggingIndex = 0;
    rerenderWith({
      player: createStudioPlayerValue({
        currentItem: bravo,
        queue: queueView({
          current: bravo,
          userItems: [charlie],
          upcomingSourceItems: [delta],
        }),
      }),
    });
    rerenderWith({
      player: createStudioPlayerValue({
        currentItem: charlie,
        queue: queueView({
          current: charlie,
          userItems: [],
          upcomingSourceItems: [delta],
        }),
      }),
    });
    await waitFor(() =>
      expect(dragHolder.mounts).toBeGreaterThan(mountsAtRest),
    );
  });

  it("says Next up for a ready-made list", async () => {
    const player = createStudioPlayerValue({
      currentItem: alpha,
      queue: queueView({
        current: alpha,
        source: { kind: "tracks", label: "", href: null },
        upcomingSourceItems: [delta],
      }),
    });
    renderWithPlayer(<StudioQueueList headingLevel={2} />, { player });
    const group = (
      await screen.findByRole("heading", { name: "Next up" })
    ).closest("section");
    expect(
      within(group as HTMLElement).getByRole("button", { name: "Play Delta" }),
    ).toBeInTheDocument();
  });

  it("names a radio from its filter", async () => {
    const player = createStudioPlayerValue({
      currentItem: alpha,
      queue: queueView({
        current: alpha,
        source: {
          kind: "radio",
          label: "Eletrónica",
          href: null,
          radioFilter: { kind: "genre", value: "electronic" },
        },
        upcomingSourceItems: [delta],
      }),
    });
    renderWithPlayer(<StudioQueueList headingLevel={2} />, { player });
    expect(
      await screen.findByRole("heading", { name: "Next from Electronic" }),
    ).toBeInTheDocument();
  });

  it("drops a drag swap after the dragged entry moved and leaves focus alone", async () => {
    const { player, rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      { player: playerWith() },
    );
    const clear = await screen.findByRole("button", { name: "Clear queue" });
    clear.focus();
    // Pick up Bravo (the first grip belongs to Your queue's first row).
    const [firstGrip] = screen.getAllByTitle("Drag to reorder");
    fireEvent.pointerDown(firstGrip as HTMLElement, {
      isPrimary: true,
      button: 0,
    });
    dragHolder.draggingIndex = 0;
    rerenderWith({ player: playerWith() });
    act(() => {
      dragHolder.reorder?.(0, 1);
    });
    expect(player.moveUserItem).toHaveBeenCalledWith(0, 1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Bravo is now number 2",
    );
    expect(clear).toHaveFocus();
    // The order changed under the drag: index 0 is Charlie now.
    rerenderWith({ player: playerWith([charlie, bravo]) });
    vi.mocked(player.moveUserItem).mockClear();
    act(() => {
      dragHolder.reorder?.(0, 1);
    });
    expect(player.moveUserItem).not.toHaveBeenCalled();
    act(() => {
      dragHolder.reorder?.(1, 0);
    });
    expect(player.moveUserItem).toHaveBeenCalledWith(1, 0);
    // The drag ends: the picked entry is forgotten.
    dragHolder.draggingIndex = null;
    rerenderWith({ player: playerWith([bravo, charlie]) });
    vi.mocked(player.moveUserItem).mockClear();
    act(() => {
      dragHolder.reorder?.(0, 1);
    });
    expect(player.moveUserItem).not.toHaveBeenCalled();
  });

  it("sends focus to the next row's Remove and makes the leaving row inert", async () => {
    const { rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      { player: playerWith() },
    );
    const removeBravo = await screen.findByRole("button", {
      name: "Remove Bravo from the queue",
    });
    removeBravo.focus();
    fireEvent.click(removeBravo);
    rerenderWith({ player: playerWith([charlie]) });
    expect(removeBravo.closest('[role="listitem"]')).toHaveAttribute("inert");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Remove Charlie from the queue" }),
      ).toHaveFocus(),
    );
  });

  it("sends focus to the heading when the last row goes", async () => {
    const { rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      { player: playerWith([bravo]) },
    );
    const removeBravo = await screen.findByRole("button", {
      name: "Remove Bravo from the queue",
    });
    removeBravo.focus();
    fireEvent.click(removeBravo);
    rerenderWith({ player: playerWith([]) });
    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Your queue" })).toHaveFocus(),
    );
  });
});

describe("StudioQueueList press and focus guards", () => {
  it("picks the dragged entry at press time, before any render", async () => {
    const { player } = renderWithPlayer(<StudioQueueList headingLevel={2} />, {
      player: playerWith(),
    });
    await screen.findByRole("heading", { name: "Your queue" });
    // The engine's first swap can land before any effect runs.
    pressGrip(0);
    act(() => {
      dragHolder.reorder?.(0, 1);
    });
    expect(player.moveUserItem).toHaveBeenCalledWith(0, 1);
  });

  it("keeps the first press when another press comes before the drag starts", async () => {
    const { player } = renderWithPlayer(<StudioQueueList headingLevel={2} />, {
      player: playerWith(),
    });
    await screen.findByRole("heading", { name: "Your queue" });
    pressGrip(0);
    // A second press on Charlie's grip, then a second finger: the engine
    // turns both away, so Bravo stays the dragged entry.
    pressGrip(1);
    pressGrip(1, { isPrimary: false });
    act(() => {
      dragHolder.reorder?.(0, 1);
    });
    expect(player.moveUserItem).toHaveBeenCalledWith(0, 1);
    // The first pointer lifts: the pick is forgotten.
    fireEvent.pointerUp(window, { isPrimary: true, button: 0 });
    vi.mocked(player.moveUserItem).mockClear();
    act(() => {
      dragHolder.reorder?.(0, 1);
    });
    expect(player.moveUserItem).not.toHaveBeenCalled();
  });

  it("keeps focus on Remove when the player leaves the order unchanged", async () => {
    const { rerenderWith } = renderWithPlayer(
      <StudioQueueList headingLevel={2} />,
      { player: playerWith() },
    );
    const removeBravo = await screen.findByRole("button", {
      name: "Remove Bravo from the queue",
    });
    removeBravo.focus();
    fireEvent.click(removeBravo);
    expect(removeBravo).toHaveFocus();
    // The queue updates with Bravo still in place: the removal was declined.
    rerenderWith({ player: playerWith() });
    expect(removeBravo).toHaveFocus();
    // The request has ended: a later change of order pulls nothing.
    rerenderWith({ player: playerWith([charlie]) });
    expect(
      screen.getByRole("button", { name: "Remove Charlie from the queue" }),
    ).not.toHaveFocus();
  });
});
