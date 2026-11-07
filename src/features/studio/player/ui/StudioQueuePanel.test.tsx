import { fireEvent, screen, waitFor } from "@testing-library/react";
import { StrictMode, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioLoadState } from "../../api/studioLoadState";
import type { StudioQueueSource } from "../studioPlayerContext";
import type {
  StudioPlayerSurfaceValue,
  StudioSidePanelView,
} from "../studioPlayerSurface";
import { StudioQueuePanelHost } from "./StudioQueuePanel";
import { STUDIO_QUEUE_BUTTON_ID } from "./studioQueueMoves";
import {
  createStudioPlayerValue,
  createSurfaceValue,
  queueView,
  renderWithPlayer,
} from "./studioPlayerTestHarness";
import { awaitCatalog } from "../../../../test/awaitCatalog";

const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("../studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));

// The Now playing view's reads stay pending, so these tests reach no server.
vi.mock("../../api/useStudioTrack", () => ({
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
vi.mock("../useStudioNowPlayingArtist", () => ({
  useStudioNowPlayingArtist: () => ({ status: "loading", artist: null }),
}));
vi.mock("../../api/useStudioArtistEvents", () => ({
  useStudioArtistEvents: () => [],
}));

/** The floating card showing `view`, or closed with null. */
function floatingSurface(view: StudioSidePanelView | null) {
  return createSurfaceValue({
    sidePanel: view,
    sidePanelPlacement: "floating",
    isQueuePanelOpen: view === "queue",
  });
}

beforeEach(() => {
  surfaceHolder.current = floatingSurface("queue");
});

const OPENER_LABEL = "Show queue";

afterEach(() => {
  vi.restoreAllMocks();
});

function setPanelOpen(isQueuePanelOpen: boolean) {
  surfaceHolder.current = floatingSurface(isQueuePanelOpen ? "queue" : null);
}

/** A playing value whose queue comes from `source`. */
function playerFrom(source: StudioQueueSource) {
  return createStudioPlayerValue({ queue: queueView({ source }) });
}

/** The player bar's queue button, handed to the host by ref. */
function HostWithOpenerRef() {
  const openerRef = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button type="button" ref={openerRef}>
        {OPENER_LABEL}
      </button>
      <StudioQueuePanelHost openerRef={openerRef} />
    </>
  );
}

/** A plain opener beside the host, as one component: the harness re-renders
 *  the element it was handed, and through it the host reads the new surface. */
function OpenerBesideHost({ openerId }: { openerId?: string }) {
  return (
    <>
      <button type="button" id={openerId}>
        {OPENER_LABEL}
      </button>
      <StudioQueuePanelHost />
    </>
  );
}

function StrictOpenerBesideHost() {
  return (
    <StrictMode>
      <OpenerBesideHost />
    </StrictMode>
  );
}

describe("StudioQueuePanelHost", () => {
  it("opens on its heading and closes on Escape", async () => {
    renderWithPlayer(<StudioQueuePanelHost />);
    const panel = await screen.findByRole("complementary", { name: "Queue" });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Queue" }),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(surfaceHolder.current?.closeSidePanel).toHaveBeenCalled();
  });

  it("stays closed on phones, where the queue lives in Now playing", () => {
    // The provider publishes no placement on phones.
    surfaceHolder.current = createSurfaceValue({
      sidePanel: "queue",
      sidePanelPlacement: null,
      isQueuePanelOpen: true,
    });
    renderWithPlayer(<StudioQueuePanelHost />);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("hands focus back to the button that opened it after Escape", async () => {
    setPanelOpen(false);
    const { rerenderWith } = renderWithPlayer(<OpenerBesideHost />);
    await awaitCatalog("studio");
    const opener = screen.getByRole("button", { name: OPENER_LABEL });
    opener.focus();
    setPanelOpen(true);
    rerenderWith({});
    const panel = await screen.findByRole("complementary", { name: "Queue" });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Queue" }),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(surfaceHolder.current?.closeSidePanel).toHaveBeenCalled();
    setPanelOpen(false);
    rerenderWith({});
    await waitFor(() => expect(opener).toHaveFocus());
  });

  it("returns focus to the opener it was given when nothing held focus", async () => {
    const { rerenderWith } = renderWithPlayer(<HostWithOpenerRef />);
    await screen.findByRole("complementary", { name: "Queue" });
    setPanelOpen(false);
    rerenderWith({});
    await waitFor(() =>
      expect(screen.getByRole("button", { name: OPENER_LABEL })).toHaveFocus(),
    );
  });

  it("falls back to the queue button by its id", async () => {
    setPanelOpen(false);
    const { rerenderWith } = renderWithPlayer(
      <OpenerBesideHost openerId={STUDIO_QUEUE_BUTTON_ID} />,
    );
    await awaitCatalog("studio");
    setPanelOpen(true);
    rerenderWith({});
    await screen.findByRole("complementary", { name: "Queue" });
    setPanelOpen(false);
    rerenderWith({});
    await waitFor(() =>
      expect(screen.getByRole("button", { name: OPENER_LABEL })).toHaveFocus(),
    );
  });

  it("hands focus back to the opener under StrictMode", async () => {
    setPanelOpen(false);
    const { rerenderWith } = renderWithPlayer(<StrictOpenerBesideHost />);
    await awaitCatalog("studio");
    const opener = screen.getByRole("button", { name: OPENER_LABEL });
    opener.focus();
    setPanelOpen(true);
    rerenderWith({});
    const panel = await screen.findByRole("complementary", { name: "Queue" });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Queue" }),
      ).toHaveFocus(),
    );
    fireEvent.keyDown(panel, { key: "Escape" });
    expect(surfaceHolder.current?.closeSidePanel).toHaveBeenCalled();
    setPanelOpen(false);
    rerenderWith({});
    await waitFor(() => expect(opener).toHaveFocus());
  });
  it("shows the Now playing view in the floating card", async () => {
    surfaceHolder.current = floatingSurface("nowPlaying");
    renderWithPlayer(<StudioQueuePanelHost />);
    await screen.findByRole("complementary", { name: "Now playing" });
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { level: 2, name: "Now playing" }),
      ).toHaveFocus(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Close Now playing" }));
    expect(surfaceHolder.current?.closeSidePanel).toHaveBeenCalled();
  });

  it("names the source as Playing from {source} with a link", async () => {
    surfaceHolder.current = floatingSurface("nowPlaying");
    renderWithPlayer(<StudioQueuePanelHost />, {
      player: playerFrom({
        kind: "playlist",
        label: "Late",
        href: "/studio/playlist?id=1",
      }),
    });
    await awaitCatalog("studio");
    const sourceLink = screen.getByRole("link", { name: "Late" });
    expect(sourceLink.getAttribute("href")).toBe("/studio/playlist?id=1");
    expect(sourceLink.closest("p")?.textContent).toBe("Playing from Late");
  });

  it("shows no source line for a plain list of tracks", () => {
    surfaceHolder.current = floatingSurface("nowPlaying");
    renderWithPlayer(<StudioQueuePanelHost />, {
      player: playerFrom({ kind: "tracks", label: "", href: null }),
    });
    expect(screen.queryByText(/Playing from/)).toBeNull();
  });

  it("renders nothing while closed or docked", () => {
    surfaceHolder.current = floatingSurface(null);
    const closed = renderWithPlayer(<StudioQueuePanelHost />);
    expect(screen.queryByRole("complementary")).toBeNull();
    closed.unmount();

    surfaceHolder.current = createSurfaceValue({
      sidePanel: "queue",
      sidePanelPlacement: "docked",
      isQueuePanelOpen: true,
    });
    renderWithPlayer(<StudioQueuePanelHost />);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("keeps the panel and its focus when the view switches", async () => {
    const { rerenderWith } = renderWithPlayer(<StudioQueuePanelHost />);
    const panel = await screen.findByRole("complementary", { name: "Queue" });
    const heading = screen.getByRole("heading", { level: 2, name: "Queue" });
    await waitFor(() => expect(heading).toHaveFocus());
    surfaceHolder.current = floatingSurface("nowPlaying");
    rerenderWith({});
    expect(screen.getByRole("complementary", { name: "Now playing" })).toBe(
      panel,
    );
    expect(heading.textContent).toBe("Now playing");
    expect(heading).toHaveFocus();
  });
});
