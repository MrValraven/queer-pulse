import { describe, expect, it, vi } from "vitest";
import type {
  VjClipMediaDTO,
  VjClipMimeType,
  VjPackMediaDTO,
  VjScreenClipStatus,
} from "../../../shared/contracts/vj";
import type { VjClipCache } from "./vjClipCache";
import {
  preloadVjPack,
  VJ_PRELOAD_CONCURRENCY,
  type VjPreloadClip,
  type VjPreloaderDependencies,
} from "./vjPreloader";

const PACK_ID = "pack-1";
const NOW = Date.parse("2026-11-05T20:00:00.000Z");
const LATER = "2026-11-05T20:15:00.000Z";
const EARLIER = "2026-11-05T19:59:00.000Z";

interface FakeClipCache extends VjClipCache {
  stored: Map<string, { blob: Blob; mimeType: VjClipMimeType }>;
}

function createFakeClipCache(cachedClipIds: string[] = []): FakeClipCache {
  const stored = new Map<string, { blob: Blob; mimeType: VjClipMimeType }>();
  cachedClipIds.forEach((clipId) =>
    stored.set(clipId, { blob: new Blob(["x"]), mimeType: "video/mp4" }),
  );
  return {
    isPersistent: true,
    stored,
    has: vi.fn((clipId: string) => Promise.resolve(stored.has(clipId))),
    put: vi.fn((clipId: string, blob: Blob, mimeType: VjClipMimeType) => {
      stored.set(clipId, { blob, mimeType });
      return Promise.resolve();
    }),
    readObjectUrl: vi.fn(() => Promise.resolve(null)),
    remove: vi.fn(() => Promise.resolve()),
    keepOnly: vi.fn(() => Promise.resolve(0)),
    listClipIds: vi.fn(() => Promise.resolve([...stored.keys()])),
  };
}

function mediaItem(
  clipId: string,
  overrides: Partial<VjClipMediaDTO> = {},
): VjClipMediaDTO {
  return {
    clipId,
    url: `https://bucket.test/${clipId}?signature=one`,
    expiresAt: LATER,
    mimeType: "video/mp4",
    byteSize: 8,
    ...overrides,
  };
}

function mediaAnswer(items: VjClipMediaDTO[]): VjPackMediaDTO {
  return { packId: PACK_ID, items };
}

/** A Response whose body arrives as chunks of the given sizes. */
function chunkedResponse(chunkSizes: number[], breakAfter?: number): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      chunkSizes.forEach((chunkSize, chunkIndex) => {
        if (breakAfter !== undefined && chunkIndex >= breakAfter) return;
        controller.enqueue(new Uint8Array(chunkSize));
      });
      if (breakAfter !== undefined) controller.error(new TypeError("cut"));
      else controller.close();
    },
  });
  return new Response(body, { status: 200 });
}

function clips(...clipIds: string[]): VjPreloadClip[] {
  return clipIds.map((clipId) => ({ clipId, byteSize: 8 }));
}

function setup(overrides: Partial<VjPreloaderDependencies> = {}) {
  const cache = createFakeClipCache();
  const dependencies: VjPreloaderDependencies = {
    cache,
    fetchMedia: vi.fn(() =>
      Promise.resolve(mediaAnswer([mediaItem("clip-a"), mediaItem("clip-b")])),
    ),
    fetchBytes: vi.fn(() => Promise.resolve(chunkedResponse([4, 4]))),
    now: () => NOW,
    isOnline: () => true,
    ...overrides,
  };
  const updates: VjScreenClipStatus[][] = [];
  const onUpdate = (statuses: VjScreenClipStatus[]) => {
    updates.push(statuses);
  };
  return { cache, dependencies, updates, onUpdate };
}

function statusOf(statuses: VjScreenClipStatus[], clipId: string) {
  return statuses.find((status) => status.clipId === clipId);
}

describe("preloadVjPack loading", () => {
  it("marks cached clips ready without asking for URLs", async () => {
    const cache = createFakeClipCache(["clip-a", "clip-b"]);
    const { dependencies, onUpdate, updates } = setup({ cache });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a", "clip-b"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(dependencies.fetchMedia).not.toHaveBeenCalled();
    expect(dependencies.fetchBytes).not.toHaveBeenCalled();
    expect(statuses).toEqual([
      { clipId: "clip-a", state: "ready", progress: 1, failure: null },
      { clipId: "clip-b", state: "ready", progress: 1, failure: null },
    ]);
    expect(updates.at(-1)).toEqual(statuses);
  });

  it("fetches each URL without credentials and reports progress", async () => {
    const { cache, dependencies, onUpdate, updates } = setup({
      fetchMedia: vi.fn(() =>
        Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
      ),
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(dependencies.fetchMedia).toHaveBeenCalledWith(
      PACK_ID,
      null,
      expect.any(AbortSignal),
    );
    expect(dependencies.fetchBytes).toHaveBeenCalledWith(
      "https://bucket.test/clip-a?signature=one",
      expect.objectContaining({ credentials: "omit", mode: "cors" }),
    );
    const progressValues = updates
      .map((update) => statusOf(update, "clip-a"))
      .filter((status) => status?.state === "loading")
      .map((status) => status?.progress ?? 0);
    expect(
      progressValues.some((progress) => progress > 0 && progress < 1),
    ).toBe(true);
    expect(statusOf(statuses, "clip-a")).toEqual({
      clipId: "clip-a",
      state: "ready",
      progress: 1,
      failure: null,
    });
    expect(cache.stored.get("clip-a")?.blob.size).toBe(8);
    expect(cache.stored.get("clip-a")?.mimeType).toBe("video/mp4");
  });

  it("fetches two clips at a time", async () => {
    const pendingDownloads: Array<(response: Response) => void> = [];
    const fetchBytes = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          pendingDownloads.push(resolve);
        }),
    );
    const { dependencies, onUpdate } = setup({
      fetchMedia: vi.fn(() =>
        Promise.resolve(
          mediaAnswer([
            mediaItem("clip-a"),
            mediaItem("clip-b"),
            mediaItem("clip-c"),
          ]),
        ),
      ),
      fetchBytes: fetchBytes as unknown as typeof fetch,
    });

    const preload = preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a", "clip-b", "clip-c"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    await vi.waitFor(() =>
      expect(fetchBytes).toHaveBeenCalledTimes(VJ_PRELOAD_CONCURRENCY),
    );
    await Promise.resolve();
    expect(fetchBytes).toHaveBeenCalledTimes(2);

    pendingDownloads[0]?.(chunkedResponse([8]));
    await vi.waitFor(() => expect(fetchBytes).toHaveBeenCalledTimes(3));
    pendingDownloads[1]?.(chunkedResponse([8]));
    pendingDownloads[2]?.(chunkedResponse([8]));

    const statuses = await preload;
    expect(statuses.map((status) => status.state)).toEqual([
      "ready",
      "ready",
      "ready",
    ]);
  });

  it("re-requests an expired URL once through clipIds", async () => {
    const fetchMedia = vi
      .fn<VjPreloaderDependencies["fetchMedia"]>()
      .mockResolvedValueOnce(
        mediaAnswer([
          mediaItem("clip-a"),
          mediaItem("clip-b", { expiresAt: EARLIER }),
        ]),
      )
      .mockResolvedValueOnce(
        mediaAnswer([
          mediaItem("clip-b", {
            url: "https://bucket.test/clip-b?signature=two",
          }),
        ]),
      );
    const fetchBytes = vi.fn((_url: string, _init?: RequestInit) =>
      Promise.resolve(chunkedResponse([4, 4])),
    );
    const { dependencies, onUpdate } = setup({
      fetchMedia,
      fetchBytes: fetchBytes as unknown as typeof fetch,
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a", "clip-b"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(fetchMedia).toHaveBeenCalledTimes(2);
    expect(fetchMedia).toHaveBeenLastCalledWith(
      PACK_ID,
      ["clip-b"],
      expect.any(AbortSignal),
    );
    const fetchedUrls = fetchBytes.mock.calls.map((call) => call[0]);
    expect(fetchedUrls).toEqual([
      "https://bucket.test/clip-a?signature=one",
      "https://bucket.test/clip-b?signature=two",
    ]);
    expect(statuses.map((status) => status.state)).toEqual(["ready", "ready"]);
  });
});

describe("preloadVjPack failures", () => {
  it("fails url_expired when the URL expires twice", async () => {
    const fetchMedia = vi
      .fn<VjPreloaderDependencies["fetchMedia"]>()
      .mockResolvedValueOnce(
        mediaAnswer([mediaItem("clip-a", { expiresAt: EARLIER })]),
      )
      .mockResolvedValueOnce(
        mediaAnswer([mediaItem("clip-a", { expiresAt: EARLIER })]),
      );
    const { dependencies, onUpdate } = setup({ fetchMedia });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(fetchMedia).toHaveBeenCalledTimes(2);
    expect(dependencies.fetchBytes).not.toHaveBeenCalled();
    expect(statuses).toEqual([
      {
        clipId: "clip-a",
        state: "failed",
        progress: 0,
        failure: "url_expired",
      },
    ]);
  });

  it("fails not_found for a clip the media answer leaves out", async () => {
    const { dependencies, onUpdate } = setup({
      fetchMedia: vi.fn(() =>
        Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
      ),
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a", "clip-gone"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(statusOf(statuses, "clip-a")?.state).toBe("ready");
    expect(statusOf(statuses, "clip-gone")).toEqual({
      clipId: "clip-gone",
      state: "failed",
      progress: 0,
      failure: "not_found",
    });
  });

  it("fails network when the download breaks", async () => {
    const { cache, dependencies, onUpdate } = setup({
      fetchMedia: vi.fn(() =>
        Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
      ),
      fetchBytes: vi.fn(() =>
        Promise.resolve(chunkedResponse([4, 4], 1)),
      ) as unknown as typeof fetch,
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(statuses).toEqual([
      { clipId: "clip-a", state: "failed", progress: 0, failure: "network" },
    ]);
    expect(cache.stored.has("clip-a")).toBe(false);
  });

  it("fails storage_full on a quota error", async () => {
    const cache = createFakeClipCache();
    cache.put = vi.fn(() =>
      Promise.reject(new DOMException("full", "QuotaExceededError")),
    );
    const { dependencies, onUpdate } = setup({
      cache,
      fetchMedia: vi.fn(() =>
        Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
      ),
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(statuses).toEqual([
      {
        clipId: "clip-a",
        state: "failed",
        progress: 0,
        failure: "storage_full",
      },
    ]);
  });

  it("leaves uncached clips queued while offline and asks for nothing", async () => {
    const cache = createFakeClipCache(["clip-a"]);
    const { dependencies, onUpdate } = setup({
      cache,
      isOnline: () => false,
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a", "clip-b"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(dependencies.fetchMedia).not.toHaveBeenCalled();
    expect(dependencies.fetchBytes).not.toHaveBeenCalled();
    expect(statuses).toEqual([
      { clipId: "clip-a", state: "ready", progress: 1, failure: null },
      { clipId: "clip-b", state: "queued", progress: 0, failure: null },
    ]);
  });

  it("stops quietly on abort", async () => {
    const abortController = new AbortController();
    const fetchBytes = vi.fn(
      (_url: string, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        }),
    );
    const { cache, dependencies, onUpdate, updates } = setup({
      fetchMedia: vi.fn(() =>
        Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
      ),
      fetchBytes: fetchBytes as unknown as typeof fetch,
    });

    const preload = preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: abortController.signal,
        onUpdate,
      },
      dependencies,
    );
    await vi.waitFor(() => expect(fetchBytes).toHaveBeenCalledTimes(1));
    const updateCountBeforeAbort = updates.length;
    abortController.abort();

    const statuses = await preload;

    expect(updates).toHaveLength(updateCountBeforeAbort);
    expect(statuses.some((status) => status.state === "failed")).toBe(false);
    expect(cache.stored.has("clip-a")).toBe(false);
  });
});

describe("preloadVjPack expired links", () => {
  it("treats a 403 on the presigned GET as an expired URL and re-requests it once", async () => {
    const fetchMedia = vi
      .fn<VjPreloaderDependencies["fetchMedia"]>()
      .mockResolvedValueOnce(mediaAnswer([mediaItem("clip-a")]))
      .mockResolvedValueOnce(
        mediaAnswer([
          mediaItem("clip-a", {
            url: "https://bucket.test/clip-a?signature=two",
          }),
        ]),
      );
    const fetchBytes = vi.fn((url: string, _init?: RequestInit) =>
      Promise.resolve(
        url.endsWith("signature=one")
          ? new Response(null, { status: 403 })
          : chunkedResponse([4, 4]),
      ),
    );
    const { cache, dependencies, onUpdate } = setup({
      fetchMedia,
      fetchBytes: fetchBytes as unknown as typeof fetch,
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(fetchMedia).toHaveBeenCalledTimes(2);
    expect(fetchMedia).toHaveBeenLastCalledWith(
      PACK_ID,
      ["clip-a"],
      expect.any(AbortSignal),
    );
    expect(fetchBytes).toHaveBeenCalledTimes(2);
    expect(statuses).toEqual([
      { clipId: "clip-a", state: "ready", progress: 1, failure: null },
    ]);
    expect(cache.stored.has("clip-a")).toBe(true);
  });

  it("fails url_expired when the storage answers 403 twice", async () => {
    const fetchMedia = vi.fn<VjPreloaderDependencies["fetchMedia"]>(() =>
      Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
    );
    const fetchBytes = vi.fn(() =>
      Promise.resolve(new Response(null, { status: 403 })),
    );
    const { dependencies, onUpdate } = setup({
      fetchMedia,
      fetchBytes: fetchBytes as unknown as typeof fetch,
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(fetchMedia).toHaveBeenCalledTimes(2);
    expect(fetchBytes).toHaveBeenCalledTimes(2);
    expect(statuses).toEqual([
      {
        clipId: "clip-a",
        state: "failed",
        progress: 0,
        failure: "url_expired",
      },
    ]);
  });

  it("fails network on any other refused download", async () => {
    const { dependencies, onUpdate } = setup({
      fetchMedia: vi.fn(() =>
        Promise.resolve(mediaAnswer([mediaItem("clip-a")])),
      ),
      fetchBytes: vi.fn(() =>
        Promise.resolve(new Response(null, { status: 500 })),
      ) as unknown as typeof fetch,
    });

    const statuses = await preloadVjPack(
      {
        packId: PACK_ID,
        clips: clips("clip-a"),
        signal: new AbortController().signal,
        onUpdate,
      },
      dependencies,
    );

    expect(dependencies.fetchMedia).toHaveBeenCalledTimes(1);
    expect(statuses).toEqual([
      { clipId: "clip-a", state: "failed", progress: 0, failure: "network" },
    ]);
  });
});
