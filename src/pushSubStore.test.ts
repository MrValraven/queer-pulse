import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  PUSH_ENABLED_MEMBER_IDS_LIMIT,
  addPushEnabledMemberId,
  clearLastSyncedSubscription,
  clearPendingSubscription,
  readLastSyncedSubscription,
  readPendingSubscription,
  readPushEnabledMemberIds,
  removePushEnabledMemberId,
  toPushEnabledMemberIds,
  toStoredLastSyncedSubscription,
  writeLastSyncedSubscription,
  writePendingSubscription,
} from "./pushSubStore";

// jsdom does not implement IndexedDB. This is a minimal, in-memory fake
// covering only the surface pushSubStore.ts exercises — open/upgrade/
// transaction/put/get/delete — enough to round-trip values across write/read/
// clear calls that share the same backing Map, the way two IndexedDB
// connections to the same origin's DB would (mirrors pushLang.test.ts's fake).
class FakeRequest<T> {
  result: T | undefined;
  error: unknown;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onupgradeneeded: (() => void) | null = null;
}

class FakeObjectStore {
  private readonly backingStore: Map<string, unknown>;

  constructor(backingStore: Map<string, unknown>) {
    this.backingStore = backingStore;
  }

  put(value: unknown, key: string): FakeRequest<undefined> {
    const request = new FakeRequest<undefined>();
    this.backingStore.set(key, value);
    queueMicrotask(() => request.onsuccess?.());
    return request;
  }

  get(key: string): FakeRequest<unknown> {
    const request = new FakeRequest<unknown>();
    request.result = this.backingStore.get(key);
    queueMicrotask(() => request.onsuccess?.());
    return request;
  }

  delete(key: string): FakeRequest<undefined> {
    const request = new FakeRequest<undefined>();
    this.backingStore.delete(key);
    queueMicrotask(() => request.onsuccess?.());
    return request;
  }
}

class FakeTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private readonly backingStore: Map<string, unknown>;

  constructor(backingStore: Map<string, unknown>) {
    this.backingStore = backingStore;
    queueMicrotask(() => this.oncomplete?.());
  }

  objectStore(): FakeObjectStore {
    return new FakeObjectStore(this.backingStore);
  }
}

class FakeDatabase {
  objectStoreNames = { contains: () => true };
  private readonly backingStore: Map<string, unknown>;

  constructor(backingStore: Map<string, unknown>) {
    this.backingStore = backingStore;
  }

  createObjectStore(): FakeObjectStore {
    return new FakeObjectStore(this.backingStore);
  }

  transaction(): FakeTransaction {
    return new FakeTransaction(this.backingStore);
  }

  close(): void {}
}

/** Installs a fake `indexedDB` whose data persists across `open()` calls
 * within the same test (one shared backing Map), and returns a teardown fn.
 */
function installFakeIndexedDb(): () => void {
  const backingStore = new Map<string, unknown>();
  const previous = (globalThis as { indexedDB?: unknown }).indexedDB;
  (globalThis as { indexedDB?: unknown }).indexedDB = {
    open: () => {
      const request = new FakeRequest<FakeDatabase>();
      request.result = new FakeDatabase(backingStore);
      queueMicrotask(() => {
        request.onupgradeneeded?.();
        request.onsuccess?.();
      });
      return request;
    },
  };
  return () => {
    (globalThis as { indexedDB?: unknown }).indexedDB = previous;
  };
}

describe("pushSubStore", () => {
  let restoreIndexedDb: (() => void) | undefined;

  beforeEach(() => {
    restoreIndexedDb = installFakeIndexedDb();
  });

  afterEach(() => {
    restoreIndexedDb?.();
  });

  it("defaults to undefined when nothing has been written", async () => {
    await expect(readPendingSubscription()).resolves.toBeUndefined();
    await expect(readLastSyncedSubscription()).resolves.toBeUndefined();
  });

  it("round-trips a pending subscription", async () => {
    const json: PushSubscriptionJSON = {
      endpoint: "https://push.example/abc",
      keys: { p256dh: "key", auth: "auth" },
    };
    await writePendingSubscription(json);
    await expect(readPendingSubscription()).resolves.toEqual(json);
  });

  it("clears a pending subscription", async () => {
    await writePendingSubscription({ endpoint: "https://push.example/abc" });
    await clearPendingSubscription();
    await expect(readPendingSubscription()).resolves.toBeUndefined();
  });

  it("round-trips the last-synced record independently of the pending subscription", async () => {
    await writePendingSubscription({ endpoint: "https://push.example/abc" });
    await writeLastSyncedSubscription({
      endpoint: "https://push.example/xyz",
      userId: "member-a",
      syncedAt: 1_800_000_000_000,
    });
    await expect(readLastSyncedSubscription()).resolves.toEqual({
      endpoint: "https://push.example/xyz",
      userId: "member-a",
      syncedAt: 1_800_000_000_000,
    });
    await expect(readPendingSubscription()).resolves.toEqual({
      endpoint: "https://push.example/abc",
    });
  });

  it("clears the last-synced record", async () => {
    await writeLastSyncedSubscription({
      endpoint: "https://push.example/xyz",
      userId: "member-a",
      syncedAt: 1_800_000_000_000,
    });
    await clearLastSyncedSubscription();
    await expect(readLastSyncedSubscription()).resolves.toBeUndefined();
  });

  it("reads a legacy endpoint-only value as unknown member and unknown time", async () => {
    // What a device that synced before the record shape existed has on disk,
    // under the same key.
    await writeLastSyncedSubscription(
      "https://push.example/legacy" as unknown as Parameters<
        typeof writeLastSyncedSubscription
      >[0],
    );
    await expect(readLastSyncedSubscription()).resolves.toEqual({
      endpoint: "https://push.example/legacy",
      userId: null,
      syncedAt: null,
    });
  });

  it("narrows malformed stored values", () => {
    expect(toStoredLastSyncedSubscription(undefined)).toBeUndefined();
    expect(toStoredLastSyncedSubscription("")).toBeUndefined();
    expect(toStoredLastSyncedSubscription({ userId: "member-a" })).toBe(
      undefined,
    );
    expect(
      toStoredLastSyncedSubscription({
        endpoint: "https://push.example/abc",
        userId: 42,
        syncedAt: Number.NaN,
      }),
    ).toEqual({
      endpoint: "https://push.example/abc",
      userId: null,
      syncedAt: null,
    });
  });

  it("records members with push enabled, most recent last, without duplicates", async () => {
    await expect(readPushEnabledMemberIds()).resolves.toEqual([]);
    await addPushEnabledMemberId("member-a");
    await addPushEnabledMemberId("member-b");
    await addPushEnabledMemberId("member-a");
    await expect(readPushEnabledMemberIds()).resolves.toEqual([
      "member-b",
      "member-a",
    ]);
  });

  it("keeps only the most recent members with push enabled", async () => {
    for (
      let memberNumber = 0;
      memberNumber < PUSH_ENABLED_MEMBER_IDS_LIMIT + 2;
      memberNumber += 1
    ) {
      await addPushEnabledMemberId(`member-${memberNumber}`);
    }
    const memberIds = await readPushEnabledMemberIds();
    expect(memberIds).toHaveLength(PUSH_ENABLED_MEMBER_IDS_LIMIT);
    expect(memberIds[0]).toBe("member-2");
    expect(memberIds[memberIds.length - 1]).toBe(
      `member-${PUSH_ENABLED_MEMBER_IDS_LIMIT + 1}`,
    );
  });

  it("keeps the member list when the sync records are cleared, and removes one member on request", async () => {
    await addPushEnabledMemberId("member-a");
    await addPushEnabledMemberId("member-b");
    await writeLastSyncedSubscription({
      endpoint: "https://push.example/xyz",
      userId: "member-a",
      syncedAt: 1_800_000_000_000,
    });
    // What sign-out clears.
    await clearLastSyncedSubscription();
    await clearPendingSubscription();
    await expect(readPushEnabledMemberIds()).resolves.toEqual([
      "member-a",
      "member-b",
    ]);
    // What turning push off clears.
    await removePushEnabledMemberId("member-a");
    await expect(readPushEnabledMemberIds()).resolves.toEqual(["member-b"]);
  });

  it("narrows a malformed member list", () => {
    expect(toPushEnabledMemberIds(undefined)).toEqual([]);
    expect(toPushEnabledMemberIds("member-a")).toEqual([]);
    expect(toPushEnabledMemberIds(["member-a", 42, "", null])).toEqual([
      "member-a",
    ]);
  });

  it("defaults to undefined when indexedDB is unavailable, and writes no-op silently", async () => {
    restoreIndexedDb?.();
    restoreIndexedDb = undefined;
    (globalThis as { indexedDB?: unknown }).indexedDB = undefined;
    await expect(readPendingSubscription()).resolves.toBeUndefined();
    await expect(readLastSyncedSubscription()).resolves.toBeUndefined();
    await expect(clearLastSyncedSubscription()).resolves.toBeUndefined();
    await expect(
      writePendingSubscription({ endpoint: "https://push.example/abc" }),
    ).resolves.toBeUndefined();
    await expect(clearPendingSubscription()).resolves.toBeUndefined();
  });
});
