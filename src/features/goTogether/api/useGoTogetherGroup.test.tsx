import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { DemoModeProvider } from "../../../app/providers/DemoModeProvider";
import {
  useAcceptGoTogetherMerge,
  useLeaveGoTogetherGroup,
} from "./useGoTogetherGroup";
import { goTogetherKeys } from "./goTogetherKeys";

/**
 * Leave and merge both used to invalidate only the card and the group
 * queries, leaving a merged-away or left-behind group's chat banner reading
 * stale data from cache and the DM inbox not picking up a merge's new
 * thread (final-wave finding I6). Both mutations now also invalidate the
 * messages conversation list and detail queries, which have no exported key
 * factory of their own, so this asserts on the same literal prefixes
 * `useConversations.ts` uses (`["conversations"]`,
 * `["conversation-detail"]`).
 *
 * Demo mode keeps both mutations off the network (`demoLeaveGroup` /
 * `demoAcceptMerge` in `goTogether.mock.ts` never throw), so the mutation
 * itself is a plain pass-through here and the test is only about what gets
 * invalidated afterwards.
 */
function renderWithSpy() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const invalidateSpy = vi.spyOn(client, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <DemoModeProvider>{children}</DemoModeProvider>
    </QueryClientProvider>
  );
  return { client, invalidateSpy, wrapper };
}

function invalidatedKeyRoots(invalidateSpy: { mock: { calls: unknown[][] } }) {
  return invalidateSpy.mock.calls.map(
    (call) => (call[0] as { queryKey: unknown[] }).queryKey[0],
  );
}

describe("useLeaveGoTogetherGroup", () => {
  it("invalidates the card, the group, and the conversation list and detail queries", async () => {
    const { invalidateSpy, wrapper } = renderWithSpy();
    const { result } = renderHook(
      () => useLeaveGoTogetherGroup("demo-go-together-pride-picnic"),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const invalidatedRoots = invalidatedKeyRoots(invalidateSpy);
    expect(invalidatedRoots).toEqual(
      expect.arrayContaining([
        goTogetherKeys.cardRoot[0],
        goTogetherKeys.groupRoot[0],
        "conversations",
        "conversation-detail",
      ]),
    );
  });
});

describe("useAcceptGoTogetherMerge", () => {
  it("caches the merged-into group, then invalidates the card, the group root, and the conversation queries", async () => {
    const { client, invalidateSpy, wrapper } = renderWithSpy();
    const { result } = renderHook(
      () => useAcceptGoTogetherMerge("demo-go-together-pride-picnic"),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const mergedGroup = result.current.data;
    expect(mergedGroup).toBeDefined();
    // Cached under its own id before the invalidation pass runs, so a
    // render right after this resolves already has it.
    expect(
      client.getQueryData(goTogetherKeys.group(mergedGroup!.id, true)),
    ).toEqual(mergedGroup);

    const invalidatedRoots = invalidatedKeyRoots(invalidateSpy);
    expect(invalidatedRoots).toEqual(
      expect.arrayContaining([
        goTogetherKeys.cardRoot[0],
        goTogetherKeys.groupRoot[0],
        "conversations",
        "conversation-detail",
      ]),
    );
  });
});
