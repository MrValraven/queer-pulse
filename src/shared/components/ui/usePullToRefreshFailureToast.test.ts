import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryObserver } from "@tanstack/react-query";
import type { PointerEvent as ReactPointerEvent } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import { usePullToRefresh } from "./usePullToRefresh";

/**
 * DES-197: `usePullToRefresh` has always wrapped `onRefresh()` in a
 * `.catch(() => showToast(...))`, but every real caller passed a bare
 * `queryClient.invalidateQueries({ queryKey: [...] })` with no
 * `throwOnError`. In the installed `@tanstack/react-query@5.101.2`,
 * `QueryClient.invalidateQueries` forwards straight to `refetchQueries`,
 * which swallows a failed refetch in its own `.catch(noop)` unless
 * `throwOnError` is set (`query-core`'s `build/modern/queryClient.js`), so
 * that promise never rejected and the toast was dead code. The fix threads
 * `{ throwOnError: true }` through the call (mirrored here exactly as
 * `MessagesThreadList.tsx` now wires it). The first two specs prove the
 * underlying react-query mechanism directly, against the real installed
 * package (no mocking of react-query itself); the last two prove the fix
 * end to end through the actual hook.
 */

const showToast = vi.fn();
vi.mock("../feedback/useToast", () => ({
  useToast: () => ({ showToast }),
}));

beforeEach(() => {
  showToast.mockReset();
});

function makeSeededFailingClient() {
  // Resolves once (the initial load, seeding the cache with data to pull
  // against), then rejects on every subsequent fetch (the failed refresh).
  const queryFn = vi
    .fn()
    .mockResolvedValueOnce(["conversation-1"])
    .mockRejectedValue(new Error("network down"));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  // `invalidateQueries`'s default filter is `type: "active"`: it only
  // refetches a query with a live observer. In the real app that observer is
  // `useConversations()`'s own mounted `useQuery` for this same key; a bare
  // `QueryClient` with nothing subscribed to `["conversations"]` would make
  // `invalidateQueries` find nothing to refetch at all (its promise resolves
  // immediately, `queryFn` never even runs a second time), which would prove
  // nothing about `throwOnError` either way. `QueryObserver` reproduces that
  // real subscription without needing to mount `MessagesThreadList`'s whole
  // provider tree.
  new QueryObserver(queryClient, {
    queryKey: ["conversations"],
    queryFn,
  }).subscribe(() => {});
  return { queryClient, queryFn };
}

/** A pointer-event stub shaped enough for `usePullToRefresh`'s own reads.
 *  Mirrors the hand-built stubs this repo's other drag-gesture tests already
 *  use (e.g. `useMessageGestures.test.ts`) rather than dispatching real DOM
 *  PointerEvents, which jsdom only partially supports. */
function pointerEvent(clientY: number): ReactPointerEvent<HTMLElement> {
  const target = document.createElement("div");
  target.scrollTop = 0;
  return {
    pointerId: 1,
    clientY,
    currentTarget: target,
  } as unknown as ReactPointerEvent<HTMLElement>;
}

/** Drags well past `DEFAULT_THRESHOLD_PX` so release always arms a refresh. */
function pullDownAndRelease(bind: ReturnType<typeof usePullToRefresh>["bind"]) {
  act(() => {
    bind.onPointerDown(pointerEvent(0));
    bind.onPointerMove(pointerEvent(220));
    bind.onPointerUp(pointerEvent(220));
  });
}

describe("QueryClient.invalidateQueries throwOnError (DES-197 mechanism)", () => {
  it("without throwOnError, resolves even though the refetch actually failed (reproduces the bug)", async () => {
    const { queryClient, queryFn } = makeSeededFailingClient();
    await queryClient.fetchQuery({ queryKey: ["conversations"], queryFn });

    await expect(
      queryClient.invalidateQueries({ queryKey: ["conversations"] }),
    ).resolves.toBeUndefined();
  });

  it("with throwOnError, rejects with the real fetch error (the DES-197 fix)", async () => {
    const { queryClient, queryFn } = makeSeededFailingClient();
    await queryClient.fetchQuery({ queryKey: ["conversations"], queryFn });

    await expect(
      queryClient.invalidateQueries(
        { queryKey: ["conversations"] },
        { throwOnError: true },
      ),
    ).rejects.toThrow("network down");
  });
});

describe("usePullToRefresh + queryClient.invalidateQueries end to end (DES-197)", () => {
  it("surfaces the failed-refresh toast when the caller passes throwOnError", async () => {
    const { queryClient, queryFn } = makeSeededFailingClient();
    await queryClient.fetchQuery({ queryKey: ["conversations"], queryFn });

    const { result } = renderHook(
      () =>
        usePullToRefresh({
          onRefresh: () =>
            queryClient.invalidateQueries(
              { queryKey: ["conversations"] },
              { throwOnError: true },
            ),
        }),
      { wrapper: TestProviders },
    );

    pullDownAndRelease(result.current.bind);

    await waitFor(() =>
      expect(showToast).toHaveBeenCalledWith(
        "Refresh failed. Try again in a moment.",
        "error",
      ),
    );
  });

  it("stays silent when the caller omits throwOnError (the pre-fix bug, kept as a regression guard)", async () => {
    const { queryClient, queryFn } = makeSeededFailingClient();
    await queryClient.fetchQuery({ queryKey: ["conversations"], queryFn });

    const { result } = renderHook(
      () =>
        usePullToRefresh({
          onRefresh: () =>
            queryClient.invalidateQueries({ queryKey: ["conversations"] }),
        }),
      { wrapper: TestProviders },
    );

    pullDownAndRelease(result.current.bind);

    // Give the (silently swallowed) refetch every chance to settle.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(showToast).not.toHaveBeenCalled();
  });
});
