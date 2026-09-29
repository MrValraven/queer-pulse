import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { ApiError } from "../../shared/api/client";
import { logError } from "../../shared/observability/logger";
import {
  createForumDraft,
  deleteForumDraft,
  getForumDraft,
  updateForumDraft,
  type ForumDraft,
  type ForumDraftInput,
  type ForumDraftMeta,
} from "./api/forumDrafts.api";
import {
  isEmptyThreadDraftSnapshot,
  readThreadDraftSnapshot,
  threadDraftSnapshotFromMeta,
  threadDraftSnapshotToMeta,
  type ForumThreadDraftSnapshot,
} from "./forumDraftSnapshot";

// ── Storage and timing for `useForumComposerDraft` ───────────────────────────
// The hook decides WHAT to save and when the composer's state changes. This
// file holds the parts with no opinion about the composer: reading a stored
// draft, writing one through the version check, and the queue that times,
// serializes, retries and flushes those writes.

/** How long the composer sits still before a save fires. Long enough that
 *  ordinary typing writes once per pause, short enough that a closed tab loses
 *  at most a sentence. */
export const AUTOSAVE_DELAY_MS = 1500;

/** How long a failed save waits before the composer tries again on its own.
 *  Long enough that an outage is not hammered once per keystroke pause, short
 *  enough that the text is safe soon after the network comes back. */
export const AUTOSAVE_RETRY_MS = 10000;

/** One save attempt. It handles its own failures and never rejects. */
export type DraftSaveRun = () => Promise<void>;

/** Where a demo-mode draft lives. Demo never reaches the network, so the
 *  member's own browser is the whole store. */
const demoStorageKey = (draftId: string) => `qp.forum.draft.${draftId}`;

/** Stores a demo-mode body, or removes it once the composer is empty. */
export function writeDemoDraftBody(draftId: string, body: string) {
  const key = demoStorageKey(draftId);
  if (body.trim()) window.localStorage.setItem(key, body);
  else window.localStorage.removeItem(key);
}

/** What a composer finds when it opens: the row's version (live only), its
 *  body, and the fields beyond the body. `null` means none stored. */
export interface StoredForumDraft {
  version: number | null;
  body: string | null;
  snapshot: ForumThreadDraftSnapshot | null;
}

/**
 * Reads a stored draft. Demo mode reads this browser alone. Live mode reads
 * the draft ROW, the source of truth, so a member who started on another
 * device gets their category, community, tags and photo back; this browser's
 * copy of those fields answers only when the row carries none (a draft saved
 * before the `meta` bag existed, or a save whose network leg failed after the
 * local write).
 */
export async function readStoredForumDraft(
  draftId: string,
  isDemo: boolean,
  storageScope: string | null,
): Promise<StoredForumDraft> {
  if (isDemo) {
    return {
      version: null,
      body: window.localStorage.getItem(demoStorageKey(draftId)),
      snapshot: readThreadDraftSnapshot(draftId, storageScope),
    };
  }
  const draft = await getForumDraft(draftId);
  return {
    version: draft ? draft.version : null,
    body: draft ? draft.desc : null,
    snapshot:
      threadDraftSnapshotFromMeta(draft?.meta) ??
      readThreadDraftSnapshot(draftId, storageScope),
  };
}

/** The row as the server stores it. */
export function draftPayload(
  input: ForumDraftInput,
  fields: ForumThreadDraftSnapshot | undefined,
  fallbackTitle: string | undefined,
): ForumDraftInput {
  /** What goes in the draft row's `meta` bag. `undefined` for a composer that
   *  keeps no fields beyond its body (a reply box), so it never sends the key
   *  at all; `null` clears a bag the member has since emptied. */
  let meta: ForumDraftMeta | null | undefined;
  if (fields)
    meta = isEmptyThreadDraftSnapshot(fields)
      ? null
      : threadDraftSnapshotToMeta(fields);
  return {
    ...input,
    // The server requires a non-empty title, and an untitled row is
    // unfindable on the drafts list.
    title: input.title.trim() || fallbackTitle || input.kind,
    meta,
  };
}

/** Creates the row when the composer holds no version yet, and patches it
 *  otherwise. */
function writeDraftOnce(
  draftId: string,
  payload: ForumDraftInput,
  version: number | null,
) {
  return version === null
    ? createForumDraft(draftId, payload)
    : updateForumDraft(draftId, payload, version);
}

const hasStatus = (error: unknown, status: number): error is ApiError =>
  error instanceof ApiError && error.status === status;

/** The version a 409 says the row is at, when it says one. */
function conflictVersion(error: ApiError): number | null {
  const currentVersion = (error.data as { currentVersion?: number } | undefined)
    ?.currentVersion;
  return typeof currentVersion === "number" ? currentVersion : null;
}

/**
 * Brings `versionRef` in line with the server after a failed write, when the
 * failure says how: a patch that 404s means the row is gone (create next), a
 * 409 carries or implies the row's current version. Reports whether a second
 * write is worth making.
 */
async function adoptServerVersion(
  draftId: string,
  error: unknown,
  versionRef: RefObject<number | null>,
  wasCreate: boolean,
): Promise<boolean> {
  if (!wasCreate && hasStatus(error, 404)) {
    versionRef.current = null;
    return true;
  }
  if (!hasStatus(error, 409)) return false;
  const currentVersion = wasCreate ? null : conflictVersion(error);
  if (currentVersion !== null) {
    versionRef.current = currentVersion;
  } else {
    const stored = await getForumDraft(draftId);
    versionRef.current = stored ? stored.version : null;
  }
  return true;
}

/**
 * One write, and after a 409 (or a patch whose row has vanished) exactly one
 * more. The tab being typed in wins (see `useForumComposerDraft`).
 *
 * A create that collides means the row already exists: another tab made it,
 * or this composer's restore failed and never learned its version. A patch
 * that collides means someone wrote since this tab last read. Either way the
 * stored version is adopted (the 409's `currentVersion` after a patch, a fresh
 * read otherwise) and the write goes again.
 *
 * `buildPayload` runs again for the second write, so it carries the composer's
 * latest text. A second 409's `currentVersion` is kept in `versionRef` before
 * the error propagates, so the next attempt starts from it.
 */
export async function writeDraftWithConflictRetry(
  draftId: string,
  buildPayload: () => ForumDraftInput,
  versionRef: RefObject<number | null>,
): Promise<ForumDraft> {
  const wasCreate = versionRef.current === null;
  try {
    return await writeDraftOnce(draftId, buildPayload(), versionRef.current);
  } catch (error) {
    const shouldRetry = await adoptServerVersion(
      draftId,
      error,
      versionRef,
      wasCreate,
    );
    if (!shouldRetry) throw error;
  }
  try {
    return await writeDraftOnce(draftId, buildPayload(), versionRef.current);
  } catch (error) {
    if (hasStatus(error, 409)) {
      const currentVersion = conflictVersion(error);
      if (currentVersion !== null) versionRef.current = currentVersion;
    }
    if (hasStatus(error, 404)) versionRef.current = null;
    throw error;
  }
}

/** A refusal that will repeat on the same request: every 4xx except a
 *  timeout, a conflict and a rate limit. The composer waits for the next edit
 *  before trying such a save again. */
export function isPermanentSaveFailure(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const isClientError = error.status >= 400 && error.status < 500;
  return isClientError && ![408, 409, 429].includes(error.status);
}

/**
 * Removes a stored draft: this browser's copy in demo mode, the row in live
 * mode when there is one (`version` set). Also removes a row a save wrote
 * after the composer was cleared, so a posted or discarded draft does not come
 * back. Resolves true once nothing is stored, false when the delete failed.
 */
export async function removeStoredForumDraft(
  draftId: string,
  isDemo: boolean,
  version: number | null,
): Promise<boolean> {
  try {
    if (isDemo) writeDemoDraftBody(draftId, "");
    else if (version !== null) await deleteForumDraft(draftId);
    return true;
  } catch (error) {
    logError(error, { scope: "forum.draft.clear" });
    return false;
  }
}

/**
 * The autosave's timing: the debounce, the save it will run, the retry after a
 * failure, and the flush on leave.
 *
 * Saves run ONE AT A TIME. A save requested while another is on the network
 * waits for it, and several waiting requests collapse into one, which then
 * reads the composer's latest text and the version the earlier write produced.
 * Two writes from the same tab therefore never race each other to the server.
 *
 * A save waiting on its debounce runs at once when the composer unmounts
 * (in-app navigation, closing the composer), and that is the guarantee. On
 * `pagehide` (a real tab close) the same save starts, but the drafts client
 * has no keepalive option, so the browser may cancel the request as the page
 * goes: that write is best effort.
 *
 * It also owns the mounted flag. Effects clean up in declaration order, so the
 * flag turns false before the unmount flush runs, and the flushed save skips
 * every state update.
 */
export function useDraftSaveQueue() {
  const isMountedRef = useRef(true);
  // Set when a save is scheduled and cleared when it starts.
  const timerRef = useRef<number | null>(null);
  const pendingSaveRef = useRef<DraftSaveRun | null>(null);
  // The save on the network, and the one request waiting behind it.
  const inFlightRef = useRef<Promise<void> | null>(null);
  const queuedSaveRef = useRef<DraftSaveRun | null>(null);
  // The retry timer, and the counter it bumps. The caller puts the counter in
  // its save effect's dependencies, so a bump re-runs that effect, which finds
  // the text still unwritten and schedules a fresh save.
  const retryTimerRef = useRef<number | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const cancelRetry = useCallback(() => {
    if (retryTimerRef.current !== null)
      window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  }, []);

  /** Starts `save`, or queues it behind the save already on the network.
   *  Resolves once it (and anything queued with it) has settled. */
  const run = useCallback(
    (save: DraftSaveRun): Promise<void> => {
      cancelRetry();
      if (inFlightRef.current) {
        queuedSaveRef.current = save;
        return inFlightRef.current;
      }
      const drain = async () => {
        let next: DraftSaveRun | null = save;
        try {
          while (next) {
            queuedSaveRef.current = null;
            await next();
            next = queuedSaveRef.current;
          }
        } finally {
          inFlightRef.current = null;
        }
      };
      const inFlight = drain();
      inFlightRef.current = inFlight;
      return inFlight;
    },
    [cancelRetry],
  );

  /** Runs a save still waiting on its debounce right away. Resolves at once
   *  when nothing is waiting. */
  const flushDraft = useCallback(async () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    const pendingSave = pendingSaveRef.current;
    pendingSaveRef.current = null;
    if (pendingSave) await run(pendingSave);
  }, [run]);

  /** Schedules `save` after the debounce. The returned cleanup cancels only
   *  the timer: the save stays pending, so an unmount can still flush it, and
   *  the next scheduling replaces it. */
  const schedule = useCallback(
    (save: DraftSaveRun) => {
      pendingSaveRef.current = save;
      const timer = window.setTimeout(() => {
        timerRef.current = null;
        pendingSaveRef.current = null;
        void run(save);
      }, AUTOSAVE_DELAY_MS);
      timerRef.current = timer;
      return () => {
        window.clearTimeout(timer);
        if (timerRef.current === timer) timerRef.current = null;
      };
    },
    [run],
  );

  /** Nothing is left to write: forget any save and retry still waiting. */
  const dropPending = useCallback(() => {
    pendingSaveRef.current = null;
    cancelRetry();
  }, [cancelRetry]);

  /** After a failed save: try again after `AUTOSAVE_RETRY_MS`, and keep the
   *  save pending meanwhile, so leaving first still makes one last attempt. */
  const scheduleRetry = useCallback(
    (save: DraftSaveRun) => {
      cancelRetry();
      pendingSaveRef.current ??= save;
      retryTimerRef.current = window.setTimeout(() => {
        retryTimerRef.current = null;
        setRetryNonce((nonce) => nonce + 1);
      }, AUTOSAVE_RETRY_MS);
    },
    [cancelRetry],
  );

  /** Cancels everything waiting (a debounced save, a queued save, a retry), so
   *  none of them can write a discarded draft back. A save already on the
   *  network is the caller's to ignore. */
  const cancelAll = useCallback(() => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    pendingSaveRef.current = null;
    queuedSaveRef.current = null;
    cancelRetry();
  }, [cancelRetry]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    function flushOnPageHide() {
      void flushDraft();
    }
    window.addEventListener("pagehide", flushOnPageHide);
    return () => {
      window.removeEventListener("pagehide", flushOnPageHide);
      cancelRetry();
      void flushDraft();
    };
  }, [flushDraft, cancelRetry]);

  return {
    isMountedRef,
    retryNonce,
    flushDraft,
    schedule,
    dropPending,
    scheduleRetry,
    cancelAll,
  };
}
