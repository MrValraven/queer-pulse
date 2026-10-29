import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearStudioRecentlyPlayed } from "../player/studioListeningMemory";
import { DEMO_ARTIST_LUA_CARDOSO } from "./studioDemoFormats.data";
import { DEMO_ARTIST_MARIANA } from "./studioDemoMe.data";
import { resetDemoYourListening } from "./studioDemoYourListening";
import { DEMO_RECENT_PAGE_SIZE } from "./studioDemoYourListening.data";
import { useClearStudioListening } from "./useClearStudioListening";
import {
  useStudioListeningRecent,
  useStudioListeningSummary,
  useStudioListeningSupporting,
} from "./useStudioListening";
import {
  useSaveStudioSupporter,
  useStudioSupporterState,
} from "./useStudioSupporter";

const showToast = vi.hoisted(() => vi.fn());

vi.mock("../../../app/providers/DemoModeProvider", () => ({
  useDemoMode: () => ({ demoMode: true }),
}));
vi.mock("./useStudioAccess", () => ({
  useStudioAccess: () => ({ hasAccess: true, uploadablePersonas: [] }),
}));
vi.mock("../../../shared/components/feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));
vi.mock("../../../shared/i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock("../player/studioListeningMemory", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../player/studioListeningMemory")>()),
  clearStudioRecentlyPlayed: vi.fn(),
}));

function wrapperWith(queryClient: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("Studio listening hooks in demo", () => {
  // One fresh client per test, held across that test's renders.
  let wrapper = wrapperWith(new QueryClient());
  beforeEach(() => {
    resetDemoYourListening();
    vi.mocked(clearStudioRecentlyPlayed).mockClear();
    showToast.mockClear();
    wrapper = wrapperWith(
      new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      }),
    );
  });

  it("reads the demo listener's summary per range, the longer range holding at least as much", async () => {
    const four = renderHook(() => useStudioListeningSummary("4w"), { wrapper });
    const twelve = renderHook(() => useStudioListeningSummary("12m"), {
      wrapper,
    });
    await waitFor(() => expect(twelve.result.current.summary).not.toBeNull());
    await waitFor(() => expect(four.result.current.summary).not.toBeNull());
    expect(twelve.result.current.summary?.totalListens ?? 0).toBeGreaterThan(0);
    expect(
      twelve.result.current.summary?.totalListens ?? 0,
    ).toBeGreaterThanOrEqual(
      four.result.current.summary?.totalListens ?? Number.POSITIVE_INFINITY,
    );
  });

  it("pages the history and fetches the next page on request", async () => {
    const { result } = renderHook(() => useStudioListeningRecent(), {
      wrapper,
    });
    await waitFor(() => expect(result.current.items.length).toBeGreaterThan(0));
    expect(result.current.hasMore).toBe(true);
    act(() => result.current.fetchNextPage());
    await waitFor(() =>
      expect(result.current.items.length).toBeGreaterThan(
        DEMO_RECENT_PAGE_SIZE,
      ),
    );
  });

  it("clears the server history and this device's list, and folds the cached lists to empty", async () => {
    const recent = renderHook(() => useStudioListeningRecent(), { wrapper });
    const summary = renderHook(() => useStudioListeningSummary("4w"), {
      wrapper,
    });
    await waitFor(() =>
      expect(recent.result.current.items.length).toBeGreaterThan(0),
    );
    await waitFor(() =>
      expect(summary.result.current.summary?.isEmpty).toBe(false),
    );
    const clear = renderHook(() => useClearStudioListening(), { wrapper });
    await act(async () =>
      expect(await clear.result.current.clearHistory()).toBe(true),
    );
    expect(clearStudioRecentlyPlayed).toHaveBeenCalledTimes(1);
    expect(recent.result.current.items).toEqual([]);
    expect(recent.result.current.hasMore).toBe(false);
    expect(summary.result.current.summary?.isEmpty).toBe(true);
    expect(summary.result.current.summary?.totalListens).toBe(0);
    expect(showToast).toHaveBeenLastCalledWith(
      "studio:listening.clear.done",
      "success",
    );
  });

  it("saves the account as the identity and reflects it in Artists who see your name", async () => {
    const state = renderHook(
      () => useStudioSupporterState(DEMO_ARTIST_LUA_CARDOSO.id, true),
      { wrapper },
    );
    await waitFor(() =>
      expect(state.result.current.state?.isSupporting).toBe(false),
    );
    const save = renderHook(
      () => useSaveStudioSupporter(DEMO_ARTIST_LUA_CARDOSO.id),
      { wrapper },
    );
    await act(async () =>
      expect(await save.result.current.save(null)).toBe(true),
    );
    expect(state.result.current.state?.isSupporting).toBe(true);
    expect(state.result.current.state?.shownAs?.kind).toBe("account");
    const supporting = renderHook(() => useStudioListeningSupporting(), {
      wrapper,
    });
    await waitFor(() =>
      expect(
        supporting.result.current.items?.map((item) => item.artist.id),
      ).toContain(DEMO_ARTIST_LUA_CARDOSO.id),
    );
  });

  it("reads the own-persona refusal and reads nothing while disabled", async () => {
    const own = renderHook(
      () => useStudioSupporterState(DEMO_ARTIST_MARIANA.id, true),
      { wrapper },
    );
    await waitFor(() =>
      expect(own.result.current.loadState.isError).toBe(true),
    );
    expect(own.result.current.state).toBeNull();
    const off = renderHook(
      () => useStudioSupporterState(DEMO_ARTIST_LUA_CARDOSO.id, false),
      { wrapper },
    );
    expect(off.result.current.loadState.isLoading).toBe(false);
    expect(off.result.current.state).toBeNull();
  });
});
