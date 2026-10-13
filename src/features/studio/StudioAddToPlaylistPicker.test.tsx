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
import { StudioAddToPlaylistPicker } from "./StudioAddToPlaylistPicker";

beforeEach(() => resetDemoPlaylists());

function renderPicker(trackIds: string[], onClose = vi.fn()) {
  render(
    <TestProviders>
      <StudioAddToPlaylistPicker
        trackIds={trackIds}
        subjectTitle="Pedro on the 25"
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
