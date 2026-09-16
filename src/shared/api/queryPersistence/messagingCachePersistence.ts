import {
  dehydrate,
  hydrate,
  type Query,
  type QueryClient,
} from "@tanstack/react-query";
import type { AuthUser } from "../../../features/auth/api/auth.api";
import { createIndexedDbRecordStore } from "./indexedDbRecordStore";
import {
  decideMessagingCacheWrite,
  isPersistableConversationsKey,
  isPersistedMessagingCacheUsable,
  messagingCacheBusterFor,
  persistableThreadConversationId,
  toPersistedMemberSession,
  withoutExpiredEntries,
  type MessagingCacheWriteDecision,
  type PersistedMessagingCache,
} from "./messagingCacheSelection";

/**
 * PRD-375: the messaging slice of the react-query cache, kept in IndexedDB so
 * a cold offline launch of the installed app can re-read the inbox and the
 * most recently opened threads. Live mode only; the caller never starts any
 * of this in demo mode.
 *
 * PRIVACY. This puts message content at rest on the device: the inbox rows
 * (previews, server drafts) and the newest page of up to ten threads. No
 * attachment bytes are stored, only the URLs the server returned. The record
 * names its member and is removed, here and in every other open tab of the
 * app (`purgeMessagingCache` broadcasts):
 * - on sign-out, which also covers account deletion and deactivation because
 *   both flows end in sign-out;
 * - when a confirmed session ends and `/auth/me` confirms nobody is signed in;
 * - when a different member signs in on the device;
 * - when the inbox alone outgrows the size budget;
 * - when it is older than seven days, or the persisted schema changes
 *   (`MESSAGING_CACHE_SCHEMA_VERSION`; a routine release that touches
 *   neither leaves the record in place).
 */

// Plan-mandated cadence; its CPU and IndexedDB cost has not been measured.
export const MESSAGING_CACHE_WRITE_THROTTLE_MS = 2_000;
/** How long a restored query outlives its last observer in memory. Longer
 *  than react-query's five-minute default so a thread restored at launch is
 *  still there when the member opens it further into an offline stretch. */
const RESTORED_QUERY_GC_TIME_MS = 60 * 60_000;

const messagingCacheStore = createIndexedDbRecordStore<unknown>({
  databaseName: "qp-query-cache",
  storeName: "records",
  recordKey: "messaging",
});

/** Bumped by every purge and every writer start, so a write queued by an
 *  older writer (or before a purge) is dropped when it reaches the store. */
let persistenceGeneration = 0;

function currentBuster(): string {
  return messagingCacheBusterFor();
}

const measuredCharacters = new WeakMap<object, number>();

function measureCharacters(value: unknown): number {
  if (typeof value !== "object" || value === null) return 0;
  const cached = measuredCharacters.get(value);
  if (cached !== undefined) return cached;
  let characters: number;
  try {
    characters = JSON.stringify(value)?.length ?? 0;
  } catch {
    characters = Number.POSITIVE_INFINITY;
  }
  measuredCharacters.set(value, characters);
  return characters;
}

function isPersistableMessagingQuery(query: Query): boolean {
  if (query.state.status !== "success") return false;
  return (
    isPersistableConversationsKey(query.queryKey) ||
    persistableThreadConversationId(query.queryKey) !== null
  );
}

/** `readPersistedMessagingCache`'s result, kept distinct from a confirmed
 *  empty store (`{ status: "ok"; record: null }`) so a caller deciding
 *  whether there is something to protect can tell "could not check" apart
 *  from "definitely nothing here". */
export type PersistedMessagingCacheReadResult =
  | { status: "ok"; record: PersistedMessagingCache | null }
  | { status: "unavailable" };

/** The stored record trimmed to entries fetched within the last seven days,
 *  or null when confirmed empty. An unusable record (other schema, expired,
 *  malformed, nothing fresh left) is deleted on the way out. `"unavailable"`
 *  covers IndexedDB being missing or unreachable (a failed or timed-out
 *  open); see `readPersistedMessagingCache` for the common case that folds
 *  this into `null` too. */
export async function readPersistedMessagingCacheResult(): Promise<PersistedMessagingCacheReadResult> {
  const result = await messagingCacheStore.read();
  if (result.status === "unavailable") return result;
  const record = result.value;
  if (record === undefined) return { status: "ok", record: null };
  const now = Date.now();
  const freshRecord = isPersistedMessagingCacheUsable(record, {
    buster: currentBuster(),
    now,
  })
    ? withoutExpiredEntries(record, now)
    : null;
  if (freshRecord) return { status: "ok", record: freshRecord };
  void messagingCacheStore.remove();
  return { status: "ok", record: null };
}

/** Convenience wrapper for the common case, where a read that failed reads
 *  the same as a confirmed empty store. A caller that must not conflate the
 *  two (a purge decision) uses `readPersistedMessagingCacheResult` instead. */
export async function readPersistedMessagingCache(): Promise<PersistedMessagingCache | null> {
  const result = await readPersistedMessagingCacheResult();
  return result.status === "ok" ? result.record : null;
}

/**
 * Hydrate a record's queries into the client. Only queries the client does
 * not hold yet are restored: anything already cached is at least as fresh
 * and may be mid-fetch, and swapping an open thread's rows under the reader
 * would move the scroll.
 */
export function hydrateMessagingCache(
  queryClient: QueryClient,
  record: PersistedMessagingCache,
): void {
  const queryCache = queryClient.getQueryCache();
  const queries = [
    ...(record.conversations ? [record.conversations] : []),
    ...record.threads.map((thread) => thread.query),
  ].filter((query) => !queryCache.get(query.queryHash));
  if (queries.length === 0) return;
  try {
    hydrate(
      queryClient,
      { mutations: [], queries },
      { defaultOptions: { queries: { gcTime: RESTORED_QUERY_GC_TIME_MS } } },
    );
  } catch {
    // A malformed record restores nothing; the live fetch fills the cache.
  }
}

/** Drop every messaging query from memory, for when a restored member turns
 *  out to be someone other than the one now signed in. */
export function removeMessagingQueries(queryClient: QueryClient): void {
  queryClient.removeQueries({
    predicate: (query) =>
      isPersistableConversationsKey(query.queryKey) ||
      persistableThreadConversationId(query.queryKey) !== null,
  });
}

const PURGE_CHANNEL_NAME = "qp-messaging-cache";
/** The bare payload used before purges named their member; still honoured. */
const LEGACY_PURGE_MESSAGE = "purge";
/** Receives the member a purge names (null when unnamed) and returns whether
 *  the purge applied to this context. */
type PurgeListener = (purgedMemberId: string | null) => boolean;
const purgeListeners = new Set<PurgeListener>();
/** `undefined` until first use; null where BroadcastChannel is missing. */
let purgeChannel: BroadcastChannel | null | undefined;

/** The member a purge message names, null for an unnamed purge (the legacy
 *  bare string included), or undefined for any other message. */
function purgedMemberIdOf(data: unknown): string | null | undefined {
  if (data === LEGACY_PURGE_MESSAGE) return null;
  if (typeof data !== "object" || data === null) return undefined;
  const { type, memberId } = data as { type?: unknown; memberId?: unknown };
  if (type !== "purge") return undefined;
  return typeof memberId === "string" && memberId !== "" ? memberId : null;
}

/**
 * The channel shared with this app's other tabs and windows. A message posted
 * on it never reaches the same instance, so a context only ever hears other
 * contexts' purges. On hearing one it asks its listeners whether the purge
 * applies here, which it does unless the member confirmed here is someone
 * other than the member it names. When it applies, the context stops its
 * writers and queues its own delete, so a write it had already queued cannot
 * resurrect the record. When it does not, its writer keeps saving its member.
 */
function sharedPurgeChannel(): BroadcastChannel | null {
  if (purgeChannel !== undefined) return purgeChannel;
  purgeChannel = null;
  try {
    if (typeof BroadcastChannel === "undefined") return null;
    const channel = new BroadcastChannel(PURGE_CHANNEL_NAME);
    channel.onmessage = (event: MessageEvent) => {
      const purgedMemberId = purgedMemberIdOf(event.data);
      if (purgedMemberId === undefined) return;
      let isApplied = purgeListeners.size === 0;
      for (const listener of purgeListeners) {
        if (listener(purgedMemberId)) isApplied = true;
      }
      if (!isApplied) return;
      persistenceGeneration += 1;
      void messagingCacheStore.remove();
    };
    purgeChannel = channel;
  } catch {
    purgeChannel = null;
  }
  return purgeChannel;
}

/** Delete the persisted record, cancel any write still queued here and tell
 *  every other open context of the app to do the same. Pass the member whose
 *  record it is when known, so a context confirmed as someone else keeps its
 *  own. Safe to call in any mode and when nothing is stored. */
export function purgeMessagingCache(
  memberId: string | null = null,
): Promise<void> {
  persistenceGeneration += 1;
  try {
    sharedPurgeChannel()?.postMessage({ type: "purge", memberId });
  } catch {
    // Best-effort: this context's own delete below still runs.
  }
  return messagingCacheStore.remove();
}

/** Run `listener` whenever ANOTHER context of the app purges the cache.
 *  Returns the unsubscribe function. */
export function subscribeToMessagingCachePurge(
  listener: PurgeListener,
): () => void {
  purgeListeners.add(listener);
  sharedPurgeChannel();
  return () => {
    purgeListeners.delete(listener);
  };
}

/**
 * Keep the persisted record in step with the live cache for one member.
 * Writes are throttled to one per `MESSAGING_CACHE_WRITE_THROTTLE_MS`. A write
 * is also started when the page is hidden or unloaded, but the browser may
 * end the page before IndexedDB commits it, so the last changes can still be
 * lost. Returns the stop function. Stopping never writes: a stop means the
 * member changed or signed out, and writing then could outlive the purge.
 */
export function startMessagingCacheWriter(
  queryClient: QueryClient,
  memberId: string,
  readCurrentUser: () => AuthUser | null,
  restored: PersistedMessagingCache | null,
): () => void {
  persistenceGeneration += 1;
  const writerGeneration = persistenceGeneration;
  const buster = currentBuster();
  const viewedAtByConversation = new Map<string, number>();
  let previous = restored?.member.id === memberId ? restored : null;
  for (const thread of previous?.threads ?? []) {
    viewedAtByConversation.set(thread.conversationId, thread.viewedAt);
  }
  let isStopped = false;
  let hasUnsavedChanges = false;
  let lastWriteAt = Date.now();
  let writeTimer: ReturnType<typeof setTimeout> | undefined;

  const isCurrentWriter = () =>
    !isStopped && persistenceGeneration === writerGeneration;

  function markOpenThreadsViewed(now: number): void {
    for (const query of queryClient.getQueryCache().getAll()) {
      const conversationId = persistableThreadConversationId(query.queryKey);
      if (conversationId && query.getObserversCount() > 0) {
        viewedAtByConversation.set(conversationId, now);
      }
    }
  }

  function writeNow(): void {
    if (writeTimer !== undefined) clearTimeout(writeTimer);
    writeTimer = undefined;
    if (!hasUnsavedChanges || !isCurrentWriter()) return;
    const currentUser = readCurrentUser();
    if (!currentUser || currentUser.id !== memberId) return;
    hasUnsavedChanges = false;
    const now = Date.now();
    lastWriteAt = now;
    markOpenThreadsViewed(now);
    let decision: MessagingCacheWriteDecision;
    try {
      const { queries } = dehydrate(queryClient, {
        shouldDehydrateQuery: isPersistableMessagingQuery,
        shouldDehydrateMutation: () => false,
      });
      decision = decideMessagingCacheWrite({
        dehydratedQueries: queries,
        viewedAtByConversation,
        previous,
        member: toPersistedMemberSession(currentUser),
        buster,
        now,
        measureCharacters,
      });
    } catch {
      return;
    }
    if (decision.kind === "skip") return;
    if (decision.kind === "delete") {
      previous = null;
      void messagingCacheStore.remove();
      return;
    }
    previous = decision.record;
    void messagingCacheStore.write(decision.record, isCurrentWriter);
  }

  function scheduleWrite(): void {
    hasUnsavedChanges = true;
    if (writeTimer !== undefined || !isCurrentWriter()) return;
    const delay = Math.max(
      0,
      lastWriteAt + MESSAGING_CACHE_WRITE_THROTTLE_MS - Date.now(),
    );
    writeTimer = setTimeout(writeNow, delay);
  }

  // `removed` is ignored on purpose: sign-out's `queryClient.clear()` emits it
  // for every query, and garbage collection is not a reason to rewrite.
  const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
    const queryKey: readonly unknown[] = (event.query as Query).queryKey;
    const conversationId = persistableThreadConversationId(queryKey);
    if (conversationId) {
      if (event.type === "observerAdded" || event.type === "observerRemoved") {
        viewedAtByConversation.set(conversationId, Date.now());
        scheduleWrite();
      } else if (event.type === "updated") {
        scheduleWrite();
      }
      return;
    }
    if (event.type === "updated" && isPersistableConversationsKey(queryKey)) {
      scheduleWrite();
    }
  });

  const flushWhenHidden = () => {
    if (document.visibilityState === "hidden") writeNow();
  };
  window.addEventListener("pagehide", writeNow);
  document.addEventListener("visibilitychange", flushWhenHidden);

  return () => {
    isStopped = true;
    if (writeTimer !== undefined) clearTimeout(writeTimer);
    writeTimer = undefined;
    unsubscribe();
    window.removeEventListener("pagehide", writeNow);
    document.removeEventListener("visibilitychange", flushWhenHidden);
  };
}
