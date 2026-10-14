import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioPlayerSurfaceValue } from "./player/studioPlayerSurface";
import { StudioPlayer } from "./StudioPlayer";
import {
  createClock,
  createStudioPlayerValue,
  createSurfaceValue,
  queueItem,
  renderWithPlayer,
} from "./player/ui/studioPlayerTestHarness";

vi.mock("./useStudioShowcase", () => ({ useStudioShowcase: () => false }));
const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("./player/studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./player/studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));

class TestPointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.pointerType = init.pointerType ?? "touch";
  }
}

function asPhone() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("880"),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

function previewPlayer() {
  return createStudioPlayerValue({
    currentItem: queueItem({ previewToken: "preview-token" }),
  });
}

const OPEN_NOW_PLAYING_LABEL = "Test: open Now playing";
const OPEN_SHORTCUTS_LABEL = "Test: open the shortcuts";
const NAVIGATE_LABEL = "Test: go elsewhere";
let closeSpies = { nowPlaying: vi.fn(), shortcuts: vi.fn() };

/** Published from the harness's render, where the mocked hook reads it. */
function publishSurface(value: StudioPlayerSurfaceValue) {
  surfaceHolder.current = value;
}

/** Real open and close state for Now playing and the shortcuts sheet, so
 *  their history entries and exits run for real. */
function SurfaceHarness() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  publishSurface(
    createSurfaceValue({
      isNowPlayingOpen,
      isShortcutsOpen,
      openNowPlaying: () => setIsNowPlayingOpen(true),
      closeNowPlaying: () => {
        closeSpies.nowPlaying();
        setIsNowPlayingOpen(false);
      },
      openShortcuts: () => setIsShortcutsOpen(true),
      closeShortcuts: () => {
        closeSpies.shortcuts();
        setIsShortcutsOpen(false);
      },
    }),
  );
  return (
    <>
      <button type="button" onClick={() => setIsNowPlayingOpen(true)}>
        {OPEN_NOW_PLAYING_LABEL}
      </button>
      <button type="button" onClick={() => setIsShortcutsOpen(true)}>
        {OPEN_SHORTCUTS_LABEL}
      </button>
      <button type="button" onClick={() => void navigate("/elsewhere")}>
        {NAVIGATE_LABEL}
      </button>
      <p>{`At ${pathname}`}</p>
      <StudioPlayer />
    </>
  );
}

async function openShortcutsFromHarness() {
  fireEvent.click(
    await screen.findByRole("button", {
      name: OPEN_SHORTCUTS_LABEL,
      hidden: true,
    }),
  );
  await screen.findByRole("dialog", { name: "Keyboard shortcuts" });
}

/** Records every element that takes a pointer capture (jsdom lacks it). */
function recordPointerCaptures() {
  const targets: Element[] = [];
  const descriptor = Object.getOwnPropertyDescriptor(
    Element.prototype,
    "setPointerCapture",
  );
  Object.defineProperty(Element.prototype, "setPointerCapture", {
    configurable: true,
    writable: true,
    value: function recordCapture(this: Element) {
      targets.push(this);
    },
  });
  const restore = () => {
    if (descriptor)
      Object.defineProperty(Element.prototype, "setPointerCapture", descriptor);
    else Reflect.deleteProperty(Element.prototype, "setPointerCapture");
  };
  return { targets, restore };
}

beforeEach(() => {
  surfaceHolder.current = createSurfaceValue();
  closeSpies = { nowPlaying: vi.fn(), shortcuts: vi.fn() };
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("StudioPlayer bar (desktop)", () => {
  it("steps the seek slider five seconds per arrow key", async () => {
    const { player } = renderWithPlayer(<StudioPlayer />);
    const slider = await screen.findByRole("slider", { name: "Seek" });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(player.seek).toHaveBeenLastCalledWith(25);
  });

  it("links the title to the track and the artist to their page", async () => {
    renderWithPlayer(<StudioPlayer />);
    expect(await screen.findByRole("link", { name: "Tide" })).toHaveAttribute(
      "href",
      "/studio/track?id=t1",
    );
    expect(screen.getByRole("link", { name: "NIGHTFORM" })).toHaveAttribute(
      "href",
      "/studio/artist?id=p1",
    );
  });

  it("offers the Like heart beside Add to playlist", async () => {
    renderWithPlayer(<StudioPlayer />);
    const bar = await screen.findByRole("region", { name: "Studio player" });
    const heart = within(bar).getByRole("button", { name: "Like Tide" });
    expect(heart).toHaveAttribute("aria-pressed");
    expect(heart.nextElementSibling).toBe(
      within(bar).getByRole("button", { name: "Add Tide to a playlist" }),
    );
  });

  it("shows a private preview as plain text with no save", async () => {
    renderWithPlayer(<StudioPlayer />, { player: previewPlayer() });
    await screen.findByRole("slider", { name: "Seek" });
    expect(screen.getByText("Tide")).toBeInTheDocument();
    expect(screen.getByText("NIGHTFORM")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Add Tide to a playlist" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Like Tide" })).toBeNull();
  });

  it("offers Retry when a track cannot play", async () => {
    const player = createStudioPlayerValue({ status: "error" });
    renderWithPlayer(<StudioPlayer />, { player });
    fireEvent.click(await screen.findByRole("button", { name: /retry/i }));
    expect(player.retry).toHaveBeenCalled();
  });

  it("keeps the error region in the accessibility tree while idle", async () => {
    const player = createStudioPlayerValue({ status: "idle" });
    renderWithPlayer(<StudioPlayer />, { player });
    const bar = await screen.findByRole("region", { name: "Studio player" });
    // The toast region and the sleep chip are status regions too; the error
    // region is the bar's own child.
    const region = within(bar)
      .getAllByRole("status")
      .find((status) => status.parentElement === bar);
    expect(region).toBeDefined();
    expect(region).toBeEmptyDOMElement();
    expect(region).not.toHaveStyle({ display: "none" });
  });

  it("keeps the bar's sleep chip silent while Now playing is open", async () => {
    surfaceHolder.current = createSurfaceValue({ isNowPlayingOpen: true });
    const running = createStudioPlayerValue({
      sleepTimer: { kind: "endOfTrack" },
    });
    const { rerenderWith } = renderWithPlayer(<StudioPlayer />, {
      player: running,
    });
    await screen.findByRole("button", { name: "Stops after this track" });
    rerenderWith({ player: createStudioPlayerValue({ sleepTimer: null }) });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: "Stops after this track" }),
      ).toBeNull(),
    );
    expect(screen.queryByText("Sleep timer off")).toBeNull();
  });

  it("announces a cancelled sleep timer from the bar when Now playing is closed", async () => {
    const { rerenderWith } = renderWithPlayer(<StudioPlayer />, {
      player: createStudioPlayerValue({ sleepTimer: { kind: "endOfTrack" } }),
    });
    await screen.findByRole("button", { name: "Stops after this track" });
    rerenderWith({ player: createStudioPlayerValue({ sleepTimer: null }) });
    expect(await screen.findByText("Sleep timer off")).toBeInTheDocument();
  });

  it("shows no money line outside the demo", async () => {
    renderWithPlayer(<StudioPlayer />);
    await screen.findByRole("slider", { name: "Seek" });
    expect(screen.queryByText(/paying/i)).not.toBeInTheDocument();
  });

  it("carries the full control set and toggles the queue panel", async () => {
    renderWithPlayer(<StudioPlayer />);
    const bar = await screen.findByRole("region", { name: "Studio player" });
    for (const name of [
      "Shuffle",
      "Repeat: off",
      "Previous track",
      "Pause",
      "Next track",
      "More player options",
    ])
      expect(within(bar).getByRole("button", { name })).toBeInTheDocument();
    expect(
      within(bar).getByRole("slider", { name: "Volume" }),
    ).toBeInTheDocument();
    const queue = within(bar).getByRole("button", { name: "Show the queue" });
    expect(queue).toHaveAttribute("aria-expanded", "false");
    expect(queue).toHaveAttribute("id", "studio-queue-button");
    fireEvent.click(queue);
    expect(surfaceHolder.current?.toggleQueuePanel).toHaveBeenCalled();
  });

  it("names the current chapter under the title", async () => {
    const player = createStudioPlayerValue({
      currentChapters: [
        { startSeconds: 0, title: "Opening", artist: null, timeLabel: "0:00" },
        {
          startSeconds: 60,
          title: "Second part",
          artist: "Guest",
          timeLabel: "1:00",
        },
      ],
    });
    renderWithPlayer(<StudioPlayer />, {
      player,
      clock: createClock({ currentChapterIndex: 1 }),
    });
    expect(await screen.findByText("Guest · Second part")).toBeInTheDocument();
  });

  it("names the radio it plays under the title", async () => {
    const player = createStudioPlayerValue({
      radio: { filter: { kind: "genre", value: "fado" }, pool: [] },
    });
    renderWithPlayer(<StudioPlayer />, { player });
    expect(
      await screen.findByText("Radio · Fado / contemporary"),
    ).toBeInTheDocument();
  });

  it("opens Now playing from the cover", async () => {
    renderWithPlayer(<StudioPlayer />);
    fireEvent.click(
      await screen.findByRole("button", {
        name: "Open Now playing, Tide by NIGHTFORM",
      }),
    );
    expect(surfaceHolder.current?.openNowPlaying).toHaveBeenCalled();
  });

  it("closes the shortcuts sheet on Back before anything under it", async () => {
    surfaceHolder.current = createSurfaceValue({ isShortcutsOpen: true });
    renderWithPlayer(<StudioPlayer />);
    await screen.findByRole("region", { name: "Studio player" });
    const listenerUnderneath = vi.fn();
    window.addEventListener("popstate", listenerUnderneath);
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.removeEventListener("popstate", listenerUnderneath);
    expect(surfaceHolder.current?.closeShortcuts).toHaveBeenCalled();
    expect(listenerUnderneath).not.toHaveBeenCalled();
  });
});

describe("StudioPlayer shortcuts sheet and Back", () => {
  it("pops its entry on Escape and swallows that pop", async () => {
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    renderWithPlayer(<SurfaceHarness />);
    await openShortcutsFromHarness();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(back).toHaveBeenCalledTimes(1), {
      timeout: 2000,
    });
    const listenerUnderneath = vi.fn();
    window.addEventListener("popstate", listenerUnderneath);
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    window.removeEventListener("popstate", listenerUnderneath);
    expect(listenerUnderneath).not.toHaveBeenCalled();
    expect(closeSpies.shortcuts).toHaveBeenCalledTimes(1);
  });

  it("leaves history alone when a navigation replaced its entry", async () => {
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    renderWithPlayer(<SurfaceHarness />);
    await openShortcutsFromHarness();
    window.history.replaceState({ idx: 0 }, "");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
    expect(closeSpies.shortcuts).toHaveBeenCalledTimes(1);
    expect(back).not.toHaveBeenCalled();
  });

  it("lets the router take a Back after it navigated while open", async () => {
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    renderWithPlayer(<SurfaceHarness />);
    await openShortcutsFromHarness();
    fireEvent.click(
      screen.getByRole("button", { name: NAVIGATE_LABEL, hidden: true }),
    );
    expect(await screen.findByText("At /elsewhere")).toBeInTheDocument();
    // TestProviders runs a MemoryRouter, which ignores window pops; this
    // listener stands in for BrowserRouter's own, registered after ours.
    const routerListener = vi.fn();
    window.addEventListener("popstate", routerListener);
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    window.removeEventListener("popstate", routerListener);
    expect(routerListener).toHaveBeenCalledTimes(1);
    expect(closeSpies.shortcuts).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
    expect(back).not.toHaveBeenCalled();
  });

  it("closes only the sheet when Back arrives over Now playing", async () => {
    renderWithPlayer(<SurfaceHarness />);
    fireEvent.click(
      await screen.findByRole("button", { name: OPEN_NOW_PLAYING_LABEL }),
    );
    await screen.findByRole("dialog", { name: "Now playing" });
    await openShortcutsFromHarness();
    act(() => {
      window.history.back();
    });
    await waitFor(() => expect(closeSpies.shortcuts).toHaveBeenCalled(), {
      timeout: 2000,
    });
    expect(closeSpies.nowPlaying).not.toHaveBeenCalled();
    expect(
      screen.getByRole("dialog", { name: "Now playing", hidden: true }),
    ).toBeInTheDocument();
  });
});

describe("StudioPlayer mini player (phone)", () => {
  it("hands the pointer capture to the pressed button", async () => {
    asPhone();
    vi.stubGlobal("PointerEvent", TestPointerEvent);
    const captures = recordPointerCaptures();
    try {
      renderWithPlayer(<StudioPlayer />);
      const play = await screen.findByRole("button", { name: "Pause" });
      fireEvent.pointerDown(play, { clientY: 700, pointerType: "touch" });
      expect(captures.targets.at(-1)).toBe(play);
    } finally {
      captures.restore();
    }
  });

  it("drops the click that ends a swipe", async () => {
    asPhone();
    vi.stubGlobal("PointerEvent", TestPointerEvent);
    const { player } = renderWithPlayer(<StudioPlayer />);
    const play = await screen.findByRole("button", { name: "Pause" });
    fireEvent.pointerDown(play, { clientY: 700, pointerType: "touch" });
    fireEvent.pointerMove(play, { clientY: 560, pointerType: "touch" });
    fireEvent.pointerUp(play, { clientY: 520, pointerType: "touch" });
    fireEvent.click(play, { detail: 1 });
    expect(surfaceHolder.current?.openNowPlaying).toHaveBeenCalled();
    expect(player.togglePlay).not.toHaveBeenCalled();
    // The next tap is a tap again.
    fireEvent.pointerDown(play, { clientY: 700, pointerType: "touch" });
    fireEvent.pointerUp(play, { clientY: 700, pointerType: "touch" });
    fireEvent.click(play, { detail: 1 });
    expect(player.togglePlay).toHaveBeenCalledTimes(1);
  });

  it("shows a playback error with a working Retry", async () => {
    asPhone();
    const player = createStudioPlayerValue({ status: "error" });
    renderWithPlayer(<StudioPlayer />, { player });
    expect(
      await screen.findByText(/This track can't play right now/),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Retry the track" }));
    expect(player.retry).toHaveBeenCalled();
  });

  it("stays minimal and opens Now playing on a tap", async () => {
    asPhone();
    renderWithPlayer(<StudioPlayer />);
    const open = await screen.findByRole("button", {
      name: "Open Now playing, Tide by NIGHTFORM",
    });
    expect(screen.queryByRole("slider")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Show the full player" }),
    ).toBeNull();
    fireEvent.click(open);
    expect(surfaceHolder.current?.openNowPlaying).toHaveBeenCalled();
  });

  it("offers the Like heart with Close player last", async () => {
    asPhone();
    renderWithPlayer(<StudioPlayer />);
    const heart = await screen.findByRole("button", { name: "Like Tide" });
    expect(heart).toHaveAttribute("aria-pressed");
    const close = screen.getByRole("button", { name: "Close player" });
    expect(close.parentElement?.lastElementChild).toBe(close);
  });

  it("folds the heart away for an episode", async () => {
    asPhone();
    const player = createStudioPlayerValue({
      currentItem: queueItem({ isEpisode: true }),
    });
    renderWithPlayer(<StudioPlayer />, { player });
    await screen.findByRole("button", { name: /Open Now playing/ });
    expect(screen.queryByRole("button", { name: "Like Tide" })).toBeNull();
  });

  it("shows a private preview as plain text with no save", async () => {
    asPhone();
    renderWithPlayer(<StudioPlayer />, { player: previewPlayer() });
    await screen.findByRole("button", { name: /Open Now playing/ });
    expect(screen.getByText("Tide")).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Add Tide to a playlist" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Like Tide" })).toBeNull();
  });

  it("opens Now playing on a swipe up", async () => {
    asPhone();
    vi.stubGlobal("PointerEvent", TestPointerEvent);
    renderWithPlayer(<StudioPlayer />);
    const card = (
      await screen.findByRole("button", { name: /Open Now playing/ })
    ).parentElement;
    if (!card) throw new Error("No card");
    fireEvent.pointerDown(card, { clientY: 700, pointerType: "touch" });
    fireEvent.pointerUp(card, { clientY: 520, pointerType: "touch" });
    expect(surfaceHolder.current?.openNowPlaying).toHaveBeenCalled();
  });
});
