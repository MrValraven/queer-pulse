import { render, screen, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../test/TestProviders";
import { resumeStudioQueueSavingForTests } from "../studio/player/studioQueueStorage";
import { resumeStudioEpisodeSavingForTests } from "../studio/player/studioEpisodeMemory";
import { QuickExit } from "./QuickExit";
import { stopQuickExitStillHereWatchForTests } from "./useQuickExit";

/**
 * Quick Exit signs the member out and wipes everything sign-out wipes plus
 * the session caches (SEC-48): the demo session flag, DM composer drafts and
 * outbox, the story draft, recent searches and the issuer details. Demo mode,
 * as every TestProviders render is, so no request leaves the test.
 */
const SAFE_DESTINATION = "https://www.google.com";
const DEMO_SESSION_KEY = "qp_logged_in";
const TRACE_KEYS = [
  "qp.messages.drafts.v1",
  "qp.messages.drafts.v1.u.someone-else",
  "qp.messages.outbox.v1.u.someone-else",
  "qp.forum.draft.fields.draft-1",
  "qp-badges-story-notes",
  "qp-story-draft-v1",
  "qp:search:recents",
  "qp.economy.issuer",
] as const;

const realLocation = window.location;

/** Swaps Location for a stand-in whose `replace` is a spy (jsdom's own is a
 *  non-configurable property that throws "Not implemented: navigation"). */
function spyOnReplace() {
  const replace = vi.fn();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: { ...realLocation, replace },
  });
  return replace;
}

beforeEach(() => {
  window.localStorage.clear();
  // Signed in, stated outright, so the "false" below can only come from Quick Exit.
  window.localStorage.setItem(DEMO_SESSION_KEY, "true");
  for (const key of TRACE_KEYS) window.localStorage.setItem(key, '"kept"');
});

afterEach(() => {
  stopQuickExitStillHereWatchForTests();
  vi.restoreAllMocks();
  resumeStudioQueueSavingForTests();
  resumeStudioEpisodeSavingForTests();
  window.localStorage.clear();
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: realLocation,
  });
});

describe("QuickExit wipe", () => {
  it("signs the demo member out and forgets every per-member trace", async () => {
    const replace = spyOnReplace();
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button"));

    expect(window.localStorage.getItem(DEMO_SESSION_KEY)).toBe("false");
    for (const key of TRACE_KEYS) {
      expect(window.localStorage.getItem(key)).toBeNull();
    }
    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });

  it("still leaves when a wipe step throws", async () => {
    const replace = spyOnReplace();
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });
    render(
      <TestProviders>
        <QuickExit />
      </TestProviders>,
    );

    fireEvent.click(await screen.findByRole("button"));

    expect(replace).toHaveBeenCalledWith(SAFE_DESTINATION);
  });
});
