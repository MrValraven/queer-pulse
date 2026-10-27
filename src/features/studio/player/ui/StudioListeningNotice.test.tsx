import { QueryClient } from "@tanstack/react-query";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../../test/TestProviders";
import { DEFAULT_STUDIO_PLAYBACK } from "../../api/studio.types";
import { studioKeys } from "../../api/studioQueryKeys";
import {
  maybeShowStudioListeningNotice,
  readStudioListeningNotice,
  resetStudioListeningNoticeForTests,
} from "../studioListeningNoticeStore";
import { StudioListeningNotice } from "./StudioListeningNotice";

vi.mock("../../api/studioPlayback.api", () => ({
  putStudioPlayback: vi.fn(() => Promise.resolve(DEFAULT_STUDIO_PLAYBACK)),
}));

const BODY = "Your listening history is on. Only you can see it";

/** Shows the notice the way a first counted play does: a loaded row that
 *  is on and carries no stamp. */
function showForTest() {
  const client = new QueryClient();
  client.setQueryData(studioKeys.playback(false), {
    ...DEFAULT_STUDIO_PLAYBACK,
    isListeningHistoryOn: true,
    listeningNoticeSeenAt: null,
  });
  maybeShowStudioListeningNotice(client, false);
}

function renderNotice() {
  return render(
    <TestProviders>
      <StudioListeningNotice />
    </TestProviders>,
  );
}

beforeEach(resetStudioListeningNoticeForTests);

afterEach(() => {
  vi.useRealTimers();
});

describe("StudioListeningNotice", () => {
  it("shows nothing until a play shows it", () => {
    renderNotice();
    expect(screen.queryByText(BODY)).toBeNull();
  });

  it("says history is on, links to Your listening and closes on the link", async () => {
    renderNotice();
    act(() => showForTest());
    // The toast regions are status regions too, so the query names this one.
    expect(
      await screen.findByText(BODY, { selector: '[role="status"]' }),
    ).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "See your listening" });
    expect(link).toHaveAttribute("href", "/studio/listening");
    fireEvent.click(link);
    await waitFor(() => expect(readStudioListeningNotice()).toBe(false));
  });

  it("closes from its close button", async () => {
    renderNotice();
    act(() => showForTest());
    fireEvent.click(
      await screen.findByRole("button", { name: "Close notice" }),
    );
    await waitFor(() => expect(readStudioListeningNotice()).toBe(false));
  });

  it("closes by itself after 12 seconds unless focus is inside", () => {
    vi.useFakeTimers();
    renderNotice();
    act(() => showForTest());
    const link = screen.getByRole("link", { name: "See your listening" });
    fireEvent.focusIn(link);
    act(() => {
      vi.advanceTimersByTime(13_000);
    });
    expect(readStudioListeningNotice()).toBe(true);
    fireEvent.focusOut(link);
    act(() => {
      vi.advanceTimersByTime(13_000);
    });
    expect(readStudioListeningNotice()).toBe(false);
  });

  it("holds the 12 seconds while the pointer is inside", () => {
    vi.useFakeTimers();
    renderNotice();
    act(() => showForTest());
    const link = screen.getByRole("link", { name: "See your listening" });
    fireEvent.pointerEnter(link);
    act(() => {
      vi.advanceTimersByTime(13_000);
    });
    expect(readStudioListeningNotice()).toBe(true);
    fireEvent.pointerLeave(link);
    act(() => {
      vi.advanceTimersByTime(11_000);
    });
    expect(readStudioListeningNotice()).toBe(true);
    act(() => {
      vi.advanceTimersByTime(2_000);
    });
    expect(readStudioListeningNotice()).toBe(false);
  });

  it("returns focus to the element that held it when Close is pressed", async () => {
    render(
      <TestProviders>
        <button type="button">Earlier control</button>
        <StudioListeningNotice />
      </TestProviders>,
    );
    const earlier = screen.getByRole("button", { name: "Earlier control" });
    earlier.focus();
    act(() => showForTest());
    const close = await screen.findByRole("button", { name: "Close notice" });
    act(() => close.focus());
    fireEvent.click(close);
    expect(earlier).toHaveFocus();
    await waitFor(() => expect(readStudioListeningNotice()).toBe(false));
  });

  it("returns focus on Escape and falls back to the play control when the earlier element is gone", async () => {
    render(
      <TestProviders>
        <button type="button" data-studio-play-toggle="">
          Play
        </button>
        <button type="button">Earlier control</button>
        <StudioListeningNotice />
      </TestProviders>,
    );
    const earlier = screen.getByRole("button", { name: "Earlier control" });
    earlier.focus();
    act(() => showForTest());
    const link = await screen.findByRole("link", {
      name: "See your listening",
    });
    act(() => link.focus());
    earlier.remove();
    fireEvent.keyDown(link, { key: "Escape" });
    expect(screen.getByRole("button", { name: "Play" })).toHaveFocus();
    await waitFor(() => expect(readStudioListeningNotice()).toBe(false));
  });

  it("leaves focus alone when the notice never took it", async () => {
    render(
      <TestProviders>
        <button type="button">Elsewhere</button>
        <StudioListeningNotice />
      </TestProviders>,
    );
    const elsewhere = screen.getByRole("button", { name: "Elsewhere" });
    act(() => showForTest());
    const close = await screen.findByRole("button", { name: "Close notice" });
    elsewhere.focus();
    fireEvent.click(close);
    expect(elsewhere).toHaveFocus();
  });
});
