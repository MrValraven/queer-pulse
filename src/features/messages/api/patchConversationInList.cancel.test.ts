import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { Conversation } from "../data";
import { patchConversationInList } from "./useMessageMutations";

// V4 hardening: a detail read already in flight when a group mutation lands
// may carry the state from before the commit. It is cancelled ahead of the
// patch, so its answer cannot bring the old title or roster back.

const GROUP_ID = "11111111-1111-1111-1111-111111111111";

function detailKey(conversationId: string) {
  return ["conversation-detail", conversationId, false] as const;
}

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: GROUP_ID,
    initials: "PB",
    tint: "plum",
    name: "Pride Brunch",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    updatedAt: "2026-09-14T09:00:00Z",
    preview: "hey",
    unread: false,
    messages: [],
    isGroup: true,
    ...overrides,
  };
}

function readDetail(queryClient: QueryClient) {
  return queryClient.getQueryData<Conversation>(detailKey(GROUP_ID));
}

describe("patchConversationInList with a detail read in flight", () => {
  it("keeps the mutation's fresh view when the older read answers late", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(detailKey(GROUP_ID), conversation());
    let answerStaleRead: (value: Conversation) => void = () => {};
    const staleRead = queryClient.fetchQuery({
      queryKey: detailKey(GROUP_ID),
      queryFn: () =>
        new Promise<Conversation>((resolve) => {
          answerStaleRead = resolve;
        }),
      staleTime: 0,
    });

    patchConversationInList(
      queryClient,
      conversation({ name: "Sunday Brunch", members: [] }),
    );
    answerStaleRead(conversation({ name: "Pride Brunch" }));
    await staleRead.catch(() => undefined);

    expect(readDetail(queryClient)?.name).toBe("Sunday Brunch");
    expect(queryClient.getQueryState(detailKey(GROUP_ID))?.fetchStatus).toBe(
      "idle",
    );
  });

  it("keeps a socket patch written while the read was in flight", async () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(detailKey(GROUP_ID), conversation());
    let answerStaleRead: (value: Conversation) => void = () => {};
    const staleRead = queryClient.fetchQuery({
      queryKey: detailKey(GROUP_ID),
      queryFn: () =>
        new Promise<Conversation>((resolve) => {
          answerStaleRead = resolve;
        }),
      staleTime: 0,
    });
    // A pin frame lands mid-read. TanStack refreshes the state it reverts
    // to on every manual write, so the cancel below keeps this pin.
    queryClient.setQueryData<Conversation>(detailKey(GROUP_ID), (previous) =>
      previous ? { ...previous, pinnedAt: "2026-09-14T12:00:00Z" } : previous,
    );

    patchConversationInList(
      queryClient,
      conversation({ name: "Sunday Brunch", members: [] }),
    );
    answerStaleRead(conversation({ name: "Pride Brunch" }));
    await staleRead.catch(() => undefined);

    const detail = readDetail(queryClient);
    expect(detail?.name).toBe("Sunday Brunch");
    expect(detail?.pinnedAt).toBe("2026-09-14T12:00:00Z");
  });

  it("lets a first read with nothing cached run to its answer", async () => {
    const queryClient = new QueryClient();
    let answerFirstRead: (value: Conversation) => void = () => {};
    const firstRead = queryClient.fetchQuery({
      queryKey: detailKey(GROUP_ID),
      queryFn: () =>
        new Promise<Conversation>((resolve) => {
          answerFirstRead = resolve;
        }),
    });

    patchConversationInList(
      queryClient,
      conversation({ name: "Sunday Brunch" }),
    );
    answerFirstRead(conversation({ name: "Sunday Brunch" }));
    await firstRead;

    expect(readDetail(queryClient)?.name).toBe("Sunday Brunch");
  });

  it("leaves an idle detail entry to the plain patch", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(detailKey(GROUP_ID), conversation());
    patchConversationInList(
      queryClient,
      conversation({ name: "Sunday Brunch" }),
    );
    expect(readDetail(queryClient)?.name).toBe("Sunday Brunch");
    expect(queryClient.getQueryState(detailKey(GROUP_ID))?.fetchStatus).toBe(
      "idle",
    );
  });
});
