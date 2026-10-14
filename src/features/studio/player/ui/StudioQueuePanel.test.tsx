import { fireEvent, screen, waitFor } from "@testing-library/react";
import { StrictMode, useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { StudioPlayerSurfaceValue } from "../studioPlayerSurface";
import { StudioQueuePanelHost } from "./StudioQueuePanel";
import { STUDIO_QUEUE_BUTTON_ID } from "./studioQueueMoves";
import {
  createSurfaceValue,
  renderWithPlayer,
} from "./studioPlayerTestHarness";

const surfaceHolder = vi.hoisted(() => ({
  current: null as StudioPlayerSurfaceValue | null,
}));
vi.mock("../studioPlayerSurface", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../studioPlayerSurface")>()),
  useStudioPlayerSurface: () => surfaceHolder.current,
}));

beforeEach(() => {
  surfaceHolder.current = createSurfaceValue({ isQueuePanelOpen: true });
});

const OPENER_LABEL = "Show queue";

afterEach(() => {
  vi.restoreAllMocks();
});

function setPanelOpen(isQueuePanelOpen: boolean) {
  surfaceHolder.current = createSurfaceValue({ isQueuePanelOpen });
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
    expect(surfaceHolder.current?.closeQueuePanel).toHaveBeenCalled();
  });

  it("stays closed on phones, where the queue lives in Now playing", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("880"),
          media: query,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
        }) as unknown as MediaQueryList,
    );
    renderWithPlayer(<StudioQueuePanelHost />);
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("hands focus back to the button that opened it after Escape", async () => {
    setPanelOpen(false);
    const { rerenderWith } = renderWithPlayer(
      <>
        <button type="button">{OPENER_LABEL}</button>
        <StudioQueuePanelHost />
      </>,
    );
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
    expect(surfaceHolder.current?.closeQueuePanel).toHaveBeenCalled();
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
      <>
        <button type="button" id={STUDIO_QUEUE_BUTTON_ID}>
          {OPENER_LABEL}
        </button>
        <StudioQueuePanelHost />
      </>,
    );
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
    const { rerenderWith } = renderWithPlayer(
      <StrictMode>
        <button type="button">{OPENER_LABEL}</button>
        <StudioQueuePanelHost />
      </StrictMode>,
    );
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
    expect(surfaceHolder.current?.closeQueuePanel).toHaveBeenCalled();
    setPanelOpen(false);
    rerenderWith({});
    await waitFor(() => expect(opener).toHaveFocus());
  });
});
