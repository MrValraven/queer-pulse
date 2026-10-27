import { readFileSync } from "node:fs";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioLoadState } from "./api/studioLoadState";
import type {
  StudioPlayerSurfaceValue,
  StudioSidePanelView,
} from "./player/studioPlayerSurface";
import {
  createStudioPlayerValue,
  createSurfaceValue,
  renderWithPlayer,
} from "./player/ui/studioPlayerTestHarness";
import { STUDIO_NOW_PLAYING_BUTTON_ID } from "./player/ui/studioQueueMoves";
import { StudioSidePanelColumn } from "./StudioSidePanelColumn";

const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("./player/studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./player/studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));

// The Now playing view's reads stay pending, so these tests reach no server.
vi.mock("./api/useStudioTrack", () => ({
  useStudioTrack: () => {
    const loadState: StudioLoadState = {
      isLoading: true,
      isError: false,
      isRetrying: false,
      isNotFound: false,
      isWithdrawn: false,
      retry: () => undefined,
    };
    return { track: null, loadState };
  },
}));
vi.mock("./player/useStudioNowPlayingArtist", () => ({
  useStudioNowPlayingArtist: () => ({ status: "loading", artist: null }),
}));
vi.mock("./api/useStudioArtistEvents", () => ({
  useStudioArtistEvents: () => [],
}));

/** The view the shell hands the column; tests change it between renders. */
const viewHolder = { current: null as StudioSidePanelView | null };

function dockedSurface(view: StudioSidePanelView | null) {
  return createSurfaceValue({
    sidePanel: view,
    sidePanelPlacement: "docked",
    isQueuePanelOpen: view === "queue",
  });
}

function setView(view: StudioSidePanelView | null) {
  viewHolder.current = view;
  surfaceHolder.current = dockedSurface(view);
}

function ColumnFromHolder() {
  return <StudioSidePanelColumn view={viewHolder.current} />;
}

beforeEach(() => {
  setView("nowPlaying");
});

afterEach(() => {
  document.documentElement.style.removeProperty("--toast-shift-end");
});

describe("StudioSidePanelColumn", () => {
  it("is an aside named for the view showing", () => {
    setView("queue");
    const { rerenderWith } = renderWithPlayer(<ColumnFromHolder />);
    expect(
      screen.getByRole("complementary", { name: "Queue" }),
    ).toBeInTheDocument();
    setView("nowPlaying");
    rerenderWith({});
    expect(
      screen.getByRole("complementary", { name: "Now playing" }),
    ).toBeInTheDocument();
  });

  it("moves no focus when it opens", () => {
    setView(null);
    const { rerenderWith } = renderWithPlayer(
      <>
        <button type="button">Page action</button>
        <ColumnFromHolder />
      </>,
    );
    const pageButton = screen.getByRole("button", { name: "Page action" });
    pageButton.focus();
    setView("nowPlaying");
    rerenderWith({});
    expect(
      screen.getByRole("complementary", { name: "Now playing" }),
    ).toBeInTheDocument();
    expect(pageButton).toHaveFocus();
  });

  it("appears without an entrance animation after a page change", () => {
    renderWithPlayer(<ColumnFromHolder />);
    const aside = screen.getByRole("complementary", { name: "Now playing" });
    expect(aside.style.opacity).toBe("1");
  });

  it("returns focus to the bar toggle of the view it closes", () => {
    renderWithPlayer(
      <>
        <button type="button" id={STUDIO_NOW_PLAYING_BUTTON_ID}>
          Now playing toggle
        </button>
        <ColumnFromHolder />
      </>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Close Now playing" }));
    expect(surfaceHolder.current?.closeSidePanel).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("button", { name: "Now playing toggle" }),
    ).toHaveFocus();
  });

  it("plays its exit when the queue empties", async () => {
    const { rerenderWith } = renderWithPlayer(<ColumnFromHolder />);
    setView(null);
    rerenderWith({ player: createStudioPlayerValue({ currentItem: null }) });
    expect(
      screen.getByRole("complementary", { hidden: true }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("complementary", { hidden: true }),
      ).not.toBeInTheDocument(),
    );
  });

  it("moves the toast stack off the column while it is open", async () => {
    const { rerenderWith } = renderWithPlayer(<ColumnFromHolder />);
    const rootStyle = document.documentElement.style;
    expect(rootStyle.getPropertyValue("--toast-shift-end")).not.toBe("");
    setView(null);
    rerenderWith({});
    await waitFor(() =>
      expect(rootStyle.getPropertyValue("--toast-shift-end")).toBe(""),
    );
  });
});

describe("StudioSidePanelColumn.module.css", () => {
  const css = readFileSync(
    "src/features/studio/StudioSidePanelColumn.module.css",
    "utf8",
  );
  const asideRule = /\.aside\s*\{([^}]*)\}/.exec(css)?.[1];

  it("runs the panel the full height from the top, like the rail", () => {
    expect(asideRule).toMatch(/position:\s*sticky/);
    expect(asideRule).toMatch(/top:\s*0;/);
    expect(asideRule).not.toMatch(/--studio-topbar-h/);
    expect(css).toMatch(/\.card\s*\{[^}]*margin:\s*8px 8px 8px 0/);
  });

  it("ends above the player bar, the tab bar and the consent banner", () => {
    expect(asideRule).toMatch(/--studio-player-inset/);
    expect(asideRule).toMatch(
      /max\(var\(--bottom-inset,\s*0px\),\s*var\(--consent-inset,\s*0px\)\)/,
    );
  });
});
