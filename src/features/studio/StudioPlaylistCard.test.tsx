import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { awaitCatalog } from "../../test/awaitCatalog";
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

async function renderCard(dto: ReturnType<typeof cardDto>) {
  const view = render(
    <TestProviders>
      <StudioPlaylistCard playlist={toPlaylistCardView(dto)} />
    </TestProviders>,
  );
  await awaitCatalog("studio");
  return view;
}

describe("StudioPlaylistCard, collaborative playlists", () => {
  it("marks a playlist the viewer edits and one they share with editors", async () => {
    const edited = await renderCard(cardDto("demo-playlist-tour-diary"));
    expect(screen.getByText("Collaborative")).toBeInTheDocument();
    edited.unmount();
    await renderCard(cardDto("demo-playlist-for-the-group-chat"));
    expect(screen.getByText("Collaborative")).toBeInTheDocument();
  });

  it("leaves a solo playlist and a listener's card unmarked", async () => {
    const solo = await renderCard(cardDto("demo-playlist-kitchen-tapes"));
    expect(screen.queryByText("Collaborative")).not.toBeInTheDocument();
    solo.unmount();
    await renderCard({
      ...cardDto("demo-playlist-for-the-group-chat"),
      isOwner: false,
      role: null,
      editorCount: 4,
    });
    expect(screen.queryByText("Collaborative")).not.toBeInTheDocument();
  });
});

describe("StudioPlaylistCard, invitee", () => {
  it("marks an invitee card Invited and leaves the Collaborative chip off", async () => {
    await renderCard({
      ...cardDto("demo-playlist-for-the-group-chat"),
      isOwner: false,
      role: "invitee",
      editorCount: 4,
    });
    expect(screen.getByText("Invited")).toBeInTheDocument();
    expect(screen.queryByText("Collaborative")).not.toBeInTheDocument();
  });

  it("shows no Invited marker on an owner or editor card", async () => {
    await renderCard(cardDto("demo-playlist-tour-diary"));
    expect(screen.queryByText("Invited")).not.toBeInTheDocument();
  });
});
