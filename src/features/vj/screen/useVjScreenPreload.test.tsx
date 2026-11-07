import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVjStageState,
  type VjClipDTO,
  type VjLibraryChange,
  type VjPackClipsDTO,
  type VjPackDTO,
  type VjScreenClipStatus,
  type VjScreenPreload,
  type VjStageState,
} from "../../../shared/contracts/vj";
import type { VjClipCache } from "./vjClipCache";
import { VJ_EXTRA_CLIPS_PACK_ID } from "./vjExtraClipMedia";
import type { VjPreloadInput, VjPreloaderDependencies } from "./vjPreloader";
import type { VjScreenRecord } from "./vjScreenRecord";
import {
  useVjScreenPreload,
  type VjScreenPreloadInput,
} from "./useVjScreenPreload";
import {
  useVjScreenStatusReport,
  VJ_STATUS_REPORT_INTERVAL_MS,
  type VjScreenStatusReportInput,
} from "./useVjScreenStatusReport";
import {
  useVjScreenRecordSync,
  type VjScreenRecordSyncInput,
} from "./useVjScreenRecordSync";

interface PreloadRunCall {
  input: unknown;
  dependencies: unknown;
  resolve: (statuses: unknown) => void;
}

const harness = vi.hoisted(() => ({
  packClipsByPackId: new Map<string, unknown>(),
  runs: [] as PreloadRunCall[],
  cache: null as VjClipCache | null,
  invalidate: vi.fn(),
  fetchMedia: vi.fn(),
  getClipsMedia: vi.fn(),
  writeRecord: vi.fn(),
  libraryClips: undefined as VjClipDTO[] | undefined,
  libraryEnabledCalls: [] as boolean[],
}));

vi.mock("../api/useVjPackClips", () => ({
  useVjPackClips: (packId: string | null) => ({
    data: packId === null ? undefined : harness.packClipsByPackId.get(packId),
  }),
}));
vi.mock("../api/useVjClips", () => ({
  useVjClips: (options?: { isEnabled?: boolean }) => {
    const isEnabled = options?.isEnabled ?? true;
    harness.libraryEnabledCalls.push(isEnabled);
    return { data: isEnabled ? harness.libraryClips : undefined };
  },
}));
vi.mock("../api/useVjPackMediaFetcher", () => ({
  useVjPackMediaFetcher: () => harness.fetchMedia,
}));
vi.mock("../api/useVjClipsMediaFetcher", () => ({
  useVjClipsMediaFetcher: () => harness.getClipsMedia,
}));
vi.mock("../api/useInvalidateVjLibrary", () => ({
  useInvalidateVjLibrary: () => harness.invalidate,
}));
vi.mock("./vjClipCache", () => ({
  createVjClipCache: () => harness.cache,
}));
vi.mock("./vjPreloader", () => ({
  preloadVjPack: (input: unknown, dependencies: unknown) =>
    new Promise((resolve) => {
      harness.runs.push({ input, dependencies, resolve });
    }),
}));
vi.mock("./vjScreenRecord", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./vjScreenRecord")>()),
  writeVjScreenRecord: (record: unknown) => {
    harness.writeRecord(record);
  },
}));

const EPOCH = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PACK_WARM = "00000000-0000-4000-8000-0000000000a1";
const PACK_COLD = "00000000-0000-4000-8000-0000000000a2";
const CLIP_GRID = "00000000-0000-4000-8000-0000000000c1";
const CLIP_HAZE = "00000000-0000-4000-8000-0000000000c2";
const CLIP_NEON = "00000000-0000-4000-8000-0000000000c3";
const CLIP_WAVE = "00000000-0000-4000-8000-0000000000c4";
const CLIP_DUST = "00000000-0000-4000-8000-0000000000c5";
const CLIP_STRAY = "00000000-0000-4000-8000-0000000000c9";
const CLIP_LIVE = "00000000-0000-4000-8000-0000000000ca";

const READY: Partial<VjScreenClipStatus> = {};
const QUEUED: Partial<VjScreenClipStatus> = { state: "queued", progress: 0 };
const NETWORK_FAILED: Partial<VjScreenClipStatus> = {
  state: "failed",
  progress: 0,
  failure: "network",
};
const NOT_FOUND: Partial<VjScreenClipStatus> = {
  state: "failed",
  progress: 0,
  failure: "not_found",
};

function packOf(
  packId: string,
  updatedAt = "2026-11-05T10:00:00.000Z",
): VjPackDTO {
  return {
    id: packId,
    name: "Warm up",
    position: 0,
    clipCount: 0,
    totalByteSize: 0,
    coverThumbnailUrl: null,
    createdBy: null,
    createdAt: "2026-11-05T10:00:00.000Z",
    updatedAt,
    event: null,
  };
}

function clipOf(clipId: string, packId: string): VjClipDTO {
  return {
    id: clipId,
    title: "Loop",
    mediaKind: "gif",
    mimeType: "image/gif",
    byteSize: 1000,
    width: 640,
    height: 360,
    durationMs: null,
    fitMode: "fill",
    thumbnailUrl: `/files/thumb/${clipId}`,
    mediaUrl: `/files/media/${clipId}`,
    packIds: [packId],
    packCount: 1,
    createdBy: null,
    createdAt: "2026-11-05T10:00:00.000Z",
    updatedAt: "2026-11-05T10:00:00.000Z",
    isFavorite: false,
    defaultSpeed: 1,
    loopInMs: null,
    loopOutMs: null,
    loopMode: "loop",
    previewUrl: null,
  };
}

/** A v2 record whose extra clips are empty and whose event card and clock offset are null. */
function recordOf(
  changes: Pick<VjScreenRecord, "savedAt" | "state" | "pack" | "clips"> &
    Partial<VjScreenRecord>,
): VjScreenRecord {
  return {
    version: 2,
    liveClip: null,
    extraClips: [],
    eventCard: null,
    clockOffsetMs: null,
    ...changes,
  };
}

/** A library change with no scene, set list or event part. */
function changeOf(
  changes: Pick<VjLibraryChange, "kind" | "packId" | "clipId" | "packIds">,
): VjLibraryChange {
  return {
    sceneId: null,
    setlistId: null,
    setlistIds: [],
    eventId: null,
    ...changes,
  };
}

function servePack(packId: string, clipIds: readonly string[]): void {
  const items = clipIds.map((clipId) => clipOf(clipId, packId));
  const answer: VjPackClipsDTO = { pack: packOf(packId), items };
  harness.packClipsByPackId.set(packId, answer);
}

interface FakeClipCache extends VjClipCache {
  storedIds: Set<string>;
  removedIds: string[];
  keptSets: ReadonlySet<string>[];
}

function createFakeClipCache(initialClipIds: readonly string[]): FakeClipCache {
  const storedIds = new Set(initialClipIds);
  const removedIds: string[] = [];
  const keptSets: ReadonlySet<string>[] = [];
  return {
    storedIds,
    removedIds,
    keptSets,
    isPersistent: false,
    has: (clipId) => Promise.resolve(storedIds.has(clipId)),
    put: (clipId) => {
      storedIds.add(clipId);
      return Promise.resolve();
    },
    readObjectUrl: () => Promise.resolve(null),
    remove: (clipId) => {
      removedIds.push(clipId);
      storedIds.delete(clipId);
      return Promise.resolve();
    },
    keepOnly: (clipIds) => {
      keptSets.push(new Set(clipIds));
      let evictedCount = 0;
      for (const storedId of [...storedIds]) {
        if (clipIds.has(storedId)) continue;
        storedIds.delete(storedId);
        evictedCount += 1;
      }
      return Promise.resolve(evictedCount);
    },
    listClipIds: () => Promise.resolve([...storedIds]),
  };
}

function createLibraryStage(state: VjStageState | null = null) {
  const listeners = new Set<(change: VjLibraryChange) => void>();
  return {
    state,
    subscribeLibrary: (listener: (change: VjLibraryChange) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    emit: (change: VjLibraryChange) => {
      for (const listener of [...listeners]) listener(change);
    },
  };
}

interface TypedRun {
  input: VjPreloadInput;
  dependencies: VjPreloaderDependencies;
  resolve: (statuses: VjScreenClipStatus[]) => void;
}

function runAt(runIndex: number): TypedRun {
  const run = harness.runs[runIndex];
  if (run === undefined) throw new Error(`no preload run ${runIndex}`);
  return run as TypedRun;
}

function runClipIds(runIndex: number): string[] {
  return runAt(runIndex).input.clips.map((clip) => clip.clipId);
}

async function flushPromises(): Promise<void> {
  await act(async () => {
    for (let tickIndex = 0; tickIndex < 5; tickIndex += 1) {
      await Promise.resolve();
    }
  });
}

/** Every clip of the run ends ready unless the outcome says otherwise. */
async function settleRun(
  runIndex: number,
  outcome: Record<string, Partial<VjScreenClipStatus>> = {},
): Promise<void> {
  const run = runAt(runIndex);
  const statuses: VjScreenClipStatus[] = run.input.clips.map((clip) => ({
    clipId: clip.clipId,
    state: "ready",
    progress: 1,
    failure: null,
    ...(outcome[clip.clipId] ?? READY),
  }));
  await act(async () => {
    run.input.onUpdate(statuses);
    run.resolve(statuses);
    await Promise.resolve();
  });
  await flushPromises();
}

function stageStateOf(
  revision: number,
  patch: Partial<VjStageState> = {},
): VjStageState {
  return { ...createVjStageState(EPOCH, 1_000), revision, ...patch };
}

function renderPreload(initialProps: VjScreenPreloadInput) {
  return renderHook(
    (props: VjScreenPreloadInput) => useVjScreenPreload(props),
    { initialProps },
  );
}

beforeEach(() => {
  harness.packClipsByPackId.clear();
  harness.runs.length = 0;
  harness.invalidate.mockReset();
  harness.fetchMedia.mockReset();
  harness.getClipsMedia.mockReset();
  harness.writeRecord.mockReset();
  harness.libraryClips = undefined;
  harness.libraryEnabledCalls.length = 0;
  harness.cache = createFakeClipCache([]);
});

afterEach(() => {
  vi.useRealTimers();
});

function fakeCache(): FakeClipCache {
  return harness.cache as FakeClipCache;
}

describe("useVjScreenPreload", () => {
  it("preloads the active pack and lists the ready clips in pack order", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE, CLIP_NEON]);
    const stage = createLibraryStage();
    const { result } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
    });

    expect(harness.runs).toHaveLength(1);
    expect(runAt(0).input.packId).toBe(PACK_WARM);
    expect(runClipIds(0)).toEqual([CLIP_GRID, CLIP_HAZE, CLIP_NEON]);
    expect(result.current.readyClipIds).toEqual([]);
    expect(result.current.statuses.map((status) => status.state)).toEqual([
      "queued",
      "queued",
      "queued",
    ]);

    await settleRun(0, { [CLIP_HAZE]: NETWORK_FAILED });

    expect(result.current.pack?.id).toBe(PACK_WARM);
    expect(result.current.readyClipIds).toEqual([CLIP_GRID, CLIP_NEON]);
    expect(result.current.statuses.map((status) => status.clipId)).toEqual([
      CLIP_GRID,
      CLIP_HAZE,
      CLIP_NEON,
    ]);
    expect(result.current.statuses[1]?.failure).toBe("network");
  });

  it("keeps playing the loaded clips while a new pack preloads", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE]);
    servePack(PACK_COLD, [CLIP_NEON]);
    harness.cache = createFakeClipCache([CLIP_GRID, CLIP_HAZE]);
    const stage = createLibraryStage();
    const { result, rerender } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
    });
    await settleRun(0);
    const keepCountBeforeSwitch = fakeCache().keptSets.length;

    rerender({ packId: PACK_COLD, record: null, stage });

    expect(harness.runs).toHaveLength(2);
    expect(runClipIds(1)).toEqual([CLIP_NEON]);
    expect(result.current.clips.map((clip) => clip.id)).toEqual([CLIP_NEON]);
    expect(result.current.clipById(CLIP_GRID)?.id).toBe(CLIP_GRID);
    expect(fakeCache().storedIds.has(CLIP_GRID)).toBe(true);
    expect(fakeCache().storedIds.has(CLIP_HAZE)).toBe(true);
    expect(fakeCache().keptSets).toHaveLength(keepCountBeforeSwitch);
  });

  it("keeps the previous pack cached and evicts the rest once the new pack is ready", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE]);
    servePack(PACK_COLD, [CLIP_NEON]);
    harness.cache = createFakeClipCache([
      CLIP_GRID,
      CLIP_HAZE,
      CLIP_STRAY,
      CLIP_LIVE,
    ]);
    const stage = createLibraryStage(
      stageStateOf(3, { activePackId: PACK_COLD, liveClipId: CLIP_LIVE }),
    );
    const { rerender } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
    });

    rerender({ packId: PACK_COLD, record: null, stage });
    expect(runAt(0).input.signal.aborted).toBe(true);
    expect(fakeCache().storedIds.has(CLIP_STRAY)).toBe(true);

    fakeCache().storedIds.add(CLIP_NEON);
    await settleRun(1);

    expect([...fakeCache().storedIds].sort()).toEqual(
      [CLIP_GRID, CLIP_HAZE, CLIP_NEON, CLIP_LIVE].sort(),
    );
    expect(fakeCache().storedIds.has(CLIP_STRAY)).toBe(false);
  });

  it("uses the saved clip list on an offline start", async () => {
    const savedClips = [
      clipOf(CLIP_GRID, PACK_WARM),
      clipOf(CLIP_HAZE, PACK_WARM),
    ];
    const record = recordOf({
      savedAt: 5_000,
      state: stageStateOf(7, { activePackId: PACK_WARM }),
      pack: packOf(PACK_WARM),
      clips: savedClips,
    });
    const stage = createLibraryStage();
    const { result } = renderPreload({ packId: PACK_WARM, record, stage });

    expect(result.current.pack?.id).toBe(PACK_WARM);
    expect(result.current.clips.map((clip) => clip.id)).toEqual([
      CLIP_GRID,
      CLIP_HAZE,
    ]);
    expect(runClipIds(0)).toEqual([CLIP_GRID, CLIP_HAZE]);

    await settleRun(0, { [CLIP_HAZE]: QUEUED });

    expect(result.current.readyClipIds).toEqual([CLIP_GRID]);
    expect(result.current.clipById(CLIP_HAZE)?.id).toBe(CLIP_HAZE);
    expect(fakeCache().keptSets).toHaveLength(0);
  });

  it("retries queued and network-failed clips when the connection is back", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE, CLIP_NEON, CLIP_WAVE]);
    const stage = createLibraryStage();
    renderPreload({ packId: PACK_WARM, record: null, stage });
    await settleRun(0, {
      [CLIP_HAZE]: NETWORK_FAILED,
      [CLIP_NEON]: QUEUED,
      [CLIP_WAVE]: NOT_FOUND,
    });
    expect(harness.runs).toHaveLength(1);

    act(() => {
      window.dispatchEvent(new Event("online"));
    });

    expect(harness.runs).toHaveLength(2);
    expect(runAt(1).input.packId).toBe(PACK_WARM);
    expect(runClipIds(1)).toEqual([CLIP_HAZE, CLIP_NEON]);
  });

  it("refetches when a library change names the active pack and drops a deleted clip from the cache", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE]);
    harness.cache = createFakeClipCache([CLIP_GRID, CLIP_HAZE]);
    const stage = createLibraryStage();
    const { result, rerender } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
    });
    await settleRun(0);
    expect(result.current.readyClipIds).toEqual([CLIP_GRID, CLIP_HAZE]);

    const otherPackChange = changeOf({
      kind: "pack_clips_changed",
      packId: PACK_COLD,
      clipId: null,
      packIds: [PACK_COLD],
    });
    act(() => stage.emit(otherPackChange));
    expect(harness.invalidate).not.toHaveBeenCalled();

    const renameOfActivePack = changeOf({
      kind: "pack_renamed",
      packId: PACK_WARM,
      clipId: null,
      packIds: [],
    });
    act(() => stage.emit(renameOfActivePack));
    expect(harness.invalidate).toHaveBeenCalledTimes(1);
    expect(harness.invalidate).toHaveBeenLastCalledWith(renameOfActivePack);

    const deletion = changeOf({
      kind: "clip_deleted",
      packId: null,
      clipId: CLIP_HAZE,
      packIds: [PACK_WARM],
    });
    act(() => stage.emit(deletion));
    await flushPromises();

    expect(harness.invalidate).toHaveBeenCalledWith(deletion);
    expect(fakeCache().removedIds).toContain(CLIP_HAZE);
    expect(fakeCache().storedIds.has(CLIP_HAZE)).toBe(false);
    expect(result.current.clips.map((clip) => clip.id)).toEqual([CLIP_GRID]);
    expect(result.current.readyClipIds).toEqual([CLIP_GRID]);
    expect(result.current.clipById(CLIP_HAZE)).toBeNull();

    servePack(PACK_WARM, [CLIP_GRID, CLIP_DUST]);
    rerender({ packId: PACK_WARM, record: null, stage });

    const lastRunIndex = harness.runs.length - 1;
    expect(runClipIds(lastRunIndex)).toEqual([CLIP_GRID, CLIP_DUST]);
  });
});

describe("useVjScreenPreload progress", () => {
  it("publishes progress in whole tenths and keeps the lists stable in between", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE]);
    const stage = createLibraryStage();
    let renderCount = 0;
    const progressProps: VjScreenPreloadInput = {
      packId: PACK_WARM,
      record: null,
      stage,
    };
    const { result } = renderHook(
      (props: VjScreenPreloadInput) => {
        renderCount += 1;
        return useVjScreenPreload(props);
      },
      { initialProps: progressProps },
    );
    const run = runAt(0);
    const loadingAt = (progress: number): VjScreenClipStatus[] => [
      { clipId: CLIP_GRID, state: "ready", progress: 1, failure: null },
      { clipId: CLIP_HAZE, state: "loading", progress, failure: null },
    ];

    act(() => run.input.onUpdate(loadingAt(0.11)));
    const statusesInStep = result.current.statuses;
    const readyInStep = result.current.readyClipIds;
    const rendersInStep = renderCount;
    expect(statusesInStep[1]?.progress).toBe(0.11);
    expect(readyInStep).toEqual([CLIP_GRID]);

    act(() => run.input.onUpdate(loadingAt(0.12)));
    act(() => run.input.onUpdate(loadingAt(0.15)));
    act(() => run.input.onUpdate(loadingAt(0.19)));

    expect(renderCount).toBe(rendersInStep);
    expect(result.current.statuses).toBe(statusesInStep);
    expect(result.current.readyClipIds).toBe(readyInStep);

    act(() => run.input.onUpdate(loadingAt(0.21)));

    expect(result.current.statuses).not.toBe(statusesInStep);
    expect(result.current.statuses[1]?.progress).toBe(0.21);
    expect(result.current.readyClipIds).toBe(readyInStep);

    await flushPromises();
  });
});

describe("useVjScreenStatusReport", () => {
  function statusesWithProgress(progress: number): VjScreenClipStatus[] {
    return [
      { clipId: CLIP_GRID, state: "ready", progress: 1, failure: null },
      { clipId: CLIP_HAZE, state: "loading", progress, failure: null },
    ];
  }

  it("sends the status once on connect and then at most twice a second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(10_000);
    const sentAt: number[] = [];
    const sentReports: { isFullscreen: boolean; preload: VjScreenPreload }[] =
      [];
    const sendStatus = vi.fn(
      (report: { isFullscreen: boolean; preload: VjScreenPreload }) => {
        sentAt.push(Date.now());
        sentReports.push(report);
      },
    );
    const propsOf = (
      isConnected: boolean,
      progress: number,
    ): VjScreenStatusReportInput => ({
      stage: { sendStatus, isConnected },
      isFullscreen: false,
      packId: PACK_WARM,
      statuses: statusesWithProgress(progress),
    });
    const { rerender } = renderHook(
      (props: VjScreenStatusReportInput) => useVjScreenStatusReport(props),
      { initialProps: propsOf(false, 0) },
    );
    expect(sendStatus).not.toHaveBeenCalled();

    rerender(propsOf(true, 0));
    expect(sendStatus).toHaveBeenCalledTimes(1);
    expect(sentReports[0]?.preload.packId).toBe(PACK_WARM);
    expect(sentReports[0]?.preload.clips).toHaveLength(2);

    rerender(propsOf(true, 0));
    act(() => {
      vi.advanceTimersByTime(VJ_STATUS_REPORT_INTERVAL_MS * 2);
    });
    expect(sendStatus).toHaveBeenCalledTimes(1);

    for (let stepIndex = 1; stepIndex <= 40; stepIndex += 1) {
      rerender(propsOf(true, stepIndex / 100));
      act(() => {
        vi.advanceTimersByTime(50);
      });
    }
    act(() => {
      vi.advanceTimersByTime(VJ_STATUS_REPORT_INTERVAL_MS);
    });

    expect(sendStatus.mock.calls.length).toBeGreaterThan(2);
    expect(sendStatus.mock.calls.length).toBeLessThanOrEqual(6);
    for (let sendIndex = 1; sendIndex < sentAt.length; sendIndex += 1) {
      const gapMs = (sentAt[sendIndex] ?? 0) - (sentAt[sendIndex - 1] ?? 0);
      expect(gapMs).toBeGreaterThanOrEqual(VJ_STATUS_REPORT_INTERVAL_MS);
    }
    expect(sentReports.at(-1)?.preload.clips[1]?.progress).toBe(0.4);

    const countBeforeReconnect = sendStatus.mock.calls.length;
    rerender(propsOf(false, 0.4));
    rerender(propsOf(true, 0.4));
    expect(sendStatus).toHaveBeenCalledTimes(countBeforeReconnect + 1);
  });
});

describe("useVjScreenRecordSync", () => {
  it("writes the record after every applied state and pack refetch", () => {
    vi.useFakeTimers();
    vi.setSystemTime(20_000);
    const firstClips = [clipOf(CLIP_GRID, PACK_WARM)];
    const firstPack = packOf(PACK_WARM);
    const firstState = stageStateOf(1, { activePackId: PACK_WARM });
    const initialProps: VjScreenRecordSyncInput = {
      state: null,
      pack: firstPack,
      clips: firstClips,
      liveClip: null,
    };
    const { rerender } = renderHook(
      (props: VjScreenRecordSyncInput) => useVjScreenRecordSync(props),
      { initialProps },
    );
    expect(harness.writeRecord).not.toHaveBeenCalled();

    rerender({
      state: firstState,
      pack: firstPack,
      clips: firstClips,
      liveClip: null,
    });
    expect(harness.writeRecord).toHaveBeenCalledTimes(1);
    expect(harness.writeRecord).toHaveBeenLastCalledWith({
      version: 2,
      savedAt: 20_000,
      state: firstState,
      pack: firstPack,
      clips: firstClips,
      liveClip: null,
      extraClips: [],
      eventCard: null,
      clockOffsetMs: null,
    });

    rerender({
      state: firstState,
      pack: firstPack,
      clips: firstClips,
      liveClip: null,
    });
    expect(harness.writeRecord).toHaveBeenCalledTimes(1);

    const secondState = stageStateOf(2, { activePackId: PACK_WARM });
    rerender({
      state: secondState,
      pack: firstPack,
      clips: firstClips,
      liveClip: null,
    });
    expect(harness.writeRecord).toHaveBeenCalledTimes(2);

    const refetchedPack = packOf(PACK_WARM, "2026-11-05T11:00:00.000Z");
    const refetchedClips = [
      clipOf(CLIP_GRID, PACK_WARM),
      clipOf(CLIP_HAZE, PACK_WARM),
    ];
    rerender({
      state: secondState,
      pack: refetchedPack,
      clips: refetchedClips,
      liveClip: null,
    });
    expect(harness.writeRecord).toHaveBeenCalledTimes(3);
    expect(harness.writeRecord).toHaveBeenLastCalledWith({
      version: 2,
      savedAt: 20_000,
      state: secondState,
      pack: refetchedPack,
      clips: refetchedClips,
      liveClip: null,
      extraClips: [],
      eventCard: null,
      clockOffsetMs: null,
    });
  });

  it("keeps the saved record while the new pack's clips are still loading", () => {
    const savedPack = packOf(PACK_WARM);
    const savedClips = [clipOf(CLIP_GRID, PACK_WARM)];
    const warmState = stageStateOf(4, { activePackId: PACK_WARM });
    const initialProps: VjScreenRecordSyncInput = {
      state: warmState,
      pack: savedPack,
      clips: savedClips,
      liveClip: null,
    };
    const { rerender } = renderHook(
      (props: VjScreenRecordSyncInput) => useVjScreenRecordSync(props),
      { initialProps },
    );
    expect(harness.writeRecord).toHaveBeenCalledTimes(1);

    const coldState = stageStateOf(5, { activePackId: PACK_COLD });
    rerender({ state: coldState, pack: null, clips: [], liveClip: null });
    expect(harness.writeRecord).toHaveBeenCalledTimes(1);

    const coldPack = packOf(PACK_COLD);
    const coldClips = [clipOf(CLIP_NEON, PACK_COLD)];
    rerender({
      state: coldState,
      pack: coldPack,
      clips: coldClips,
      liveClip: null,
    });
    expect(harness.writeRecord).toHaveBeenCalledTimes(2);
    expect(harness.writeRecord).toHaveBeenLastCalledWith(
      expect.objectContaining({
        state: coldState,
        pack: coldPack,
        clips: coldClips,
      }),
    );

    const clearedState = stageStateOf(6, { activePackId: null });
    rerender({ state: clearedState, pack: null, clips: [], liveClip: null });
    expect(harness.writeRecord).toHaveBeenCalledTimes(3);
  });

  it("saves the strobe off and the live clip's entry from another pack", () => {
    const coldPack = packOf(PACK_COLD);
    const coldClips = [clipOf(CLIP_NEON, PACK_COLD)];
    const warmLiveClip = clipOf(CLIP_GRID, PACK_WARM);
    const strobingState = stageStateOf(8, {
      activePackId: PACK_COLD,
      liveClipId: CLIP_GRID,
      effects: {
        ...createVjStageState(EPOCH, 1_000).effects,
        isStrobing: true,
        strobeStartedAt: 900,
      },
    });
    const initialProps: VjScreenRecordSyncInput = {
      state: strobingState,
      pack: coldPack,
      clips: coldClips,
      liveClip: warmLiveClip,
    };
    const { rerender } = renderHook(
      (props: VjScreenRecordSyncInput) => useVjScreenRecordSync(props),
      { initialProps },
    );

    expect(harness.writeRecord).toHaveBeenCalledTimes(1);
    const savedRecord = harness.writeRecord.mock.calls[0]?.[0] as
      VjScreenRecord | undefined;
    expect(savedRecord?.state.effects.isStrobing).toBe(false);
    expect(savedRecord?.state.effects.strobeStartedAt).toBeNull();
    expect(savedRecord?.state.liveClipId).toBe(CLIP_GRID);
    expect(savedRecord?.liveClip).toEqual(warmLiveClip);

    // An entry for another clip than the live one is never saved as it.
    const nextState = stageStateOf(9, {
      activePackId: PACK_COLD,
      liveClipId: CLIP_NEON,
    });
    rerender({ ...initialProps, state: nextState });
    const nextRecord = harness.writeRecord.mock.calls[1]?.[0] as
      VjScreenRecord | undefined;
    expect(nextRecord?.liveClip).toBeNull();
  });
});

describe("useVjScreenPreload live clip and reattach", () => {
  it("resolves a live clip outside the active pack from the record after a reload", () => {
    const outsideClip = clipOf(CLIP_LIVE, PACK_WARM);
    const record = recordOf({
      savedAt: 5_000,
      state: stageStateOf(7, {
        activePackId: PACK_COLD,
        liveClipId: CLIP_LIVE,
      }),
      pack: packOf(PACK_COLD),
      clips: [clipOf(CLIP_NEON, PACK_COLD)],
      liveClip: outsideClip,
    });
    const stage = createLibraryStage();
    const { result } = renderPreload({ packId: PACK_COLD, record, stage });

    expect(result.current.clipById(CLIP_LIVE)).toEqual(outsideClip);
    expect(harness.libraryEnabledCalls.every((isEnabled) => !isEnabled)).toBe(
      true,
    );
  });

  it("falls back to the library list for a live clip no local list holds", () => {
    servePack(PACK_COLD, [CLIP_NEON]);
    const libraryClip = clipOf(CLIP_LIVE, PACK_WARM);
    harness.libraryClips = [clipOf(CLIP_DUST, PACK_WARM), libraryClip];
    const stage = createLibraryStage(
      stageStateOf(3, { activePackId: PACK_COLD, liveClipId: CLIP_LIVE }),
    );
    const { result } = renderPreload({
      packId: PACK_COLD,
      record: null,
      stage,
    });

    expect(harness.libraryEnabledCalls.at(-1)).toBe(true);
    expect(result.current.clipById(CLIP_LIVE)).toEqual(libraryClip);
    expect(result.current.clipById(CLIP_STRAY)).toBeNull();
  });

  it("retries what never arrived when the socket attaches again", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE, CLIP_NEON]);
    const stage = { ...createLibraryStage(), isConnected: false };
    const { rerender } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
    });
    await settleRun(0, {
      [CLIP_HAZE]: NETWORK_FAILED,
      [CLIP_NEON]: {
        state: "failed",
        progress: 0,
        failure: "url_expired",
      },
    });
    expect(harness.runs).toHaveLength(1);

    rerender({
      packId: PACK_WARM,
      record: null,
      stage: { ...stage, isConnected: true },
    });

    expect(harness.runs).toHaveLength(2);
    expect(runClipIds(1)).toEqual([CLIP_HAZE, CLIP_NEON]);
  });

  it("leaves a run still going alone when the socket attaches", () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE]);
    const stage = { ...createLibraryStage(), isConnected: false };
    const { rerender } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
    });
    expect(harness.runs).toHaveLength(1);

    rerender({
      packId: PACK_WARM,
      record: null,
      stage: { ...stage, isConnected: true },
    });

    expect(harness.runs).toHaveLength(1);
    expect(runAt(0).input.signal.aborted).toBe(false);
  });
});

describe("useVjScreenPreload cache retention", () => {
  const SCREEN_ID = "11111111-1111-4111-8111-111111111111";

  function mixStateOf(revision: number, mixClipId: string): VjStageState {
    const baseState = stageStateOf(revision, { activePackId: PACK_WARM });
    return { ...baseState, mix: { ...baseState.mix, clipId: mixClipId } };
  }

  it("keeps a mix clip from another pack in the cache and loads it through the clips media fetcher", async () => {
    servePack(PACK_WARM, [CLIP_GRID, CLIP_HAZE]);
    harness.libraryClips = [
      clipOf(CLIP_DUST, PACK_COLD),
      clipOf(CLIP_WAVE, PACK_COLD),
    ];
    harness.getClipsMedia.mockResolvedValue({ items: [] });
    harness.cache = createFakeClipCache([CLIP_STRAY]);
    const stage = createLibraryStage(mixStateOf(2, CLIP_DUST));
    const { result } = renderPreload({
      packId: PACK_WARM,
      record: null,
      stage,
      screenId: SCREEN_ID,
      setlistSceneClipIds: [CLIP_WAVE],
    });

    expect(harness.runs).toHaveLength(2);
    expect(runAt(0).input.packId).toBe(PACK_WARM);
    expect(runAt(1).input.packId).toBe(VJ_EXTRA_CLIPS_PACK_ID);
    expect(runClipIds(1)).toEqual([CLIP_DUST, CLIP_WAVE]);
    expect(result.current.extraClips.map((clip) => clip.id)).toEqual([
      CLIP_DUST,
      CLIP_WAVE,
    ]);

    await runAt(1).dependencies.fetchMedia(VJ_EXTRA_CLIPS_PACK_ID, null);
    expect(harness.getClipsMedia).toHaveBeenCalledWith(
      [CLIP_DUST, CLIP_WAVE],
      undefined,
    );
    expect(harness.fetchMedia).not.toHaveBeenCalled();

    await settleRun(1);
    // The pack's statuses never name the extra clips; the targets may play them.
    expect(result.current.statuses.map((status) => status.clipId)).toEqual([
      CLIP_GRID,
      CLIP_HAZE,
    ]);
    expect(result.current.readyClipIds).toEqual([]);
    expect(result.current.playableClipIds).toEqual([CLIP_DUST, CLIP_WAVE]);
    expect(result.current.clipById(CLIP_DUST)?.id).toBe(CLIP_DUST);

    fakeCache().storedIds.add(CLIP_DUST);
    fakeCache().storedIds.add(CLIP_WAVE);
    await settleRun(0);
    expect(fakeCache().keptSets.at(-1)).toEqual(
      new Set([CLIP_GRID, CLIP_HAZE, CLIP_DUST, CLIP_WAVE]),
    );
    expect(fakeCache().storedIds.has(CLIP_DUST)).toBe(true);
    expect(fakeCache().storedIds.has(CLIP_STRAY)).toBe(false);
  });

  it("plays the record's extra clips on an offline start without asking the library", () => {
    const dustClip = clipOf(CLIP_DUST, PACK_COLD);
    const record = recordOf({
      savedAt: 5_000,
      state: mixStateOf(7, CLIP_DUST),
      pack: packOf(PACK_WARM),
      clips: [clipOf(CLIP_GRID, PACK_WARM)],
      extraClips: [dustClip],
    });
    const stage = createLibraryStage();
    const { result } = renderPreload({
      packId: PACK_WARM,
      record,
      stage,
      screenId: SCREEN_ID,
    });

    expect(result.current.extraClips).toEqual([dustClip]);
    expect(runClipIds(1)).toEqual([CLIP_DUST]);
    expect(harness.libraryEnabledCalls.every((isEnabled) => !isEnabled)).toBe(
      true,
    );
  });
});

describe("useVjScreenRecordSync v2 fields", () => {
  it("writes the extra clips, the event card and the clock offset", () => {
    const extraClip = clipOf(CLIP_DUST, PACK_COLD);
    const eventCard = {
      eventId: "event-1",
      title: "Friday dance",
      startAt: "2026-11-07T21:00:00.000Z",
      endAt: null,
      timezone: "Europe/Lisbon",
      area: null,
      isOnline: false,
      publicUrl: null,
    };
    const baseProps: VjScreenRecordSyncInput = {
      state: stageStateOf(1, { activePackId: PACK_WARM }),
      pack: packOf(PACK_WARM),
      clips: [clipOf(CLIP_GRID, PACK_WARM)],
      liveClip: null,
      extraClips: [extraClip],
      eventCard,
      clockOffsetMs: 120,
    };
    const { rerender } = renderHook(
      (props: VjScreenRecordSyncInput) => useVjScreenRecordSync(props),
      { initialProps: baseProps },
    );
    expect(harness.writeRecord).toHaveBeenLastCalledWith(
      expect.objectContaining({
        version: 2,
        extraClips: [extraClip],
        eventCard,
        clockOffsetMs: 120,
      }),
    );

    // A clock sample that barely moves the offset writes nothing.
    rerender({ ...baseProps, clockOffsetMs: 130 });
    expect(harness.writeRecord).toHaveBeenCalledTimes(1);

    rerender({ ...baseProps, clockOffsetMs: 160 });
    expect(harness.writeRecord).toHaveBeenCalledTimes(2);
    expect(harness.writeRecord).toHaveBeenLastCalledWith(
      expect.objectContaining({ clockOffsetMs: 160 }),
    );
  });
});
