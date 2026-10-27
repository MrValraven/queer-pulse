import { renderHook, screen } from "@testing-library/react";
import { useLayoutEffect } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioLoadState } from "./api/studioLoadState";
import type { StudioPlayerSurfaceValue } from "./player/studioPlayerSurface";
import { useIsStudioSidePanelDockHostMounted } from "./player/studioSidePanelDock";
import {
  DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE,
  writeStudioSidePanelPreference,
} from "./player/studioSidePanelPreference";
import {
  createSurfaceValue,
  renderWithPlayer,
} from "./player/ui/studioPlayerTestHarness";
import { StudioShell } from "./StudioShell";

const RAIL_COLLAPSED_STORAGE_KEY = "qp.studio.rail.collapsed.v1";

const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
const accessHolder = vi.hoisted(() => ({ hasAccess: true }));
vi.mock("./player/studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./player/studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));
vi.mock("./api/useStudioAccess", () => ({
  useStudioAccess: () => ({
    status: accessHolder.hasAccess ? "granted" : "denied",
    hasAccess: accessHolder.hasAccess,
    isPending: false,
    uploadablePersonas: [],
  }),
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

/** Answers width queries as a window `width` px wide. */
function mockViewport(width: number) {
  vi.spyOn(window, "matchMedia").mockImplementation((query: string) => {
    const maxWidth = /\(max-width: (\d+)px\)/.exec(query);
    const minWidth = /\(min-width: (\d+)px\)/.exec(query);
    const isMatch = maxWidth
      ? width <= Number(maxWidth[1])
      : minWidth
        ? width >= Number(minWidth[1])
        : false;
    return {
      matches: isMatch,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  });
}

/** The shell reads only `hasQueue` from the surface; the column's panel
 *  reads the rest. */
function renderShellAt(width: number, hasQueue = true) {
  mockViewport(width);
  surfaceHolder.current = createSurfaceValue({
    hasQueue,
    sidePanel: "nowPlaying",
    sidePanelPlacement: width > 880 ? "docked" : null,
  });
  return renderWithPlayer(
    <StudioShell>
      <p>Page</p>
    </StudioShell>,
    { initialEntries: ["/studio"] },
  );
}

/** Expects the shell to show no docked column and no third grid track. */
function expectNoColumn() {
  expect(
    screen.queryByRole("complementary", { name: "Now playing" }),
  ).toBeNull();
  expect(document.querySelector("[data-side-panel-open]")).toBeNull();
}

beforeEach(() => {
  accessHolder.hasAccess = true;
  window.localStorage.removeItem(RAIL_COLLAPSED_STORAGE_KEY);
  writeStudioSidePanelPreference(DEFAULT_STUDIO_SIDE_PANEL_PREFERENCE);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("StudioShell side panel", () => {
  it("docks the column and opens the third grid track", () => {
    renderShellAt(1600);
    expect(
      screen.getByRole("complementary", { name: "Now playing" }),
    ).toBeInTheDocument();
    expect(document.querySelector("[data-side-panel-open]")).not.toBeNull();
  });

  it("folds the rail for the panel below 1500px and leaves the saved choice", () => {
    renderShellAt(1400);
    expect(document.querySelector("[data-rail-collapsed]")).not.toBeNull();
    expect(window.localStorage.getItem(RAIL_COLLAPSED_STORAGE_KEY)).toBeNull();
  });

  it("keeps the rail as set from 1500px", () => {
    renderShellAt(1600);
    expect(document.querySelector("[data-rail-collapsed]")).toBeNull();
  });

  it("renders no column in the floating placement", () => {
    renderShellAt(1100);
    expectNoColumn();
  });

  it("renders no column while the saved preference keeps it closed", () => {
    writeStudioSidePanelPreference({ isOpen: false, view: "nowPlaying" });
    renderShellAt(1600);
    expectNoColumn();
    expect(document.querySelector("[data-rail-collapsed]")).toBeNull();
  });

  it("renders no column while nothing is queued", () => {
    renderShellAt(1600, false);
    expectNoColumn();
  });

  it("renders no column on phones", () => {
    renderShellAt(880);
    expectNoColumn();
  });

  it("renders no column for a member without Studio access", () => {
    accessHolder.hasAccess = false;
    renderShellAt(1600);
    expectNoColumn();
  });

  it("lands the column and the rail fold on its first commit", () => {
    // A child's layout effect runs before the shell's own, so it sees the
    // DOM of the shell's first render, before any store has caught up.
    const firstCommit = {
      isPanelOpen: false,
      isRailFolded: false,
      isRailLabelsFolded: false,
    };
    function FirstCommitProbe() {
      useLayoutEffect(() => {
        firstCommit.isPanelOpen =
          document.querySelector("[data-side-panel-open]") !== null &&
          document.querySelector("aside[aria-labelledby]") !== null;
        firstCommit.isRailFolded =
          document.querySelector("[data-rail-collapsed]") !== null;
        // The rail's own labels fold with the grid, so they never fade in.
        firstCommit.isRailLabelsFolded =
          document.querySelector("aside[data-collapsed]") !== null;
      }, []);
      return null;
    }
    mockViewport(1400);
    surfaceHolder.current = createSurfaceValue({
      sidePanel: "nowPlaying",
      sidePanelPlacement: "docked",
    });
    renderWithPlayer(
      <StudioShell>
        <FirstCommitProbe />
      </StudioShell>,
      { initialEntries: ["/studio"] },
    );
    expect(firstCommit).toEqual({
      isPanelOpen: true,
      isRailFolded: true,
      isRailLabelsFolded: true,
    });
  });

  it("registers the shell as the dock host", () => {
    const { unmount } = renderShellAt(1600);
    expect(
      renderHook(() => useIsStudioSidePanelDockHostMounted()).result.current,
    ).toBe(true);
    unmount();
    expect(
      renderHook(() => useIsStudioSidePanelDockHostMounted()).result.current,
    ).toBe(false);
  });
});
