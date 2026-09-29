import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { MessageResponse } from "../contracts/contracts";
import type { Conversation } from "../../features/messages/data";
import { patchConversationInList } from "../../features/messages/api/useMessageMutations";
import {
  bumpConversationUnread,
  invalidateConversationDetail,
  patchConversationFavorite,
  patchConversationMarkedUnread,
  patchConversationMuted,
  patchConversationPinned,
  patchConversationPreview,
  patchConversationRead,
  patchConversationReadCoverage,
  patchConversationRow,
  patchConversationTitle,
} from "./messageCache";

// ENG-403 follow-up: a thread opened past the loaded inbox pages renders
// from its `["conversation-detail", id, demoMode]` entry, so every
// conversation-level patch writes that entry beside the list, and only
// when it is already cached.

const LIST_KEY = ["conversations", false, "", "personal"] as const;

function detailKey(conversationId: string) {
  return ["conversation-detail", conversationId, false] as const;
}

function conversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: "c1",
    initials: "JP",
    tint: "plum",
    name: "Jordan Park",
    pronouns: "",
    connectedSince: "",
    time: "9:00 AM",
    updatedAt: "2026-09-14T09:00:00Z",
    preview: "hey",
    unread: false,
    messages: [],
    ...overrides,
  };
}

function message(overrides: Partial<MessageResponse> = {}): MessageResponse {
  return {
    id: "m1",
    conversationId: "c-past",
    body: "new message",
    sender: { handle: "jordan", displayName: "Jordan Park", avatarUrl: null },
    createdAt: "2026-09-14T10:00:00Z",
    editedAt: null,
    reactions: [],
    deletedAt: null,
    deliveredAt: null,
    clientMessageId: null,
    forwarded: false,
    pinnedAt: null,
    starred: false,
    canPin: false,
    canEdit: false,
    canDelete: false,
    canReport: false,
    replyTo: null,
    kind: "user",
    attachment: null,
    systemEvent: null,
    ...overrides,
  };
}

function readDetail(queryClient: QueryClient, conversationId: string) {
  return queryClient.getQueryData<Conversation>(detailKey(conversationId));
}

/** A list of loaded rows plus one thread cached only as a detail entry. */
function seedPastPagesThread(): QueryClient {
  const queryClient = new QueryClient();
  queryClient.setQueryData(LIST_KEY, [conversation({ id: "c-loaded" })]);
  queryClient.setQueryData(
    detailKey("c-past"),
    conversation({ id: "c-past", unreadCount: 2, unread: true }),
  );
  return queryClient;
}

describe("conversation-level patches write the detail entry", () => {
  it("patches pin, favorite and mute onto a thread held only as a detail", () => {
    const queryClient = seedPastPagesThread();
    patchConversationPinned(queryClient, "c-past", "2026-09-14T11:00:00Z");
    patchConversationFavorite(queryClient, "c-past", true);
    patchConversationMuted(queryClient, "c-past", true);
    const detail = readDetail(queryClient, "c-past");
    expect(detail?.pinnedAt).toBe("2026-09-14T11:00:00Z");
    expect(detail?.favorite).toBe(true);
    expect(detail?.muted).toBe(true);
  });

  it("keeps a list without the thread at the same array identity", () => {
    const queryClient = seedPastPagesThread();
    const listBefore = queryClient.getQueryData(LIST_KEY);
    patchConversationMuted(queryClient, "c-past", true);
    expect(queryClient.getQueryData(LIST_KEY)).toBe(listBefore);
  });

  it("patches the list row and the detail entry of the same thread alike", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(LIST_KEY, [conversation({ id: "c1" })]);
    queryClient.setQueryData(detailKey("c1"), conversation({ id: "c1" }));
    patchConversationRow(queryClient, "c1", (row) => ({
      ...row,
      archivedAt: "2026-09-14T12:00:00Z",
    }));
    const list = queryClient.getQueryData<Conversation[]>(LIST_KEY);
    expect(list?.[0]?.archivedAt).toBe("2026-09-14T12:00:00Z");
    expect(readDetail(queryClient, "c1")?.archivedAt).toBe(
      "2026-09-14T12:00:00Z",
    );
  });

  it("creates no detail entry for a thread that was never read by id", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(LIST_KEY, [conversation({ id: "c1" })]);
    patchConversationPinned(queryClient, "c1", "2026-09-14T11:00:00Z");
    bumpConversationUnread(queryClient, "c1");
    expect(readDetail(queryClient, "c1")).toBeUndefined();
    expect(
      queryClient.getQueryCache().find({ queryKey: detailKey("c1") }),
    ).toBeUndefined();
  });

  it("raises and marks unread on the detail entry", () => {
    const queryClient = seedPastPagesThread();
    bumpConversationUnread(queryClient, "c-past");
    expect(readDetail(queryClient, "c-past")?.unreadCount).toBe(3);
    patchConversationMarkedUnread(
      queryClient,
      "c-past",
      "2026-09-14T13:00:00Z",
    );
    const detail = readDetail(queryClient, "c-past");
    expect(detail?.markedUnreadAt).toBe("2026-09-14T13:00:00Z");
    expect(detail?.unread).toBe(true);
  });

  it("writes a new message's preview into the detail without touching the list order", () => {
    const queryClient = seedPastPagesThread();
    patchConversationPreview(
      queryClient,
      "c-past",
      message({ body: "from past pages", createdAt: "2026-09-14T10:30:00Z" }),
    );
    const detail = readDetail(queryClient, "c-past");
    expect(detail?.preview).toContain("from past pages");
    expect(detail?.updatedAt).toBe("2026-09-14T10:30:00Z");
    const list = queryClient.getQueryData<Conversation[]>(LIST_KEY);
    expect(list?.map((row) => row.id)).toEqual(["c-loaded"]);
  });
});

describe("patchConversationRead on the detail entry", () => {
  it("clears unread on a covered detail and reports full coverage", () => {
    const queryClient = seedPastPagesThread();
    const isFullyCovered = patchConversationRead(
      queryClient,
      "c-past",
      "2026-09-14T09:00:00Z",
    );
    expect(isFullyCovered).toBe(true);
    const detail = readDetail(queryClient, "c-past");
    expect(detail?.unread).toBe(false);
    expect(detail?.unreadCount).toBe(0);
    expect(detail?.myLastReadAt).toBe("2026-09-14T09:00:00Z");
  });

  it("keeps a detail newer than the watermark unread and reports it", () => {
    const queryClient = seedPastPagesThread();
    const isFullyCovered = patchConversationRead(
      queryClient,
      "c-past",
      "2026-09-14T08:00:00Z",
    );
    expect(isFullyCovered).toBe(false);
    const detail = readDetail(queryClient, "c-past");
    expect(detail?.unread).toBe(true);
    expect(detail?.unreadCount).toBe(2);
    expect(detail?.myLastReadAt).toBe("2026-09-14T08:00:00Z");
  });
});

describe("patchConversationInList on the detail entry", () => {
  it("overlays a group mutation's fresh view and keeps the detail roster when the view carries none", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(LIST_KEY, []);
    const roster = [
      { handle: "ana", name: "Ana", role: "owner" },
    ] as unknown as Conversation["members"];
    queryClient.setQueryData(
      detailKey("g1"),
      conversation({ id: "g1", isGroup: true, name: "Old", members: roster }),
    );
    patchConversationInList(
      queryClient,
      conversation({
        id: "g1",
        isGroup: true,
        name: "Renamed",
        members: [],
        hasLeft: true,
        leftReason: "dissolved",
      }),
    );
    const detail = readDetail(queryClient, "g1");
    expect(detail?.name).toBe("Renamed");
    expect(detail?.hasLeft).toBe(true);
    expect(detail?.leftReason).toBe("dissolved");
    expect(detail?.members).toBe(roster);
  });

  it("creates no detail entry for a group that was never read by id", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(LIST_KEY, [conversation({ id: "g1" })]);
    patchConversationInList(
      queryClient,
      conversation({ id: "g1", name: "Renamed" }),
    );
    expect(readDetail(queryClient, "g1")).toBeUndefined();
  });
});

describe("invalidateConversationDetail", () => {
  it("marks only that thread's detail entry stale", async () => {
    const queryClient = seedPastPagesThread();
    queryClient.setQueryData(
      detailKey("c-other"),
      conversation({ id: "c-other" }),
    );
    await invalidateConversationDetail(queryClient, "c-past", true);
    const cache = queryClient.getQueryCache();
    expect(
      cache.find({ queryKey: detailKey("c-past") })?.state.isInvalidated,
    ).toBe(true);
    expect(
      cache.find({ queryKey: detailKey("c-other") })?.state.isInvalidated,
    ).toBe(false);
    expect(cache.find({ queryKey: LIST_KEY })?.state.isInvalidated).toBe(false);
  });
});

describe("patchConversationReadCoverage", () => {
  it("reports a short detail alone so the inbox is left untouched", () => {
    const queryClient = seedPastPagesThread();
    const coverage = patchConversationReadCoverage(
      queryClient,
      "c-past",
      "2026-09-14T08:00:00Z",
    );
    expect(coverage).toEqual({ isListCovered: true, isDetailCovered: false });
  });
});

describe("patchConversationDetail keeps a stale mark", () => {
  it("re-marks an invalidated detail after the patch writes it", async () => {
    const queryClient = seedPastPagesThread();
    await invalidateConversationDetail(queryClient, "c-past", true);
    patchConversationMuted(queryClient, "c-past", true);
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: detailKey("c-past") });
    expect(readDetail(queryClient, "c-past")?.muted).toBe(true);
    expect(query?.state.isInvalidated).toBe(true);
  });

  it("leaves a fresh detail fresh", () => {
    const queryClient = seedPastPagesThread();
    patchConversationMuted(queryClient, "c-past", true);
    const query = queryClient
      .getQueryCache()
      .find({ queryKey: detailKey("c-past") });
    expect(query?.state.isInvalidated).toBe(false);
  });
});

describe("patchConversationTitle", () => {
  it("renames the row and the detail and re-derives the initials", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(LIST_KEY, [conversation({ id: "g1" })]);
    queryClient.setQueryData(detailKey("g1"), conversation({ id: "g1" }));
    patchConversationTitle(queryClient, "g1", "Book club");
    const row = queryClient.getQueryData<Conversation[]>(LIST_KEY)?.[0];
    expect(row?.name).toBe("Book club");
    expect(row?.initials).toBe("BC");
    expect(readDetail(queryClient, "g1")?.name).toBe("Book club");
  });
});
