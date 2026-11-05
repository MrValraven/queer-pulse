/**
 * Keeps the projector's clip cache filled for the active pack (contract 5.4,
 * 6.10, 8.5). A pack change starts a new preload and aborts the old one while
 * the loaded clips keep playing; once the new pack has settled, the cache keeps
 * the active pack, the previous pack and the live clip. Coming back online,
 * and the socket attaching again while no run is going, retry what never
 * arrived; a library change naming the active pack refetches its clips, and a
 * deleted clip leaves the cache. Nothing here logs.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type {
  VjClipDTO,
  VjLibraryChange,
  VjPackDTO,
  VjScreenClipStatus,
  VjStageState,
} from "../../../shared/contracts/vj";
import { useInvalidateVjLibrary } from "../api/useInvalidateVjLibrary";
import { useVjClips } from "../api/useVjClips";
import { useVjPackClips } from "../api/useVjPackClips";
import {
  useVjPackMediaFetcher,
  type VjPackMediaFetcher,
} from "../api/useVjPackMediaFetcher";
import type { VjStageController } from "../live/useVjStage";
import { createVjClipCache, type VjClipCache } from "./vjClipCache";
import { preloadVjPack } from "./vjPreloader";
import type { VjScreenRecord } from "./vjScreenRecord";

export interface VjScreenPreloadResult {
  pack: VjPackDTO | null;
  /** The active pack, from the query or, offline, from the record. */
  clips: readonly VjClipDTO[];
  /** Pack order. */
  statuses: readonly VjScreenClipStatus[];
  /** Pack order. */
  readyClipIds: readonly string[];
  cache: VjClipCache;
  /** Active pack, previous pack, the record, the record's live clip, then the library. */
  clipById: (clipId: string) => VjClipDTO | null;
  /** Status failed decode_failed, entry removed from the cache. */
  markDecodeFailed: (clipId: string) => void;
}

export interface VjScreenPreloadInput {
  packId: string | null;
  record: VjScreenRecord | null;
  /**
   * The full controller also fits: its state names the live clip the cache
   * keeps, and a reattach (isConnected turning true) retries what never arrived.
   */
  stage: Pick<VjStageController, "subscribeLibrary"> & {
    state?: VjStageState | null;
    isConnected?: boolean;
  };
}

/** Progress reaches the page in whole tenths, so a playing screen re-renders a few times per clip. */
export const VJ_PRELOAD_PROGRESS_STEPS = 10;

const NO_CLIPS: readonly VjClipDTO[] = [];
const NO_CLIP_IDS: ReadonlySet<string> = new Set<string>();

interface VjPackMemory {
  packId: string | null;
  clips: readonly VjClipDTO[];
  previousClips: readonly VjClipDTO[];
}

/** What the preload effects read without re-running on every render. */
interface VjPreloadLatest {
  packId: string | null;
  clips: readonly VjClipDTO[];
  previousClips: readonly VjClipDTO[];
  liveClipId: string | null;
}

interface VjPreloadRunner {
  cache: VjClipCache;
  fetchMedia: VjPackMediaFetcher;
  latestRef: RefObject<VjPreloadLatest>;
  statusByIdRef: RefObject<Map<string, VjScreenClipStatus>>;
  /** The statuses the page last received. */
  publishedByIdRef: RefObject<Map<string, VjScreenClipStatus>>;
  decodeFailedIdsRef: RefObject<Set<string>>;
  runControllerRef: RefObject<AbortController | null>;
  publishStatuses: () => void;
}

function queuedStatusOf(clipId: string): VjScreenClipStatus {
  return { clipId, state: "queued", progress: 0, failure: null };
}

function decodeFailedStatusOf(clipId: string): VjScreenClipStatus {
  return { clipId, state: "failed", progress: 0, failure: "decode_failed" };
}

function isSettled(status: VjScreenClipStatus): boolean {
  return status.state === "ready" || status.state === "failed";
}

function isRetryable(status: VjScreenClipStatus | undefined): boolean {
  if (status === undefined) return true;
  if (status.state === "failed") {
    // A fresh media request mints new links, so an expired one is worth another try.
    return status.failure === "network" || status.failure === "url_expired";
  }
  return status.state !== "ready";
}

function progressStepOf(progress: number): number {
  return Math.floor(progress * VJ_PRELOAD_PROGRESS_STEPS);
}

/** True when the page would show something new: a state, a failure or a whole progress step. */
function isVisibleChange(
  published: VjScreenClipStatus | undefined,
  next: VjScreenClipStatus,
): boolean {
  if (published === undefined) return true;
  return (
    published.state !== next.state ||
    published.failure !== next.failure ||
    progressStepOf(published.progress) !== progressStepOf(next.progress)
  );
}

function isSameStatus(
  first: VjScreenClipStatus,
  second: VjScreenClipStatus,
): boolean {
  return (
    first.clipId === second.clipId &&
    first.state === second.state &&
    first.failure === second.failure &&
    first.progress === second.progress
  );
}

/** Stores the updates and publishes them only when one of them is visible. */
function storeStatuses(
  runner: VjPreloadRunner,
  updates: readonly VjScreenClipStatus[],
): void {
  let hasVisibleChange = false;
  updates.forEach((status) => {
    runner.statusByIdRef.current.set(status.clipId, status);
    if (
      isVisibleChange(
        runner.publishedByIdRef.current.get(status.clipId),
        status,
      )
    ) {
      hasVisibleChange = true;
    }
  });
  if (hasVisibleChange) runner.publishStatuses();
}

function clipSignatureOf(clips: readonly VjClipDTO[]): string {
  return clips.map((clip) => `${clip.id}:${clip.byteSize}`).join("|");
}

/** The active clip list, or null while it is still unknown (the query is loading and the record holds another pack). */
function knownClipsOf(
  packId: string | null,
  queryData: { pack: VjPackDTO; items: VjClipDTO[] } | undefined,
  record: VjScreenRecord | null,
): { pack: VjPackDTO; clips: readonly VjClipDTO[] } | null {
  if (packId === null) return null;
  if (queryData !== undefined && queryData.pack.id === packId) {
    return { pack: queryData.pack, clips: queryData.items };
  }
  if (record !== null && record.pack !== null && record.pack.id === packId) {
    return { pack: record.pack, clips: record.clips };
  }
  return null;
}

/** Evicts every entry outside the active pack, the previous pack and the live clip once the active pack has settled. */
function evictWhenSettled(runner: VjPreloadRunner): void {
  const latest = runner.latestRef.current;
  const isEverySettled = latest.clips.every((clip) => {
    if (runner.decodeFailedIdsRef.current.has(clip.id)) return true;
    const status = runner.statusByIdRef.current.get(clip.id);
    return status !== undefined && isSettled(status);
  });
  if (!isEverySettled) return;
  const keptClipIds = new Set<string>();
  latest.clips.forEach((clip) => keptClipIds.add(clip.id));
  latest.previousClips.forEach((clip) => keptClipIds.add(clip.id));
  if (latest.liveClipId !== null) keptClipIds.add(latest.liveClipId);
  void runner.cache.keepOnly(keptClipIds).catch(() => undefined);
}

/** Starts one preload run over the given clips, aborting the one in flight. */
function startPreloadRun(
  runner: VjPreloadRunner,
  packId: string,
  clips: readonly VjClipDTO[],
): AbortController {
  runner.runControllerRef.current?.abort();
  const controller = new AbortController();
  runner.runControllerRef.current = controller;
  const clipsToLoad = clips.filter(
    (clip) => !runner.decodeFailedIdsRef.current.has(clip.id),
  );
  void preloadVjPack(
    {
      packId,
      clips: clipsToLoad.map((clip) => ({
        clipId: clip.id,
        byteSize: clip.byteSize,
      })),
      signal: controller.signal,
      onUpdate: (updates) => {
        if (controller.signal.aborted) return;
        storeStatuses(runner, updates);
      },
    },
    { cache: runner.cache, fetchMedia: runner.fetchMedia },
  ).then((finalStatuses) => {
    // The run is over: a reattach may start a retry now.
    if (runner.runControllerRef.current === controller) {
      runner.runControllerRef.current = null;
    }
    if (controller.signal.aborted) return;
    storeStatuses(runner, finalStatuses);
    if (runner.latestRef.current.packId === packId) evictWhenSettled(runner);
  });
  return controller;
}

/** Remembers the clips of the pack that was active before this one. */
function usePackMemory(
  packId: string | null,
  knownClips: readonly VjClipDTO[] | null,
): readonly VjClipDTO[] {
  const [packMemory, setPackMemory] = useState<VjPackMemory>(() => ({
    packId,
    clips: knownClips ?? NO_CLIPS,
    previousClips: NO_CLIPS,
  }));
  if (packMemory.packId !== packId) {
    setPackMemory({
      packId,
      clips: knownClips ?? NO_CLIPS,
      previousClips:
        packMemory.clips.length > 0
          ? packMemory.clips
          : packMemory.previousClips,
    });
  } else if (knownClips !== null && packMemory.clips !== knownClips) {
    setPackMemory({ ...packMemory, clips: knownClips });
  }
  return packMemory.previousClips;
}

/** Starts a run over the queued, loading, network-failed and link-expired clips of the active pack. */
function retryUnsettledClips(runner: VjPreloadRunner): void {
  const latest = runner.latestRef.current;
  if (latest.packId === null) return;
  const retryClips = latest.clips.filter(
    (clip) =>
      !runner.decodeFailedIdsRef.current.has(clip.id) &&
      isRetryable(runner.statusByIdRef.current.get(clip.id)),
  );
  if (retryClips.length === 0) return;
  startPreloadRun(runner, latest.packId, retryClips);
}

/** Retries what never arrived when the browser is back online. */
function useRetryWhenOnline(runner: VjPreloadRunner): void {
  useEffect(() => {
    const handleOnline = () => retryUnsettledClips(runner);
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [runner]);
}

/**
 * Retries what never arrived when the socket attaches again: a dead uplink
 * behind live wifi never fires `online`. A run still going is left alone.
 */
function useRetryOnReattach(
  runner: VjPreloadRunner,
  isConnected: boolean,
): void {
  const wasConnectedRef = useRef(isConnected);
  useEffect(() => {
    const wasConnected = wasConnectedRef.current;
    wasConnectedRef.current = isConnected;
    if (!isConnected || wasConnected) return;
    const runController = runner.runControllerRef.current;
    if (runController !== null && !runController.signal.aborted) return;
    retryUnsettledClips(runner);
  }, [runner, isConnected]);
}

/**
 * The live clip's entry when the active and previous packs do not hold it:
 * the record's live clip, then (online) the library list, as the remote does.
 */
function useLiveClipFallbacks(
  liveClipId: string | null,
  localLists: readonly (readonly VjClipDTO[])[],
  recordLiveClip: VjClipDTO | null,
): readonly VjClipDTO[] {
  const isKnownLocally =
    liveClipId === null ||
    localLists.some((clipList) =>
      clipList.some((clip) => clip.id === liveClipId),
    ) ||
    recordLiveClip?.id === liveClipId;
  const libraryClipsQuery = useVjClips({ isEnabled: !isKnownLocally });
  const libraryClips = libraryClipsQuery.data ?? NO_CLIPS;
  return useMemo(
    () =>
      recordLiveClip === null
        ? libraryClips
        : [recordLiveClip, ...libraryClips],
    [recordLiveClip, libraryClips],
  );
}

/** Refetches on a change naming the active pack; a deleted clip leaves the cache and the lists. */
function useLibraryChanges(
  subscribeLibrary: VjStageController["subscribeLibrary"],
  runner: VjPreloadRunner,
  onClipDeleted: (clipId: string) => void,
): void {
  const invalidateLibrary = useInvalidateVjLibrary();
  useEffect(
    () =>
      subscribeLibrary((change: VjLibraryChange) => {
        if (change.kind === "clip_deleted" && change.clipId !== null) {
          onClipDeleted(change.clipId);
          void runner.cache.remove(change.clipId).catch(() => undefined);
        }
        const activePackId = runner.latestRef.current.packId;
        if (activePackId === null) return;
        if (
          change.packId === activePackId ||
          change.packIds.includes(activePackId)
        ) {
          invalidateLibrary(change);
        }
      }),
    [subscribeLibrary, runner, onClipDeleted, invalidateLibrary],
  );
}

/** Answers the list it answered last time while every item is the same, so consumers keep their memo. */
function useStableList<Item>(
  nextList: readonly Item[],
  isSameItem: (first: Item, second: Item) => boolean,
): readonly Item[] {
  const [stableList, setStableList] = useState(nextList);
  const isUnchanged =
    stableList.length === nextList.length &&
    stableList.every((item, itemIndex) => {
      const nextItem = nextList[itemIndex];
      return nextItem !== undefined && isSameItem(item, nextItem);
    });
  if (isUnchanged) return stableList;
  setStableList(nextList);
  return nextList;
}

function isSameClipId(first: string, second: string): boolean {
  return first === second;
}

function useClipIdSet(): [ReadonlySet<string>, (clipId: string) => void] {
  const [clipIds, setClipIds] = useState<ReadonlySet<string>>(NO_CLIP_IDS);
  const addClipId = useCallback((clipId: string) => {
    setClipIds((current) =>
      current.has(clipId) ? current : new Set([...current, clipId]),
    );
  }, []);
  return [clipIds, addClipId];
}

export function useVjScreenPreload(
  input: VjScreenPreloadInput,
): VjScreenPreloadResult {
  const { packId, record } = input;
  const { subscribeLibrary } = input.stage;
  const liveClipId =
    input.stage.state?.liveClipId ?? record?.state.liveClipId ?? null;
  const [cache] = useState(() => createVjClipCache());
  const fetchMedia = useVjPackMediaFetcher();
  const packClipsQuery = useVjPackClips(packId);
  const [deletedClipIds, addDeletedClipId] = useClipIdSet();
  const [decodeFailedClipIds, addDecodeFailedClipId] = useClipIdSet();
  const [statusById, setStatusById] = useState<
    ReadonlyMap<string, VjScreenClipStatus>
  >(() => new Map());

  const known = knownClipsOf(packId, packClipsQuery.data, record);
  const knownPack = known?.pack ?? null;
  const knownSourceClips = known?.clips ?? null;
  const knownClips = useMemo(
    () =>
      knownSourceClips === null
        ? null
        : knownSourceClips.filter((clip) => !deletedClipIds.has(clip.id)),
    [knownSourceClips, deletedClipIds],
  );
  const clips = knownClips ?? NO_CLIPS;
  const previousSourceClips = usePackMemory(packId, knownClips);
  const previousClips = useMemo(
    () => previousSourceClips.filter((clip) => !deletedClipIds.has(clip.id)),
    [previousSourceClips, deletedClipIds],
  );

  const latestRef = useRef<VjPreloadLatest>({
    packId,
    clips,
    previousClips,
    liveClipId,
  });
  const statusByIdRef = useRef(new Map<string, VjScreenClipStatus>());
  const publishedByIdRef = useRef(new Map<string, VjScreenClipStatus>());
  const decodeFailedIdsRef = useRef(new Set<string>());
  const runControllerRef = useRef<AbortController | null>(null);
  const runner = useMemo<VjPreloadRunner>(
    () => ({
      cache,
      fetchMedia,
      latestRef,
      statusByIdRef,
      publishedByIdRef,
      decodeFailedIdsRef,
      runControllerRef,
      publishStatuses: () => {
        publishedByIdRef.current = new Map(statusByIdRef.current);
        setStatusById(publishedByIdRef.current);
      },
    }),
    [cache, fetchMedia],
  );

  useEffect(() => {
    latestRef.current = { packId, clips, previousClips, liveClipId };
  });

  const isClipListKnown = knownClips !== null;
  const clipSignature = clipSignatureOf(clips);
  useEffect(() => {
    if (packId === null || !isClipListKnown) return;
    startPreloadRun(runner, packId, latestRef.current.clips);
    // Aborts this run or the online retry that replaced it.
    return () => runner.runControllerRef.current?.abort();
  }, [runner, packId, isClipListKnown, clipSignature]);

  useRetryWhenOnline(runner);
  useRetryOnReattach(runner, input.stage.isConnected ?? false);
  useLibraryChanges(subscribeLibrary, runner, addDeletedClipId);

  const markDecodeFailed = useCallback(
    (clipId: string) => {
      decodeFailedIdsRef.current.add(clipId);
      addDecodeFailedClipId(clipId);
      void cache.remove(clipId).catch(() => undefined);
    },
    [cache, addDecodeFailedClipId],
  );

  const nextStatuses = useMemo(
    () =>
      clips.map((clip) =>
        decodeFailedClipIds.has(clip.id)
          ? decodeFailedStatusOf(clip.id)
          : (statusById.get(clip.id) ?? queuedStatusOf(clip.id)),
      ),
    [clips, statusById, decodeFailedClipIds],
  );
  const statuses = useStableList(nextStatuses, isSameStatus);
  const nextReadyClipIds = useMemo(
    () =>
      statuses
        .filter((status) => status.state === "ready")
        .map((status) => status.clipId),
    [statuses],
  );
  const readyClipIds = useStableList(nextReadyClipIds, isSameClipId);

  const recordClips = record?.clips ?? NO_CLIPS;
  const fallbackClips = useLiveClipFallbacks(
    liveClipId,
    [clips, previousClips, recordClips],
    record?.liveClip ?? null,
  );
  const clipById = useCallback(
    (clipId: string): VjClipDTO | null => {
      if (deletedClipIds.has(clipId)) return null;
      for (const clipList of [
        clips,
        previousClips,
        recordClips,
        fallbackClips,
      ]) {
        const match = clipList.find((clip) => clip.id === clipId);
        if (match !== undefined) return match;
      }
      return null;
    },
    [clips, previousClips, recordClips, fallbackClips, deletedClipIds],
  );

  return useMemo<VjScreenPreloadResult>(
    () => ({
      pack: knownPack,
      clips,
      statuses,
      readyClipIds,
      cache,
      clipById,
      markDecodeFailed,
    }),
    [
      knownPack,
      clips,
      statuses,
      readyClipIds,
      cache,
      clipById,
      markDecodeFailed,
    ],
  );
}
