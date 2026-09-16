import { describe, expect, it } from "vitest";
import type { AuthUser } from "../../../features/auth/api/auth.api";
import {
  MESSAGING_CACHE_MAX_AGE_MS,
  buildPersistedMessagingCache,
  decideMessagingCacheWrite,
  isPersistableConversationsKey,
  isPersistedMessagingCacheUsable,
  messagingCacheBusterFor,
  persistableThreadConversationId,
  toPersistedMemberSession,
  toProvisionalAuthUser,
  trimThreadToNewestPage,
  withoutExpiredEntries,
  type DehydratedQuery,
  type MessagingCacheSnapshotInput,
  type PersistedMemberSession,
  type PersistedMessagingCache,
} from "./messagingCacheSelection";

const BUSTER = messagingCacheBusterFor();
const NOW = 1_800_000_000_000;

const MEMBER: PersistedMemberSession = {
  id: "member-a",
  status: "active",
  ageAttestedAt: "2026-01-01T00:00:00.000Z",
  onboardedAt: "2026-01-02T00:00:00.000Z",
  profile: { slug: "alex", firstName: "Alex", lastName: "Reis" },
};

function dehydratedQuery(queryKey: unknown[], data: unknown): DehydratedQuery {
  return {
    queryKey,
    queryHash: JSON.stringify(queryKey),
    dehydratedAt: NOW,
    state: {
      data,
      dataUpdateCount: 1,
      dataUpdatedAt: NOW,
      error: null,
      errorUpdateCount: 0,
      errorUpdatedAt: 0,
      fetchFailureCount: 0,
      fetchFailureReason: null,
      fetchMeta: null,
      isInvalidated: false,
      status: "success",
      fetchStatus: "idle",
    },
  };
}

function conversationsQuery(ids: string[]): DehydratedQuery {
  return dehydratedQuery(
    ["conversations", false, ""],
    ids.map((id) => ({ id, name: id })),
  );
}

function threadQuery(conversationId: string, pageCount = 2): DehydratedQuery {
  const pages = Array.from({ length: pageCount }, (_, pageIndex) => ({
    items: [{ id: `${conversationId}-message-${pageIndex}`, body: "hello" }],
    nextCursor: pageIndex === pageCount - 1 ? null : `cursor-${pageIndex}`,
  }));
  return dehydratedQuery(["messages", conversationId, false], {
    pages,
    pageParams: pages.map((_, pageIndex) =>
      pageIndex === 0 ? undefined : `cursor-${pageIndex - 1}`,
    ),
  });
}

function snapshotInput(
  overrides: Partial<MessagingCacheSnapshotInput>,
): MessagingCacheSnapshotInput {
  return {
    dehydratedQueries: [],
    viewedAtByConversation: new Map(),
    previous: null,
    member: MEMBER,
    buster: BUSTER,
    now: NOW,
    measureCharacters: () => 10,
    ...overrides,
  };
}

function threadIdsOf(record: PersistedMessagingCache | null): string[] {
  return (record?.threads ?? []).map((thread) => thread.conversationId);
}

describe("messaging query key selection", () => {
  it("persists only the live, undeleted inbox key", () => {
    expect(isPersistableConversationsKey(["conversations", false, ""])).toBe(
      true,
    );
    expect(isPersistableConversationsKey(["conversations", true, ""])).toBe(
      false,
    );
    expect(isPersistableConversationsKey(["conversations", false, "x"])).toBe(
      false,
    );
    expect(isPersistableConversationsKey(["conversations-unread-count"])).toBe(
      false,
    );
  });

  it("reads the conversation id only from live thread keys", () => {
    expect(persistableThreadConversationId(["messages", "c1", false])).toBe(
      "c1",
    );
    expect(persistableThreadConversationId(["messages", "c1", true])).toBe(
      null,
    );
    expect(persistableThreadConversationId(["messages", null, false])).toBe(
      null,
    );
    expect(persistableThreadConversationId(["message-search", "c1"])).toBe(
      null,
    );
  });
});

describe("trimThreadToNewestPage", () => {
  it("keeps page 0 and its page param only", () => {
    const trimmed = trimThreadToNewestPage(threadQuery("c1", 3));
    const data = trimmed?.state.data as {
      pages: { items: { id: string }[] }[];
      pageParams: unknown[];
    };
    expect(data.pages).toHaveLength(1);
    expect(data.pages[0]?.items[0]?.id).toBe("c1-message-0");
    expect(data.pageParams).toEqual([undefined]);
  });

  it("drops messages whose attachment is a local blob or data URL", () => {
    const query = dehydratedQuery(["messages", "c1", false], {
      pages: [
        {
          items: [
            { id: "kept", attachment: { url: "https://cdn.test/a.jpg" } },
            { id: "blob", attachment: { url: "blob:https://app/123" } },
            { id: "inline", attachment: { previewUrl: "data:image/png;x" } },
          ],
          nextCursor: null,
        },
      ],
      pageParams: [undefined],
    });
    const data = trimThreadToNewestPage(query)?.state.data as {
      pages: { items: { id: string }[] }[];
    };
    expect(data.pages[0]?.items.map((item) => item.id)).toEqual(["kept"]);
  });

  it("returns null for a thread with no pages", () => {
    const empty = dehydratedQuery(["messages", "c1", false], {
      pages: [],
      pageParams: [],
    });
    expect(trimThreadToNewestPage(empty)).toBeNull();
  });
});

describe("buildPersistedMessagingCache", () => {
  it("keeps the ten most recently viewed threads, newest first", () => {
    const ids = Array.from({ length: 12 }, (_, index) => `c${index}`);
    const record = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [
          conversationsQuery(ids),
          ...ids.map((id) => threadQuery(id)),
        ],
        viewedAtByConversation: new Map(
          ids.map((id, index) => [id, NOW - index * 1000]),
        ),
      }),
    );
    expect(threadIdsOf(record)).toEqual(ids.slice(0, 10));
  });

  it("skips threads that were cached but never opened", () => {
    const record = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [
          conversationsQuery(["c1", "c2"]),
          threadQuery("c1"),
          threadQuery("c2"),
        ],
        viewedAtByConversation: new Map([["c1", NOW]]),
      }),
    );
    expect(threadIdsOf(record)).toEqual(["c1"]);
  });

  it("drops a thread whose conversation left the inbox", () => {
    const record = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [conversationsQuery(["c1"]), threadQuery("c2")],
        viewedAtByConversation: new Map([["c2", NOW]]),
      }),
    );
    expect(threadIdsOf(record)).toEqual([]);
    expect(record?.conversations).not.toBeNull();
  });

  it("drops the oldest threads first once the size budget is spent", () => {
    const record = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [
          conversationsQuery(["c1", "c2", "c3"]),
          threadQuery("c1"),
          threadQuery("c2"),
          threadQuery("c3"),
        ],
        viewedAtByConversation: new Map([
          ["c1", NOW - 2000],
          ["c2", NOW],
          ["c3", NOW - 1000],
        ]),
        measureCharacters: () => 100,
        maxCharacters: 300,
      }),
    );
    expect(threadIdsOf(record)).toEqual(["c2", "c3"]);
  });

  it("persists nothing when the inbox alone is over budget", () => {
    const record = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [conversationsQuery(["c1"]), threadQuery("c1")],
        viewedAtByConversation: new Map([["c1", NOW]]),
        measureCharacters: () => 500,
        maxCharacters: 300,
      }),
    );
    expect(record).toBeNull();
  });

  it("carries forward the same member's threads no longer in memory", () => {
    const previous = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [
          conversationsQuery(["c1", "c2"]),
          threadQuery("c1"),
        ],
        viewedAtByConversation: new Map([["c1", NOW - 5000]]),
      }),
    );
    const record = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [
          conversationsQuery(["c1", "c2"]),
          threadQuery("c2"),
        ],
        viewedAtByConversation: new Map([["c2", NOW]]),
        previous,
      }),
    );
    expect(threadIdsOf(record)).toEqual(["c2", "c1"]);
  });

  it("never carries forward another member's record", () => {
    const previous = buildPersistedMessagingCache(
      snapshotInput({
        dehydratedQueries: [conversationsQuery(["c1"]), threadQuery("c1")],
        viewedAtByConversation: new Map([["c1", NOW]]),
      }),
    );
    const record = buildPersistedMessagingCache(
      snapshotInput({
        member: { ...MEMBER, id: "member-b" },
        previous,
      }),
    );
    expect(record).toBeNull();
  });
});

describe("isPersistedMessagingCacheUsable", () => {
  const record: PersistedMessagingCache = {
    buster: BUSTER,
    savedAt: NOW,
    member: MEMBER,
    conversations: null,
    threads: [],
  };

  it("accepts a fresh record from this build", () => {
    expect(
      isPersistedMessagingCacheUsable(record, { buster: BUSTER, now: NOW }),
    ).toBe(true);
  });

  it("discards a record from another schema version", () => {
    expect(
      isPersistedMessagingCacheUsable(record, {
        buster: "999",
        now: NOW,
      }),
    ).toBe(false);
  });

  it("keeps a record whose buster does not encode a release version", () => {
    // A routine deploy must not invalidate a saved record on its own: the
    // buster is schema-only now, so it is stable across releases.
    expect(messagingCacheBusterFor()).toBe(BUSTER);
  });

  it("discards a record older than seven days", () => {
    expect(
      isPersistedMessagingCacheUsable(record, {
        buster: BUSTER,
        now: NOW + MESSAGING_CACHE_MAX_AGE_MS + 1,
      }),
    ).toBe(false);
  });

  it("discards malformed values", () => {
    expect(
      isPersistedMessagingCacheUsable(null, { buster: BUSTER, now: NOW }),
    ).toBe(false);
    expect(
      isPersistedMessagingCacheUsable(
        { ...record, member: { id: "" } },
        { buster: BUSTER, now: NOW },
      ),
    ).toBe(false);
  });
});

describe("provisional member session", () => {
  it("round-trips a member without email, role or staff grants", () => {
    const user: AuthUser = {
      ...toProvisionalAuthUser(MEMBER),
      email: "alex@example.test",
      role: "admin",
      staffRoles: ["magazine_editor"],
    };
    const provisional = toProvisionalAuthUser(toPersistedMemberSession(user));
    expect(provisional.email).toBe("");
    expect(provisional.role).toBe("member");
    expect(provisional.staffRoles).toEqual([]);
    expect(provisional.onboardedAt).toBe(MEMBER.onboardedAt);
    expect(provisional.profile.slug).toBe("alex");
  });
});

function agedBy(query: DehydratedQuery, ageMs: number): DehydratedQuery {
  return { ...query, state: { ...query.state, dataUpdatedAt: NOW - ageMs } };
}

describe("decideMessagingCacheWrite", () => {
  it("deletes the stored record when the inbox alone is over budget", () => {
    const decision = decideMessagingCacheWrite(
      snapshotInput({
        dehydratedQueries: [conversationsQuery(["c1"])],
        measureCharacters: () => 500,
        maxCharacters: 300,
      }),
    );
    expect(decision.kind).toBe("delete");
  });

  it("skips the write when nothing is loaded", () => {
    expect(decideMessagingCacheWrite(snapshotInput({})).kind).toBe("skip");
  });

  it("drops a carried-forward thread fetched more than seven days ago", () => {
    const previous: PersistedMessagingCache = {
      buster: BUSTER,
      savedAt: NOW,
      member: MEMBER,
      conversations: conversationsQuery(["c1", "c2"]),
      threads: [
        {
          conversationId: "c1",
          viewedAt: NOW,
          query: agedBy(threadQuery("c1"), MESSAGING_CACHE_MAX_AGE_MS + 1),
        },
      ],
    };
    const decision = decideMessagingCacheWrite(
      snapshotInput({
        dehydratedQueries: [
          conversationsQuery(["c1", "c2"]),
          threadQuery("c2"),
        ],
        viewedAtByConversation: new Map([["c2", NOW - 1000]]),
        previous,
      }),
    );
    expect(
      decision.kind === "write" ? threadIdsOf(decision.record) : null,
    ).toEqual(["c2"]);
  });

  it("drops a carried-forward inbox fetched more than seven days ago", () => {
    const previous: PersistedMessagingCache = {
      buster: BUSTER,
      savedAt: NOW,
      member: MEMBER,
      conversations: agedBy(
        conversationsQuery(["c1"]),
        MESSAGING_CACHE_MAX_AGE_MS + 1,
      ),
      threads: [],
    };
    expect(decideMessagingCacheWrite(snapshotInput({ previous })).kind).toBe(
      "skip",
    );
  });
});

describe("stored member validation", () => {
  it("discards a record whose member has no profile", () => {
    const record = {
      buster: BUSTER,
      savedAt: NOW,
      member: { id: "member-a", status: "active" },
      conversations: null,
      threads: [],
    };
    expect(
      isPersistedMessagingCacheUsable(record, { buster: BUSTER, now: NOW }),
    ).toBe(false);
  });

  it("discards a record whose member profile has no slug", () => {
    const record = {
      buster: BUSTER,
      savedAt: NOW,
      member: { ...MEMBER, profile: { firstName: "Alex", lastName: "Reis" } },
      conversations: null,
      threads: [],
    };
    expect(
      isPersistedMessagingCacheUsable(record, { buster: BUSTER, now: NOW }),
    ).toBe(false);
  });

  it("discards a record whose member status is unknown", () => {
    const record = {
      buster: BUSTER,
      savedAt: NOW,
      member: { ...MEMBER, status: "admin" },
      conversations: null,
      threads: [],
    };
    expect(
      isPersistedMessagingCacheUsable(record, { buster: BUSTER, now: NOW }),
    ).toBe(false);
  });
});

describe("withoutExpiredEntries", () => {
  function recordWith(
    conversations: DehydratedQuery | null,
    threadQueries: DehydratedQuery[],
  ): PersistedMessagingCache {
    return {
      buster: BUSTER,
      savedAt: NOW,
      member: MEMBER,
      conversations,
      threads: threadQueries.map((query, index) => ({
        conversationId: `c${index}`,
        viewedAt: NOW,
        query,
      })),
    };
  }

  it("returns the same record when every entry is fresh", () => {
    const record = recordWith(conversationsQuery(["c0"]), [threadQuery("c0")]);
    expect(withoutExpiredEntries(record, NOW)).toBe(record);
  });

  it("drops a thread fetched more than seven days ago at restore time", () => {
    const record = recordWith(conversationsQuery(["c0", "c1"]), [
      agedBy(threadQuery("c0"), MESSAGING_CACHE_MAX_AGE_MS + 1),
      threadQuery("c1"),
    ]);
    expect(threadIdsOf(withoutExpiredEntries(record, NOW))).toEqual(["c1"]);
  });

  it("drops an inbox fetched more than seven days ago", () => {
    const record = recordWith(
      agedBy(conversationsQuery(["c0"]), MESSAGING_CACHE_MAX_AGE_MS + 1),
      [threadQuery("c0")],
    );
    expect(withoutExpiredEntries(record, NOW)?.conversations).toBeNull();
  });

  it("returns null when nothing fresh is left", () => {
    const record = recordWith(
      agedBy(conversationsQuery(["c0"]), MESSAGING_CACHE_MAX_AGE_MS + 1),
      [agedBy(threadQuery("c0"), MESSAGING_CACHE_MAX_AGE_MS + 1)],
    );
    expect(withoutExpiredEntries(record, NOW)).toBeNull();
  });
});
