import { QueryClient, type InfiniteData } from "@tanstack/react-query";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  patchMessageEdit,
  patchMessageReaction,
  removeMessageFromThread,
} from "../../../shared/api/messageCache";
import { conversations, type ChatMessage } from "../data";
import { DEMO_LONG_THREAD_CONVERSATION_ID } from "../demoLongThread.data";
import {
  DEMO_OLDER_PAGE_DELAY_MS,
  DEMO_THREAD_PAGE_SIZE,
  DEMO_VIEWER_HANDLE,
  fetchDemoThreadPage,
  demoThreadPage,
  demoThreadStoreKey,
  ensureDemoThreadStore,
  findDemoConversationIdForMessage,
  readDemoThread,
  withDemoLocalOnlyMessages,
  withDemoPresentation,
} from "./demoThreadCache";
import { groupMessages } from "./messages.adapters";
import type { MessagePage } from "./threadCacheTrim";

type ThreadData = InfiniteData<MessagePage>;

function renderedThreadKey(conversationId: string) {
  return ["messages", conversationId, true] as const;
}

/** Puts the newest demo page where `useMessageThread` keeps it in demo. */
function seedRenderedThread(queryClient: QueryClient, conversationId: string) {
  const newestPage = demoThreadPage(
    readDemoThread(queryClient, conversationId),
    undefined,
  );
  queryClient.setQueryData<ThreadData>(renderedThreadKey(conversationId), {
    pages: [newestPage],
    pageParams: [undefined],
  });
}

function seededConversation(conversationId: string) {
  return conversations.find(
    (conversation) => conversation.id === conversationId,
  )!;
}

describe("demoThreadPage", () => {
  it("pages the long thread newest 30 first, then the remaining 18", () => {
    const newestFirst = readDemoThread(
      new QueryClient(),
      DEMO_LONG_THREAD_CONVERSATION_ID,
    );
    expect(newestFirst).toHaveLength(48);

    const newestPage = demoThreadPage(newestFirst, undefined);
    expect(newestPage.items).toHaveLength(DEMO_THREAD_PAGE_SIZE);
    expect(newestPage.items[0]!.id).toBe("demo-msg-maria-048");
    expect(newestPage.nextCursor).not.toBeNull();

    const olderPage = demoThreadPage(newestFirst, newestPage.nextCursor!);
    expect(olderPage.items).toHaveLength(18);
    expect(olderPage.items[0]!.id).toBe("demo-msg-maria-018");
    expect(olderPage.items.at(-1)!.id).toBe("demo-msg-maria-001");
    expect(olderPage.nextCursor).toBeNull();
  });

  it("stays contiguous when a refetch recomputes the cursor after a removal", () => {
    const newestFirst = readDemoThread(
      new QueryClient(),
      DEMO_LONG_THREAD_CONVERSATION_ID,
    ).filter((message) => message.id !== "demo-msg-maria-040");

    const newestPage = demoThreadPage(newestFirst, undefined);
    const olderPage = demoThreadPage(newestFirst, newestPage.nextCursor!);
    const pagedIds = [...newestPage.items, ...olderPage.items].map(
      (message) => message.id,
    );
    expect(new Set(pagedIds).size).toBe(47);
    expect(pagedIds).not.toContain("demo-msg-maria-040");
  });

  it("returns one final page for a short thread", () => {
    const page = demoThreadPage(
      readDemoThread(new QueryClient(), "kai"),
      undefined,
    );
    expect(page.items.map((message) => message.id)).toEqual([
      "demo-msg-kai-002",
      "demo-msg-kai-001",
    ]);
    expect(page.nextCursor).toBeNull();
  });
});

describe("demo session store", () => {
  it("reads the seed without creating a store", () => {
    const queryClient = new QueryClient();
    expect(readDemoThread(queryClient, "kai")).toHaveLength(2);
    expect(queryClient.getQueryData(demoThreadStoreKey("kai"))).toBeUndefined();
  });

  it("is never garbage collected", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "kai");
    const storeQuery = queryClient
      .getQueryCache()
      .find({ queryKey: demoThreadStoreKey("kai"), exact: true });
    expect(storeQuery?.options.gcTime).toBe(Infinity);
  });

  it("lets one shared helper patch the rendered page and the store together", () => {
    const queryClient = new QueryClient();
    seedRenderedThread(queryClient, "anika");
    ensureDemoThreadStore(queryClient, "anika");

    patchMessageReaction(
      queryClient,
      "anika",
      "demo-msg-anika-005",
      "laugh",
      true,
    );

    const rendered = queryClient
      .getQueryData<ThreadData>(renderedThreadKey("anika"))!
      .pages[0]!.items.find((message) => message.id === "demo-msg-anika-005")!;
    const stored = readDemoThread(queryClient, "anika").find(
      (message) => message.id === "demo-msg-anika-005",
    )!;
    for (const message of [rendered, stored]) {
      expect(
        message.reactions.find((reaction) => reaction.key === "laugh"),
      ).toEqual({ key: "laugh", count: 1, mine: true });
    }
  });

  it("pages an edit back in after the rendered pages are refetched", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "anika");
    const editedAt = new Date().toISOString();
    patchMessageEdit(
      queryClient,
      "anika",
      "demo-msg-anika-004",
      "Edited in demo",
      editedAt,
    );

    const refetched = demoThreadPage(
      readDemoThread(queryClient, "anika"),
      undefined,
    ).items.find((message) => message.id === "demo-msg-anika-004")!;
    expect(refetched.body).toBe("Edited in demo");
    expect(refetched.editedAt).toBe(editedAt);
  });

  it("drops a message hidden for the viewer from the store", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "kai");
    removeMessageFromThread(queryClient, "kai", "demo-msg-kai-001");
    expect(
      readDemoThread(queryClient, "kai").map((message) => message.id),
    ).toEqual(["demo-msg-kai-002"]);
  });

  it("sends all six reaction keys, keeping the seeded counts", () => {
    const newest = readDemoThread(new QueryClient(), "anika")[0]!;
    expect(newest.id).toBe("demo-msg-anika-006");
    expect(newest.reactions).toHaveLength(6);
    expect(
      newest.reactions.find((reaction) => reaction.key === "love"),
    ).toEqual({ key: "love", count: 1, mine: true });
  });

  it("attributes the viewer's own lines and system events to the demo viewer", () => {
    const brunch = readDemoThread(new QueryClient(), "brunch-crew");
    const created = brunch.find(
      (message) => message.id === "demo-msg-brunch-001",
    )!;
    expect(created.sender.handle).toBe(DEMO_VIEWER_HANDLE);
    const anika = readDemoThread(new QueryClient(), "anika");
    const ownLine = anika.find(
      (message) => message.id === "demo-msg-anika-002",
    )!;
    expect(ownLine.sender.handle).toBe(DEMO_VIEWER_HANDLE);
  });
});

describe("fetchDemoThreadPage", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("clears the older-page timer and rejects with an AbortError on abort", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const pending = fetchDemoThreadPage(
      new QueryClient(),
      DEMO_LONG_THREAD_CONVERSATION_ID,
      "2026-09-15T12:00:00.000Z|demo-msg-maria-019",
      controller.signal,
    );
    expect(vi.getTimerCount()).toBe(1);

    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("rejects at once when the signal is already aborted", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    controller.abort();
    await expect(
      fetchDemoThreadPage(
        new QueryClient(),
        DEMO_LONG_THREAD_CONVERSATION_ID,
        "2026-09-15T12:00:00.000Z|demo-msg-maria-019",
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(vi.getTimerCount()).toBe(0);
  });

  it("resolves the older page once the delay passes", async () => {
    vi.useFakeTimers();
    const queryClient = new QueryClient();
    const newestPage = demoThreadPage(
      readDemoThread(queryClient, DEMO_LONG_THREAD_CONVERSATION_ID),
      undefined,
    );
    const pending = fetchDemoThreadPage(
      queryClient,
      DEMO_LONG_THREAD_CONVERSATION_ID,
      newestPage.nextCursor!,
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(DEMO_OLDER_PAGE_DELAY_MS);
    const olderPage = await pending;
    expect(olderPage.items).toHaveLength(18);
    expect(olderPage.nextCursor).toBeNull();
  });
});

describe("findDemoConversationIdForMessage", () => {
  it("resolves a seeded message to its thread", () => {
    expect(findDemoConversationIdForMessage("demo-msg-brunch-015")).toBe(
      "brunch-crew",
    );
    expect(findDemoConversationIdForMessage("demo-msg-maria-001")).toBe(
      DEMO_LONG_THREAD_CONVERSATION_ID,
    );
  });

  it("returns null for an unknown id", () => {
    expect(findDemoConversationIdForMessage("demo-msg-unknown-001")).toBeNull();
  });
});

describe("withDemoPresentation", () => {
  function presentedBrunch(queryClient: QueryClient) {
    const oldestFirst = [
      ...readDemoThread(queryClient, "brunch-crew"),
    ].reverse();
    return withDemoPresentation(
      "brunch-crew",
      groupMessages(oldestFirst, DEMO_VIEWER_HANDLE),
    );
  }

  it("keeps each seeded sender's tint", () => {
    const seedItems = seededConversation("brunch-crew").messages.flatMap(
      (group) => group.items,
    );
    const bubbles = presentedBrunch(new QueryClient()).flatMap(
      (group) => group.items,
    );
    expect(bubbles).toHaveLength(seedItems.length);
    for (const bubble of bubbles) {
      const seed = seedItems.find((item) => item.id === bubble.id)!;
      expect(bubble.senderTint).toBe(seed.senderTint);
    }
  });

  it("returns the same bubble object while its message is untouched", () => {
    const queryClient = new QueryClient();
    ensureDemoThreadStore(queryClient, "brunch-crew");
    const first = presentedBrunch(queryClient).flatMap((group) => group.items);
    const second = presentedBrunch(queryClient).flatMap((group) => group.items);
    first.forEach((bubble, index) => expect(second[index]).toBe(bubble));
  });
});

describe("withDemoLocalOnlyMessages", () => {
  const pill: ChatMessage = {
    from: "me",
    text: "",
    kind: "system",
    systemEvent: { type: "member_added", actorName: "You", actorIsMe: true },
  };

  it("files an idless pill ahead of the thread's session sends", () => {
    const brunch = seededConversation("brunch-crew");
    const active = {
      ...brunch,
      messages: [...brunch.messages, { day: "Today", items: [pill] }],
    };
    const sessionSend: ChatMessage = {
      from: "me",
      text: "hi",
      localId: "local-1",
    };
    const merged = withDemoLocalOnlyMessages(
      { "brunch-crew": [sessionSend] },
      active,
    );
    expect(merged["brunch-crew"]).toEqual([pill, sessionSend]);
  });

  it("returns the same map when the row holds only seeded messages", () => {
    const sent = { anika: [] };
    expect(withDemoLocalOnlyMessages(sent, seededConversation("anika"))).toBe(
      sent,
    );
  });
});
