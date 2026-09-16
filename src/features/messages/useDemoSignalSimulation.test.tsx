import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useDemoInboundMessageSimulation } from "./useDemoSignalSimulation";
import {
  DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
  DEMO_INBOUND_MESSAGE_DELAY_MS,
} from "./demoSignalSimulation";
import { DEMO_INBOUND_SIMULATION_MESSAGE_BODY } from "./data";
import { demoThreadPage, readDemoThread } from "./api/demoThreadCache";
import type { MessageResponse } from "../../shared/contracts/contracts";

/**
 * Unit coverage for `useDemoInboundMessageSimulation`: the only demo-mode path
 * that lands a genuine inbound message into an already-open thread, which is
 * what unblocks `useMessageScroll`'s jump-pill counter in demo (see the
 * hook's own doc, and `e2e/messaging-scroll.spec.ts`'s now-unskipped spec).
 * A `QueryClientProvider` wrapper is required, since the hook calls
 * `useQueryClient()` directly, unconditionally.
 */

function renderedThreadKey(conversationId: string) {
  return ["messages", conversationId, true] as const;
}

/** Puts the newest demo page where `useMessageThread` keeps it in demo, the
 *  same seeding `demoThreadCache.test.ts` uses: `upsertMessage` (which this
 *  hook patches through) is a no-op against a thread that was never loaded. */
function seedRenderedThread(queryClient: QueryClient, conversationId: string) {
  const newestPage = demoThreadPage(
    readDemoThread(queryClient, conversationId),
    undefined,
  );
  queryClient.setQueryData(renderedThreadKey(conversationId), {
    pages: [newestPage],
    pageParams: [undefined],
  });
}

function cachedItems(
  queryClient: QueryClient,
  conversationId: string,
): MessageResponse[] {
  const data = queryClient.getQueryData<{
    pages: { items: MessageResponse[] }[];
  }>(renderedThreadKey(conversationId));
  return data?.pages[0]?.items ?? [];
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useDemoInboundMessageSimulation", () => {
  it("delivers a genuine inbound message into the target thread after the fixed delay", () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    seedRenderedThread(queryClient, DEMO_INBOUND_MESSAGE_CONVERSATION_ID);
    const before = cachedItems(
      queryClient,
      DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
    );

    renderHook(
      () =>
        useDemoInboundMessageSimulation(
          DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
          true,
        ),
      { wrapper: createWrapper(queryClient) },
    );

    act(() => {
      vi.advanceTimersByTime(DEMO_INBOUND_MESSAGE_DELAY_MS - 1);
    });
    expect(
      cachedItems(queryClient, DEMO_INBOUND_MESSAGE_CONVERSATION_ID),
    ).toHaveLength(before.length);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    const after = cachedItems(
      queryClient,
      DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
    );
    expect(after).toHaveLength(before.length + 1);
    const delivered = after.find(
      (message) => !before.some((existing) => existing.id === message.id),
    )!;
    expect(delivered.body).toBe(DEMO_INBOUND_SIMULATION_MESSAGE_BODY);
    expect(delivered.sender.handle).toBe(DEMO_INBOUND_MESSAGE_CONVERSATION_ID);
    expect(delivered.sender.displayName).toBe("Maria Ferreira");
  });

  it("stays silent in live mode even for the target thread", () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    seedRenderedThread(queryClient, DEMO_INBOUND_MESSAGE_CONVERSATION_ID);
    const before = cachedItems(
      queryClient,
      DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
    );

    renderHook(
      () =>
        useDemoInboundMessageSimulation(
          DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
          false,
        ),
      { wrapper: createWrapper(queryClient) },
    );

    act(() => {
      vi.advanceTimersByTime(DEMO_INBOUND_MESSAGE_DELAY_MS * 2);
    });
    expect(
      cachedItems(queryClient, DEMO_INBOUND_MESSAGE_CONVERSATION_ID),
    ).toHaveLength(before.length);
  });

  it("stays silent for a thread other than the seeded target", () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    seedRenderedThread(queryClient, "anika");
    const before = cachedItems(queryClient, "anika");

    renderHook(() => useDemoInboundMessageSimulation("anika", true), {
      wrapper: createWrapper(queryClient),
    });

    act(() => {
      vi.advanceTimersByTime(DEMO_INBOUND_MESSAGE_DELAY_MS * 2);
    });
    expect(cachedItems(queryClient, "anika")).toHaveLength(before.length);
  });

  it("cancels the pending delivery when the thread switches away before the delay elapses", () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    seedRenderedThread(queryClient, DEMO_INBOUND_MESSAGE_CONVERSATION_ID);
    const before = cachedItems(
      queryClient,
      DEMO_INBOUND_MESSAGE_CONVERSATION_ID,
    );

    const { rerender } = renderHook(
      ({ conversationId }: { conversationId: string }) =>
        useDemoInboundMessageSimulation(conversationId, true),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { conversationId: DEMO_INBOUND_MESSAGE_CONVERSATION_ID },
      },
    );

    act(() => {
      vi.advanceTimersByTime(DEMO_INBOUND_MESSAGE_DELAY_MS / 2);
    });
    rerender({ conversationId: "anika" });
    act(() => {
      vi.advanceTimersByTime(DEMO_INBOUND_MESSAGE_DELAY_MS);
    });

    expect(
      cachedItems(queryClient, DEMO_INBOUND_MESSAGE_CONVERSATION_ID),
    ).toHaveLength(before.length);
  });
});
