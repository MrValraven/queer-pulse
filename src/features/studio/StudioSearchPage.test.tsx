import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useNavigate } from "react-router-dom";
import { toSearchView } from "./api/studio.adapters";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioSearchTrackRow } from "./StudioSearchTrackRow";
import { TestProviders } from "../../test/TestProviders";
import { StudioSearchPage } from "./StudioSearchPage";

describe("StudioSearchPage (demo fixture)", () => {
  it("reads the query and the filter from the URL", async () => {
    render(
      <TestProviders
        initialEntries={["/studio/search?q=devocao&type=releases"]}
      >
        <StudioSearchPage />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("searchbox", {
        name: /releases, tracks and artists/i,
      }),
    ).toHaveValue("devocao");
    expect(screen.getByRole("button", { name: "Releases" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const releases = await screen.findByRole("region", { name: /releases/i });
    expect(
      within(releases).getByRole("link", { name: "Devoção" }),
    ).toBeInTheDocument();
  });

  it("switches the filter in place", async () => {
    render(
      <TestProviders initialEntries={["/studio/search?q=santa"]}>
        <StudioSearchPage />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Tracks" }));
    expect(screen.getByRole("button", { name: "Tracks" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const tracks = await screen.findByRole("region", { name: /tracks/i });
    expect(
      within(tracks).getAllByRole("link", { name: /carta para a santa/i })
        .length,
    ).toBeGreaterThan(0);
  });

  it("says plainly when nothing matches and clears from the empty state", async () => {
    render(
      <TestProviders initialEntries={["/studio/search?q=zzzz"]}>
        <StudioSearchPage />
      </TestProviders>,
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /clear search/i }),
    );
    expect(
      screen.getByRole("searchbox", { name: /releases, tracks and artists/i }),
    ).toHaveValue("");
  });

  it("settles a query with a trailing space: results shown, idle and counted", async () => {
    render(
      <TestProviders initialEntries={["/studio/search"]}>
        <StudioSearchPage />
      </TestProviders>,
    );
    fireEvent.change(
      await screen.findByRole("searchbox", {
        name: /releases, tracks and artists/i,
      }),
      { target: { value: "nightform " } },
    );
    const results = await screen.findByRole(
      "region",
      { name: /artists/i },
      { timeout: 3000 },
    );
    await waitFor(() =>
      expect(results.parentElement).toHaveAttribute("aria-busy", "false"),
    );
    expect(screen.getByRole("status")).toHaveTextContent(/\d+ results?/);
  });

  it("walks a filter change back with the Back button", async () => {
    function BackButton() {
      const navigate = useNavigate();
      return (
        <button type="button" onClick={() => void navigate(-1)}>
          go back
        </button>
      );
    }
    render(
      <TestProviders initialEntries={["/studio/search?q=santa"]}>
        <StudioSearchPage />
        <BackButton />
      </TestProviders>,
    );
    fireEvent.click(await screen.findByRole("button", { name: "Tracks" }));
    expect(screen.getByRole("button", { name: "Tracks" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "go back" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Tracks" })).toHaveAttribute(
        "aria-pressed",
        "false",
      ),
    );
    expect(screen.getByRole("button", { name: "Everything" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

describe("StudioSearchTrackRow", () => {
  it("plays inside its release from a real button outside the link", () => {
    const playRelease = vi.fn(() => Promise.resolve());
    const view = toSearchView({
      releases: [],
      artists: [],
      tracks: [
        {
          id: "t1",
          position: 1,
          title: "Vela acesa",
          durationSeconds: 217,
          isExplicit: false,
          hasAudio: true,
          release: {
            id: "r9",
            title: "Devoção",
            type: "ep",
            coverUrl: null,
            releasedOn: "2026-04-12",
            trackCount: 3,
            totalDurationSeconds: 600,
            artist: {
              id: "p1",
              handle: "rita",
              name: "Rita Ferreira",
              kind: "musician",
              avatarUrl: null,
            },
          },
        },
      ],
    });
    const track = view.tracks[0];
    if (!track) throw new Error("fixture has no track");
    const value = {
      queue: [],
      currentIndex: 0,
      status: "idle",
      currentItem: null,
      hasPrevious: false,
      hasNext: false,
      playRelease,
      playReleases: vi.fn(() => Promise.resolve()),
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
      <TestProviders>
        <StudioPlayerContext.Provider value={value}>
          <ol>
            <StudioSearchTrackRow track={track} />
          </ol>
        </StudioPlayerContext.Provider>
      </TestProviders>,
    );
    const playButton = screen.getByRole("button", { name: /vela acesa/i });
    expect(playButton.tagName).toBe("BUTTON");
    expect(playButton.closest("a")).toBeNull();
    fireEvent.click(playButton);
    expect(playRelease).toHaveBeenCalledWith("r9", "t1");
  });
});
