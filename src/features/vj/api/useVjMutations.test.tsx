import { QueryClient } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TestProviders } from "../../../test/TestProviders";
import type { VjPackDTO } from "../../../shared/contracts/vj";
import { configureVjDemoStore, resetVjDemoLibrary } from "../demo/vjDemoStore";
import { createVjDemoChannelHub } from "../demo/vjDemoChannel";
import { useVjClips } from "./useVjClips";
import { useDeleteVjClip, useMoveVjClip } from "./useVjClipMutations";
import { useVjPackClips } from "./useVjPackClips";
import { useVjPackMediaFetcher } from "./useVjPackMediaFetcher";
import {
  useCreateVjPack,
  useReorderVjPacks,
  useVjIsWriting,
} from "./useVjPackMutations";
import { useVjPacks } from "./useVjPacks";
import { vjKeys } from "./vjKeys";

/** A held promise lets a test look at the state between mutate and settle. */
const gate = vi.hoisted(() => ({
  hold: null as Promise<void> | null,
}));

vi.mock("../demo/vjDemoStore", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../demo/vjDemoStore")>();
  return {
    ...actual,
    demoCreateVjPack: (body: { name: unknown }): VjPackDTO => {
      if (gate.hold === null) return actual.demoCreateVjPack(body);
      return gate.hold.then(() =>
        actual.demoCreateVjPack(body),
      ) as unknown as VjPackDTO;
    },
  };
});

class MemoryStorage implements Storage {
  private readonly entries = new Map<string, string>();
  get length(): number {
    return this.entries.size;
  }
  clear(): void {
    this.entries.clear();
  }
  getItem(key: string): string | null {
    return this.entries.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.entries.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.entries.delete(key);
  }
  setItem(key: string, value: string): void {
    this.entries.set(key, value);
  }
}

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <TestProviders queryClient={queryClient}>{children}</TestProviders>;
  };
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

describe("VJ library hooks (demo)", () => {
  beforeEach(() => {
    gate.hold = null;
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("creates a pack and lists it last", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({ packs: useVjPacks(), create: useCreateVjPack() }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => expect(result.current.packs.data).toBeDefined());
    await act(async () => {
      await result.current.create.mutateAsync({ name: "Encore" });
    });
    await waitFor(() =>
      expect(result.current.packs.data?.map((pack) => pack.name).at(-1)).toBe(
        "Encore",
      ),
    );
  });

  it("reorders packs and keeps the answer in the cache", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({ packs: useVjPacks(), reorder: useReorderVjPacks() }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => expect(result.current.packs.data).toBeDefined());
    const originalIds = (result.current.packs.data ?? []).map(
      (pack) => pack.id,
    );
    await act(async () => {
      await result.current.reorder.mutateAsync({
        packIds: [...originalIds].reverse(),
      });
    });
    const cached = queryClient.getQueryData<VjPackDTO[]>(vjKeys.packs(true));
    expect(cached?.map((pack) => pack.id)).toEqual([...originalIds].reverse());
    expect(result.current.packs.data?.map((pack) => pack.id)).toEqual(
      [...originalIds].reverse(),
    );
    expect(queryClient.getQueryState(vjKeys.packs(true))?.isInvalidated).toBe(
      false,
    );
  });

  it("moves a clip and leaves the source on a refused add", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        packs: useVjPacks(),
        clips: useVjClips(),
        move: useMoveVjClip(),
      }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => {
      expect(result.current.packs.data).toBeDefined();
      expect(result.current.clips.data).toBeDefined();
    });
    const packs = result.current.packs.data ?? [];
    const warmUp = packs.find((pack) => pack.name === "Warm-up");
    const peakHour = packs.find((pack) => pack.name === "Peak hour");
    const neonGrid = result.current.clips.data?.find(
      (clip) => clip.title === "Neon grid",
    );
    expect(warmUp && peakHour && neonGrid).toBeTruthy();
    if (!warmUp || !peakHour || !neonGrid) return;
    await act(async () => {
      await expect(
        result.current.move.mutateAsync({
          clipId: neonGrid.id,
          fromPackId: peakHour.id,
          toPackId: warmUp.id,
        }),
      ).rejects.toMatchObject({ data: { code: "VJ_CLIP_ALREADY_IN_PACK" } });
    });
    const peakHourClips = renderHook(() => useVjPackClips(peakHour.id), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() =>
      expect(peakHourClips.result.current.data).toBeDefined(),
    );
    expect(
      peakHourClips.result.current.data?.items.some(
        (clip) => clip.id === neonGrid.id,
      ),
    ).toBe(true);
  });

  it("drops a deleted clip from its packs and the library", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({
        packs: useVjPacks(),
        clips: useVjClips(),
        remove: useDeleteVjClip(),
      }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => {
      expect(result.current.packs.data).toBeDefined();
      expect(result.current.clips.data).toBeDefined();
    });
    const warmUp = result.current.packs.data?.find(
      (pack) => pack.name === "Warm-up",
    );
    const neonGrid = result.current.clips.data?.find(
      (clip) => clip.title === "Neon grid",
    );
    expect(warmUp && neonGrid).toBeTruthy();
    if (!warmUp || !neonGrid) return;
    const warmUpClips = renderHook(() => useVjPackClips(warmUp.id), {
      wrapper: createWrapper(queryClient),
    });
    await waitFor(() => expect(warmUpClips.result.current.data).toBeDefined());
    await act(async () => {
      await result.current.remove.mutateAsync({ clipId: neonGrid.id });
    });
    await waitFor(() =>
      expect(
        warmUpClips.result.current.data?.items.some(
          (clip) => clip.id === neonGrid.id,
        ),
      ).toBe(false),
    );
    await waitFor(() =>
      expect(
        result.current.clips.data?.some((clip) => clip.id === neonGrid.id),
      ).toBe(false),
    );
  });

  it("hands out media URLs without caching them", async () => {
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({ packs: useVjPacks(), fetchMedia: useVjPackMediaFetcher() }),
      { wrapper: createWrapper(queryClient) },
    );
    await waitFor(() => expect(result.current.packs.data).toBeDefined());
    const peakHour = result.current.packs.data?.find(
      (pack) => pack.name === "Peak hour",
    );
    expect(peakHour).toBeTruthy();
    if (!peakHour) return;
    const media = await result.current.fetchMedia(peakHour.id, null);
    expect(media.items).toHaveLength(4);
    const cachedKeys = queryClient
      .getQueryCache()
      .findAll({ queryKey: vjKeys.root })
      .map((query) => query.queryKey);
    expect(
      cachedKeys.some((queryKey) =>
        queryKey.some(
          (segment) => typeof segment === "string" && segment === "media",
        ),
      ),
    ).toBe(false);
  });

  it("reports a write in flight", async () => {
    let release: () => void = () => undefined;
    gate.hold = new Promise<void>((resolve) => {
      release = resolve;
    });
    const queryClient = createQueryClient();
    const { result } = renderHook(
      () => ({ isWriting: useVjIsWriting(), create: useCreateVjPack() }),
      { wrapper: createWrapper(queryClient) },
    );
    expect(result.current.isWriting).toBe(false);
    act(() => {
      result.current.create.mutate({ name: "Encore" });
    });
    await waitFor(() => expect(result.current.isWriting).toBe(true));
    await act(async () => {
      release();
      await gate.hold;
    });
    await waitFor(() => expect(result.current.isWriting).toBe(false));
  });
});

describe("useCreateVjPack cache", () => {
  beforeEach(() => {
    gate.hold = null;
    configureVjDemoStore({
      storage: new MemoryStorage(),
      channel: createVjDemoChannelHub().open(),
    });
    resetVjDemoLibrary();
  });

  it("puts a created pack in the cached list as soon as it saves", async () => {
    const queryClient = createQueryClient();
    const seededPack = {
      id: "00000000-0000-4000-8000-0000000000f1",
      name: "Opening",
      position: 0,
      clipCount: 0,
      totalByteSize: 0,
      coverThumbnailUrl: null,
      createdBy: null,
      createdAt: "2026-11-05T00:00:00.000Z",
      updatedAt: "2026-11-05T00:00:00.000Z",
    } satisfies VjPackDTO;
    queryClient.setQueryData(vjKeys.packs(true), [seededPack]);
    const { result } = renderHook(() => useCreateVjPack(), {
      wrapper: createWrapper(queryClient),
    });
    let createdPack: VjPackDTO | undefined;
    await act(async () => {
      createdPack = await result.current.mutateAsync({ name: "Encore" });
    });
    const cached = queryClient.getQueryData<VjPackDTO[]>(vjKeys.packs(true));
    expect(cached?.map((pack) => pack.id)).toEqual([
      seededPack.id,
      createdPack?.id,
    ]);
    expect(queryClient.getQueryState(vjKeys.packs(true))?.isInvalidated).toBe(
      true,
    );
  });
});
