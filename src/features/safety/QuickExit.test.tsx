import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { useEffect } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { useStudioPlayer } from "../studio/player/studioPlayerContext";
import { resumeStudioQueueSavingForTests } from "../studio/player/studioQueueStorage";
import { QuickExit } from "./QuickExit";

/**
 * Quick-exit safety net (audit item #12).
 *
 * NOTE: the task described a "double-Shift" trigger. The shipped component
 * (`QuickExit.tsx`) actually triggers the decoy redirect on the **Escape** key
 * (a well-known safety pattern) plus a visible button — there is no
 * double-Shift handler in the source. These tests exercise the REAL behaviour:
 * Escape (and the button) navigate away via `window.location.replace`, but
 * Escape is a deliberate NO-OP while focus is in a text-entry field so an
 * accidental Escape can't discard a half-written report.
 *
 * `window.location.replace` is spied on because jsdom's real implementation
 * throws "Not implemented: navigation".
 */
const SAFE_DESTINATION = "https://www.google.com";

const realLocation = window.location;

afterEach(() => {
  vi.restoreAllMocks();
  resumeStudioQueueSavingForTests();
  window.sessionStorage.clear();
  // Restore the genuine Location after each swap below.
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: realLocation,
  });
});

/** Queues one track in the app-wide player as it mounts, so the player
 *  saves its queue to session storage. */
function QueuedPlayer() {
  const player = useStudioPlayer();
  useEffect(() => {
    void player.playTracks([
      {
        trackId: "quick-exit-track",
        title: "Track",
        durationSeconds: 200,
        trackHref: "/studio/track?id=quick-exit-track",
        releaseId: "quick-exit-release",
        releaseTitle: "Release",
        coverUrl: null,
        tint: "plum",
        artistId: "p1",
        artistName: "Artist",
        artistHref: "/studio/artist?id=p1",
        isExplicit: false,
      },
    ]);
    // Once, at mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

const savedQueueKeys = () =>
  Object.keys(window.sessionStorage).filter((key) =>
    key.startsWith("studio.queue."),
  );

// jsdom's `window.location.replace` is a non-configurable own property, so
// `vi.spyOn(window.location, "replace")` throws "Cannot redefine property".
// Swap the whole Location object for a stand-in whose `replace` is a spy
// instead (the component only touches `location.replace` and `history`).
function spyOnReplace() {
  const replace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...realLocation, replace },
  });
  return replace;
}

describe("QuickExit", () => {
  it("redirects to the neutral decoy site on Escape", () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    // Nothing focused → activeElement is <body>, not a text field.
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("is a NO-OP on Escape while the user is typing in a text input", () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <input data-testid="report-draft" type="text" />
        <QuickExit />
      </TestProviders>,
    );

    // Put focus in the text field, mirroring someone mid-draft.
    const input = screen.getByTestId<HTMLInputElement>("report-draft");
    input.focus();
    expect(document.activeElement).toBe(input);

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    // The visible button stays the always-instant exit; Escape must not fire
    // here or it would throw away the in-progress input.
    expect(replace).not.toHaveBeenCalled();
  });

  it("still redirects immediately when the visible button is pressed", async () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    // The label is a lazy-loaded translation, so wait for the button to resolve.
    const button = await screen.findByRole("button");
    fireEvent.click(button);

    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("forgets the Studio queue saved in this tab before leaving", () => {
    window.sessionStorage.setItem("studio.queue.member-1", "{}");
    window.sessionStorage.setItem("studio.queue.member-2", "{}");
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(window.sessionStorage.getItem("studio.queue.member-1")).toBeNull();
    expect(window.sessionStorage.getItem("studio.queue.member-2")).toBeNull();
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("keeps the queue unsaved through the pagehide that leaving fires", async () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QueuedPlayer />
        <QuickExit />
      </TestProviders>,
    );
    await waitFor(() => expect(savedQueueKeys()).not.toEqual([]));

    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => {
      window.dispatchEvent(new Event("pagehide"));
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(savedQueueKeys()).toEqual([]);
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });
});
