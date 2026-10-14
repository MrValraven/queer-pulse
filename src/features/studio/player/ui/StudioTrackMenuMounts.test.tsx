import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StudioAlbumTracklist } from "../../StudioAlbumTracklist";
import { StudioLibrarySavedList } from "../../StudioLibrarySavedList";
import { StudioPlaylistEntryRow } from "../../StudioPlaylistEntryRow";
import { StudioSearchTrackRow } from "../../StudioSearchTrackRow";
import { StudioTrackHero } from "../../StudioTrackHero";
import {
  releaseViewFixture,
  renderWithPlayer,
  trackFixture,
} from "./studioPlayerTestHarness";

const release = releaseViewFixture();
const firstTrack = { ...release.tracks[0]!, release };

describe("track menu mounts", () => {
  it("sits on every album track row", async () => {
    renderWithPlayer(<StudioAlbumTracklist release={release} />);
    for (const title of ["Tide", "Pier", "Pending"])
      expect(
        await screen.findByRole("button", {
          name: `More actions for ${title}`,
        }),
      ).toBeInTheDocument();
  });

  it("leaves the rows of a preview without a menu", async () => {
    renderWithPlayer(
      <StudioAlbumTracklist
        release={releaseViewFixture({ isPreview: true })}
      />,
    );
    expect(
      await screen.findByRole("button", { name: "Play Pier" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /More actions for/ }),
    ).toBeNull();
  });

  it("leaves the rows of a taken-down release without a menu", async () => {
    renderWithPlayer(
      <StudioAlbumTracklist
        release={releaseViewFixture({ status: "taken_down" })}
      />,
    );
    expect(
      await screen.findByRole("button", { name: "Play Pier" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /More actions for/ }),
    ).toBeNull();
  });

  it("sits on a search track row", async () => {
    renderWithPlayer(
      <ul>
        <StudioSearchTrackRow track={firstTrack} />
      </ul>,
    );
    expect(
      await screen.findByRole("button", { name: "More actions for Tide" }),
    ).toBeInTheDocument();
  });

  it("sits on a playlist entry row", async () => {
    renderWithPlayer(
      <ul>
        <StudioPlaylistEntryRow
          entry={{
            entryId: "e1",
            position: 1,
            addedAt: "2026-10-01T00:00:00.000Z",
            isAvailable: true,
            unavailableReason: null,
            track: firstTrack,
          }}
          index={0}
          rowCount={1}
          isOwner={false}
          isBusy={false}
          isCurrent={false}
          isPlaying={false}
          registerControl={vi.fn()}
          onPlay={vi.fn()}
          onMove={vi.fn()}
          onDropAt={vi.fn()}
          onRemove={vi.fn()}
        />
      </ul>,
    );
    expect(
      await screen.findByRole("button", { name: "More actions for Tide" }),
    ).toBeInTheDocument();
  });

  it("sits on saved tracks in the library and skips saved releases", async () => {
    renderWithPlayer(
      <StudioLibrarySavedList
        items={[
          {
            id: "studio_track:t1",
            kind: "studio_track",
            title: "Tide",
            href: "/studio/track?id=t1",
          },
          {
            id: "studio_release:r1",
            kind: "studio_release",
            title: "Salt water",
            href: "/studio/album?id=r1",
          },
        ]}
      />,
    );
    expect(
      await screen.findByRole("button", { name: "More actions for Tide" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "More actions for Salt water" }),
    ).toBeNull();
  });

  it("sits in the track hero", async () => {
    renderWithPlayer(
      <StudioTrackHero track={trackFixture()} onTip={vi.fn()} />,
    );
    expect(
      await screen.findByRole("button", { name: "More actions for Tide" }),
    ).toBeInTheDocument();
  });
});
