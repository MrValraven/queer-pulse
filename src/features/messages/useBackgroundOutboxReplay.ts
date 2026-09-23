import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../app/providers/authContext";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { useStorageScope } from "../../app/providers/useStorageScope";
import { useRealtime } from "../../shared/api/realtime";
import { ApiError } from "../../shared/api/client";
import { queryClient } from "../../shared/api/queryClient";
import {
  patchConversationPreview,
  upsertMessage,
} from "../../shared/api/messageCache";
import { isDocumentAttachment } from "../../shared/api/documentAttachment";
import { isStickerAttachment } from "../../shared/api/stickerAttachment";
import type { MessageResponse } from "../../shared/contracts/contracts";
import {
  sendDocumentMessage,
  sendMessage as postMessage,
} from "./api/messages.api";
import { peekOutbox, rememberDeliveredLocalId, writeOutboxRaw } from "./outbox";
import type { OutboxMap } from "./outbox";
import type { ChatMessage } from "./data";
import { mediaKindOf } from "./messageSending.helpers";
import { isServerConversationId } from "./useMessagesController.helpers";
import {
  PERMANENT_FAILURE_STATUS_CODES,
  earliestDueAt,
  isMessagesPageOutboxMounted,
  onMessagesPageOutboxFullyUnmounted,
  replayConversationInOrder,
} from "./outboxReplay.helpers";

/**
 * ENG-214: replay the offline outbox for the whole signed-in session, so a
 * member who queues a send offline and then browses elsewhere before the
 * network returns still gets it replayed, even with the Messages page
 * closed (previously that member got no replay until they reopened
 * Messages). Mounted once from `AppChrome`
 * (alongside `useRealtimeConnection`), so it lives for the whole signed-in
 * session. Inert in demo mode, signed out, and, via
 * `isMessagesPageOutboxMounted`, while the Messages page's own
 * `useMessageOutbox` is mounted, since that hook already owns the outbox
 * then (see `outboxReplay.helpers.ts`'s mount-counter doc).
 *
 * Reads/writes the SAME localStorage store as `useMessageOutbox` (`outbox.ts`)
 * but has no React `sent` state to react through, so every entry's outcome is
 * recorded through its own fresh read-modify-write against storage
 * (`writeOutboxEntryOutcome` reads storage again right before writing, never
 * a snapshot taken at the start of the pass). Two SEPARATE checks gate an
 * attempt: `canStartNewAttempt` (scope, active, AND the Messages page not
 * mounted) must hold before a network request is even fired, since the page
 * owns the outbox once it mounts; `isScopeStillActive` (scope and active
 * only) gates whether an already-in-flight request's outcome is recorded,
 * since a page mounting mid-request doesn't undo a send that already went
 * out, only a genuine sign-out or member switch does.
 */
export function useBackgroundOutboxReplay(): void {
  const { demoMode } = useDemoMode();
  const { loggedIn } = useAuth();
  const scopeId = useStorageScope();
  const { connected } = useRealtime();

  // A real, live, signed-in member's scope. `useStorageScope` returns
  // `"demo"` only when `demoMode` is true (already excluded) and `null` while
  // signed out/still resolving, so this is just a defensive belt-and-braces
  // check alongside the explicit `demoMode`/`loggedIn` gates.
  const isActive = !demoMode && loggedIn && !!scopeId && scopeId !== "demo";
  const isActiveRef = useRef(isActive);
  const scopeIdRef = useRef(scopeId);
  useEffect(() => {
    isActiveRef.current = isActive;
    scopeIdRef.current = scopeId;
  }, [isActive, scopeId]);

  const replayTimerRef = useRef<number | null>(null);
  const isReplayInFlightRef = useRef(false);
  // Indirection so `scheduleNextReplay` and `runReplayPassIfEligible` can call
  // each other without a circular `useCallback` dependency (mirrors the
  // `*Ref` pattern `useMessageOutbox` already uses for its own event-driven
  // callbacks).
  const runReplayPassIfEligibleRef = useRef<() => Promise<void>>(() =>
    Promise.resolve(),
  );

  const clearScheduledReplay = useCallback(() => {
    if (replayTimerRef.current !== null) {
      window.clearTimeout(replayTimerRef.current);
      replayTimerRef.current = null;
    }
  }, []);

  // ENG-208, mirrored: after every pass, schedule ONE timer for the earliest
  // moment anything still eligible becomes due, so a merely-backing-off entry
  // doesn't silently wait for an `online`/reconnect event that may never come.
  // Reads through `loadEffectiveOutbox` (storage plus the in-memory backoff
  // overlay), the same source `runScopeReplay`/`attemptDelivery` use, so a
  // storage write that silently failed (quota) can't make this schedule too
  // early either.
  const scheduleNextReplay = useCallback(
    (scope: string) => {
      clearScheduledReplay();
      if (!isActiveRef.current || isMessagesPageOutboxMounted()) return;
      if (typeof navigator !== "undefined" && navigator.onLine === false)
        return;
      const dueAt = earliestDueAt(loadEffectiveOutbox(scope), () => false);
      if (dueAt === null) return;
      const delay = Math.max(0, dueAt - Date.now());
      replayTimerRef.current = window.setTimeout(() => {
        replayTimerRef.current = null;
        void runReplayPassIfEligibleRef.current();
      }, delay);
    },
    [clearScheduledReplay],
  );

  const runReplayPassIfEligible = useCallback(async () => {
    const scope = scopeIdRef.current;
    if (!isActiveRef.current || !scope || isMessagesPageOutboxMounted()) return;
    if (isReplayInFlightRef.current) return;
    isReplayInFlightRef.current = true;
    // Two separate checks, each re-evaluated fresh before EVERY attempt
    // inside `runScopeReplay` below, giving each attempt in the pass its own
    // current answer: `canStartNewAttempt` (scope, active, AND the page not
    // mounted) gates firing a NEW network request, since the page owns the
    // outbox once it mounts. `isScopeStillActive` (scope and active only)
    // gates recording the outcome of a request already in flight, since a
    // page mounting mid-request doesn't undo a send that already went out.
    const isScopeStillActive = () =>
      isActiveRef.current && scopeIdRef.current === scope;
    const canStartNewAttempt = () =>
      isScopeStillActive() && !isMessagesPageOutboxMounted();
    try {
      await runScopeReplay(scope, isScopeStillActive, canStartNewAttempt);
    } finally {
      isReplayInFlightRef.current = false;
      scheduleNextReplay(scope);
    }
  }, [scheduleNextReplay]);

  useEffect(() => {
    runReplayPassIfEligibleRef.current = runReplayPassIfEligible;
  }, [runReplayPassIfEligible]);

  // Deferred by a macrotask so a Messages page mounting in the SAME commit
  // (e.g. the app loads directly on /messages) registers its own mount count
  // first: `useMessageOutbox`'s mount effect runs synchronously within the
  // same commit as this hook's, but `window.setTimeout(..., 0)` pushes this
  // check to AFTER every effect from that commit has already run. Tracked in
  // its own ref, always replacing any pending one, so it can be cancelled on
  // unmount, the same as the backoff timer below.
  const deferredReplayTimeoutRef = useRef<number | null>(null);
  const runReplayPassDeferred = useCallback(() => {
    if (deferredReplayTimeoutRef.current !== null) {
      window.clearTimeout(deferredReplayTimeoutRef.current);
    }
    deferredReplayTimeoutRef.current = window.setTimeout(() => {
      deferredReplayTimeoutRef.current = null;
      void runReplayPassIfEligibleRef.current();
    }, 0);
  }, []);

  // Trigger: mount (and whenever `isActive` flips true, e.g. sign-in).
  useEffect(() => {
    if (!isActive) return;
    runReplayPassDeferred();
  }, [isActive, runReplayPassDeferred]);

  // Trigger (ENG-214): the Messages page's outbox fully unmounts, so a
  // member who queues a send offline and then navigates away isn't left
  // waiting on the next online/reconnect/timer trigger, which may not come
  // for a long time on an otherwise-steady connection. Deferred for the same
  // same-commit-race reason as the mount trigger above (a fast unmount and
  // remount, e.g. Strict Mode or a quick navigation back to Messages, lets
  // the remount's own mount count register first).
  useEffect(() => {
    return onMessagesPageOutboxFullyUnmounted(runReplayPassDeferred);
  }, [runReplayPassDeferred]);

  // Trigger: the browser regains network.
  useEffect(() => {
    if (!isActive) return;
    const onOnline = () => void runReplayPassIfEligible();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [isActive, runReplayPassIfEligible]);

  // Trigger: the realtime socket reconnects (false→true only, mirroring
  // `useMessageOutbox`'s own guard).
  const wasConnectedRef = useRef(connected);
  useEffect(() => {
    if (isActive && connected && !wasConnectedRef.current) {
      void runReplayPassIfEligible();
    }
    wasConnectedRef.current = connected;
  }, [connected, isActive, runReplayPassIfEligible]);

  // Cancel both the backoff timer and any still-pending deferred pass on
  // unmount, so neither fires against a hook instance that's gone.
  useEffect(() => {
    return () => {
      clearScheduledReplay();
      if (deferredReplayTimeoutRef.current !== null) {
        window.clearTimeout(deferredReplayTimeoutRef.current);
        deferredReplayTimeoutRef.current = null;
      }
    };
  }, [clearScheduledReplay]);
}

// ENG-208: in-memory bookkeeping for the background replayer that fills in
// for a `writeOutboxEntryOutcome` write that can silently fail (quota,
// private mode). Two maps, each read by `loadEffectiveOutbox` below (the one
// read used everywhere this hook needs "the outbox as it currently stands":
// the work list, an eligibility re-check, or the earliest-due computation
// for scheduling), so a failed storage write can neither understate an
// entry's backoff nor let it be resent after this tab already delivered it:
//   - `backoffMemory`, keyed by localId, holds the highest retryCount/
//     lastAttemptAt this TAB has observed for that entry, the source of
//     truth for eligibility and scheduling regardless of whether a write
//     landed. `withEffectiveBackoff` overlays it onto a stored message,
//     keeping the higher of the two values for each field, since a stored
//     value can legitimately be ahead of this map too (a successful write,
//     or a fresh page load in a tab that never attempted this entry before).
//   - `deliveredLocalIds` holds every localId this tab has confirmed
//     delivered, even one whose matching storage removal may have silently
//     failed: once in this set, an entry is treated as gone everywhere in
//     this hook, permanently, regardless of what storage still shows.
const backoffMemory = new Map<
  string,
  { retryCount: number; lastAttemptAt: number }
>();
const deliveredLocalIds = new Set<string>();

function recordBackoffAttempt(
  localId: string,
  retryCount: number,
  lastAttemptAt: number,
): void {
  const remembered = backoffMemory.get(localId);
  backoffMemory.set(localId, {
    retryCount: Math.max(remembered?.retryCount ?? 0, retryCount),
    lastAttemptAt: Math.max(remembered?.lastAttemptAt ?? 0, lastAttemptAt),
  });
}

function forgetBackoffAttempts(localId: string): void {
  backoffMemory.delete(localId);
}

function withEffectiveBackoff(message: ChatMessage): ChatMessage {
  if (!message.localId) return message;
  const remembered = backoffMemory.get(message.localId);
  if (!remembered) return message;
  return {
    ...message,
    retryCount: Math.max(message.retryCount ?? 0, remembered.retryCount),
    lastAttemptAt: Math.max(
      message.lastAttemptAt ?? 0,
      remembered.lastAttemptAt,
    ),
  };
}

/** `peekOutbox`, filtered to drop any localId `deliveredLocalIds` already
 *  confirmed delivered and with `backoffMemory` overlaid onto everything
 *  that's left: see the pair's shared doc above. */
function loadEffectiveOutbox(scopeId: string): OutboxMap {
  const outbox = peekOutbox(scopeId);
  const effective: OutboxMap = {};
  for (const [conversationId, messages] of Object.entries(outbox)) {
    const remaining = messages
      .filter(
        (message) =>
          !message.localId || !deliveredLocalIds.has(message.localId),
      )
      .map(withEffectiveBackoff);
    if (remaining.length > 0) effective[conversationId] = remaining;
  }
  return effective;
}

/** One full pass over `scopeId`'s outbox: every conversation replays
 *  sequentially (oldest due entry first, stopping the moment the next entry
 *  is either in flight or eligible but not yet due, see
 *  `replayConversationInOrder`), different conversations in parallel.
 *  Placeholder conversation ids (a just-picked recipient's slug, not yet a
 *  real server id) are skipped entirely: only `migrateOutboxConversation` on
 *  the Messages page drives those. `loadEffectiveOutbox` decides the WORK
 *  LIST here, which conversations and messages to consider, and in what
 *  order; every entry's actual outcome is recorded through its own fresh
 *  read-modify-write (`writeOutboxEntryOutcome`, called from
 *  `attemptDelivery`), never from this snapshot, so this pass's own copy of
 *  an entry can never overwrite a concurrent write from another tab or a
 *  fresher state the Messages page has since taken over. */
async function runScopeReplay(
  scopeId: string,
  isScopeStillActive: () => boolean,
  canStartNewAttempt: () => boolean,
): Promise<void> {
  const outbox = loadEffectiveOutbox(scopeId);
  const conversationIds = Object.keys(outbox).filter(isServerConversationId);
  if (conversationIds.length === 0) return;
  await Promise.all(
    conversationIds.map((conversationId) =>
      replayConversationInOrder(
        outbox[conversationId] ?? [],
        // No separate in-flight bookkeeping here: `runReplayPassIfEligible`'s
        // `isReplayInFlightRef` already keeps at most one pass running at a
        // time for this hook. The mount counter keeps this hook and the
        // page's own replay loop from STARTING work on the same entry at
        // once, but it's a hand-off, not a hard lock: if the page starts a
        // request and then unmounts while that request is still in flight
        // (slower than one backoff window, 2s the first time), the page's
        // own in-flight tracking is gone with it, and this hook can end up
        // attempting the same entry concurrently with that still-running
        // request. `canStartNewAttempt`/`isScopeStillActive` in
        // `attemptDelivery` narrow that window but don't close it; the
        // server's own `clientMessageId` dedupe is what keeps a genuine
        // overlap harmless.
        () => false,
        (message) =>
          attemptDelivery(
            scopeId,
            conversationId,
            message.localId,
            isScopeStillActive,
            canStartNewAttempt,
          ),
      ),
    ),
  );
}

/** Read-modify-write ONE entry against storage: reads fresh via `peekOutbox`
 *  (never marking anything known, see its own doc) and writes back through
 *  `writeOutboxRaw` (see ITS own doc for why this is the right write for a
 *  read that just happened synchronously, moments earlier, with nothing else
 *  able to run in between). Removing an entry marks its localId known first
 *  (`rememberDeliveredLocalId`): a defensive record for this tab in case a
 *  LATER write from this same tab (the Messages page mounting and saving
 *  moments after, say) reads storage before this one's write has landed. A
 *  no-op if the entry is already gone, e.g. another tab or a manual retry
 *  already acked it. */
function writeOutboxEntryOutcome(
  scopeId: string,
  conversationId: string,
  localId: string,
  update: (entry: ChatMessage) => ChatMessage | null,
): void {
  const current = peekOutbox(scopeId);
  const messages = current[conversationId];
  if (!messages) return;
  const index = messages.findIndex((item) => item.localId === localId);
  if (index === -1) return;
  const updated = update(messages[index]!);
  const nextMessages = messages.slice();
  if (updated === null) {
    nextMessages.splice(index, 1);
    rememberDeliveredLocalId(localId);
  } else {
    nextMessages[index] = updated;
  }
  const next = { ...current };
  if (nextMessages.length > 0) next[conversationId] = nextMessages;
  else delete next[conversationId];
  writeOutboxRaw(next, scopeId);
}

/** POST one stored outbox entry, rebuilding the payload its original send
 *  used: a document routes to `sendDocumentMessage`; a GIF or image carries
 *  its real attachment (`sendAttachment` first); a sticker sends its bare
 *  `{kind, stickerId}` (the id lives on its attachment, see `retrySend` in
 *  `useMessageSendActions.ts`); anything else is a text send. Every send
 *  carries `entry.sendAsIdentityId`, the identity the entry was composed as
 *  (see `outbox.ts`), whichever mailbox is open now. Exported for tests. */
export function sendOutboxEntry(
  conversationId: string,
  localId: string,
  entry: ChatMessage,
): Promise<MessageResponse> {
  const attachment = entry.sendAttachment ?? entry.attachment;
  const mediaKind = mediaKindOf(entry);
  if (attachment && isDocumentAttachment(attachment)) {
    return sendDocumentMessage(
      conversationId,
      entry.text,
      attachment,
      entry.replyTo?.id,
      localId,
      entry.forwarded,
      entry.sendAsIdentityId,
    );
  }
  const stickerId =
    attachment && isStickerAttachment(attachment)
      ? attachment.stickerId
      : undefined;
  return postMessage(
    conversationId,
    entry.text,
    entry.replyTo?.id,
    localId,
    entry.forwarded,
    stickerId ? undefined : attachment,
    stickerId
      ? "sticker"
      : mediaKind === "gif" || mediaKind === "image"
        ? mediaKind
        : undefined,
    stickerId,
    entry.sendAsIdentityId,
  );
}

/** Attempt one entry's delivery straight against the API (no react-query
 *  mutation object exists outside a component) and patch the outcome into
 *  BOTH the shared react-query cache (`upsertMessage` and
 *  `patchConversationPreview`, the same contract `useMessageDeliverCore`'s
 *  mutations use) and the outbox entry itself, via `writeOutboxEntryOutcome`.
 *  Mirrors `useMessageDeliverCore`'s `runDeliver`/`handleDeliverError`
 *  classification exactly, so a page mounting mid-replay sees identical
 *  status/backoff bookkeeping either way. Re-reads the entry fresh from
 *  storage first: a manual retry or another trigger may have already
 *  resolved it since the pass-start snapshot was taken, and respecting that
 *  fresher state here is what keeps it from being resent. `canStartNewAttempt`
 *  gates firing the network call at all; `isScopeStillActive` gates recording
 *  the completed outcome (both the storage write and the cache patch) once
 *  the request settles, so a page mounting mid-request still lets an
 *  already-in-flight send finish and record its true outcome, while a
 *  genuine scope change (sign-out, a different member) is what skips
 *  recording it. The attachment loaded from storage is never a local
 *  `blob:` preview: `outbox.ts`'s `trimOutboxMap` already strips that at
 *  write time, so there is nothing to `revokeBlobPreview` here. */
async function attemptDelivery(
  scopeId: string,
  conversationId: string,
  localId: string,
  isScopeStillActive: () => boolean,
  canStartNewAttempt: () => boolean,
): Promise<boolean> {
  const stored = peekOutbox(scopeId)[conversationId]?.find(
    (item) => item.localId === localId,
  );
  if (
    !stored ||
    deliveredLocalIds.has(localId) ||
    (stored.status !== "sending" && stored.status !== "failed")
  ) {
    // Already gone, already confirmed delivered in memory even if the
    // matching storage removal silently failed, or already resolved since
    // the work list was built: nothing to do, and nothing to block the rest
    // of this conversation's chain on.
    return true;
  }
  if (!canStartNewAttempt()) return false;
  const current = withEffectiveBackoff(stored);

  const nextRetryCount = (current.retryCount ?? 0) + 1;
  const nextLastAttemptAt = Date.now();
  recordBackoffAttempt(localId, nextRetryCount, nextLastAttemptAt);
  writeOutboxEntryOutcome(scopeId, conversationId, localId, (entry) => ({
    ...entry,
    retryCount: nextRetryCount,
    lastAttemptAt: nextLastAttemptAt,
  }));
  // Mirrors `useMessageDeliverCore`'s placeholder-conversation guard, kept
  // here too even though `runScopeReplay` already filters placeholder ids out
  // of its work list, as a second line of defence.
  if (!isServerConversationId(conversationId)) return false;
  try {
    const response = await sendOutboxEntry(conversationId, localId, current);
    if (!isScopeStillActive()) return false;
    // Mark delivered in memory FIRST, unconditionally: even if the storage
    // removal below silently fails (quota), this tab must never attempt this
    // localId again.
    deliveredLocalIds.add(localId);
    writeOutboxEntryOutcome(scopeId, conversationId, localId, () => null);
    // Only forget the backoff bookkeeping once the removal is CONFIRMED, by
    // re-reading storage rather than trusting the write call above to have
    // landed: a write that silently failed must not also lose the retry
    // history that write was supposed to have made moot.
    const stillStored = peekOutbox(scopeId)[conversationId]?.some(
      (item) => item.localId === localId,
    );
    if (!stillStored) forgetBackoffAttempts(localId);
    upsertMessage(queryClient, conversationId, response);
    patchConversationPreview(queryClient, conversationId, response);
    return true;
  } catch (error) {
    if (!isScopeStillActive()) return false;
    const isPermanentFailure =
      error instanceof ApiError &&
      PERMANENT_FAILURE_STATUS_CODES.has(error.status);
    // ENG-242: mirrors `useMessageDeliverCore.handleDeliverError` — lift the
    // error body's machine-readable `code`, when present, so a background
    // replay's failure renders the same specific reason a foreground send's
    // would.
    const failureCode =
      error instanceof ApiError &&
      error.data &&
      typeof error.data === "object" &&
      "code" in error.data &&
      typeof (error.data as { code?: unknown }).code === "string"
        ? (error.data as { code: string }).code
        : undefined;
    const failedAt = Date.now();
    recordBackoffAttempt(localId, nextRetryCount, failedAt);
    writeOutboxEntryOutcome(scopeId, conversationId, localId, (entry) => ({
      ...entry,
      status: "failed",
      isRetryable: !isPermanentFailure,
      failureCode,
      lastAttemptAt: failedAt,
    }));
    return false;
  }
}
