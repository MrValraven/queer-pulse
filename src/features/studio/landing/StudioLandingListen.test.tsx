import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { I18nProvider } from "../../../app/providers/I18nProvider";
import type {
  StudioLandingPreviewView,
  StudioLandingView,
} from "../api/studioLanding.adapters";
import type { StudioLandingListenReason } from "../api/studioLanding.api";
import { StudioLandingListen } from "./StudioLandingListen";
import { StudioLandingListenRow } from "./StudioLandingListenRow";
import type { StudioLandingPlayerState } from "./useStudioLandingPlayer";

const mocks: { isDemo: boolean; landing: StudioLandingView | null } =
  vi.hoisted(() => ({ isDemo: true, landing: null }));

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: mocks.isDemo }),
}));
vi.mock("../api/useStudioLanding", () => ({
  useStudioLanding: () => ({
    landing: mocks.landing,
    isLoading: false,
    isError: false,
  }),
}));

const TRACKS = [
  ["Night Bus", "Nightform"],
  ["Sunday Mass", "Vanda Diesel"],
  ["Lights Up", "lechatdashinko"],
  ["Paragem", "Lua Cardoso"],
  ["Tuesday Take", "Coro de Outubro"],
] as const;

function previewOf(index: number): StudioLandingPreviewView {
  const [trackTitle, artistName] = TRACKS[index]!;
  return {
    id: `preview-${index + 1}`,
    trackTitle,
    durationSeconds: 220,
    coverUrl: null,
    coverTint: "jade",
    artist: {
      name: artistName,
      handle: "",
      kindLabelKey: null,
      avatarUrl: null,
      initials: artistName.slice(0, 1).toUpperCase(),
      tint: "plum",
      personaHref: null,
    },
  };
}

const PREVIEWS = TRACKS.map((_track, index) => previewOf(index));

function landingWith(previews: StudioLandingPreviewView[]): StudioLandingView {
  return {
    counts: { artists: 14, releases: 37, eventsThisMonth: 6 },
    isProofShown: true,
    nextEvent: null,
    previews,
    artists: [],
    isArtistsShown: false,
    photos: { hero: null, manifesto: null },
  };
}

function Providers({ children }: { children: ReactNode }) {
  return <I18nProvider>{children}</I18nProvider>;
}

function stateOf(
  overrides: Partial<StudioLandingPlayerState> = {},
): StudioLandingPlayerState {
  return {
    activeId: null,
    status: "idle",
    elapsedSeconds: 0,
    failures: {},
    ...overrides,
  };
}

function renderRow(state: StudioLandingPlayerState) {
  const onRetry = vi.fn();
  render(
    <Providers>
      <StudioLandingListenRow
        preview={PREVIEWS[0]!}
        state={state}
        onToggle={vi.fn()}
        onRetry={onRetry}
      />
    </Providers>,
  );
  return { onRetry };
}

function failureState(reason: StudioLandingListenReason) {
  return stateOf({ failures: { "preview-1": reason } });
}

beforeEach(() => {
  mocks.isDemo = true;
  mocks.landing = landingWith(PREVIEWS);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("StudioLandingListen", () => {
  it("is hidden with no previews", () => {
    mocks.landing = landingWith([]);
    render(<StudioLandingListen />, { wrapper: Providers });
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("is hidden while the landing read has no answer", () => {
    mocks.landing = null;
    render(<StudioLandingListen />, { wrapper: Providers });
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("lists five rows, each with a play button, the note and a focusable heading", async () => {
    render(<StudioLandingListen />, { wrapper: Providers });
    const list = await screen.findByRole("list", { name: "Tracks to play" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(5);
    for (const [track, artist] of TRACKS) {
      expect(
        within(list).getByRole("button", {
          name: `Play ${track} by ${artist}`,
        }),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByText(/The artists shared these tracks for this page/),
    ).toBeInTheDocument();
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveAttribute("tabindex", "-1");
    expect(heading.closest("section")).toHaveAttribute(
      "id",
      "studio-hear-it-first",
    );
  });

  it("flips a row to Pause while it plays and says so in the status region", async () => {
    render(<StudioLandingListen />, { wrapper: Providers });
    const playButton = await screen.findByRole("button", {
      name: "Play Night Bus by Nightform",
    });
    // The demo clock starts on the click, so it runs on the fake timers.
    vi.useFakeTimers();
    fireEvent.click(playButton);
    expect(
      screen.getByRole("button", { name: "Pause Night Bus by Nightform" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Playing Night Bus by Nightform",
    );
    act(() => {
      vi.advanceTimersByTime(12_000);
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuetext",
      "0:12 of 3:40",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Pause Night Bus by Nightform" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent("Night Bus is paused");
  });

  it("stops playback when a refetch drops the track that plays", async () => {
    const { rerender } = render(<StudioLandingListen />, {
      wrapper: Providers,
    });
    const playButton = await screen.findByRole("button", {
      name: "Play Night Bus by Nightform",
    });
    vi.useFakeTimers();
    fireEvent.click(playButton);
    expect(
      screen.getByRole("button", { name: "Pause Night Bus by Nightform" }),
    ).toBeInTheDocument();
    mocks.landing = landingWith(PREVIEWS.slice(1));
    rerender(<StudioLandingListen />);
    expect(screen.queryByRole("button", { name: /^Pause / })).toBeNull();
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(screen.queryByRole("progressbar")).toBeNull();
    expect(
      screen.getByRole("button", { name: "Play Sunday Mass by Vanda Diesel" }),
    ).toBeInTheDocument();
  });

  it("shows the demo sample note only in demo", async () => {
    const { unmount } = render(<StudioLandingListen />, { wrapper: Providers });
    expect(
      await screen.findByText(/Demo: the artists, tracks, quotes and photos/),
    ).toBeInTheDocument();
    unmount();
    mocks.isDemo = false;
    render(<StudioLandingListen />, { wrapper: Providers });
    await screen.findByRole("list", { name: "Tracks to play" });
    expect(screen.queryByText(/Demo: the artists, tracks/)).toBeNull();
  });
});

describe("StudioLandingListenRow", () => {
  it("names an unavailable track and offers no retry", async () => {
    renderRow(failureState("unavailable"));
    expect(
      await screen.findByText("This track was taken off this page"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /again/ })).toBeNull();
    expect(
      screen.getByRole("button", { name: "Play Night Bus by Nightform" }),
    ).toHaveAttribute("aria-disabled", "true");
  });

  it.each([
    ["server", "Studio didn't answer, so this track can't load"],
    ["offline", "You're offline, so this track can't load"],
    ["rateLimited", "Too many plays in a short time. Try again in a minute"],
    ["playback", "Your browser couldn't play this track"],
  ] as const)("names a %s failure and offers a retry", async (reason, line) => {
    const { onRetry } = renderRow(failureState(reason));
    expect(await screen.findByText(line)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Try Night Bus again" }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("gives the active track a progress bar with its time", async () => {
    renderRow(
      stateOf({
        activeId: "preview-1",
        status: "playing",
        elapsedSeconds: 12.6,
      }),
    );
    const progress = await screen.findByRole("progressbar");
    expect(progress).toHaveAttribute("aria-valuetext", "0:12 of 3:40");
    expect(progress).toHaveAttribute("aria-valuenow", "12");
    expect(progress).toHaveAttribute("aria-valuemax", "220");
  });

  it("keeps the bar away from a row that is not playing", async () => {
    renderRow(stateOf({ activeId: "preview-2", status: "playing" }));
    await screen.findByRole("button", { name: "Play Night Bus by Nightform" });
    expect(screen.queryByRole("progressbar")).toBeNull();
  });
});
