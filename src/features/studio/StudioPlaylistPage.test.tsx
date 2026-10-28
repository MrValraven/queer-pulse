import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { resetStudioLibrarySeedForTests } from "./api/useStudioLibrarySaves";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioCollectionPage } from "./StudioCollectionPage";

const playback = vi.hoisted(() => ({ hideExplicit: false }));
vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => playback.hideExplicit,
}));

beforeEach(() => {
  resetDemoPlaylists();
  playback.hideExplicit = false;
  // The shell seeds the demo library fixture, which saves the dyke-bar
  // playlist. Marking the seed done keeps the saved store empty, so a
  // viewer meets the playlist unsaved.
  window.localStorage.removeItem("qp.saved.v1");
  resetStudioLibrarySeedForTests();
  window.localStorage.setItem("qp.demo.studioLibrarySeeded.v4", "1");
});

function renderPage(playlistId: string) {
  const playTracks = vi.fn(() => Promise.resolve());
  const player = {
    ...createStudioPlayerTestValue(),
    status: "idle",
    radio: null,
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease: vi.fn(() => Promise.resolve()),
    playReleases: vi.fn(() => Promise.resolve()),
    playTracks,
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    retry: vi.fn(),
    stop: vi.fn(),
    isCurrentRelease: () => false,
    isCurrentTrack: () => false,
  } satisfies StudioPlayerValue;
  render(
    <TestProviders initialEntries={[`/studio/collection?id=${playlistId}`]}>
      <StudioPlayerContext.Provider value={player}>
        <StudioCollectionPage />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return { playTracks };
}

describe("playlist page (demo)", () => {
  it("shows the owner every entry, a withdrawn one greyed with Remove only", async () => {
    renderPage("demo-playlist-kitchen-tapes");
    expect(
      await screen.findByRole("heading", { level: 1, name: "Kitchen tapes" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: /tracks in kitchen tapes/i });
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
    expect(within(list).getByText("Withdrawn")).toBeInTheDocument();
    expect(
      within(list).getByRole("button", {
        name: "Remove entry 3 from the playlist",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Playlist actions" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Like Kitchen tapes" }),
    ).not.toBeInTheDocument();
  });

  it("plays only what can be played, in playlist order", async () => {
    const { playTracks } = renderPage("demo-playlist-kitchen-tapes");
    fireEvent.click(
      await screen.findByRole("button", { name: "Play Kitchen tapes" }),
    );
    const [items] = playTracks.mock.calls[0] as unknown as [
      { trackId: string }[],
    ];
    expect(items.map((item) => item.trackId)).toEqual([
      "demo-track-cidade-dos-santos-01",
      "demo-track-cidade-dos-santos-03",
      "demo-track-mariana-3-01",
      "demo-track-home-1-01",
    ]);
  });

  it("moves a row down, keeps focus on the pressed button and says where it went", async () => {
    renderPage("demo-playlist-kitchen-tapes");
    const moveDown = await screen.findByRole("button", {
      name: "Move Abertura: a luz down",
    });
    moveDown.focus();
    fireEvent.click(moveDown);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Move Abertura: a luz down" }),
      ).toHaveFocus(),
    );
    expect(
      await screen.findByText("Abertura: a luz is now number 2"),
    ).toBeInTheDocument();
  });

  it("gives an unavailable row no drag handle", async () => {
    renderPage("demo-playlist-kitchen-tapes");
    const list = await screen.findByRole("list", {
      name: /tracks in kitchen tapes/i,
    });
    const rows = within(list).getAllByRole("listitem");
    const unavailableRow = within(list).getByText("Withdrawn").closest("li");
    expect(unavailableRow).not.toBeNull();
    expect(unavailableRow?.querySelector('[draggable="true"]')).toBeNull();
    expect(rows[0]?.querySelector('[draggable="true"]')).not.toBeNull();
  });

  it("moves focus to the previous row's Remove after removing the last row", async () => {
    renderPage("demo-playlist-kitchen-tapes");
    const list = await screen.findByRole("list", {
      name: /tracks in kitchen tapes/i,
    });
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(5);
    const lastRemove = within(rows[4] as HTMLElement).getByRole("button", {
      name: /^remove /i,
    });
    const previousRemove = within(rows[3] as HTMLElement).getByRole("button", {
      name: /^remove /i,
    });
    lastRemove.focus();
    fireEvent.click(lastRemove);
    await waitFor(() => expect(previousRemove).toHaveFocus());
  });

  it("gives a viewer the heart and no owner controls or visibility", async () => {
    renderPage("demo-playlist-dyke-bar-standards");
    await screen.findByRole("heading", {
      level: 1,
      name: "Lisbon dyke-bar standards",
    });
    expect(screen.getByRole("link", { name: "Sara Marques" })).toHaveAttribute(
      "href",
      "/members/sara-marques",
    );
    expect(
      screen.getByRole("button", { name: "Like Lisbon dyke-bar standards" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Playlist actions" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Public")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^move /i }),
    ).not.toBeInTheDocument();
  });

  it("answers a playlist nobody can see with the not-found state", async () => {
    renderPage("no-such-playlist");
    expect(
      await screen.findByText("We can't find that in Studio"),
    ).toBeInTheDocument();
  });

  it("reads any other loss as No longer available, with Remove", async () => {
    renderPage("demo-playlist-for-the-group-chat");
    const list = await screen.findByRole("list", {
      name: /tracks in for the group chat/i,
    });
    expect(within(list).getByText("No longer available")).toBeInTheDocument();
    expect(
      within(list).getByRole("button", {
        name: "Remove entry 3 from the playlist",
      }),
    ).toBeInTheDocument();
  });

  it("greys a hidden explicit track with no play button", async () => {
    playback.hideExplicit = true;
    renderPage("demo-playlist-dyke-bar-standards");
    const list = await screen.findByRole("list", {
      name: /tracks in lisbon dyke-bar standards/i,
    });
    expect(
      within(list).getByText("Hidden by your settings"),
    ).toBeInTheDocument();
    expect(
      within(list).queryByRole("button", { name: "Play A Beja" }),
    ).not.toBeInTheDocument();
  });
});

describe("collaborative playlists (demo)", () => {
  function renderRoutedPage(playlistId: string) {
    render(
      <TestProviders initialEntries={[`/studio/collection?id=${playlistId}`]}>
        <Routes>
          <Route path="/studio/collection" element={<StudioCollectionPage />} />
          <Route path="/studio/library" element={<p>Library page</p>} />
        </Routes>
      </TestProviders>,
    );
  }

  it("shows an invitee the banner, and Accept makes them an editor", async () => {
    renderRoutedPage("demo-playlist-pride-warm-up");
    expect(
      await screen.findByRole("heading", {
        name: "Catarina Vaz invited you to edit this playlist",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Playlist actions" }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Accept invite" }));
    expect(
      await screen.findByText("You can now edit Pride warm-up"),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("heading", {
          name: "Catarina Vaz invited you to edit this playlist",
        }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("button", { name: "Playlist actions" }),
    ).toBeInTheDocument();
  });

  it("moves focus to Playlist actions after Accept", async () => {
    renderRoutedPage("demo-playlist-pride-warm-up");
    const accept = await screen.findByRole("button", { name: "Accept invite" });
    accept.focus();
    fireEvent.click(accept);
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Playlist actions" }),
      ).toHaveFocus(),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Like Pride warm-up" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("leaves for the library after Decline", async () => {
    renderRoutedPage("demo-playlist-pride-warm-up");
    fireEvent.click(
      await screen.findByRole("button", { name: "Decline invite" }),
    );
    expect(await screen.findByText("Library page")).toBeInTheDocument();
    expect(await screen.findByText("Invite declined")).toBeInTheDocument();
  });

  it("lets an editor leave through the menu", async () => {
    renderRoutedPage("demo-playlist-tour-diary");
    fireEvent.click(
      await screen.findByRole("button", { name: "Playlist actions" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Leave playlist" }),
    );
    const confirm = await screen.findByRole("dialog", {
      name: "Leave Tour diary?",
    });
    fireEvent.click(
      within(confirm).getByRole("button", { name: "Leave playlist" }),
    );
    expect(await screen.findByText("Library page")).toBeInTheDocument();
    expect(await screen.findByText("You left Tour diary")).toBeInTheDocument();
  });

  it("opens the editors from Manage editors for the owner", async () => {
    renderRoutedPage("demo-playlist-for-the-group-chat");
    fireEvent.click(
      await screen.findByRole("button", { name: "Playlist actions" }),
    );
    fireEvent.click(
      await screen.findByRole("menuitem", { name: "Manage editors" }),
    );
    const sheet = await screen.findByRole("dialog", { name: "Editors" });
    expect(within(sheet).getByText("Luísa Gomes")).toBeInTheDocument();
    expect(within(sheet).getByText("Invite sent")).toBeInTheDocument();
  });

  it("opens the editors from the chip for an editor", async () => {
    renderRoutedPage("demo-playlist-tour-diary");
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Collaborative playlist with 1 editor. See who edits it",
      }),
    );
    const sheet = await screen.findByRole("dialog", { name: "Editors" });
    expect(within(sheet).getByText("Tiago Costa")).toBeInTheDocument();
  });
});
