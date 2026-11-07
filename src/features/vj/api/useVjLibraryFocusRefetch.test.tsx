import {
  QueryClient,
  QueryClientProvider,
  focusManager,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVjClips } from "./useVjClips";
import { useVjPackClips } from "./useVjPackClips";
import { VJ_LIVE_STALE_MS, useVjPacks } from "./useVjPacks";
import { getVjClips, getVjPackClips, getVjPacks } from "./vj.api";

const PACK_ID = "00000000-0000-4000-8000-0000000000a1";

const demoModeState = vi.hoisted(() => ({ demoMode: false }));
vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: demoModeState.demoMode }),
}));
vi.mock("./vj.api", () => ({
  getVjPacks: vi.fn(() => Promise.resolve({ items: [] })),
  getVjClips: vi.fn(() => Promise.resolve({ items: [] })),
  getVjPackClips: vi.fn(() =>
    Promise.resolve({ pack: { id: PACK_ID }, items: [] }),
  ),
}));

/** The app's client turns focus refetch off for every query, as here. */
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, refetchOnWindowFocus: false, staleTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function renderLibraryReads() {
  return renderHook(
    () => ({
      packs: useVjPacks(),
      clips: useVjClips(),
      packClips: useVjPackClips(PACK_ID),
    }),
    { wrapper: createWrapper() },
  );
}

function refocusWindow() {
  act(() => {
    focusManager.setFocused(false);
    focusManager.setFocused(true);
  });
}

beforeEach(() => {
  vi.mocked(getVjPacks).mockClear();
  vi.mocked(getVjClips).mockClear();
  vi.mocked(getVjPackClips).mockClear();
});

afterEach(() => {
  focusManager.setFocused(undefined);
  vi.restoreAllMocks();
});

describe("VJ library reads on window focus", () => {
  it("reads the live library again when the admin comes back to the tab once it is stale", async () => {
    demoModeState.demoMode = false;
    const { result } = renderLibraryReads();
    await waitFor(() => expect(result.current.packClips.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.packs.isSuccess).toBe(true));
    await waitFor(() => expect(result.current.clips.isSuccess).toBe(true));
    const packsReadsBefore = vi.mocked(getVjPacks).mock.calls.length;
    const clipsReadsBefore = vi.mocked(getVjClips).mock.calls.length;
    const packClipsReadsBefore = vi.mocked(getVjPackClips).mock.calls.length;

    // Live reads stay fresh for VJ_LIVE_STALE_MS; the admin comes back later.
    const backAt = Date.now() + VJ_LIVE_STALE_MS + 1;
    vi.spyOn(Date, "now").mockReturnValue(backAt);
    refocusWindow();

    await waitFor(() =>
      expect(vi.mocked(getVjPacks).mock.calls.length).toBe(
        packsReadsBefore + 1,
      ),
    );
    await waitFor(() =>
      expect(vi.mocked(getVjClips).mock.calls.length).toBe(
        clipsReadsBefore + 1,
      ),
    );
    await waitFor(() =>
      expect(vi.mocked(getVjPackClips).mock.calls.length).toBe(
        packClipsReadsBefore + 1,
      ),
    );
  });
});
