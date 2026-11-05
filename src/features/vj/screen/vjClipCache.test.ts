import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VJ_CLIP_CACHE_NAME, VJ_CLIP_CACHE_PATH_PREFIX } from "../vj.constants";
import {
  createVjClipCache,
  requestPersistentVjClipStorage,
  vjClipCacheKey,
} from "./vjClipCache";

/** A CacheStorage over a Map: one named cache, keyed by request URL. */
function createFakeCacheStorage() {
  const entries = new Map<string, Response>();
  const openedNames: string[] = [];
  const cache = {
    match: (key: string) => Promise.resolve(entries.get(key)?.clone()),
    put: (key: string, response: Response) => {
      entries.set(key, response);
      return Promise.resolve();
    },
    delete: (key: string) => Promise.resolve(entries.delete(key)),
    keys: () =>
      Promise.resolve([...entries.keys()].map((key) => new Request(key))),
  };
  const cacheStorage = {
    open: (name: string) => {
      openedNames.push(name);
      return Promise.resolve(cache);
    },
  } as unknown as CacheStorage;
  return { cacheStorage, entries, openedNames };
}

const originalCreateObjectUrlDescriptor = Object.getOwnPropertyDescriptor(
  URL,
  "createObjectURL",
);
let createObjectUrl: ReturnType<typeof vi.fn<(blob: Blob) => string>>;

beforeEach(() => {
  createObjectUrl = vi.fn((blob: Blob) => `blob:test/${blob.size}`);
  Object.defineProperty(URL, "createObjectURL", {
    configurable: true,
    writable: true,
    value: createObjectUrl,
  });
});

afterEach(() => {
  if (originalCreateObjectUrlDescriptor === undefined) {
    Reflect.deleteProperty(URL, "createObjectURL");
  } else {
    Object.defineProperty(
      URL,
      "createObjectURL",
      originalCreateObjectUrlDescriptor,
    );
  }
});

describe("vjClipCacheKey", () => {
  it("builds the synthetic URL from the origin and the clip id", () => {
    expect(vjClipCacheKey("clip-1", "https://screen.test")).toBe(
      `https://screen.test${VJ_CLIP_CACHE_PATH_PREFIX}clip-1`,
    );
  });
});

describe("createVjClipCache", () => {
  it("stores a clip under its synthetic key with its content type", async () => {
    const { cacheStorage, entries, openedNames } = createFakeCacheStorage();
    const clipCache = createVjClipCache(cacheStorage);

    await clipCache.put("clip-1", new Blob(["abcd"]), "video/mp4");

    expect(clipCache.isPersistent).toBe(true);
    expect(openedNames).toContain(VJ_CLIP_CACHE_NAME);
    const stored = entries.get(vjClipCacheKey("clip-1"));
    expect(stored).toBeDefined();
    expect(stored?.headers.get("Content-Type")).toBe("video/mp4");
    expect(await clipCache.has("clip-1")).toBe(true);
    expect(await clipCache.has("clip-2")).toBe(false);
  });

  it("reads a cached clip as an object URL", async () => {
    const { cacheStorage } = createFakeCacheStorage();
    const clipCache = createVjClipCache(cacheStorage);
    await clipCache.put("clip-1", new Blob(["abcdef"]), "image/gif");

    const objectUrl = await clipCache.readObjectUrl("clip-1");

    expect(objectUrl).toBe("blob:test/6");
    expect(createObjectUrl).toHaveBeenCalledTimes(1);
    const readBlob = createObjectUrl.mock.calls[0]?.[0];
    expect(await readBlob?.text()).toBe("abcdef");
    expect(await clipCache.readObjectUrl("clip-missing")).toBeNull();
  });

  it("keeps only the clips it is told to keep", async () => {
    const { cacheStorage, entries } = createFakeCacheStorage();
    entries.set("https://screen.test/some/other/entry", new Response("x"));
    const clipCache = createVjClipCache(cacheStorage);
    await clipCache.put("clip-1", new Blob(["1"]), "video/mp4");
    await clipCache.put("clip-2", new Blob(["2"]), "video/webm");
    await clipCache.put("clip-3", new Blob(["3"]), "image/gif");

    const evictedCount = await clipCache.keepOnly(
      new Set(["clip-2", "clip-9"]),
    );

    expect(evictedCount).toBe(2);
    expect(await clipCache.listClipIds()).toEqual(["clip-2"]);
    expect(entries.has("https://screen.test/some/other/entry")).toBe(true);
  });

  it("removes one clip", async () => {
    const { cacheStorage } = createFakeCacheStorage();
    const clipCache = createVjClipCache(cacheStorage);
    await clipCache.put("clip-1", new Blob(["1"]), "video/mp4");

    await clipCache.remove("clip-1");

    expect(await clipCache.has("clip-1")).toBe(false);
  });

  it("rejects a put with the original quota error", async () => {
    const { cacheStorage } = createFakeCacheStorage();
    const quotaError = new DOMException("full", "QuotaExceededError");
    const opened = await cacheStorage.open(VJ_CLIP_CACHE_NAME);
    opened.put = () => Promise.reject(quotaError);
    const clipCache = createVjClipCache(cacheStorage);

    await expect(
      clipCache.put("clip-1", new Blob(["1"]), "video/mp4"),
    ).rejects.toBe(quotaError);
  });

  it("falls back to memory when Cache Storage fails to open", async () => {
    const openError = new DOMException("blocked", "SecurityError");
    const openCache = vi.fn(() => Promise.reject(openError));
    const cacheStorage = { open: openCache } as unknown as CacheStorage;
    const clipCache = createVjClipCache(cacheStorage);

    expect(await clipCache.has("clip-1")).toBe(false);
    expect(clipCache.isPersistent).toBe(false);
    await expect(
      clipCache.put("clip-1", new Blob(["abcd"]), "video/mp4"),
    ).resolves.toBeUndefined();
    expect(await clipCache.has("clip-1")).toBe(true);
    expect(await clipCache.readObjectUrl("clip-1")).toBe("blob:test/4");
    expect(await clipCache.listClipIds()).toEqual(["clip-1"]);
    await clipCache.remove("clip-1");
    expect(await clipCache.has("clip-1")).toBe(false);
    expect(openCache).toHaveBeenCalledTimes(1);
  });

  it("falls back to memory when opening Cache Storage throws at once", async () => {
    const cacheStorage = {
      open: () => {
        throw new DOMException("blocked", "SecurityError");
      },
    } as unknown as CacheStorage;
    const clipCache = createVjClipCache(cacheStorage);

    await clipCache.put("clip-1", new Blob(["ab"]), "image/gif");

    expect(await clipCache.has("clip-1")).toBe(true);
    expect(clipCache.isPersistent).toBe(false);
  });

  it("falls back to memory where Cache Storage is missing", async () => {
    const globalScope = globalThis as { caches?: CacheStorage };
    const originalCaches = globalScope.caches;
    delete globalScope.caches;
    try {
      const clipCache = createVjClipCache();

      expect(clipCache.isPersistent).toBe(false);
      expect(await clipCache.has("clip-1")).toBe(false);
      await clipCache.put("clip-1", new Blob(["abc"]), "image/gif");
      expect(await clipCache.has("clip-1")).toBe(true);
      expect(await clipCache.readObjectUrl("clip-1")).toBe("blob:test/3");
      expect(await clipCache.listClipIds()).toEqual(["clip-1"]);
      expect(await clipCache.keepOnly(new Set())).toBe(1);
      expect(await clipCache.has("clip-1")).toBe(false);
    } finally {
      if (originalCaches !== undefined) globalScope.caches = originalCaches;
    }
  });
});

describe("requestPersistentVjClipStorage", () => {
  it("asks the browser to keep the clip cache", async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    const storageManager = {
      persisted: vi.fn(() => Promise.resolve(false)),
      persist,
    } as unknown as StorageManager;

    expect(await requestPersistentVjClipStorage(storageManager)).toBe(true);
    expect(persist).toHaveBeenCalledTimes(1);
  });

  it("does not ask again when the storage is already persistent", async () => {
    const persist = vi.fn(() => Promise.resolve(true));
    const storageManager = {
      persisted: () => Promise.resolve(true),
      persist,
    } as unknown as StorageManager;

    expect(await requestPersistentVjClipStorage(storageManager)).toBe(true);
    expect(persist).not.toHaveBeenCalled();
  });

  it("answers false without the API or when the browser refuses", async () => {
    expect(await requestPersistentVjClipStorage(undefined)).toBe(false);
    expect(
      await requestPersistentVjClipStorage({} as unknown as StorageManager),
    ).toBe(false);
    const refusingManager = {
      persisted: () => Promise.resolve(false),
      persist: () => Promise.reject(new Error("refused")),
    } as unknown as StorageManager;
    expect(await requestPersistentVjClipStorage(refusingManager)).toBe(false);
  });
});
