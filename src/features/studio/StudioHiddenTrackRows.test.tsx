import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toSearchTrackView, toTrackView } from "./api/studio.adapters";
import type { StudioReleaseCardDTO } from "./api/studio.types";
import { StudioSearchTrackRow } from "./StudioSearchTrackRow";
import { StudioTrackHero } from "./StudioTrackHero";

const playback = vi.hoisted(() => ({ hideExplicit: true }));
vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => playback.hideExplicit,
}));

afterEach(() => {
  playback.hideExplicit = true;
});

const releaseCard: StudioReleaseCardDTO = {
  id: "release-1",
  title: "Night bus",
  type: "ep",
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 2,
  totalDurationSeconds: 360,
  artist: {
    id: "persona-1",
    handle: "nightform",
    name: "NIGHTFORM",
    kind: "musician",
    avatarUrl: null,
  },
  publishedAt: "2026-04-12T10:00:00.000Z",
  genre: null,
  mood: null,
  scene: null,
};

const explicitTrack = {
  id: "track-1",
  position: 1,
  title: "Loud",
  durationSeconds: 180,
  isExplicit: true,
  hasAudio: true,
};

describe("hidden explicit tracks outside the tracklist", () => {
  it("greys a search result with no play button", async () => {
    render(
      <TestProviders>
        <ul>
          <StudioSearchTrackRow
            track={toSearchTrackView({
              ...explicitTrack,
              release: releaseCard,
            })}
          />
        </ul>
      </TestProviders>,
    );
    expect(
      await screen.findByRole("link", { name: "Hidden by your settings" }),
    ).toHaveAttribute("href", "/studio/settings");
    expect(
      screen.queryByRole("button", { name: "Play Loud" }),
    ).not.toBeInTheDocument();
  });

  it("drops the track page's play button and says why", async () => {
    render(
      <TestProviders>
        <StudioTrackHero
          track={toTrackView({
            ...explicitTrack,
            releaseId: "release-1",
            credits: [],
            lyrics: null,
            syncedLyrics: null,
            chapters: null,
            release: releaseCard,
            personaCredits: [],
          })}
          onTip={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText("Hidden by your settings"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Play Loud" }),
    ).not.toBeInTheDocument();
  });

  it("plays the track as usual once the setting is off", async () => {
    playback.hideExplicit = false;
    render(
      <TestProviders>
        <ul>
          <StudioSearchTrackRow
            track={toSearchTrackView({
              ...explicitTrack,
              release: releaseCard,
            })}
          />
        </ul>
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Play Loud" }),
    ).toBeInTheDocument();
  });
});
