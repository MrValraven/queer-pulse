import { renderHook, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { useStrangerMemberSearch } from "./useStrangerMemberSearch";

/**
 * DES-185: `NewMessagePickList` only shows "No one matching {query}" once
 * `loading` (this hook's return) is false. Before this fix, `loading` was
 * `enabled && !demoMode && liveQuery.isFetching`, read off the STALE
 * debounced value, so during the ~200ms gap right after a keystroke (while
 * the previous debounced round has already settled with zero hits), it
 * flashed the empty state against the fresh keystroke text before the new
 * debounce round even started. Runs under this suite's forced demo mode
 * (vitest.config's `VITE_DEMO=1`), which is exactly the path that was
 * additionally broken: `loading` used to hardcode `!demoMode`, so demo mode
 * never reported the gap as loading at all.
 */

const NO_EXCLUSIONS = new Set<string>();

// A query guaranteed not to match anything in the demo member corpus, so
// both rounds below settle to zero results, keeping the assertions focused
// purely on the `loading` signal rather than on whether real hits appear.
const NO_MATCH_QUERY = "zzznomatchzzz";

describe("useStrangerMemberSearch settling gap (DES-185)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not flash loading:false on mount before any debounce round has run", () => {
    const { result } = renderHook(
      ({ query }: { query: string }) =>
        useStrangerMemberSearch(query, NO_EXCLUSIONS),
      { initialProps: { query: NO_MATCH_QUERY }, wrapper: TestProviders },
    );

    // `useDebouncedValue` seeds its state to the initial value on mount, so
    // there is no gap the very first render.
    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it("reports loading during the gap right after a keystroke, before the debounce settles", () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useStrangerMemberSearch(query, NO_EXCLUSIONS),
      { initialProps: { query: NO_MATCH_QUERY }, wrapper: TestProviders },
    );

    expect(result.current.loading).toBe(false);

    // The next keystroke: the debounced value is still the OLD (already
    // zero-hit) query for the next 200ms. Without the DES-185 fix this read
    // `loading: false`, which is exactly what let the empty state flash.
    rerender({ query: `${NO_MATCH_QUERY}x` });
    expect(result.current.loading).toBe(true);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.results).toEqual([]);
  });

  it("does not report loading forever once the live text drops below the search floor", () => {
    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useStrangerMemberSearch(query, NO_EXCLUSIONS),
      { initialProps: { query: NO_MATCH_QUERY }, wrapper: TestProviders },
    );

    // Shrinking to a single character will never enable a search once the
    // debounce settles, so the gap must not be reported as loading either.
    rerender({ query: "z" });
    expect(result.current.loading).toBe(false);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.loading).toBe(false);
  });
});
