/**
 * Keeps the projector's clip cache filled for the active pack (contract 5.4,
 * 6.10, 8.5). A pack change starts a new preload and aborts the old one while
 * the loaded clips keep playing; once the new pack has settled, the cache keeps
 * the active pack, the previous pack and every clip `vjRetainedClips` names
 * (contract 9.1: the live, mix and override clips and every clip the active
 * set list names, the next step's first). Coming back online, and the socket
 * attaching again while no run is going, retry what never arrived; a library
 * change naming the active pack refetches its clips, and a deleted clip
 * leaves the cache. Nothing here logs.
 *
 * The extra clips (retained clips outside both packs) run through the same
 * preloader with GET /admin/vj/clips/media (`createVjExtraClipFetcher`). Their
 * statuses stay apart from the pack's, so the setup card and the `preload`
 * report name the pack only; `playableClipIds` lists both for the targets.
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
import { useVjClipsMediaFetcher } from "../api/useVjClipsMediaFetcher";
import { useVjPackClips } from "../api/useVjPackClips";
import {
  useVjPackMediaFetcher,
  type VjPackMediaFetcher,
} from "../api/useVjPackMediaFetcher";
import type { VjStageController } from "../live/useVjStage";
import { createVjClipCache, type VjClipCache } from "./vjClipCache";
import { preloadVjPack } from "./vjPreloader";
import {
  createVjExtraClipFetcher,
  VJ_EXTRA_CLIPS_PACK_ID,
} from "./vjExtraClipMedia";
import { vjClipSetSignatureOf, vjRetainedClips } from "./vjRetainedClips";
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
  /** Active pack, previous pack, the record, the record's live and extra clips, then the library. */
  clipById: (clipId: string) => VjClipDTO | null;
  /** Status failed decode_failed, entry removed from the cache. */
  markDecodeFailed: (clipId: string) => void;
  /** Retained clips outside both packs whose entry is known, most urgent first. */
  extraClips: readonly VjClipDTO[];
  /** The extra clips' statuses, in extraClips order; never part of `statuses`. */
  extraStatuses: readonly VjScreenClipStatus[];
  /** Ready pack clips, then ready extra clips: what a live or mix target may play. */
  playableClipIds: readonly string[];
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
  /** This screen's id, so its override clip stays cached; default none. */
  screenId?: string;
  /** Every clip the active set list names, the next step's first; default none. */
  setlistClipIds?: readonly string[];
}

/** Progress reaches the page in whole tenths, so a playing screen re-renders a few times per clip. */
export const VJ_PRELOAD_PROGRESS_STEPS = 10;

const NO_CLIPS: readonly VjClipDTO[] = [];
const NO_CLIP_IDS: ReadonlySet<string> = new Set<string>();
const NO_CLIP_ID_LIST: readonly string[] = [];

interface VjPackMemory {
  packId: string | null;
  clips: readonly VjClipDTO[];
  previousClips: readonly VjClipDTO[];
}

/** What the preload effects read without re-running on every render. */
interface VjPreloadLatest {
  /** The pack id runs go under (the extra clips' pseudo id for the extra runner); null with nothing to load. */
  packId: string | null;
  clips: readonly VjClipDTO[];
  /** Every clip the cache keeps once the active pack settles. */
  keptClipIds: ReadonlySet<string>;
}

interface VjPreloadRunner {
  cache: VjClipCache;
  /** The media source for one run over these clips. */
  fetchMediaFor: (clipIds: readonly string[]) => VjPackMediaFetcher;
  /** The pack runner evicts once its pack settles; the extra clips runner never does. */
  shouldEvict: boolean;
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

/** Evicts every entry the retention set leaves out once the active pack has settled. */
function evictWhenSettled(runner: VjPreloadRunner): void {
  const latest = runner.latestRef.current;
  const isEverySettled = latest.clips.every((clip) => {
    if (runner.decodeFailedIdsRef.current.has(clip.id)) return true;
    const status = runner.statusByIdRef.current.get(clip.id);
    return status !== undefined && isSettled(status);
  });
  if (!isEverySettled) return;
  void runner.cache.keepOnly(latest.keptClipIds).catch(() => undefined);
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
  const fetchMedia = runner.fetchMediaFor(clipsToLoad.map((clip) => clip.id));
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
    { cache: runner.cache, fetchMedia },
  ).then((finalStatuses) => {
    // The run is over: a reattach may start a retry now.
    if (runner.runControllerRef.current === controller) {
      runner.runControllerRef.current = null;
    }
    if (controller.signal.aborted) return;
    storeStatuses(runner, finalStatuses);
    if (runner.shouldEvict && runner.latestRef.current.packId === packId) {
      evictWhenSettled(runner);
    }
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
 * Entries for retained clips the active and previous packs do not hold: the
 * record's live and extra clips, then (online, only while some id is still
 * unknown) the library list, as the remote does.
 */
function useClipEntryFallbacks(
  neededClipIds: readonly string[],
  localLists: readonly (readonly VjClipDTO[])[],
  recordEntries: readonly VjClipDTO[],
): readonly VjClipDTO[] {
  const isKnownLocally = neededClipIds.every((clipId) =>
    [...localLists, recordEntries].some((clipList) =>
      clipList.some((clip) => clip.id === clipId),
    ),
  );
  const libraryClipsQuery = useVjClips({ isEnabled: !isKnownLocally });
  const libraryClips = libraryClipsQuery.data ?? NO_CLIPS;
  return useMemo(
    () =>
      recordEntries.length === 0
        ? libraryClips
        : [...recordEntries, ...libraryClips],
    [recordEntries, libraryClips],
  );
}

/**
 * Whether a change touches scenes or set lists. These carry packId null, so
 * the active pack check would miss them; the screen still refetches its
 * scenes and set lists, so new and edited sequence steps get pre-cached.
 */
function isVjSequenceLibraryChange(change: VjLibraryChange): boolean {
  return change.kind.startsWith("scene") || change.kind.startsWith("setlist");
}

/**
 * Refetches on a change naming the active pack, and on every scene and set
 * list change; a deleted clip leaves the cache and the lists.
 */
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
        if (isVjSequenceLibraryChange(change)) {
          invalidateLibrary(change);
          return;
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

function findClipIn(
  clipLists: readonly (readonly VjClipDTO[])[],
  clipId: string,
): VjClipDTO | null {
  for (const clipList of clipLists) {
    const match = clipList.find((clip) => clip.id === clipId);
    if (match !== undefined) return match;
  }
  return null;
}

function isSameClip(first: VjClipDTO, second: VjClipDTO): boolean {
  return first === second;
}

/** A clip list's statuses: a decode failure wins, then the runner's status, else queued. */
function useClipStatuses(
  clips: readonly VjClipDTO[],
  statusById: ReadonlyMap<string, VjScreenClipStatus>,
  decodeFailedClipIds: ReadonlySet<string>,
): readonly VjScreenClipStatus[] {
  const nextStatuses = useMemo(
    () =>
      clips.map((clip) =>
        decodeFailedClipIds.has(clip.id)
          ? decodeFailedStatusOf(clip.id)
          : (statusById.get(clip.id) ?? queuedStatusOf(clip.id)),
      ),
    [clips, statusById, decodeFailedClipIds],
  );
  return useStableList(nextStatuses, isSameStatus);
}

function useReadyClipIds(
  statuses: readonly VjScreenClipStatus[],
): readonly string[] {
  const nextReadyClipIds = useMemo(
    () =>
      statuses
        .filter((status) => status.state === "ready")
        .map((status) => status.clipId),
    [statuses],
  );
  return useStableList(nextReadyClipIds, isSameClipId);
}

interface VjPreloadRunnerOptions {
  cache: VjClipCache;
  fetchMediaFor: VjPreloadRunner["fetchMediaFor"];
  shouldEvict: boolean;
  decodeFailedIdsRef: RefObject<Set<string>>;
  latest: VjPreloadLatest;
}

/** One runner (the pack's or the extra clips') with the statuses it published. */
function usePreloadRunner(options: VjPreloadRunnerOptions): {
  runner: VjPreloadRunner;
  statusById: ReadonlyMap<string, VjScreenClipStatus>;
} {
  const { cache, fetchMediaFor, shouldEvict, decodeFailedIdsRef } = options;
  const [statusById, setStatusById] = useState<
    ReadonlyMap<string, VjScreenClipStatus>
  >(() => new Map());
  const latestRef = useRef<VjPreloadLatest>(options.latest);
  const statusByIdRef = useRef(new Map<string, VjScreenClipStatus>());
  const publishedByIdRef = useRef(new Map<string, VjScreenClipStatus>());
  const runControllerRef = useRef<AbortController | null>(null);
  const runner = useMemo<VjPreloadRunner>(
    () => ({
      cache,
      fetchMediaFor,
      shouldEvict,
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
    [cache, fetchMediaFor, shouldEvict, decodeFailedIdsRef],
  );
  // Declared before the run effects, so a run started in the same commit reads this render.
  useEffect(() => {
    latestRef.current = options.latest;
  });
  useRetryWhenOnline(runner);
  return { runner, statusById };
}

/** Runs the extra clips whenever a clip joins or leaves the set; the cached
 *  ones turn ready at once. A reorder (every sequence step turns the list to
 *  the next step first) keeps the run going, so a slow link still finishes
 *  the upcoming steps. A run downloads in the order of the list it started
 *  from, the next step first. */
function useExtraClipsRun(
  runner: VjPreloadRunner,
  extraClips: readonly VjClipDTO[],
): void {
  const hasExtraClips = extraClips.length > 0;
  const extraSignature = vjClipSetSignatureOf(extraClips);
  useEffect(() => {
    if (!hasExtraClips) return;
    startPreloadRun(
      runner,
      VJ_EXTRA_CLIPS_PACK_ID,
      runner.latestRef.current.clips,
    );
    return () => runner.runControllerRef.current?.abort();
  }, [runner, hasExtraClips, extraSignature]);
}

interface VjRetainedClipsHookInput {
  clips: readonly VjClipDTO[];
  previousClips: readonly VjClipDTO[];
  state: VjStageState | null;
  screenId: string;
  setlistClipIds: readonly string[];
  record: VjScreenRecord | null;
  deletedClipIds: ReadonlySet<string>;
}

/** The retention set (contract 9.1), the extra clips' known entries and the fallback entries behind them. */
function useRetainedClips(input: VjRetainedClipsHookInput) {
  const { clips, previousClips, state, screenId, setlistClipIds } = input;
  const { record, deletedClipIds } = input;
  const retained = useMemo(
    () =>
      vjRetainedClips({
        activePackClipIds: clips.map((clip) => clip.id),
        previousPackClipIds: previousClips.map((clip) => clip.id),
        state,
        screenId,
        setlistClipIds,
      }),
    [clips, previousClips, state, screenId, setlistClipIds],
  );
  const recordClips = record?.clips ?? NO_CLIPS;
  const recordEntries = useMemo(() => {
    if (record === null) return NO_CLIPS;
    const liveEntries = record.liveClip === null ? [] : [record.liveClip];
    return [...liveEntries, ...record.extraClips];
  }, [record]);
  const fallbackClips = useClipEntryFallbacks(
    retained.extraClipIds,
    [clips, previousClips, recordClips],
    recordEntries,
  );
  const nextExtraClips = useMemo(
    () =>
      retained.extraClipIds
        .filter((clipId) => !deletedClipIds.has(clipId))
        .map((clipId) => findClipIn([recordClips, fallbackClips], clipId))
        .filter((clip): clip is VjClipDTO => clip !== null),
    [retained.extraClipIds, deletedClipIds, recordClips, fallbackClips],
  );
  const extraClips = useStableList(nextExtraClips, isSameClip);
  return {
    keptClipIds: retained.keptClipIds,
    extraClips,
    recordClips,
    fallbackClips,
  };
}

export function useVjScreenPreload(
  input: VjScreenPreloadInput,
): VjScreenPreloadResult {
  const { packId, record } = input;
  const { subscribeLibrary } = input.stage;
  const [cache] = useState(() => createVjClipCache());
  const fetchMedia = useVjPackMediaFetcher();
  const getClipsMedia = useVjClipsMediaFetcher();
  const packClipsQuery = useVjPackClips(packId);
  const [deletedClipIds, addDeletedClipId] = useClipIdSet();
  const [decodeFailedClipIds, addDecodeFailedClipId] = useClipIdSet();
  const decodeFailedIdsRef = useRef(new Set<string>());

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
  const retained = useRetainedClips({
    clips,
    previousClips,
    state: input.stage.state ?? record?.state ?? null,
    screenId: input.screenId ?? "",
    setlistClipIds: input.setlistClipIds ?? NO_CLIP_ID_LIST,
    record,
    deletedClipIds,
  });
  const { extraClips, recordClips, fallbackClips } = retained;

  const packFetchMediaFor = useCallback(() => fetchMedia, [fetchMedia]);
  const extraFetchMediaFor = useCallback(
    (clipIds: readonly string[]) =>
      createVjExtraClipFetcher(getClipsMedia, clipIds),
    [getClipsMedia],
  );
  const pack = usePreloadRunner({
    cache,
    fetchMediaFor: packFetchMediaFor,
    shouldEvict: true,
    decodeFailedIdsRef,
    latest: { packId, clips, keptClipIds: retained.keptClipIds },
  });
  const extra = usePreloadRunner({
    cache,
    fetchMediaFor: extraFetchMediaFor,
    shouldEvict: false,
    decodeFailedIdsRef,
    latest: {
      packId: extraClips.length > 0 ? VJ_EXTRA_CLIPS_PACK_ID : null,
      clips: extraClips,
      keptClipIds: retained.keptClipIds,
    },
  });

  const packRunner = pack.runner;
  const isClipListKnown = knownClips !== null;
  const clipSignature = clipSignatureOf(clips);
  useEffect(() => {
    if (packId === null || !isClipListKnown) return;
    startPreloadRun(packRunner, packId, packRunner.latestRef.current.clips);
    // Aborts this run or the online retry that replaced it.
    return () => packRunner.runControllerRef.current?.abort();
  }, [packRunner, packId, isClipListKnown, clipSignature]);
  useExtraClipsRun(extra.runner, extraClips);

  const isConnected = input.stage.isConnected ?? false;
  useRetryOnReattach(packRunner, isConnected);
  useRetryOnReattach(extra.runner, isConnected);
  useLibraryChanges(subscribeLibrary, packRunner, addDeletedClipId);

  const markDecodeFailed = useCallback(
    (clipId: string) => {
      decodeFailedIdsRef.current.add(clipId);
      addDecodeFailedClipId(clipId);
      void cache.remove(clipId).catch(() => undefined);
    },
    [cache, addDecodeFailedClipId],
  );

  const statuses = useClipStatuses(clips, pack.statusById, decodeFailedClipIds);
  const readyClipIds = useReadyClipIds(statuses);
  const extraStatuses = useClipStatuses(
    extraClips,
    extra.statusById,
    decodeFailedClipIds,
  );
  const extraReadyClipIds = useReadyClipIds(extraStatuses);
  const playableClipIds = useMemo(
    () =>
      extraReadyClipIds.length === 0
        ? readyClipIds
        : [...readyClipIds, ...extraReadyClipIds],
    [readyClipIds, extraReadyClipIds],
  );

  const clipById = useCallback(
    (clipId: string): VjClipDTO | null =>
      deletedClipIds.has(clipId)
        ? null
        : findClipIn(
            [clips, previousClips, recordClips, fallbackClips],
            clipId,
          ),
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
      extraClips,
      extraStatuses,
      playableClipIds,
    }),
    [
      knownPack,
      clips,
      statuses,
      readyClipIds,
      cache,
      clipById,
      markDecodeFailed,
      extraClips,
      extraStatuses,
      playableClipIds,
    ],
  );
}
