import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toPlaylistCardView } from "./api/studio.adapters";
import {
  demoMyPlaylistsPage,
  resetDemoPlaylists,
} from "./api/studioDemoPlaylists";
import { StudioPlaylistCard } from "./StudioPlaylistCard";

beforeEach(() => resetDemoPlaylists());

function cardDto(playlistId: string) {
  const card = demoMyPlaylistsPage(null).items.find(
    (item) => item.id === playlistId,
  );
  if (!card) throw new Error(`fixture has no ${playlistId}`);
  return card;
}

function renderCard(dto: ReturnType<typeof cardDto>) {
  return render(
    <TestProviders>
      <StudioPlaylistCard playlist={toPlaylistCardView(dto)} />
    </TestProviders>,
  );
}

describe("StudioPlaylistCard, collaborative playlists", () => {
  it("marks a playlist the viewer edits and one they share with editors", () => {
    const edited = renderCard(cardDto("demo-playlist-tour-diary"));
    expect(screen.getByText("Collaborative")).toBeInTheDocument();
    edited.unmount();
    renderCard(cardDto("demo-playlist-for-the-group-chat"));
    expect(screen.getByText("Collaborative")).toBeInTheDocument();
  });

  it("leaves a solo playlist and a listener's card unmarked", () => {
    const solo = renderCard(cardDto("demo-playlist-kitchen-tapes"));
    expect(screen.queryByText("Collaborative")).not.toBeInTheDocument();
    solo.unmount();
    renderCard({
      ...cardDto("demo-playlist-for-the-group-chat"),
      isOwner: false,
      role: null,
      editorCount: 4,
    });
    expect(screen.queryByText("Collaborative")).not.toBeInTheDocument();
  });
});

describe("StudioPlaylistCard, invitee", () => {
  it("marks an invitee card Invited and leaves the Collaborative chip off", () => {
    renderCard({
      ...cardDto("demo-playlist-for-the-group-chat"),
      isOwner: false,
      role: "invitee",
      editorCount: 4,
    });
    expect(screen.getByText("Invited")).toBeInTheDocument();
    expect(screen.queryByText("Collaborative")).not.toBeInTheDocument();
  });

  it("shows no Invited marker on an owner or editor card", () => {
    renderCard(cardDto("demo-playlist-tour-diary"));
    expect(screen.queryByText("Invited")).not.toBeInTheDocument();
  });
});
