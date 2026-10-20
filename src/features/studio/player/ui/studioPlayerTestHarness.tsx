import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import {
  createStudioPlayerTestValue,
  testPlayerClock,
} from "../../../../test/studioPlayerTestValue";
import {
  toReleaseView,
  toTrackView,
  type StudioReleaseView,
  type StudioTrackView,
} from "../../api/studio.adapters";
import type { StudioReleaseDTO, StudioTrackDTO } from "../../api/studio.types";
import {
  StudioPlayerClockContext,
  StudioPlayerContext,
  type StudioPlayerClock,
  type StudioPlayerValue,
  type StudioQueueItem,
  type StudioQueueView,
} from "../studioPlayerContext";
import type { StudioPlayerSurfaceValue } from "../studioPlayerSurface";

/** One queue entry; the entry id follows the track id unless given. */
export function queueItem(
  overrides: Partial<StudioQueueItem> = {},
): StudioQueueItem {
  const trackId = overrides.trackId ?? "t1";
  return {
    queueEntryId: `entry-${trackId}`,
    trackId,
    title: "Tide",
    durationSeconds: 200,
    trackHref: `/studio/track?id=${trackId}`,
    releaseId: "r1",
    releaseTitle: "Salt water",
    coverUrl: null,
    tint: "coral",
    artistId: "p1",
    artistName: "NIGHTFORM",
    artistHref: "/studio/artist?id=p1",
    isExplicit: false,
    ...overrides,
  };
}

/** The queue as Plan 3's tests expect it: a release source named "Salt water". */
export function queueView(
  overrides: Partial<StudioQueueView> = {},
): StudioQueueView {
  return {
    source: {
      kind: "release",
      label: "Salt water",
      href: "/studio/album?id=r1",
    },
    current: queueItem(),
    userItems: [],
    upcomingSourceItems: [],
    isShuffled: false,
    repeat: "off",
    ...overrides,
  };
}

/** Plan 2's complete value (`createStudioPlayerTestValue`), playing, with a
 *  named source and every action a `vi.fn` so tests can assert on it. */
export function createStudioPlayerValue(
  overrides: Partial<StudioPlayerValue> = {},
): StudioPlayerValue {
  const current =
    overrides.currentItem === undefined ? queueItem() : overrides.currentItem;
  return {
    ...createStudioPlayerTestValue(current),
    status: current ? "playing" : "idle",
    queue: queueView({ current }),
    playRelease: vi.fn(() => Promise.resolve()),
    playReleases: vi.fn(() => Promise.resolve()),
    playTracks: vi.fn(() => Promise.resolve()),
    togglePlay: vi.fn(),
    next: vi.fn(),
    previous: vi.fn(),
    seek: vi.fn(),
    retry: vi.fn(),
    stop: vi.fn(),
    playWarnedTrack: vi.fn(),
    skipWarnedTrack: vi.fn(),
    playNext: vi.fn(() => Promise.resolve(true)),
    addToQueue: vi.fn(() => Promise.resolve(true)),
    moveUserItem: vi.fn(),
    moveUpcomingSourceItem: vi.fn(),
    removeEntry: vi.fn(),
    clearUserQueue: vi.fn(),
    playEntry: vi.fn(),
    toggleShuffle: vi.fn(),
    cycleRepeat: vi.fn(),
    setVolume: vi.fn(),
    toggleMute: vi.fn(),
    setCrossfadeSeconds: vi.fn(),
    setLoudnessEven: vi.fn(),
    startSleepTimer: vi.fn(),
    cancelSleepTimer: vi.fn(),
    promptRemotePlayback: vi.fn(),
    ...overrides,
  };
}

export function createSurfaceValue(
  overrides: Partial<StudioPlayerSurfaceValue> = {},
): StudioPlayerSurfaceValue {
  return {
    isNowPlayingOpen: false,
    nowPlayingTab: "lyrics",
    isQueuePanelOpen: false,
    isShortcutsOpen: false,
    openNowPlaying: vi.fn(),
    closeNowPlaying: vi.fn(),
    setNowPlayingTab: vi.fn(),
    openQueue: vi.fn(),
    closeQueuePanel: vi.fn(),
    toggleQueuePanel: vi.fn(),
    openShortcuts: vi.fn(),
    closeShortcuts: vi.fn(),
    ...overrides,
  };
}

/** Plan 2's `testPlayerClock`, 20 s into a 200 s track unless patched. */
export function createClock(
  overrides: Partial<StudioPlayerClock> = {},
): StudioPlayerClock {
  return testPlayerClock({ currentTime: 20, duration: 200, ...overrides });
}

/** Renders inside the app's test providers with this player and clock. */
export function renderWithPlayer(
  ui: ReactElement,
  options: {
    player?: StudioPlayerValue;
    clock?: StudioPlayerClock;
    initialEntries?: string[];
  } = {},
) {
  const player = options.player ?? createStudioPlayerValue();
  const clock = options.clock ?? createClock();
  const wrap = (
    node: ReactElement,
    value: StudioPlayerValue,
    clockValue: StudioPlayerClock,
  ) => (
    <TestProviders initialEntries={options.initialEntries}>
      <StudioPlayerContext.Provider value={value}>
        <StudioPlayerClockContext.Provider value={clockValue}>
          {node}
        </StudioPlayerClockContext.Provider>
      </StudioPlayerContext.Provider>
    </TestProviders>
  );
  const rendered = render(wrap(ui, player, clock));
  return {
    ...rendered,
    player,
    rerenderWith: (next: {
      player?: StudioPlayerValue;
      clock?: StudioPlayerClock;
    }) =>
      rendered.rerender(wrap(ui, next.player ?? player, next.clock ?? clock)),
  };
}

const ARTIST_DTO = {
  id: "p1",
  handle: "nightform",
  name: "NIGHTFORM",
  kind: "musician" as const,
  avatarUrl: null,
};

const RELEASE_CARD_DTO = {
  id: "r1",
  title: "Salt water",
  type: "ep" as const,
  coverUrl: null,
  releasedOn: "2026-04-12",
  trackCount: 3,
  totalDurationSeconds: 600,
  artist: ARTIST_DTO,
  genre: null,
  publishedAt: "2026-04-12T10:00:00.000Z",
  mood: null,
  scene: null,
};

/** A published EP of three tracks; the third has no audio yet. Named apart
 *  from Plan 2's harness `releaseFixture` (contract F.5). */
export function releaseViewFixture(
  overrides: Partial<StudioReleaseDTO> = {},
): StudioReleaseView {
  return toReleaseView({
    ...RELEASE_CARD_DTO,
    description: null,
    status: "published",
    tracks: [
      {
        id: "t1",
        position: 1,
        title: "Tide",
        durationSeconds: 200,
        isExplicit: false,
        hasAudio: true,
      },
      {
        id: "t2",
        position: 2,
        title: "Pier",
        durationSeconds: 200,
        isExplicit: false,
        hasAudio: true,
      },
      {
        id: "t3",
        position: 3,
        title: "Pending",
        durationSeconds: null,
        isExplicit: false,
        hasAudio: false,
      },
    ],
    isOwner: false,
    rightsConfirmedAt: null,
    takedownReason: null,
    sceneId: null,
    personaCredits: [],
    ...overrides,
  });
}

/** Track t1 of that EP, with two plain lyric lines and one credit. */
export function trackFixture(
  overrides: Partial<StudioTrackDTO> = {},
): StudioTrackView {
  return toTrackView({
    id: "t1",
    position: 1,
    title: "Tide",
    durationSeconds: 200,
    isExplicit: false,
    hasAudio: true,
    releaseId: "r1",
    credits: [{ name: "Ana", role: "Vocals" }],
    lyrics: "First line\nSecond line",
    syncedLyrics: null,
    chapters: null,
    release: RELEASE_CARD_DTO,
    personaCredits: [],
    ...overrides,
  });
}
