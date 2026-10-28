import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toPlaylistView } from "./api/studio.adapters";
import {
  demoStudioPlaylist,
  resetDemoPlaylists,
} from "./api/studioDemoPlaylists";
import { StudioPlaylistHero } from "./StudioPlaylistHero";

beforeEach(() => resetDemoPlaylists());

function renderHero(playlistId: string) {
  const onOwnerAction = vi.fn();
  const onOpenEditors = vi.fn();
  render(
    <TestProviders>
      <StudioPlaylistHero
        playlist={toPlaylistView(demoStudioPlaylist(playlistId))}
        onOwnerAction={onOwnerAction}
        onOpenEditors={onOpenEditors}
      />
    </TestProviders>,
  );
  return { onOwnerAction, onOpenEditors };
}

async function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Playlist actions" }));
  return screen.findByRole("menu");
}

describe("StudioPlaylistHero, collaborative playlists", () => {
  it("gives the owner the chip, which opens the editors, and Manage editors", async () => {
    const { onOwnerAction, onOpenEditors } = renderHero(
      "demo-playlist-for-the-group-chat",
    );
    const chip = screen.getByRole("button", {
      name: "Collaborative playlist with 2 editors. See who edits it",
    });
    fireEvent.click(chip);
    expect(onOpenEditors).toHaveBeenCalledTimes(1);
    const menu = await openMenu();
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual([
      "Edit details",
      "Change visibility",
      "Manage editors",
      "Delete playlist",
    ]);
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "Manage editors" }),
    );
    expect(onOwnerAction).toHaveBeenCalledWith("manageEditors");
  });

  it("gives an editor Edit details and Leave playlist, and no heart", async () => {
    const { onOwnerAction } = renderHero("demo-playlist-tour-diary");
    expect(
      screen.getByRole("button", {
        name: "Collaborative playlist with 1 editor. See who edits it",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Like Tour diary" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Private")).not.toBeInTheDocument();
    const menu = await openMenu();
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Edit details", "Leave playlist"]);
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: "Leave playlist" }),
    );
    expect(onOwnerAction).toHaveBeenCalledWith("leave");
  });

  it("shows an invitee and a listener no chip and no menu", () => {
    for (const playlistId of [
      "demo-playlist-pride-warm-up",
      "demo-playlist-dyke-bar-standards",
    ]) {
      const { unmount } = render(
        <TestProviders>
          <StudioPlaylistHero
            playlist={toPlaylistView(demoStudioPlaylist(playlistId))}
            onOwnerAction={vi.fn()}
            onOpenEditors={vi.fn()}
          />
        </TestProviders>,
      );
      expect(
        screen.queryByRole("button", { name: /collaborative playlist/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Playlist actions" }),
      ).not.toBeInTheDocument();
      unmount();
    }
  });

  it("shows the owner of a solo playlist no chip", () => {
    renderHero("demo-playlist-kitchen-tapes");
    expect(
      screen.queryByRole("button", { name: /collaborative playlist/i }),
    ).not.toBeInTheDocument();
  });
});
