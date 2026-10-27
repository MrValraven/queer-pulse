import { useState } from "react";
import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
  StudioPlayerSurfaceValue,
  StudioNowPlayingTab,
} from "../studioPlayerSurface";
import { StudioNowPlayingHost } from "./StudioNowPlaying";
import {
  createStudioPlayerValue,
  createSurfaceValue,
  queueItem,
  queueView,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const surfaceModule = vi.hoisted(() => ({
  value: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("../studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceModule.value,
}));

/** Every id the track detail hook was asked for; it still answers for real. */
const trackHookCalls = vi.hoisted(() => [] as (string | null)[]);
vi.mock("../../api/useStudioTrack", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../../api/useStudioTrack")>();
  return {
    ...actual,
    useStudioTrack: (trackId: string | null) => {
      trackHookCalls.push(trackId);
      return actual.useStudioTrack(trackId);
    },
  };
});

class TestPointerEvent extends MouseEvent {
  pointerId: number;
  pointerType: string;
  constructor(type: string, init: PointerEventInit = {}) {
    super(type, init);
    this.pointerId = init.pointerId ?? 1;
    this.pointerType = init.pointerType ?? "touch";
  }
}

function asPhone(isPhone: boolean) {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: isPhone && query.includes("880"),
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

const OPENER_LABEL = "Open the player";
let scrollIntoViewMock = vi.fn();

/** Published from the harness's render, where the mocked hook reads it. */
function publishSurface(value: StudioPlayerSurfaceValue) {
  surfaceModule.value = value;
}

/** Real open and close state, so exits and focus return run for real. */
function Harness({
  initialTab = "lyrics",
}: {
  initialTab?: StudioNowPlayingTab;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState<StudioNowPlayingTab>(initialTab);
  publishSurface(
    createSurfaceValue({
      isNowPlayingOpen: isOpen,
      nowPlayingTab: tab,
      openNowPlaying: () => setIsOpen(true),
      closeNowPlaying: () => setIsOpen(false),
      setNowPlayingTab: setTab,
    }),
  );
  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)}>
        {OPENER_LABEL}
      </button>
      <StudioNowPlayingHost />
    </>
  );
}

async function openFromButton() {
  const opener = await screen.findByRole("button", { name: OPENER_LABEL });
  opener.focus();
  fireEvent.click(opener);
  return {
    opener,
    dialog: await screen.findByRole("dialog", { name: "Now playing" }),
  };
}

beforeEach(() => {
  // Plan 2's provider renders above the harness and may read the surface first.
  surfaceModule.value = createSurfaceValue();
  trackHookCalls.length = 0;
  vi.stubGlobal("PointerEvent", TestPointerEvent);
  scrollIntoViewMock = vi.fn();
  Element.prototype.scrollIntoView = scrollIntoViewMock;
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

/** The phone head (the close button's header) and the frame that follows a drag. */
function headAndFrame(dialog: HTMLElement) {
  const close = within(dialog).getByRole("button", {
    name: "Close Now playing",
  });
  const head = close.closest("header");
  const frame = head?.parentElement;
  if (!head || !frame) throw new Error("No header");
  return { close, head, frame };
}

describe("StudioNowPlaying closing", () => {
  it("springs back from a short drag and stays open", async () => {
    asPhone(true);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    const { head, frame } = headAndFrame(dialog);
    fireEvent.pointerDown(head, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(head, { clientY: 115, pointerType: "touch" });
    expect(frame.style.transform).toBe("translateY(15px)");
    fireEvent.pointerUp(head, { clientY: 115, pointerType: "touch" });
    expect(frame.style.transform).toBe("");
    expect(
      screen.getByRole("dialog", { name: "Now playing" }),
    ).toBeInTheDocument();
  });

  it("starts no drag from the head while the sheet is scrolled down", async () => {
    asPhone(true);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    const { head, frame } = headAndFrame(dialog);
    Object.defineProperty(dialog, "scrollTop", {
      configurable: true,
      value: 240,
    });
    fireEvent.pointerDown(head, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(head, { clientY: 260, pointerType: "touch" });
    expect(frame.style.transform).toBe("");
    fireEvent.pointerUp(head, { clientY: 300, pointerType: "touch" });
    // A close would start the exit, which makes the sheet inert at once.
    expect(dialog).not.toHaveAttribute("inert");
    expect(
      screen.getByRole("dialog", { name: "Now playing" }),
    ).toBeInTheDocument();
  });

  it("stays open after a swipe on the body", async () => {
    asPhone(true);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    const body = within(dialog).getByRole("heading", {
      level: 2,
      name: "Lyrics",
    });
    fireEvent.pointerDown(body, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(body, { clientY: 300, pointerType: "touch" });
    fireEvent.pointerUp(body, { clientY: 300, pointerType: "touch" });
    expect(
      screen.getByRole("dialog", { name: "Now playing" }),
    ).toBeInTheDocument();
  });

  it("starts no drag from the close button, and its tap closes", async () => {
    asPhone(true);
    vi.spyOn(window.history, "back").mockImplementation(() => undefined);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    const { close, frame } = headAndFrame(dialog);
    fireEvent.pointerDown(close, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(close, { clientY: 160, pointerType: "touch" });
    expect(frame.style.transform).toBe("");
    fireEvent.pointerUp(close, { clientY: 160, pointerType: "touch" });
    fireEvent.click(close);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
  });

  it("returns focus to the mini player after a swipe down closes Now playing", async () => {
    asPhone(true);
    renderWithPlayer(<Harness />);
    const { opener, dialog } = await openFromButton();
    const head = within(dialog)
      .getByRole("button", { name: "Close Now playing" })
      .closest("header");
    if (!head) throw new Error("No header");
    fireEvent.pointerDown(head, { clientY: 100, pointerType: "touch" });
    fireEvent.pointerMove(head, { clientY: 260, pointerType: "touch" });
    fireEvent.pointerUp(head, { clientY: 300, pointerType: "touch" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
    expect(opener).toHaveFocus();
  });

  it("closes on Escape and on Back", async () => {
    asPhone(false);
    // The Escape close pops the history entry; keep that pop from landing later.
    vi.spyOn(window.history, "back").mockImplementation(() => undefined);
    renderWithPlayer(<Harness />);
    await openFromButton();
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
    await openFromButton();
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
  });

  it("closes an open popover on the first Escape and Now playing on the second", async () => {
    asPhone(false);
    vi.spyOn(window.history, "back").mockImplementation(() => undefined);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "More player options" }),
    );
    expect(
      await within(dialog).findByRole("group", { name: "More player options" }),
    ).toBeInTheDocument();
    // The key lands where focus is, as a real press does: inside the panel.
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    await waitFor(() =>
      expect(
        within(dialog).queryByRole("group", { name: "More player options" }),
      ).toBeNull(),
    );
    expect(
      screen.getByRole("dialog", { name: "Now playing" }),
    ).toBeInTheDocument();
    fireEvent.keyDown(document.activeElement ?? document.body, {
      key: "Escape",
    });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
  });

  it("leaves history alone when its title link navigates", async () => {
    asPhone(false);
    const back = vi
      .spyOn(window.history, "back")
      .mockImplementation(() => undefined);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    fireEvent.click(within(dialog).getByRole("link", { name: "Tide" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull(), {
      timeout: 2000,
    });
    expect(back).not.toHaveBeenCalled();
  });

  it("stays open when a modified press opens a link in a new tab", async () => {
    asPhone(false);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    fireEvent.click(within(dialog).getByRole("link", { name: "Tide" }), {
      metaKey: true,
    });
    expect(
      screen.getByRole("dialog", { name: "Now playing" }),
    ).toBeInTheDocument();
  });
});

describe("StudioNowPlaying content", () => {
  it("never asks a private preview's track detail and says it has no credits", async () => {
    asPhone(false);
    const item = queueItem({ previewToken: "preview-token" });
    renderWithPlayer(<Harness />, {
      player: createStudioPlayerValue({ currentItem: item }),
    });
    const { dialog } = await openFromButton();
    fireEvent.click(within(dialog).getByRole("tab", { name: "Credits" }));
    expect(
      await within(dialog).findByText("No credits for this track yet"),
    ).toBeInTheDocument();
    expect(trackHookCalls).toEqual([]);
  });

  it("names an episode's words a transcript", async () => {
    asPhone(false);
    const item = queueItem({ isEpisode: true, previewToken: "preview-token" });
    renderWithPlayer(<Harness />, {
      player: createStudioPlayerValue({ currentItem: item }),
    });
    const { dialog } = await openFromButton();
    expect(
      within(dialog).getByRole("tab", { name: "Transcript" }),
    ).toBeInTheDocument();
    expect(within(dialog).queryByRole("tab", { name: "Lyrics" })).toBeNull();
    expect(
      within(dialog).getByText("No transcript for this one"),
    ).toBeInTheDocument();
  });

  it("names a radio by its filter", async () => {
    asPhone(false);
    const radioSource = {
      kind: "radio" as const,
      label: "",
      href: null,
      radioFilter: { kind: "genre" as const, value: "fado" as const },
    };
    renderWithPlayer(<Harness />, {
      player: createStudioPlayerValue({
        queue: queueView({ source: radioSource }),
      }),
    });
    const { dialog } = await openFromButton();
    expect(
      within(dialog).getByText("Playing from Fado / contemporary"),
    ).toBeInTheDocument();
  });

  it("names a private preview's title and artist without linking them", async () => {
    asPhone(false);
    const item = queueItem({ previewToken: "preview-token" });
    renderWithPlayer(<Harness />, {
      player: createStudioPlayerValue({ currentItem: item }),
    });
    const { dialog } = await openFromButton();
    expect(
      within(dialog).getByRole("heading", { level: 2, name: "Tide" }),
    ).toBeInTheDocument();
    expect(within(dialog).getByText("NIGHTFORM")).toBeInTheDocument();
    expect(within(dialog).queryByRole("link", { name: "Tide" })).toBeNull();
    expect(
      within(dialog).queryByRole("link", { name: "NIGHTFORM" }),
    ).toBeNull();
  });

  it("shows tabs on desktop, with Chapters only when the track has them", async () => {
    asPhone(false);
    const { rerenderWith } = renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    const tabs = within(dialog)
      .getAllByRole("tab")
      .map((tab) => tab.textContent);
    expect(tabs).toEqual(["Lyrics", "Queue", "Credits", "Artist"]);
    fireEvent.click(within(dialog).getByRole("tab", { name: "Queue" }));
    expect(
      await within(dialog).findByRole("heading", { name: "Your queue" }),
    ).toBeInTheDocument();
    rerenderWith({
      player: createStudioPlayerValue({
        currentChapters: [
          {
            startSeconds: 0,
            title: "Opening",
            artist: null,
            timeLabel: "0:00",
          },
        ],
      }),
    });
    expect(
      await within(dialog).findByRole("tab", { name: "Chapters" }),
    ).toBeInTheDocument();
  });

  it("switches panes on a phone, Queue first, and scrolls to Queue when opened on it", async () => {
    asPhone(true);
    renderWithPlayer(<Harness initialTab="queue" />);
    const { dialog } = await openFromButton();
    const switcher = within(dialog).getByRole("group", {
      name: "Now playing details",
    });
    const choices = within(switcher)
      .getAllByRole("button")
      .map((choice) => choice.textContent);
    expect(choices).toEqual(["Queue", "Lyrics", "Artist", "Credits"]);
    expect(within(dialog).queryByRole("tablist")).toBeNull();
    expect(
      within(switcher).getByRole("button", { name: "Queue" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      within(dialog).getByRole("heading", { name: "Your queue" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(scrollIntoViewMock.mock.contexts).toContain(
        switcher.parentElement,
      ),
    );
    scrollIntoViewMock.mockClear();
    fireEvent.click(within(switcher).getByRole("button", { name: "Lyrics" }));
    expect(
      await within(dialog).findByRole("heading", { level: 2, name: "Lyrics" }),
    ).toBeInTheDocument();
    // A choice made on the switcher keeps the sheet where the finger is.
    expect(scrollIntoViewMock).not.toHaveBeenCalled();
  });

  it("offers Like, Add to playlist and the track menu beside the playing track", async () => {
    asPhone(true);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    for (const name of [
      "Like Tide",
      "Add Tide to a playlist",
      "More actions for Tide",
    ])
      expect(within(dialog).getByRole("button", { name })).toBeInTheDocument();
  });

  it("shows the can't play line, and its Retry retries the track", async () => {
    asPhone(false);
    const player = createStudioPlayerValue({ status: "error" });
    renderWithPlayer(<Harness />, { player });
    const { dialog } = await openFromButton();
    expect(
      within(dialog).getByText("This track couldn't start. Try again", {
        exact: false,
      }),
    ).toBeInTheDocument();
    fireEvent.click(
      within(dialog).getByRole("button", { name: "Retry the track" }),
    );
    expect(player.retry).toHaveBeenCalledTimes(1);
  });

  it("names where the music comes from", async () => {
    asPhone(false);
    renderWithPlayer(<Harness />);
    const { dialog } = await openFromButton();
    expect(
      within(dialog).getByText("Playing from Salt water"),
    ).toBeInTheDocument();
  });
});
