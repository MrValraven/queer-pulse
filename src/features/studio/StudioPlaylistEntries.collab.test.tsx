import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../../shared/api/client";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { useStudioPlaylist } from "./api/useStudioPlaylist";
import { StudioPlaylistEntries } from "./StudioPlaylistEntries";

const control = vi.hoisted(() => ({
  shouldRefuseOrder: false,
  isEntryAlreadyGone: false,
}));
const reorderSpy = vi.hoisted(() => vi.fn());
vi.mock("./api/studioDemoPlaylists", async (importOriginal) => {
  const original =
    await importOriginal<typeof import("./api/studioDemoPlaylists")>();
  return {
    ...original,
    demoReorderPlaylist: (
      ...args: Parameters<typeof original.demoReorderPlaylist>
    ) => {
      reorderSpy(...args);
      if (control.shouldRefuseOrder)
        throw new ApiError(409, "stale", {
          statusCode: 409,
          code: "studio_playlist_order_mismatch",
        });
      return original.demoReorderPlaylist(...args);
    },
    demoRemovePlaylistEntry: (
      ...args: Parameters<typeof original.demoRemovePlaylistEntry>
    ) => {
      // Another editor's removal lands first, then this one answers 404.
      original.demoRemovePlaylistEntry(...args);
      if (control.isEntryAlreadyGone)
        throw new ApiError(404, "gone", {
          statusCode: 404,
          code: "studio_playlist_entry_not_found",
        });
    },
  };
});

beforeEach(() => {
  resetDemoPlaylists();
  control.shouldRefuseOrder = false;
  control.isEntryAlreadyGone = false;
  reorderSpy.mockClear();
});

function Harness({ playlistId }: { playlistId: string }) {
  const { playlist } = useStudioPlaylist(playlistId);
  return playlist ? <StudioPlaylistEntries playlist={playlist} /> : null;
}

function renderEntries(playlistId: string) {
  render(
    <TestProviders>
      <Harness playlistId={playlistId} />
    </TestProviders>,
  );
}

describe("playlist entries, collaborative playlists", () => {
  it("shows the owner who added each track", async () => {
    renderEntries("demo-playlist-for-the-group-chat");
    const list = await screen.findByRole("list", {
      name: /tracks in for the group chat/i,
    });
    expect(within(list).getByText("Added by Catarina Vaz")).toBeInTheDocument();
    expect(within(list).getByText("Added by Tiago Costa")).toBeInTheDocument();
  });

  it("shows a listener no added by", async () => {
    renderEntries("demo-playlist-dyke-bar-standards");
    await screen.findByRole("list", { name: /tracks in lisbon dyke-bar/i });
    expect(screen.queryByText(/^Added by/)).not.toBeInTheDocument();
  });

  it("sends every entry when an editor moves a row", async () => {
    renderEntries("demo-playlist-tour-diary");
    const list = await screen.findByRole("list", {
      name: /tracks in tour diary/i,
    });
    expect(within(list).getAllByRole("listitem")).toHaveLength(4);
    fireEvent.click(
      within(list).getAllByRole("button", {
        name: /^Move .* down$/,
      })[0] as HTMLElement,
    );
    await waitFor(() => expect(reorderSpy).toHaveBeenCalledTimes(1));
    const [playlistId, entryIds] = reorderSpy.mock.calls[0] as [
      string,
      string[],
    ];
    expect(playlistId).toBe("demo-playlist-tour-diary");
    expect(entryIds).toHaveLength(4);
  });

  it("says the playlist just changed when a move is refused", async () => {
    control.shouldRefuseOrder = true;
    renderEntries("demo-playlist-for-the-group-chat");
    const list = await screen.findByRole("list", {
      name: /tracks in for the group chat/i,
    });
    fireEvent.click(
      within(list).getAllByRole("button", {
        name: /^Move .* down$/,
      })[0] as HTMLElement,
    );
    expect(
      await screen.findByText("This playlist just changed. Try again"),
    ).toBeInTheDocument();
  });

  it("settles quietly when another editor removed the entry first", async () => {
    control.isEntryAlreadyGone = true;
    renderEntries("demo-playlist-for-the-group-chat");
    const list = await screen.findByRole("list", {
      name: /tracks in for the group chat/i,
    });
    const before = within(list).getAllByRole("listitem").length;
    fireEvent.click(
      within(list).getAllByRole("button", {
        name: /^Remove .* from the playlist$/,
      })[0] as HTMLElement,
    );
    expect(
      await screen.findByText("Removed from the playlist"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("That track was already removed"),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(within(list).getAllByRole("listitem")).toHaveLength(before - 1),
    );
  });
});
