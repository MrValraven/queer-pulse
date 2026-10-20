import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../../../test/studioPlayerTestValue";
import { DEMO_DRAFT_EPISODE_ID } from "../../../studio/api/studioDemoFormats.data";
import type {
  StudioReleaseDTO,
  StudioTrackSummaryDTO,
} from "../../../studio/api/studio.types";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "../../../studio/player/studioPlayerContext";
import { demoAdminCreatorDraftDetail } from "../../adminCreatorDraftPreviews.data";
import { DEMO_CREATOR_DRAFT_IDS } from "../../adminCreatorDrafts.data";
import { StudioDraftPreview } from "./StudioDraftPreview";
import { toStaffStudioPreview } from "./studioDraftPreview.adapters";

/** The demo detail's preview, the shape staff receive from the server. */
function studioPreviewOf(
  kind: "studio_release" | "studio_episode",
): StudioReleaseDTO {
  const detail = demoAdminCreatorDraftDetail(
    kind,
    DEMO_CREATOR_DRAFT_IDS[kind],
  );
  if (detail?.kind === "studio_release" || detail?.kind === "studio_episode")
    return detail.preview;
  throw new Error(`The demo needs a ${kind} preview`);
}

const showWithDraftEpisode = studioPreviewOf("studio_episode");
const scheduledRelease = studioPreviewOf("studio_release");

function renderWithPlayer(
  element: ReactElement,
  overrides: Partial<StudioPlayerValue> = {},
) {
  const player: StudioPlayerValue = {
    ...createStudioPlayerTestValue(),
    ...overrides,
  };
  render(
    <TestProviders>
      <StudioPlayerContext.Provider value={player}>
        {element}
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return player;
}

describe("StudioDraftPreview", () => {
  it("keeps the draft episode that the public adapter drops", () => {
    const { release, episode } = toStaffStudioPreview(
      showWithDraftEpisode,
      DEMO_DRAFT_EPISODE_ID,
    );
    expect(
      release.tracks.some((track) => track.id === DEMO_DRAFT_EPISODE_ID),
    ).toBe(false);
    expect(episode?.id).toBe(DEMO_DRAFT_EPISODE_ID);
  });

  it("plays nothing when staff press Play", async () => {
    const playTracks = vi.fn(() => Promise.resolve());
    const playRelease = vi.fn(() => Promise.resolve());
    const togglePlay = vi.fn();
    renderWithPlayer(
      <StudioDraftPreview preview={scheduledRelease} episodeTrackId={null} />,
      { playTracks, playRelease, togglePlay },
    );
    const preview = screen.getByRole("region", {
      name: /creatorDrafts\.preview\.label|Preview of this draft/,
    });
    for (const button of within(preview).getAllByRole("button"))
      await userEvent.click(button);
    expect(playTracks).not.toHaveBeenCalled();
    expect(playRelease).not.toHaveBeenCalled();
    expect(togglePlay).not.toHaveBeenCalled();
  });

  it("names the artist without a link", () => {
    renderWithPlayer(
      <StudioDraftPreview preview={scheduledRelease} episodeTrackId={null} />,
    );
    expect(
      screen.queryByRole("link", { name: scheduledRelease.artist.name }),
    ).toBeNull();
    expect(screen.getAllByText(scheduledRelease.artist.name)).not.toHaveLength(
      0,
    );
  });

  it("shows the draft episode on its own under the show", () => {
    renderWithPlayer(
      <StudioDraftPreview
        preview={showWithDraftEpisode}
        episodeTrackId={DEMO_DRAFT_EPISODE_ID}
      />,
    );
    expect(
      screen.getByRole("heading", { name: "Our parents, part two" }),
    ).toBeInTheDocument();
  });

  it("shows the draft episode's content warning as the show page does", () => {
    renderWithPlayer(
      <StudioDraftPreview
        preview={{
          ...showWithDraftEpisode,
          tracks: showWithDraftEpisode.tracks.map(
            (track): StudioTrackSummaryDTO =>
              track.id === DEMO_DRAFT_EPISODE_ID
                ? { ...track, contentWarnings: ["self-harm"] }
                : track,
          ),
        }}
        episodeTrackId={DEMO_DRAFT_EPISODE_ID}
      />,
    );
    const preview = screen.getByRole("region", {
      name: /creatorDrafts\.preview\.label|Preview of this draft/,
    });
    expect(preview.textContent).toMatch(/self-harm/i);
  });

  it("says so when the server leaves the episode out", () => {
    renderWithPlayer(
      <StudioDraftPreview
        preview={{
          ...showWithDraftEpisode,
          tracks: showWithDraftEpisode.tracks.filter(
            (track) => track.id !== DEMO_DRAFT_EPISODE_ID,
          ),
        }}
        episodeTrackId={DEMO_DRAFT_EPISODE_ID}
      />,
    );
    expect(
      screen.getByText(
        /creatorDrafts\.preview\.episodeMissing|This episode has no preview yet/,
      ),
    ).toBeInTheDocument();
  });
});
