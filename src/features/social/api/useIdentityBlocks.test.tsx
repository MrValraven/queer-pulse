// src/features/social/api/useIdentityBlocks.test.tsx
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import { DemoModeProvider } from "../../../app/providers/DemoModeProvider";
import {
  identityBlocksQueryKey,
  useBlockIdentity,
  useIdentityBlocks,
} from "./useIdentityBlocks";

/** Mirrors the app's real defaults (`shared/api/queryClient.ts`): a 30s
 *  `staleTime` is exactly what caused I-1. The old demo `queryFn` always
 *  returned the static seed, so any refetch past this window silently
 *  reverted a block or unblock, something a plain `staleTime: 0` test
 *  client would not have reproduced. */
function productionLikeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 30_000 } },
  });
}

function wrapperWith(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <DemoModeProvider>{children}</DemoModeProvider>
      </QueryClientProvider>
    );
  };
}

/** Both hooks in one tree, so the mutation's cache write and the list
 *  query's own observer live under the same render (two independent
 *  `renderHook` trees sharing only the `QueryClient` do not reliably
 *  cross-notify one another in this test setup). */
function useListAndBlock() {
  return { list: useIdentityBlocks(), block: useBlockIdentity() };
}

describe("useIdentityBlocks, demo persistence (I-1)", () => {
  it("keeps a block once the query goes stale and refetches", async () => {
    const client = productionLikeClient();
    const wrapper = wrapperWith(client);
    const { result } = renderHook(() => useListAndBlock(), { wrapper });

    await waitFor(() => expect(result.current.list.isLoading).toBe(false));
    const seededCount = result.current.list.identityBlocks.length;

    await act(async () => {
      await result.current.block.mutateAsync({
        identityId: "demo-identity-test-block",
        kind: "listing",
        displayName: "Test Business",
      });
    });
    await waitFor(() =>
      expect(
        result.current.list.identityBlocks.some(
          (entry) => entry.identity.id === "demo-identity-test-block",
        ),
      ).toBe(true),
    );

    // Forces the `queryFn` to re-run: exactly what `refetchOnMount` does
    // once real elapsed time passes `staleTime`. The old `queryFn` always
    // answered with the static seed here, silently undoing the block. Reads
    // the cache directly (not `result.current`): react-query's own observer
    // notification lands on a later tick than `refetchQueries`' own promise,
    // so polling the RENDERED value here can catch a transient pre-refetch
    // state and pass for the wrong reason. The cache write itself, which is
    // what this behaviour is actually about, is synchronous with the await.
    await act(async () => {
      await client.refetchQueries({ queryKey: identityBlocksQueryKey(true) });
    });

    const afterRefetch = client.getQueryData<{ identity: { id: string } }[]>(
      identityBlocksQueryKey(true),
    );
    expect(
      afterRefetch?.some(
        (entry) => entry.identity.id === "demo-identity-test-block",
      ),
    ).toBe(true);
    expect(afterRefetch).toHaveLength(seededCount + 1);
  });

  it("survives a remount with no observer in between (gcTime never expires in demo)", async () => {
    const client = productionLikeClient();
    const wrapper = wrapperWith(client);
    const { result: blockResult, unmount: unmountBlockHook } = renderHook(
      () => useBlockIdentity(),
      { wrapper },
    );

    await act(async () => {
      await blockResult.current.mutateAsync({
        identityId: "demo-identity-test-block-2",
        kind: "listing",
        displayName: "Second Test Business",
      });
    });
    unmountBlockHook();

    // Nothing observes the `identity-blocks` cache entry between the write
    // above and the fresh mount below: the exact "created with no observer"
    // gap I-1 flagged, which the app's default `gcTime` (5 minutes) would
    // otherwise clear.
    const { result: listResult, unmount: unmountListHook } = renderHook(
      () => useIdentityBlocks(),
      { wrapper },
    );
    await waitFor(() => expect(listResult.current.isLoading).toBe(false));

    await waitFor(() =>
      expect(
        listResult.current.identityBlocks.some(
          (entry) => entry.identity.id === "demo-identity-test-block-2",
        ),
      ).toBe(true),
    );
    unmountListHook();
  });
});
