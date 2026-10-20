import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { toReleaseView } from "./api/studio.adapters";
import type { StudioReleaseDTO } from "./api/studio.types";
import { StudioPlayerContext } from "./player/studioPlayerContext";
import { StudioAlbumTracklist } from "./StudioAlbumTracklist";

vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => false,
}));

function releaseFor(isOwner: boolean) {
  const dto: StudioReleaseDTO = {
    id: "r1",
    title: "Devoção",
    type: "album",
    coverUrl: null,
    releasedOn: "2026-03-01",
    trackCount: 2,
    totalDurationSeconds: 400,
    artist: {
      id: "p1",
      handle: "mariana",
      name: "Mariana Sol",
      kind: "musician",
      avatarUrl: null,
    },
    description: null,
    genre: null,
    mood: null,
    scene: null,
    status: "published",
    publishedAt: "2026-03-01T10:00:00.000Z",
    tracks: [
      {
        id: "t1",
        position: 1,
        title: "Devoção",
        durationSeconds: 200,
        isExplicit: false,
        hasAudio: true,
        contentWarnings: ["family-rejection"],
      },
      {
        id: "t2",
        position: 2,
        title: "Vela acesa",
        durationSeconds: 200,
        isExplicit: false,
        hasAudio: true,
        isWithheld: true,
      },
    ],
    isOwner,
    rightsConfirmedAt: null,
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
  };
  return toReleaseView(dto);
}

function renderList(isOwner: boolean) {
  return render(
    <TestProviders>
      <StudioPlayerContext.Provider value={createStudioPlayerTestValue()}>
        <StudioAlbumTracklist release={releaseFor(isOwner)} />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
}

describe("StudioAlbumTracklist, Studio safety", () => {
  it("keeps a listener's withheld row in place as Unavailable, with nothing to press", () => {
    renderList(false);
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    const withheld = rows[1] as HTMLElement;
    expect(within(withheld).getByText("Unavailable")).toBeTruthy();
    expect(within(withheld).queryByRole("button")).toBeNull();
    expect(within(withheld).queryByText("Vela acesa")).toBeNull();
    expect(within(withheld).getByText("2")).toBeTruthy();
  });

  it("shows the warning pill on a warned row", () => {
    renderList(false);
    const first = screen.getAllByRole("listitem")[0] as HTMLElement;
    expect(within(first).getByText(/family/i)).toBeTruthy();
  });

  it("keeps the owner's withheld row whole", () => {
    renderList(true);
    expect(screen.getByText("Vela acesa")).toBeTruthy();
  });
});
