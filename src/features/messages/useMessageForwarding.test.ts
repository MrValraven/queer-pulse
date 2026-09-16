import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMessageForwarding } from "./useMessageForwarding";
import type { Conversation } from "./data";

/**
 * The bug this covers (C1 of the DES-206 forward-picker review): forwarding
 * to two-or-more brand-new-conversation recipients used to drive
 * `startConversation.mutate(slug, { onSuccess, onError })` once per
 * recipient on the SAME shared TanStack mutation observer. In v5,
 * `MutationObserver#mutate` stores the per-call callbacks as the observer's
 * one current `#mutateOptions`, so a second call before the first settles
 * overwrites the first's callbacks and its own `onSuccess`/`onError` never
 * fires: the picker's settled count stalls and the recipient never
 * completes. `forwardMessage` now awaits `mutateAsync` per call instead,
 * which builds its own `Mutation` instance per call and returns THAT
 * instance's own promise (see `useMessageForwarding.ts`'s own doc), so every
 * recipient resolves independently regardless of ordering.
 */
function buildRecipient(slug: string): Conversation {
  return {
    id: slug,
    slug,
    initials: slug.slice(0, 2).toUpperCase(),
    tint: "default",
    name: slug,
    pronouns: "",
    connectedSince: "",
    time: "",
    preview: "",
    unread: false,
    messages: [],
  };
}

describe("useMessageForwarding", () => {
  it("resolves every new-conversation recipient on its own mutateAsync call, even when an earlier call settles later", async () => {
    const conversations = {
      alex: { ...buildRecipient("alex"), id: "conv-alex" },
      bree: { ...buildRecipient("bree"), id: "conv-bree" },
    } satisfies Record<string, Conversation>;
    // "alex" resolves AFTER "bree" (reversed completion order): a
    // shared-observer bug would let bree's callbacks fire (as the LATEST
    // `#mutateOptions`) and alex's never fire at all.
    const mutateAsync = vi.fn((slug: string) => {
      if (slug === "alex") {
        return new Promise<Conversation>((resolve) => {
          setTimeout(() => resolve(conversations.alex), 10);
        });
      }
      return Promise.resolve(conversations.bree);
    });

    const appendOptimistic = vi.fn();
    const deliver = vi.fn();
    const setExtraThreads = vi.fn();
    const setReadIds = vi.fn();
    const setLocallyDeletedIds = vi.fn();
    const migrateOutboxConversation = vi.fn();

    const { result } = renderHook(() =>
      useMessageForwarding({
        demoMode: false,
        allThreads: [],
        t: (key: string) => key,
        setExtraThreads,
        setReadIds,
        setLocallyDeletedIds,
        // Only `mutateAsync` is exercised by `forwardMessage`.
        startConversation: { mutateAsync } as never,
        appendOptimistic,
        deliver,
        migrateOutboxConversation,
      }),
    );

    const alexRecipient = buildRecipient("alex");
    const breeRecipient = buildRecipient("bree");

    const outcomes = await Promise.allSettled([
      result.current.forwardMessage(alexRecipient, "hey"),
      result.current.forwardMessage(breeRecipient, "hey"),
    ]);

    expect(outcomes).toEqual([
      { status: "fulfilled", value: true },
      { status: "fulfilled", value: true },
    ]);
    expect(mutateAsync).toHaveBeenCalledTimes(2);
    expect(mutateAsync).toHaveBeenCalledWith("alex");
    expect(mutateAsync).toHaveBeenCalledWith("bree");
    // Each recipient's own send landed on ITS OWN real conversation id. A
    // shared-observer bug would only ever deliver to one of them.
    expect(deliver).toHaveBeenCalledWith(
      "conv-alex",
      "hey",
      expect.any(String),
      undefined,
      true,
      undefined,
      undefined,
    );
    expect(deliver).toHaveBeenCalledWith(
      "conv-bree",
      "hey",
      expect.any(String),
      undefined,
      true,
      undefined,
      undefined,
    );
    expect(appendOptimistic).toHaveBeenCalledTimes(2);
  });

  it("resolves false and rolls back the placeholder when a brand-new conversation fails to materialize", async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error("network"));
    const setExtraThreads = vi.fn();
    const setReadIds = vi.fn();

    const { result } = renderHook(() =>
      useMessageForwarding({
        demoMode: false,
        allThreads: [],
        t: (key: string) => key,
        setExtraThreads,
        setReadIds,
        setLocallyDeletedIds: vi.fn(),
        startConversation: { mutateAsync } as never,
        appendOptimistic: vi.fn(),
        deliver: vi.fn(),
        migrateOutboxConversation: vi.fn(),
      }),
    );

    const outcome = await result.current.forwardMessage(
      buildRecipient("casey"),
      "hey",
    );

    expect(outcome).toBe(false);
    // The placeholder row it optimistically added is removed again.
    expect(setExtraThreads).toHaveBeenCalledTimes(2);
  });
});
