// The projector's clip store (contract 8.5). Each clip's bytes sit in Cache
// Storage under a synthetic URL that is never fetched; the clip id is the
// version because a clip's bytes never change. On an insecure origin Cache
// Storage is missing, and when opening it fails (a browser that blocks site
// storage), the blobs stay in memory for this session.

import type { VjClipMimeType } from "../../../shared/contracts/vj";
import { VJ_CLIP_CACHE_NAME, VJ_CLIP_CACHE_PATH_PREFIX } from "../vj.constants";

export interface VjClipCache {
  /** False when Cache Storage is missing or failed to open: blobs stay in memory for this session. */
  isPersistent: boolean;
  has(clipId: string): Promise<boolean>;
  /** Rejects with the original error (QuotaExceededError included). */
  put(clipId: string, blob: Blob, mimeType: VjClipMimeType): Promise<void>;
  /** URL.createObjectURL of the cached body; the caller revokes it. */
  readObjectUrl(clipId: string): Promise<string | null>;
  remove(clipId: string): Promise<void>;
  /** Evicts every other entry and answers how many went. */
  keepOnly(clipIds: ReadonlySet<string>): Promise<number>;
  listClipIds(): Promise<string[]>;
}

function currentOrigin(): string {
  return typeof window === "undefined" ? "" : window.location.origin;
}

export function vjClipCacheKey(
  clipId: string,
  origin: string = currentOrigin(),
): string {
  return `${origin}${VJ_CLIP_CACHE_PATH_PREFIX}${clipId}`;
}

/** The clip id a cache entry's URL names, or null for a foreign entry. */
function clipIdOfCacheUrl(url: string): string | null {
  let pathname: string;
  try {
    pathname = new URL(url).pathname;
  } catch {
    pathname = url;
  }
  if (!pathname.startsWith(VJ_CLIP_CACHE_PATH_PREFIX)) return null;
  const clipId = decodeURIComponent(
    pathname.slice(VJ_CLIP_CACHE_PATH_PREFIX.length),
  );
  return clipId.length > 0 ? clipId : null;
}

async function evictOthers(
  cache: VjClipCache,
  clipIds: ReadonlySet<string>,
): Promise<number> {
  const storedClipIds = await cache.listClipIds();
  const evictedClipIds = storedClipIds.filter(
    (storedClipId) => !clipIds.has(storedClipId),
  );
  await Promise.all(
    evictedClipIds.map((evictedClipId) => cache.remove(evictedClipId)),
  );
  return evictedClipIds.length;
}

/**
 * Cache Storage, or the memory store once opening it has failed: a rejected
 * open would otherwise fail every clip as storage_full and leave the
 * projector black.
 */
function createPersistentClipCache(cacheStorage: CacheStorage): VjClipCache {
  const memoryCache = createMemoryClipCache();
  let hasFallenBackToMemory = false;
  let openedCache: Promise<Cache | null> | null = null;
  const openCache = (): Promise<Cache | null> => {
    openedCache ??= Promise.resolve()
      .then(() => cacheStorage.open(VJ_CLIP_CACHE_NAME))
      .catch(() => {
        hasFallenBackToMemory = true;
        return null;
      });
    return openedCache;
  };

  const clipCache: VjClipCache = {
    get isPersistent() {
      return !hasFallenBackToMemory;
    },
    async has(clipId) {
      const cache = await openCache();
      if (cache === null) return memoryCache.has(clipId);
      const response = await cache.match(vjClipCacheKey(clipId));
      return response !== undefined;
    },
    async put(clipId, blob, mimeType) {
      const cache = await openCache();
      if (cache === null) return memoryCache.put(clipId, blob, mimeType);
      const response = new Response(blob, {
        headers: {
          "Content-Type": mimeType,
          "Content-Length": String(blob.size),
        },
      });
      await cache.put(vjClipCacheKey(clipId), response);
    },
    async readObjectUrl(clipId) {
      const cache = await openCache();
      if (cache === null) return memoryCache.readObjectUrl(clipId);
      const response = await cache.match(vjClipCacheKey(clipId));
      if (response === undefined) return null;
      const body = await response.blob();
      return URL.createObjectURL(body);
    },
    async remove(clipId) {
      const cache = await openCache();
      if (cache === null) return memoryCache.remove(clipId);
      await cache.delete(vjClipCacheKey(clipId));
    },
    keepOnly(clipIds) {
      return evictOthers(clipCache, clipIds);
    },
    async listClipIds() {
      const cache = await openCache();
      if (cache === null) return memoryCache.listClipIds();
      const requests = await cache.keys();
      return requests
        .map((request) => clipIdOfCacheUrl(request.url))
        .filter((clipId): clipId is string => clipId !== null);
    },
  };
  return clipCache;
}

function createMemoryClipCache(): VjClipCache {
  const blobsByClipId = new Map<string, Blob>();

  const clipCache: VjClipCache = {
    isPersistent: false,
    has(clipId) {
      return Promise.resolve(blobsByClipId.has(clipId));
    },
    put(clipId, blob, mimeType) {
      const typedBlob =
        blob.type === mimeType ? blob : new Blob([blob], { type: mimeType });
      blobsByClipId.set(clipId, typedBlob);
      return Promise.resolve();
    },
    readObjectUrl(clipId) {
      const blob = blobsByClipId.get(clipId);
      return Promise.resolve(
        blob === undefined ? null : URL.createObjectURL(blob),
      );
    },
    remove(clipId) {
      blobsByClipId.delete(clipId);
      return Promise.resolve();
    },
    keepOnly(clipIds) {
      return evictOthers(clipCache, clipIds);
    },
    listClipIds() {
      return Promise.resolve([...blobsByClipId.keys()]);
    },
  };
  return clipCache;
}

function defaultCacheStorage(): CacheStorage | undefined {
  // `caches` is absent on an insecure origin even though lib.dom types it.
  const globalScope = globalThis as { caches?: CacheStorage };
  return globalScope.caches;
}

/**
 * Asks the browser once to keep this origin's storage under pressure, so
 * Chrome does not evict the clip cache between shows. Answers whether the
 * storage is persistent; a browser without the API, or one that refuses,
 * answers false and the show goes on.
 */
export async function requestPersistentVjClipStorage(
  storageManager: StorageManager | undefined = defaultStorageManager(),
): Promise<boolean> {
  if (storageManager === undefined) return false;
  if (typeof storageManager.persist !== "function") return false;
  try {
    if (
      typeof storageManager.persisted === "function" &&
      (await storageManager.persisted())
    ) {
      return true;
    }
    return await storageManager.persist();
  } catch {
    return false;
  }
}

function defaultStorageManager(): StorageManager | undefined {
  if (typeof navigator === "undefined") return undefined;
  // `storage` is absent on an insecure origin even though lib.dom types it.
  const navigatorScope = navigator as { storage?: StorageManager };
  return navigatorScope.storage;
}

export function createVjClipCache(cacheStorage?: CacheStorage): VjClipCache {
  const storage = cacheStorage ?? defaultCacheStorage();
  return storage === undefined
    ? createMemoryClipCache()
    : createPersistentClipCache(storage);
}
