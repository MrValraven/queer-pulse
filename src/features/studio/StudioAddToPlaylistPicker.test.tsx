import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resetDemoPlaylists } from "./api/studioDemoPlaylists";
import { resetStudioLibrarySeedForTests } from "./api/useStudioLibrarySaves";
import { StudioAddToPlaylistPicker } from "./StudioAddToPlaylistPicker";
import type { StudioLikeSubject } from "./useStudioLike";

beforeEach(() => {
  resetDemoPlaylists();
  // Likes live in the saved store (localStorage in the demo).
  window.localStorage.clear();
  // The Liked songs row reads the liked list, which seeds the demo library
  // fixture and likes Pedro on the 25. Marking the seed done keeps the
  // store empty, so the track starts unliked.
  resetStudioLibrarySeedForTests();
  window.localStorage.setItem("qp.demo.studioLibrarySeeded.v3", "1");
});

const pedroLike: StudioLikeSubject = {
  trackId: "demo-track-home-4-01",
  title: "Pedro on the 25",
  href: "/studio/track?id=demo-track-home-4-01",
  artistName: "NIGHTFORM",
};

function renderPicker(
  trackIds: string[],
  onClose = vi.fn(),
  likeSubject?: StudioLikeSubject,
) {
  render(
    <TestProviders>
      <StudioAddToPlaylistPicker
        trackIds={trackIds}
        subjectTitle="Pedro on the 25"
        likeSubject={likeSubject}
        onClose={onClose}
      />
    </TestProviders>,
  );
  return onClose;
}

describe("StudioAddToPlaylistPicker", () => {
  it("offers Create playlist first, then the member's own playlists", async () => {
    renderPicker(["demo-track-home-4-01"]);
    const kitchen = await screen.findByRole("button", {
      name: "Add to Kitchen tapes",
    });
    const createPlaylist = screen.getByRole("button", {
      name: "Create playlist",
    });
    expect(
      createPlaylist.compareDocumentPosition(kitchen) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.queryByRole("button", {
        name: "Add to Lisbon dyke-bar standards",
      }),
    ).not.toBeInTheDocument();
  });

  it("offers Liked songs right after Create playlist for a single track", async () => {
    renderPicker(["demo-track-home-4-01"], vi.fn(), pedroLike);
    const kitchen = await screen.findByRole("button", {
      name: "Add to Kitchen tapes",
    });
    const liked = screen.getByRole("button", { name: "Liked songs" });
    const createPlaylist = screen.getByRole("button", {
      name: "Create playlist",
    });
    expect(
      createPlaylist.compareDocumentPosition(liked) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      liked.compareDocumentPosition(kitchen) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(liked).toHaveAttribute("aria-pressed", "false");
  });

  it("likes the track from Liked songs and closes", async () => {
    const onClose = renderPicker(["demo-track-home-4-01"], vi.fn(), pedroLike);
    const liked = await screen.findByRole("button", { name: "Liked songs" });
    fireEvent.click(liked);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(liked).toHaveAttribute("aria-pressed", "true");
  });

  it("leaves Liked songs out when a whole release is added", async () => {
    renderPicker([
      "demo-track-cidade-dos-santos-01",
      "demo-track-cidade-dos-santos-03",
    ]);
    await screen.findByRole("button", { name: "Add to Kitchen tapes" });
    expect(
      screen.queryByRole("button", { name: "Liked songs" }),
    ).not.toBeInTheDocument();
  });

  it("adds the track and says where", async () => {
    const onClose = renderPicker(["demo-track-home-4-01"]);
    fireEvent.click(
      await screen.findByRole("button", { name: "Add to Kitchen tapes" }),
    );
    expect(
      await screen.findByText("Added to Kitchen tapes"),
    ).toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("says when the track was already there", async () => {
    renderPicker(["demo-track-cidade-dos-santos-01"]);
    fireEvent.click(
      await screen.findByRole("button", { name: "Add to Kitchen tapes" }),
    );
    expect(
      await screen.findByText("Already in Kitchen tapes"),
    ).toBeInTheDocument();
  });

  it("says a release had nothing to add when every track is already there", async () => {
    const onClose = renderPicker([
      "demo-track-cidade-dos-santos-01",
      "demo-track-cidade-dos-santos-03",
    ]);
    fireEvent.click(
      await screen.findByRole("button", { name: "Add to Kitchen tapes" }),
    );
    expect(
      await screen.findByText("There are no tracks here you can add yet"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Added to Kitchen tapes"),
    ).not.toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it("creates a playlist from the picker and says once where the track went", async () => {
    const onClose = renderPicker(["demo-track-home-4-01"]);
    await screen.findByRole("button", { name: "Add to Kitchen tapes" });
    fireEvent.click(screen.getByRole("button", { name: "Create playlist" }));
    const dialog = await screen.findByRole("dialog", { name: "New playlist" });
    fireEvent.change(within(dialog).getByRole("textbox", { name: /name/i }), {
      target: { value: "Night bus" },
    });
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Create playlist" }),
    );
    expect(await screen.findByText("Added to Night bus")).toBeInTheDocument();
    expect(screen.queryByText("Playlist created")).not.toBeInTheDocument();
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
