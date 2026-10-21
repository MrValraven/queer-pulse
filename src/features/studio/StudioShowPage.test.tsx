import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { toReleaseView } from "./api/studio.adapters";
import { demoStudioRelease } from "./api/studioDemoApi";
import { DEMO_SHOW_ID } from "./api/studioDemoFormats.data";
import { clearStudioEpisodeMemory } from "./player/studioEpisodeMemory";
import { StudioAlbumPage } from "./StudioAlbumPage";
import { StudioShowPage } from "./StudioShowPage";

const playback = vi.hoisted(() => ({ hideExplicit: false }));
vi.mock("./api/useStudioPlaybackPreferences", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("./api/useStudioPlaybackPreferences")
  >()),
  useStudioHideExplicit: () => playback.hideExplicit,
}));

afterEach(() => {
  clearStudioEpisodeMemory();
  playback.hideExplicit = false;
});

/** The demo show as a listener sees it, with the named episodes explicit. */
function listenerShow(explicitTitles: string[] = []) {
  const dto = demoStudioRelease(DEMO_SHOW_ID);
  return toReleaseView({
    ...dto,
    isOwner: false,
    tracks: dto.tracks.map((track) => ({
      ...track,
      isExplicit: explicitTitles.includes(track.title),
    })),
  });
}

describe("StudioShowPage (demo, owner)", () => {
  function renderShow() {
    render(
      <TestProviders initialEntries={[`/studio/album?id=${DEMO_SHOW_ID}`]}>
        <StudioAlbumPage />
      </TestProviders>,
    );
  }

  it("renders the show with its episodes newest first", async () => {
    renderShow();
    expect(
      await screen.findByRole("heading", { level: 1, name: "Late Bloomers" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Play latest episode" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", {
      name: "Episodes of Late Bloomers",
    });
    const titles = within(list)
      .getAllByRole("heading", { level: 3 })
      .map((heading) => heading.textContent);
    expect(titles).toEqual([
      "Chosen family dinners",
      "Dating again at 45",
      "Coming out at 40",
    ]);
  });

  it("reverses the order with Oldest", async () => {
    renderShow();
    const oldest = await screen.findByRole("button", { name: "Oldest" });
    fireEvent.click(oldest);
    expect(oldest).toHaveAttribute("aria-pressed", "true");
    const list = screen.getByRole("list", {
      name: "Episodes of Late Bloomers",
    });
    expect(
      within(list).getAllByRole("heading", { level: 3 })[0]?.textContent,
    ).toBe("Coming out at 40");
  });

  it("shows the owner the draft and Add episode", async () => {
    renderShow();
    expect(await screen.findByText("Draft")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Edit episode Our parents, part two/ }),
    ).toHaveAttribute(
      "href",
      `/studio/upload?release=${DEMO_SHOW_ID}&episode=demo-episode-late-bloomers-draft`,
    );
    expect(screen.getByRole("link", { name: "Add episode" })).toHaveAttribute(
      "href",
      `/studio/upload?release=${DEMO_SHOW_ID}&episode=new`,
    );
  });

  it("marks an episode as played and back", async () => {
    renderShow();
    const mark = await screen.findByRole("button", {
      name: "Mark as played Chosen family dinners",
    });
    fireEvent.click(mark);
    expect(
      await screen.findByRole("button", {
        name: "Mark as unplayed Chosen family dinners",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chosen family dinners marked as played"),
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Mark as unplayed Chosen family dinners",
      }),
    );
    expect(
      await screen.findByRole("button", {
        name: "Mark as played Chosen family dinners",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Chosen family dinners marked as unplayed"),
    ).toBeInTheDocument();
  });
});

describe("StudioShowPage (listener)", () => {
  it("hides drafts and Add episode from a listener", async () => {
    const dto = demoStudioRelease(DEMO_SHOW_ID);
    const release = toReleaseView({ ...dto, isOwner: false });
    render(
      <TestProviders>
        <StudioShowPage release={release} onReport={() => {}} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "Coming out at 40",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Draft")).toBeNull();
    expect(screen.queryByText("Our parents, part two")).toBeNull();
    expect(screen.queryByRole("link", { name: "Add episode" })).toBeNull();
  });

  it("gives a scheduled show's visitor Notify me and no episode count", async () => {
    const dto = demoStudioRelease(DEMO_SHOW_ID);
    const release = toReleaseView({
      ...dto,
      isOwner: false,
      status: "scheduled",
      publishAt: "2099-03-01T18:00:00.000Z",
      trackCount: 0,
      tracks: [],
    });
    render(
      <TestProviders>
        <StudioShowPage release={release} onReport={() => {}} />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: /Notify me/ }),
    ).toBeInTheDocument();
    expect(screen.getByText("Podcast")).toBeInTheDocument();
    expect(screen.queryByText(/\d+ episodes?/)).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Play latest episode" }),
    ).toBeNull();
    expect(screen.queryByRole("list", { name: /Episodes of/ })).toBeNull();
  });

  it("hides Play on an explicit episode the settings hide", async () => {
    playback.hideExplicit = true;
    render(
      <TestProviders>
        <StudioShowPage
          release={listenerShow(["Chosen family dinners"])}
          onReport={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByText("Hidden by your settings"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Play Chosen family dinners" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", { name: "Play Dating again at 45" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Explicit" })).toHaveTextContent(
      "E",
    );
    // Play latest episode skips the hidden newest episode.
    expect(
      screen.getByRole("button", { name: "Play latest episode" }),
    ).not.toHaveAttribute("aria-disabled");
  });

  it("disables Play latest episode when the settings hide every episode", async () => {
    playback.hideExplicit = true;
    render(
      <TestProviders>
        <StudioShowPage
          release={listenerShow([
            "Coming out at 40",
            "Dating again at 45",
            "Chosen family dinners",
          ])}
          onReport={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Play latest episode" }),
    ).toHaveAttribute("aria-disabled", "true");
    expect(screen.queryByRole("button", { name: /^Play Coming/ })).toBeNull();
  });

  it("shows the explicit badge and Play while the settings allow it", async () => {
    render(
      <TestProviders>
        <StudioShowPage
          release={listenerShow(["Chosen family dinners"])}
          onReport={() => {}}
        />
      </TestProviders>,
    );
    expect(
      await screen.findByRole("button", { name: "Play Chosen family dinners" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Explicit" })).toBeInTheDocument();
    expect(screen.queryByText("Hidden by your settings")).toBeNull();
  });
});
