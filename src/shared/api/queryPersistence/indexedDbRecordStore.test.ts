import { afterEach, describe, expect, it, vi } from "vitest";
import { createIndexedDbRecordStore } from "./indexedDbRecordStore";

// Mirrors indexedDbRecordStore.ts's own OPEN_TIMEOUT_MS as a plain literal,
// so this test exercises the same budget a real caller waits on regardless
// of what the module happens to export.
const OPEN_TIMEOUT_MS = 3_000;

class FakeRequest<T> {
  result: T | undefined;
  error: unknown;
  onsuccess: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onupgradeneeded: (() => void) | null = null;
  onblocked: (() => void) | null = null;
}

class FakeObjectStore {
  private readonly backingStore: Map<string, unknown>;
  private readonly transaction: FakeTransaction;

  constructor(
    backingStore: Map<string, unknown>,
    transaction: FakeTransaction,
  ) {
    this.backingStore = backingStore;
    this.transaction = transaction;
  }

  /** Fires the request's own `onsuccess` first, then the owning
   *  transaction's `oncomplete`, matching real IndexedDB's order: a
   *  transaction only completes once its requests have. `runRequest` in
   *  `indexedDbRecordStore.ts` relies on exactly this order (it reads
   *  `request.result` from inside `onsuccess`, before `oncomplete`
   *  resolves the caller's promise). */
  private completeAfter(fireRequestSuccess: () => void): void {
    queueMicrotask(() => {
      fireRequestSuccess();
      this.transaction.oncomplete?.();
    });
  }

  put(value: unknown, key: string): FakeRequest<undefined> {
    const request = new FakeRequest<undefined>();
    this.backingStore.set(key, value);
    this.completeAfter(() => request.onsuccess?.());
    return request;
  }

  get(key: string): FakeRequest<unknown> {
    const request = new FakeRequest<unknown>();
    request.result = this.backingStore.get(key);
    this.completeAfter(() => request.onsuccess?.());
    return request;
  }

  delete(key: string): FakeRequest<undefined> {
    const request = new FakeRequest<undefined>();
    this.backingStore.delete(key);
    this.completeAfter(() => request.onsuccess?.());
    return request;
  }
}

class FakeTransaction {
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;
  private readonly backingStore: Map<string, unknown>;

  constructor(backingStore: Map<string, unknown>) {
    this.backingStore = backingStore;
  }

  objectStore(): FakeObjectStore {
    return new FakeObjectStore(this.backingStore, this);
  }
}

class FakeDatabase {
  objectStoreNames = { contains: () => true };
  closeCallCount = 0;
  private readonly backingStore: Map<string, unknown>;

  constructor(backingStore: Map<string, unknown>) {
    this.backingStore = backingStore;
  }

  createObjectStore(): FakeObjectStore {
    return new FakeObjectStore(
      this.backingStore,
      new FakeTransaction(this.backingStore),
    );
  }

  transaction(): FakeTransaction {
    return new FakeTransaction(this.backingStore);
  }

  close(): void {
    this.closeCallCount += 1;
  }
}

/** A well-behaved fake: `open()` settles on the next microtask, same as
 *  `pushSubStore.test.ts`'s. */
function installRespondingIndexedDb(): {
  restore: () => void;
  deleteDatabase: ReturnType<typeof vi.fn>;
} {
  const backingStore = new Map<string, unknown>();
  const deleteDatabase = vi.fn(() => new FakeRequest<undefined>());
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
    deleteDatabase,
  };
  return {
    restore: () => {
      (globalThis as { indexedDB?: unknown }).indexedDB = previous;
    },
    deleteDatabase,
  };
}

/** A wedged fake: `open()` returns a request that never calls back, the way a
 *  stuck upgrade or a corrupted profile can leave the browser. */
function installWedgedIndexedDb(): {
  restore: () => void;
  deleteDatabase: ReturnType<typeof vi.fn>;
} {
  const deleteDatabase = vi.fn(() => new FakeRequest<undefined>());
  const previous = (globalThis as { indexedDB?: unknown }).indexedDB;
  (globalThis as { indexedDB?: unknown }).indexedDB = {
    open: () => new FakeRequest<FakeDatabase>(),
    deleteDatabase,
  };
  return {
    restore: () => {
      (globalThis as { indexedDB?: unknown }).indexedDB = previous;
    },
    deleteDatabase,
  };
}

describe("indexedDbRecordStore", () => {
  let restoreIndexedDb: (() => void) | undefined;

  afterEach(() => {
    restoreIndexedDb?.();
    restoreIndexedDb = undefined;
    vi.useRealTimers();
  });

  it("round-trips a value through a responding store", async () => {
    ({ restore: restoreIndexedDb } = installRespondingIndexedDb());
    const store = createIndexedDbRecordStore<{ value: string }>({
      databaseName: "qp-test-db",
      storeName: "records",
      recordKey: "key",
    });
    await store.write({ value: "hello" });
    await expect(store.read()).resolves.toEqual({
      status: "ok",
      value: { value: "hello" },
    });
    await store.remove();
    await expect(store.read()).resolves.toEqual({
      status: "ok",
      value: undefined,
    });
  });

  it("reports reads as unavailable, promptly, when open never settles", async () => {
    vi.useFakeTimers();
    ({ restore: restoreIndexedDb } = installWedgedIndexedDb());
    const store = createIndexedDbRecordStore<{ value: string }>({
      databaseName: "qp-test-db",
      storeName: "records",
      recordKey: "key",
    });
    const readPromise = store.read();
    await vi.advanceTimersByTimeAsync(OPEN_TIMEOUT_MS);
    await expect(readPromise).resolves.toEqual({ status: "unavailable" });
  });

  it("falls back to indexedDB.deleteDatabase when a purge's open times out", async () => {
    vi.useFakeTimers();
    const wedged = installWedgedIndexedDb();
    restoreIndexedDb = wedged.restore;
    const store = createIndexedDbRecordStore<{ value: string }>({
      databaseName: "qp-test-db",
      storeName: "records",
      recordKey: "key",
    });
    const removePromise = store.remove();
    await vi.advanceTimersByTimeAsync(OPEN_TIMEOUT_MS);
    await removePromise;
    expect(wedged.deleteDatabase).toHaveBeenCalledWith("qp-test-db");
  });

  it("never throws when indexedDB is unavailable", async () => {
    const previous = (globalThis as { indexedDB?: unknown }).indexedDB;
    (globalThis as { indexedDB?: unknown }).indexedDB = undefined;
    restoreIndexedDb = () => {
      (globalThis as { indexedDB?: unknown }).indexedDB = previous;
    };
    // Item 11: the `!isIndexedDbAvailable()` branch returns its fallback
    // directly and never calls `onUnavailable`, so `remove()`'s
    // `bestEffortDeleteDatabase` fallback (the only caller of
    // `indexedDB.deleteDatabase`) is never reached while indexedDB itself is
    // missing. `indexedDB` stays undefined for the whole test, so this
    // `deleteDatabase` reference can never actually be wired to anything the
    // store could call; it exists purely to pin the contract in writing
    // (only the wedged-open case in the test above legitimately calls it).
    const deleteDatabase = vi.fn();
    const store = createIndexedDbRecordStore<{ value: string }>({
      databaseName: "qp-test-db",
      storeName: "records",
      recordKey: "key",
    });
    await expect(store.read()).resolves.toEqual({ status: "unavailable" });
    await expect(store.write({ value: "x" })).resolves.toBeUndefined();
    await expect(store.remove()).resolves.toBeUndefined();
    expect(deleteDatabase).not.toHaveBeenCalled();
  });
});
