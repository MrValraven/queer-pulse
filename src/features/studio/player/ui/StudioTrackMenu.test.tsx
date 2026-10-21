import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StudioTrackMenu } from "./StudioTrackMenu";
import {
  createClock,
  createStudioPlayerValue,
  queueItem,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

vi.mock("../../share/StudioShareToChatModal", () => ({
  StudioShareToChatModal: ({ title }: { title: string }) => (
    <div role="dialog" aria-label={`Send ${title}`} />
  ),
}));

vi.mock("../../StudioAddToPlaylistPicker", () => ({
  StudioAddToPlaylistPicker: ({ subjectTitle }: { subjectTitle: string }) => (
    <div role="dialog" aria-label={`Add ${subjectTitle} to a playlist`} />
  ),
}));

const TRACK = {
  id: "t9",
  title: "Lighthouse",
  href: "/studio/track?id=t9",
  hasAudio: true,
  isExplicit: false,
};
const writeText = vi.fn(() => Promise.resolve());

beforeEach(() => {
  writeText.mockClear();
  Object.assign(navigator, { clipboard: { writeText } });
});

async function openMenu() {
  fireEvent.click(
    await screen.findByRole("button", { name: "More actions for Lighthouse" }),
  );
  return screen.findByRole("menu");
}

describe("StudioTrackMenu", () => {
  it("opens on the first item and closes on Escape back to the trigger", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    expect(screen.getByRole("menuitem", { name: "Play next" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(
      screen.getByRole("button", { name: "More actions for Lighthouse" }),
    ).toHaveFocus();
  });

  it("moves through the items with the arrow keys, Home and End", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(
      screen.getByRole("menuitem", { name: "Add to queue" }),
    ).toHaveFocus();
    fireEvent.keyDown(menu, { key: "End" });
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Play next" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Home" });
    expect(screen.getByRole("menuitem", { name: "Play next" })).toHaveFocus();
  });

  it("queues the track next and says so", async () => {
    const { player } = renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Play next" }));
    await waitFor(() => expect(player.playNext).toHaveBeenCalledWith("t9"));
    expect(await screen.findByText("Playing next")).toBeInTheDocument();
  });

  it("adds the track to the queue and says so", async () => {
    const { player } = renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Add to queue" }));
    await waitFor(() => expect(player.addToQueue).toHaveBeenCalledWith("t9"));
    expect(await screen.findByText("Added to your queue")).toBeInTheDocument();
  });

  it("says when the track could not join the queue", async () => {
    const player = createStudioPlayerValue({
      addToQueue: vi.fn(() => Promise.resolve(false)),
    });
    renderWithPlayer(<StudioTrackMenu track={TRACK} />, { player });
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Add to queue" }));
    expect(
      await screen.findByText("This track can't join your queue right now"),
    ).toBeInTheDocument();
  });

  it("blocks queue items for an explicit track hidden by the settings", async () => {
    const player = createStudioPlayerValue({
      playbackSettings: { autoplayNext: true, hideExplicit: true },
    });
    renderWithPlayer(
      <StudioTrackMenu track={{ ...TRACK, isExplicit: true }} />,
      {
        player,
      },
    );
    await openMenu();
    const addToQueue = screen.getByRole("menuitem", { name: "Add to queue" });
    expect(addToQueue).toHaveAttribute("aria-disabled", "true");
    expect(addToQueue).toHaveAccessibleDescription("Hidden by your settings");
    expect(screen.getByRole("menuitem", { name: "Play next" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    fireEvent.click(addToQueue);
    expect(player.addToQueue).not.toHaveBeenCalled();
    expect(
      screen.getByRole("menuitem", { name: "Copy link" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("leaves an explicit track open while the setting is off", async () => {
    renderWithPlayer(
      <StudioTrackMenu track={{ ...TRACK, isExplicit: true }} />,
    );
    await openMenu();
    expect(
      screen.getByRole("menuitem", { name: "Add to queue" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("blocks queue items for a track without audio and gives the reason", async () => {
    const { player } = renderWithPlayer(
      <StudioTrackMenu track={{ ...TRACK, hasAudio: false }} />,
    );
    await openMenu();
    const playNext = screen.getByRole("menuitem", { name: "Play next" });
    expect(playNext).toHaveAttribute("aria-disabled", "true");
    expect(playNext).toHaveAccessibleDescription("Processing");
    fireEvent.click(playNext);
    expect(player.playNext).not.toHaveBeenCalled();
  });

  it("offers a timestamped link only for the playing track", async () => {
    const player = createStudioPlayerValue({
      currentItem: queueItem({ trackId: "t9" }),
    });
    renderWithPlayer(<StudioTrackMenu track={TRACK} />, {
      player,
      clock: createClock({ currentTime: 83.9 }),
    });
    await openMenu();
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Copy link at 1:23" }),
    );
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/studio/track?id=t9&t=83`,
      ),
    );
  });

  it("hides the timestamped link while a preview plays", async () => {
    const player = createStudioPlayerValue({
      currentItem: queueItem({ trackId: "t9", previewToken: "b".repeat(64) }),
    });
    renderWithPlayer(<StudioTrackMenu track={TRACK} />, {
      player,
      clock: createClock({ currentTime: 83.9 }),
    });
    await openMenu();
    expect(screen.queryByRole("menuitem", { name: /Copy link at/ })).toBeNull();
    expect(
      screen.getByRole("menuitem", { name: "Copy link" }),
    ).toBeInTheDocument();
  });

  it("copies the plain link for any other track", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    expect(screen.queryByRole("menuitem", { name: /Copy link at/ })).toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Copy link" }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(
        `${window.location.origin}/studio/track?id=t9`,
      ),
    );
    expect(await screen.findByText("Link copied")).toBeInTheDocument();
  });

  it("opens the picker for this track", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Send in a message" }),
    );
    expect(
      await screen.findByRole("dialog", { name: "Send Lighthouse" }),
    ).toBeInTheDocument();
  });

  it("hides Send in a message while a preview of this track plays", async () => {
    const player = createStudioPlayerValue({
      currentItem: queueItem({ trackId: "t9", previewToken: "b".repeat(64) }),
    });
    renderWithPlayer(<StudioTrackMenu track={TRACK} />, { player });
    await openMenu();
    expect(
      screen.queryByRole("menuitem", { name: "Send in a message" }),
    ).toBeNull();
  });
});

describe("StudioTrackMenu items", () => {
  it("lists listening, going, sharing and report items in that order", async () => {
    renderWithPlayer(
      <StudioTrackMenu
        track={{
          ...TRACK,
          artistHref: "/studio/artist?id=a1",
          releaseHref: "/studio/album?id=r1",
          artistName: "Mariana Sol",
        }}
      />,
    );
    await openMenu();
    const labels = screen
      .getAllByRole("menuitem")
      .map((item) => item.textContent);
    expect(labels).toEqual([
      "Play next",
      "Add to queue",
      "Add to playlist",
      "Add to Liked songs",
      "Go to artist",
      "Go to release",
      "Send in a message",
      "Copy link",
    ]);
    expect(screen.getAllByRole("separator")).toHaveLength(2);
    expect(
      screen.getByRole("menuitem", { name: "Go to artist" }),
    ).toHaveAttribute("href", "/studio/artist?id=a1");
  });

  it("names the menu after the track", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    expect(menu).toHaveAccessibleName("Actions for Lighthouse");
  });

  it("opens the playlist picker for this track", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Add to playlist" }));
    expect(
      await screen.findByRole("dialog", {
        name: "Add Lighthouse to a playlist",
      }),
    ).toBeInTheDocument();
  });

  it("hands Add to playlist to the caller when it asks", async () => {
    const onRequestAddToPlaylist = vi.fn();
    renderWithPlayer(
      <StudioTrackMenu
        track={TRACK}
        onRequestAddToPlaylist={onRequestAddToPlaylist}
      />,
    );
    await openMenu();
    fireEvent.click(screen.getByRole("menuitem", { name: "Add to playlist" }));
    expect(onRequestAddToPlaylist).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("jumps to an item by its first letter", async () => {
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    fireEvent.keyDown(menu, { key: "c" });
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toHaveFocus();
  });
});

describe("StudioTrackMenu panel alignment", () => {
  // jsdom lays nothing out: the panel is given a 200 by 160 box, and every
  // element's rect stands in for the trigger's.
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(160);
    return () => vi.restoreAllMocks();
  });

  function panelRectAt(left: number) {
    return vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        left,
        right: left + 200,
        top: 0,
        bottom: 160,
        width: 200,
        height: 160,
        x: left,
        y: 0,
        toJSON: () => ({}),
      });
  }

  it("hangs from the start edge when the end edge would cross the left of the screen", async () => {
    // A trigger whose end edge sits at 80px: a 200px panel hung from it
    // would start at -120px.
    const rectSpy = panelRectAt(-120);
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    expect(menu).toHaveAttribute("data-align", "start");
    rectSpy.mockRestore();
  });

  it("keeps hanging from the end edge when the panel fits", async () => {
    const rectSpy = panelRectAt(240);
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    expect(menu).not.toHaveAttribute("data-align");
    rectSpy.mockRestore();
  });

  it("opens up when the trigger sits near the bottom of the screen", async () => {
    const rectSpy = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        left: 240,
        right: 440,
        top: window.innerHeight - 60,
        bottom: window.innerHeight - 16,
        width: 200,
        height: 160,
        x: 240,
        y: window.innerHeight - 60,
        toJSON: () => ({}),
      });
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    expect(menu).toHaveAttribute("data-placement", "up");
    rectSpy.mockRestore();
  });

  it("opens down when there is room below", async () => {
    const rectSpy = panelRectAt(240);
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    const menu = await openMenu();
    expect(menu).not.toHaveAttribute("data-placement");
    rectSpy.mockRestore();
  });

  it("focuses the first item without scrolling the page", async () => {
    const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
    renderWithPlayer(<StudioTrackMenu track={TRACK} />);
    await openMenu();
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    focusSpy.mockRestore();
  });
});
