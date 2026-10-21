import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import type { StudioTrackRowView } from "./api/studio.adapters";
import type { StudioLikedEntryView } from "./api/studioLiked.adapters";
import type { StudioEpisodeRowView } from "./api/studioEpisodes";
import {
  renderWithPlayer,
  releaseViewFixture,
} from "./player/ui/studioPlayerTestHarness";
import { StudioEpisodeRow } from "./StudioEpisodeRow";
import { StudioLikedEntryRow } from "./StudioLikedEntryRow";
import { StudioPreviewTrackRow } from "./StudioPreviewTrackRow";

const row: StudioTrackRowView = {
  id: "t1",
  position: 1,
  title: "Família",
  durationSeconds: 200,
  durationLabel: "3:20",
  isExplicit: false,
  hasAudio: true,
  href: "/studio/track?id=t1",
  savedId: "studio_track:t1",
  contentWarnings: ["family-rejection"],
};

describe("warning pills on rows", () => {
  it("shows the warning on a preview row", () => {
    render(
      <TestProviders>
        <ol>
          <StudioPreviewTrackRow
            track={row}
            isCurrent={false}
            isPlaying={false}
            isHidden={false}
            onPlay={() => {}}
          />
        </ol>
      </TestProviders>,
    );
    expect(screen.getByText(/family/i)).toBeTruthy();
  });

  it("shows the warning on a liked row", () => {
    const entry: StudioLikedEntryView = {
      entryId: "e1",
      position: 1,
      addedAt: "2026-10-01T00:00:00.000Z",
      isAvailable: true,
      unavailableReason: null,
      addedBy: null,
      trackId: row.id,
      savedId: row.savedId,
      title: row.title,
      savedTitle: row.title,
      href: row.href,
      track: { ...row, release: releaseViewFixture() },
    };
    renderWithPlayer(
      <ol>
        <StudioLikedEntryRow
          entry={entry}
          index={0}
          isCurrent={false}
          isPlaying={false}
          rowRef={() => {}}
          onPlay={() => {}}
          likeOptions={{ isQuiet: true, onToggled: () => {} }}
        />
      </ol>,
    );
    expect(screen.getByText(/family/i)).toBeTruthy();
  });

  it("shows the warning on an episode row", () => {
    const episode: StudioEpisodeRowView = { ...row, number: 1 };
    renderWithPlayer(
      <ol>
        <StudioEpisodeRow
          episode={episode}
          release={releaseViewFixture()}
          index={0}
        />
      </ol>,
    );
    expect(screen.getByText(/family/i)).toBeTruthy();
  });
});
