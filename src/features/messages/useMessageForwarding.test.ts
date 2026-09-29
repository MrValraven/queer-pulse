import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useMessageForwarding } from "./useMessageForwarding";
import { mergeInboxThreads } from "./useMessageThreadList";
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
        activeId: "",
        returnToLatest: vi.fn(),
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
      undefined,
      // A brand-new first contact goes out as the member's own profile.
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
      undefined,
      // A brand-new first contact goes out as the member's own profile.
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
        activeId: "",
        returnToLatest: vi.fn(),
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

  describe("a forward into the open thread", () => {
    function renderForwarding(activeId: string, allThreads: Conversation[]) {
      const calls: string[] = [];
      const returnToLatest = vi.fn(() => calls.push("returnToLatest"));
      const appendOptimistic = vi.fn(() => calls.push("appendOptimistic"));
      const deliver = vi.fn(() => calls.push("deliver"));
      const { result } = renderHook(() =>
        useMessageForwarding({
          demoMode: false,
          allThreads,
          activeId,
          returnToLatest,
          t: (key: string) => key,
          setExtraThreads: vi.fn(),
          setReadIds: vi.fn(),
          setLocallyDeletedIds: vi.fn(),
          startConversation: { mutateAsync: vi.fn() } as never,
          appendOptimistic,
          deliver,
          migrateOutboxConversation: vi.fn(),
        }),
      );
      return { result, calls, returnToLatest };
    }

    it("returns an open existing thread to its latest message before the bubble lands", async () => {
      const openThread = { ...buildRecipient("dani"), id: "conv-dani" };
      const { result, calls } = renderForwarding("conv-dani", [openThread]);

      const outcome = await result.current.forwardMessage(
        buildRecipient("dani"),
        "hey",
      );

      expect(outcome).toBe(true);
      expect(calls).toEqual(["returnToLatest", "appendOptimistic", "deliver"]);
    });

    it("returns an open group to its latest message before the bubble lands", async () => {
      const openGroup = {
        ...buildRecipient("book-club"),
        id: "conv-group",
        isGroup: true,
      };
      const { result, calls } = renderForwarding("conv-group", [openGroup]);

      await result.current.forwardMessage(openGroup, "hey");

      expect(calls).toEqual(["returnToLatest", "appendOptimistic", "deliver"]);
    });

    it("leaves the open thread alone when the forward goes to another thread", async () => {
      const openThread = { ...buildRecipient("dani"), id: "conv-dani" };
      const otherThread = { ...buildRecipient("eli"), id: "conv-eli" };
      const { result, calls, returnToLatest } = renderForwarding("conv-dani", [
        openThread,
        otherThread,
      ]);

      await result.current.forwardMessage(buildRecipient("eli"), "hey");

      expect(returnToLatest).not.toHaveBeenCalled();
      expect(calls).toEqual(["appendOptimistic", "deliver"]);
    });
  });
});

describe("useMessageForwarding into a session row the list pages lack", () => {
  const oldActivity = "2026-01-05T10:00:00.000Z";
  // Loaded list rows, newest first, all newer than the old DM's last
  // message and all older than any forward sent today.
  const loadedRows: Conversation[] = [
    {
      ...buildRecipient("gabi"),
      id: "conv-gabi",
      updatedAt: "2026-03-02T09:00:00.000Z",
    },
    {
      ...buildRecipient("hana"),
      id: "conv-hana",
      updatedAt: "2026-02-01T09:00:00.000Z",
    },
  ];

  // Holds `extraThreads` the way React state would, so every queued
  // updater runs against the result of the one before it.
  function renderWithSessionRows(
    initialExtraThreads: Conversation[],
    mutateAsync: (slug: string) => Promise<Conversation>,
  ) {
    let extraThreads = initialExtraThreads;
    const setExtraThreads = vi.fn(
      (
        update: Conversation[] | ((previous: Conversation[]) => Conversation[]),
      ) => {
        extraThreads =
          typeof update === "function" ? update(extraThreads) : update;
      },
    );
    const { result } = renderHook(() =>
      useMessageForwarding({
        demoMode: false,
        allThreads: [...initialExtraThreads, ...loadedRows],
        activeId: "",
        returnToLatest: vi.fn(),
        t: (key: string) => key,
        setExtraThreads,
        setReadIds: vi.fn(),
        setLocallyDeletedIds: vi.fn(),
        startConversation: { mutateAsync } as never,
        appendOptimistic: vi.fn(),
        deliver: vi.fn(),
        migrateOutboxConversation: vi.fn(),
      }),
    );
    return { result, readExtraThreads: () => extraThreads };
  }

  function mergedIds(extraThreads: Conversation[]): string[] {
    return mergeInboxThreads({
      extraThreads,
      baseThreads: loadedRows,
      detailThreadsById: new Map(),
      shouldPreferCachedRows: true,
      locallyDeletedIds: new Set(),
    }).map((thread) => thread.id);
  }

  it("stamps an old DM that startConversation hands back with the forward's activity, so it leads the older list rows", async () => {
    const oldDm: Conversation = {
      ...buildRecipient("ines"),
      id: "conv-ines",
      updatedAt: oldActivity,
      time: "5 Jan",
      preview: "see you then",
      lastMessageBody: "see you then",
      lastMessageSenderHandle: "ines",
    };
    const { result, readExtraThreads } = renderWithSessionRows([], () =>
      Promise.resolve(oldDm),
    );
    const forwardStartedAt = Date.now();

    const outcome = await result.current.forwardMessage(
      buildRecipient("ines"),
      "the zine launch is on friday",
    );

    expect(outcome).toBe(true);
    const stampedCopy = readExtraThreads().find(
      (thread) => thread.id === "conv-ines",
    );
    expect(Date.parse(stampedCopy?.updatedAt ?? "")).toBeGreaterThanOrEqual(
      forwardStartedAt,
    );
    expect(stampedCopy).toMatchObject({
      preview: "the zine launch is on friday",
      lastMessageBody: "the zine launch is on friday",
      lastMessageSenderHandle: undefined,
      lastMessageIsSystem: false,
      time: "messages:time.justNow",
    });
    expect(mergedIds(readExtraThreads())).toEqual([
      "conv-ines",
      "conv-gabi",
      "conv-hana",
    ]);
  });

  it("bumps an existing session-only row the forward goes to", async () => {
    const sessionRow: Conversation = {
      ...buildRecipient("jo"),
      id: "conv-jo",
      updatedAt: oldActivity,
      preview: "thanks for the map",
    };
    const untouchedRow: Conversation = {
      ...buildRecipient("kai"),
      id: "conv-kai",
      updatedAt: oldActivity,
    };
    const { result, readExtraThreads } = renderWithSessionRows(
      [sessionRow, untouchedRow],
      vi.fn(),
    );
    const forwardStartedAt = Date.now();

    await result.current.forwardMessage(buildRecipient("jo"), "hey");

    const [bumpedRow, otherRow] = readExtraThreads();
    expect(Date.parse(bumpedRow?.updatedAt ?? "")).toBeGreaterThanOrEqual(
      forwardStartedAt,
    );
    expect(bumpedRow?.preview).toBe("hey");
    expect(otherRow).toBe(untouchedRow);
    expect(mergedIds(readExtraThreads())).toEqual([
      "conv-jo",
      "conv-gabi",
      "conv-hana",
      "conv-kai",
    ]);
  });

  it("leaves the session rows alone when the forward goes to a listed row", async () => {
    const sessionRow: Conversation = {
      ...buildRecipient("jo"),
      id: "conv-jo",
      updatedAt: oldActivity,
    };
    const initialExtraThreads = [sessionRow];
    const { result, readExtraThreads } = renderWithSessionRows(
      initialExtraThreads,
      vi.fn(),
    );

    await result.current.forwardMessage(buildRecipient("gabi"), "hey");

    expect(readExtraThreads()).toBe(initialExtraThreads);
  });
});
