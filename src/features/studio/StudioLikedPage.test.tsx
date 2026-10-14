import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { createStudioPlayerTestValue } from "../../test/studioPlayerTestValue";
import { DEMO_LIBRARY_SAVES } from "./studioLibrary.data";
import { resetStudioLibrarySeedForTests } from "./api/useStudioLibrarySaves";
import {
  StudioPlayerContext,
  type StudioPlayerValue,
} from "./player/studioPlayerContext";
import { StudioLikedPage } from "./StudioLikedPage";

beforeEach(() => {
  window.localStorage.clear();
  resetStudioLibrarySeedForTests();
});

/** The demo fixture's track likes, which the seed puts in the saved store. */
const seededTrackLikes = () =>
  DEMO_LIBRARY_SAVES.filter((item) => item.kind === "studio_track");

function renderPage() {
  const playTracks = vi.fn(() => Promise.resolve());
  const player = {
    ...createStudioPlayerTestValue(),
    status: "idle",
    radio: null,
    currentItem: null,
    hasPrevious: false,
    hasNext: false,
    playRelease: vi.fn(() => Promise.resolve()),
    playReleases: vi.fn(() => Promise.resolve()),
    playTracks,
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
    <TestProviders initialEntries={["/studio/liked"]}>
      <StudioPlayerContext.Provider value={player}>
        <StudioLikedPage />
      </StudioPlayerContext.Provider>
    </TestProviders>,
  );
  return { playTracks };
}

async function findList() {
  return screen.findByRole("list", { name: "Tracks in Liked songs" });
}

describe("Liked songs page (demo)", () => {
  it("shows the private heart playlist with every seeded like, each one pressed", async () => {
    renderPage();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Liked songs" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Private")).toBeInTheDocument();
    const list = await findList();
    const rows = within(list).getAllByRole("listitem");
    expect(rows).toHaveLength(seededTrackLikes().length);
    for (const row of rows) {
      expect(
        within(row).getByRole("button", { name: /^like /i }),
      ).toHaveAttribute("aria-pressed", "true");
    }
    expect(
      screen.queryByRole("button", { name: /share/i }),
    ).not.toBeInTheDocument();
  });

  it("plays the playable likes in list order", async () => {
    const { playTracks } = renderPage();
    const list = await findList();
    fireEvent.click(screen.getByRole("button", { name: "Play Liked songs" }));
    const [items] = playTracks.mock.calls[0] as unknown as [
      { trackId: string }[],
    ];
    const queuedIds = items.map((item) => item.trackId);
    expect(queuedIds.length).toBeGreaterThan(0);
    const rowTrackIds = within(list)
      .getAllByRole("link")
      .map((link) =>
        new URL(
          link.getAttribute("href") ?? "",
          "https://qp.test",
        ).searchParams.get("id"),
      );
    expect(queuedIds).toEqual(
      rowTrackIds.filter((trackId) => queuedIds.includes(trackId ?? "")),
    );
  });

  it("takes a row out once its heart is unliked", async () => {
    renderPage();
    const list = await findList();
    const [firstLike] = seededTrackLikes();
    const heart = within(list).getByRole("button", {
      name: `Like ${firstLike?.title ?? ""}`,
    });
    fireEvent.click(heart);
    await waitFor(() =>
      expect(
        within(list).queryByRole("button", {
          name: `Like ${firstLike?.title ?? ""}`,
        }),
      ).not.toBeInTheDocument(),
    );
    expect(within(list).getAllByRole("listitem")).toHaveLength(
      seededTrackLikes().length - 1,
    );
  });

  it("shows the empty state and folds Play and Shuffle away once every like is gone", async () => {
    renderPage();
    const list = await findList();
    for (const item of seededTrackLikes()) {
      fireEvent.click(
        within(list).getByRole("button", { name: `Like ${item.title}` }),
      );
    }
    expect(
      await screen.findByRole("link", { name: "Find music" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Play Liked songs" }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: /shuffle/i }),
    ).not.toBeInTheDocument();
  });
});
