import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  clearPendingSubscription,
  readLastSyncedEndpoint,
  readPendingSubscription,
  writeLastSyncedEndpoint,
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
    await expect(readLastSyncedEndpoint()).resolves.toBeUndefined();
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

  it("round-trips the last-synced endpoint independently of the pending subscription", async () => {
    await writePendingSubscription({ endpoint: "https://push.example/abc" });
    await writeLastSyncedEndpoint("https://push.example/xyz");
    await expect(readLastSyncedEndpoint()).resolves.toBe(
      "https://push.example/xyz",
    );
    await expect(readPendingSubscription()).resolves.toEqual({
      endpoint: "https://push.example/abc",
    });
  });

  it("defaults to undefined when indexedDB is unavailable, and writes no-op silently", async () => {
    restoreIndexedDb?.();
    restoreIndexedDb = undefined;
    (globalThis as { indexedDB?: unknown }).indexedDB = undefined;
    await expect(readPendingSubscription()).resolves.toBeUndefined();
    await expect(readLastSyncedEndpoint()).resolves.toBeUndefined();
    await expect(
      writePendingSubscription({ endpoint: "https://push.example/abc" }),
    ).resolves.toBeUndefined();
    await expect(clearPendingSubscription()).resolves.toBeUndefined();
  });
});
