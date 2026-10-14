import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { clearStudioEpisodeMemory } from "./player/studioEpisodeMemory";
import { StudioPlayerContext } from "./player/studioPlayerContext";
import {
  createStudioPlayerValue,
  renderWithPlayer,
  trackFixture,
} from "./player/ui/studioPlayerTestHarness";
import { StudioEpisodeHero } from "./StudioEpisodeHero";
import { StudioTrackPage } from "./StudioTrackPage";

afterEach(() => clearStudioEpisodeMemory());

function renderTrack(id: string, playTracks = vi.fn(() => Promise.resolve())) {
  const player = { ...createStudioPlayerTestValue(null), playTracks };
  render(
    <TestProviders initialEntries={[`/studio/track?id=${id}`]}>
      <StudioPlayerContext.Provider value={player}>
        <StudioTrackPage />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return playTracks;
}

describe("the episode page (demo)", () => {
  it("shows the show link, the notes and a played toggle", async () => {
    renderTrack("demo-episode-late-bloomers-01");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Coming out at 40",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Late Bloomers" })[0],
    ).toHaveAttribute("href", "/studio/album?id=demo-release-late-bloomers");
    expect(
      screen.getByRole("heading", { name: "Show notes" }),
    ).toBeInTheDocument();
    const helpline = screen.getByRole("link", {
      name: /example\.org\/lisbon-helpline/,
    });
    expect(helpline).toHaveAttribute("target", "_blank");
    expect(helpline.getAttribute("rel")).toContain("nofollow");
    expect(helpline.getAttribute("rel")).toContain("ugc");
    expect(helpline.getAttribute("rel")).toContain("noopener");
    expect(
      screen.getByRole("button", { name: "Mark as played Coming out at 40" }),
    ).toBeInTheDocument();
  });

  it("plays the episode alone from a timestamp in the notes", async () => {
    const playTracks = renderTrack("demo-episode-late-bloomers-01");
    fireEvent.click(
      await screen.findByRole("button", { name: "Play from 04:10" }),
    );
    expect(playTracks).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          trackId: "demo-episode-late-bloomers-01",
          isEpisode: true,
        }),
      ],
      "demo-episode-late-bloomers-01",
      expect.objectContaining({ kind: "release", label: "Late Bloomers" }),
      250,
    );
  });

  it("offers Like and the track menu on a published episode", async () => {
    renderTrack("demo-episode-late-bloomers-01");
    expect(
      await screen.findByRole("button", {
        name: "More actions for Coming out at 40",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Like Coming out at 40" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toBeInTheDocument();
  });

  it("leaves the live set, curator note, split and lead sheet off an episode", async () => {
    renderTrack("demo-episode-late-bloomers-01");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Coming out at 40",
      }),
    ).toBeInTheDocument();
    expect(screen.queryAllByText("Wednesday set")).toHaveLength(0);
    expect(screen.queryByText("Curator's note")).toBeNull();
    expect(screen.queryByText("Where €1 goes when you play this")).toBeNull();
    expect(screen.queryAllByText(/Lead sheet/)).toHaveLength(0);
    expect(
      screen.queryByRole("link", { name: "Lead sheet & chords" }),
    ).toBeNull();
  });

  it("lists the chapters right under the show notes", async () => {
    renderTrack("demo-episode-late-bloomers-01");
    const notesHeading = await screen.findByRole("heading", {
      name: "Show notes",
    });
    const sectionAfterNotes =
      notesHeading.closest("section")?.nextElementSibling;
    expect(sectionAfterNotes).toBeInstanceOf(HTMLElement);
    expect(
      within(sectionAfterNotes as HTMLElement).getByRole("heading", {
        name: "Chapters",
      }),
    ).toBeInTheDocument();
  });

  it("keeps a draft episode inert: no Like, menu or timestamp buttons", async () => {
    const playTracks = renderTrack("demo-episode-late-bloomers-draft");
    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Our parents, part two",
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "More actions for Our parents, part two",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Like Our parents, part two" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "Mark as played Our parents, part two",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Play from 00:00" }),
    ).toBeNull();
    expect(screen.getByText("00:00 Intro")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Share" })).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Play Our parents, part two" }),
    );
    expect(playTracks).not.toHaveBeenCalled();
  });

  it("offers Share on a published episode without audio", async () => {
    renderWithPlayer(
      <StudioEpisodeHero track={trackFixture({ hasAudio: false })} />,
      {
        player: createStudioPlayerValue({ currentItem: null, status: "idle" }),
        initialEntries: ["/studio/track?id=t1"],
      },
    );
    expect(
      await screen.findByRole("button", { name: "Share" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Like Tide" })).toBeNull();
    expect(
      screen.queryByRole("button", { name: "More actions for Tide" }),
    ).toBeNull();
  });

  it("names an episode's chapter list Chapters", async () => {
    renderTrack("demo-episode-late-bloomers-01");
    expect(
      await screen.findByRole("heading", { name: "Chapters" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Tracklist" })).toBeNull();
  });

  it("titles the words Transcript on an episode and on spoken word", async () => {
    renderTrack("demo-episode-late-bloomers-03");
    expect(
      await screen.findByRole("heading", { name: "Transcript" }),
    ).toBeInTheDocument();
  });

  it("titles them Transcript on a spoken word track too", async () => {
    renderTrack("demo-track-lua-01");
    expect(
      await screen.findByRole("heading", { name: "Transcript" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Lyrics" })).toBeNull();
  });

  it("keeps Lyrics on a music track, with no Sources", async () => {
    renderTrack("demo-track-cidade-dos-santos-06");
    expect(
      await screen.findByRole("heading", { name: "Lyrics" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Transcript" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Sources" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Show notes" })).toBeNull();
    expect(screen.getAllByText("Wednesday set").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", { name: "Lead sheet & chords" }),
    ).toBeInTheDocument();
  });

  it("lists the sources of a lip-sync mix", async () => {
    renderTrack("demo-track-vanda-mass-01");
    expect(
      await screen.findByRole("heading", { name: "Sources" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Like a Prayer by Madonna")).toBeInTheDocument();
    expect(screen.getByText("Holy by Sara Tavares")).toBeInTheDocument();
  });
});
