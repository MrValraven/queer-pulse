import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { readPushLang, writePushLang } from "./pushLang";

// jsdom does not implement IndexedDB (a documented gap, not a bug to work
// around with a real engine here). This is a minimal, in-memory fake covering
// only the surface pushLang.ts actually exercises — open/upgrade/transaction/
// put/get — enough to round-trip a single "lang" key across write/read calls
// that share the same backing Map, the way two IndexedDB connections to the
// same origin's DB would.
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

describe("pushLang", () => {
  let restoreIndexedDb: (() => void) | undefined;

  beforeEach(() => {
    restoreIndexedDb = installFakeIndexedDb();
  });

  afterEach(() => {
    restoreIndexedDb?.();
  });

  it("round-trips a written language", async () => {
    await writePushLang("pt");
    await expect(readPushLang()).resolves.toBe("pt");
  });

  it("defaults to en when nothing has been written", async () => {
    await expect(readPushLang()).resolves.toBe("en");
  });

  it("defaults to en when indexedDB is unavailable", async () => {
    restoreIndexedDb?.();
    restoreIndexedDb = undefined;
    (globalThis as { indexedDB?: unknown }).indexedDB = undefined;
    await expect(readPushLang()).resolves.toBe("en");
    // writePushLang must also no-op silently rather than throw.
    await expect(writePushLang("pt")).resolves.toBeUndefined();
  });
});
