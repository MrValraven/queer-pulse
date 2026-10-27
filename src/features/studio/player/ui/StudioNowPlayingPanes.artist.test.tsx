import { fireEvent, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioChapterView } from "../../api/studio.adapters";
import type {
  StudioNowPlayingTab,
  StudioPlayerSurfaceValue,
} from "../studioPlayerSurface";
import { StudioNowPlayingPanes } from "./StudioNowPlayingPanes";
import {
  createStudioPlayerValue,
  createSurfaceValue,
  queueItem,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const surfaceModule = vi.hoisted(() => ({
  value: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("../studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceModule.value,
}));
vi.mock("./StudioNowPlayingArtistPane", () => ({
  StudioNowPlayingArtistPane: () => <div data-testid="artist-pane-marker" />,
}));
vi.mock("./StudioQueueList", () => ({
  StudioQueueList: () => <div data-testid="queue-list-marker" />,
}));

const CHAPTERS: StudioChapterView[] = [
  { title: "Intro", startSeconds: 0, artist: null, timeLabel: "0:00" },
];

beforeEach(() => {
  surfaceModule.value = createSurfaceValue({ nowPlayingTab: "lyrics" });
});

function renderPanes({
  isPhone,
  isEpisode = false,
  hasChapters = false,
  nowPlayingTab = "lyrics",
}: {
  isPhone: boolean;
  nowPlayingTab?: StudioNowPlayingTab;
  isEpisode?: boolean;
  hasChapters?: boolean;
}) {
  surfaceModule.value = createSurfaceValue({ nowPlayingTab });
  const item = queueItem({ isEpisode });
  const player = createStudioPlayerValue({
    currentItem: item,
    currentChapters: hasChapters ? CHAPTERS : null,
  });
  return renderWithPlayer(
    <StudioNowPlayingPanes item={item} isPhone={isPhone} />,
    { player },
  );
}

describe("StudioNowPlayingPanes artist tab", () => {
  it("orders the phone switcher queue, lyrics, artist, credits", () => {
    renderPanes({ isPhone: true });
    const switcher = screen.getByRole("group", {
      name: "Now playing details",
    });
    const labels = within(switcher)
      .getAllByRole("button")
      .map((button) => button.textContent);
    expect(labels).toEqual(["Queue", "Lyrics", "Artist", "Credits"]);
  });

  it("puts Artist last before Chapters on desktop", () => {
    renderPanes({ isPhone: false, hasChapters: true });
    const tabs = screen.getAllByRole("tab").map((tab) => tab.textContent);
    expect(tabs).toEqual(["Lyrics", "Queue", "Credits", "Artist", "Chapters"]);
  });

  it("names the tab Show for an episode", () => {
    renderPanes({ isPhone: false, isEpisode: true });
    expect(screen.getByRole("tab", { name: "Show" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Artist" })).toBeNull();
  });

  it("shows the artist sections on the Artist tab", async () => {
    renderPanes({ isPhone: false });
    fireEvent.click(screen.getByRole("tab", { name: "Artist" }));
    expect(await screen.findByTestId("artist-pane-marker")).toBeInTheDocument();
  });

  it("keeps Artist active when it is the saved tab", () => {
    const phone = renderPanes({ isPhone: true, nowPlayingTab: "artist" });
    expect(screen.getByRole("button", { name: "Artist" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    phone.unmount();
    renderPanes({ isPhone: false, nowPlayingTab: "artist" });
    expect(screen.getByRole("tab", { name: "Artist" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
