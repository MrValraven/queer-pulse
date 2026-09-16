import type { DehydratedState, InfiniteData } from "@tanstack/react-query";
import type {
  AuthUser,
  MemberStatus,
} from "../../../features/auth/api/auth.api";

/**
 * The pure half of PRD-375's messaging cache persistence: which queries are
 * persisted, how they are trimmed and capped, and whether a stored record may
 * be restored. No IndexedDB, no clock and no query client in here, so every
 * rule is covered by `messagingCacheSelection.test.ts`.
 */

export type DehydratedQuery = DehydratedState["queries"][number];

/** Bump when the persisted shape (or a persisted query's data shape) changes;
 *  a record written under another value is discarded on read. This is the
 *  ONLY thing that invalidates a saved record: it deliberately ignores the
 *  app's release version, so a routine deploy that touches none of the
 *  persisted shapes leaves a member's saved inbox in place, surviving the
 *  update. */
export const MESSAGING_CACHE_SCHEMA_VERSION = 2;
export const MESSAGING_CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
export const MESSAGING_CACHE_MAX_THREADS = 10;
/** About 2 MB, measured as serialized JSON characters. */
export const MESSAGING_CACHE_MAX_CHARACTERS = 2_000_000;

/** The slice of the signed-in member kept beside the cache, so a cold offline
 *  launch can render the inbox as them without `/auth/me`. No email, no role
 *  and no staff grants: an offline session never carries more than a member. */
export interface PersistedMemberSession {
  id: string;
  status: MemberStatus;
  ageAttestedAt: string | null;
  onboardedAt: string | null;
  profile: AuthUser["profile"];
}

export interface PersistedThread {
  conversationId: string;
  /** When the member last had this thread open (epoch ms); ranks threads. */
  viewedAt: number;
  query: DehydratedQuery;
}

export interface PersistedMessagingCache {
  buster: string;
  savedAt: number;
  member: PersistedMemberSession;
  conversations: DehydratedQuery | null;
  threads: PersistedThread[];
}

interface ThreadPage {
  items: unknown[];
  nextCursor: string | null;
}

/** The record is usable across releases; only a schema bump (see
 *  {@link MESSAGING_CACHE_SCHEMA_VERSION}) invalidates it. */
export function messagingCacheBusterFor(): string {
  return `${MESSAGING_CACHE_SCHEMA_VERSION}`;
}

/** The live inbox exactly as `useConversations` keys it: live mode, and no
 *  demo-only deleted-chat token. */
export function isPersistableConversationsKey(
  queryKey: readonly unknown[],
): boolean {
  return (
    queryKey.length === 3 &&
    queryKey[0] === "conversations" &&
    queryKey[1] === false &&
    queryKey[2] === ""
  );
}

/** The conversation id of a live `useMessageThread` query, else null. */
export function persistableThreadConversationId(
  queryKey: readonly unknown[],
): string | null {
  if (queryKey.length !== 3) return null;
  if (queryKey[0] !== "messages" || queryKey[2] !== false) return null;
  const conversationId = queryKey[1];
  return typeof conversationId === "string" && conversationId !== ""
    ? conversationId
    : null;
}

function isLocalOnlyUrl(url: unknown): boolean {
  return (
    typeof url === "string" &&
    (url.startsWith("blob:") || url.startsWith("data:"))
  );
}

/** A message whose attachment points at an in-memory `blob:` or inline
 *  `data:` payload. Neither survives a reload, and a `data:` URL would put the
 *  file itself on disk, so such a message is never persisted. */
function carriesLocalOnlyAttachment(item: unknown): boolean {
  if (typeof item !== "object" || item === null) return false;
  const attachment = (item as { attachment?: unknown }).attachment;
  if (typeof attachment !== "object" || attachment === null) return false;
  const { url, previewUrl } = attachment as {
    url?: unknown;
    previewUrl?: unknown;
  };
  return isLocalOnlyUrl(url) || isLocalOnlyUrl(previewUrl);
}

/**
 * A thread query cut down to its newest page (page 0: pages are newest-first,
 * and live upserts write there). The page object itself is reused when no
 * message had to be dropped, so a size measurement memoised on it stays warm
 * across writes.
 */
export function trimThreadToNewestPage(
  query: DehydratedQuery,
): DehydratedQuery | null {
  const data = query.state.data as InfiniteData<ThreadPage> | undefined;
  if (!data || !Array.isArray(data.pages) || data.pages.length === 0) {
    return null;
  }
  const newestPage = data.pages[0];
  if (!newestPage || !Array.isArray(newestPage.items)) return null;
  const keptItems = newestPage.items.filter(
    (item) => !carriesLocalOnlyAttachment(item),
  );
  const keptPage =
    keptItems.length === newestPage.items.length
      ? newestPage
      : { ...newestPage, items: keptItems };
  const pageParams = Array.isArray(data.pageParams)
    ? data.pageParams.slice(0, 1)
    : [undefined];
  return {
    ...query,
    state: {
      ...query.state,
      data: { pages: [keptPage], pageParams },
      fetchMeta: null,
    },
  };
}

/** The value whose serialized size a persisted entry is charged for. */
export function measuredValueOf(query: DehydratedQuery): unknown {
  const data = query.state.data as InfiniteData<ThreadPage> | undefined;
  if (data && Array.isArray(data.pages) && data.pages.length === 1) {
    return data.pages[0];
  }
  return query.state.data;
}

function conversationIdsOf(query: DehydratedQuery | null): Set<string> | null {
  const rows = query?.state.data;
  if (!Array.isArray(rows)) return null;
  const ids = new Set<string>();
  for (const row of rows) {
    const id = (row as { id?: unknown } | null)?.id;
    if (typeof id === "string") ids.add(id);
  }
  return ids;
}

export interface MessagingCacheSnapshotInput {
  /** Successful live messaging queries, straight from `dehydrate`. */
  dehydratedQueries: readonly DehydratedQuery[];
  viewedAtByConversation: ReadonlyMap<string, number>;
  /** The last record written or restored; its threads are carried forward
   *  when their queries were garbage-collected from memory since. */
  previous: PersistedMessagingCache | null;
  member: PersistedMemberSession;
  buster: string;
  now: number;
  measureCharacters: (value: unknown) => number;
  maxThreads?: number;
  maxCharacters?: number;
}

function collectThreadCandidates(
  input: MessagingCacheSnapshotInput,
  previous: PersistedMessagingCache | null,
): Map<string, PersistedThread> {
  const candidates = new Map<string, PersistedThread>();
  for (const thread of previous?.threads ?? []) {
    const viewedAt =
      input.viewedAtByConversation.get(thread.conversationId) ??
      thread.viewedAt;
    candidates.set(thread.conversationId, { ...thread, viewedAt });
  }
  for (const query of input.dehydratedQueries) {
    const conversationId = persistableThreadConversationId(query.queryKey);
    if (!conversationId) continue;
    const viewedAt =
      input.viewedAtByConversation.get(conversationId) ??
      candidates.get(conversationId)?.viewedAt;
    // Cached but never opened (a prefetch): not a "viewed" thread.
    if (viewedAt === undefined) continue;
    const trimmed = trimThreadToNewestPage(query);
    if (trimmed) {
      candidates.set(conversationId, {
        conversationId,
        viewedAt,
        query: trimmed,
      });
    }
  }
  return candidates;
}

/**
 * What the writer does with the store:
 * - `write` the record;
 * - `skip`: nothing worth persisting is loaded, so the stored record stays;
 * - `delete`: the inbox alone is over budget, so no fresh record can be
 *   written and the stored one (older than what is on screen) is removed.
 */
export type MessagingCacheWriteDecision =
  | { kind: "write"; record: PersistedMessagingCache }
  | { kind: "skip" }
  | { kind: "delete" };

function isOlderThanMaxAge(query: DehydratedQuery, now: number): boolean {
  return now - query.state.dataUpdatedAt > MESSAGING_CACHE_MAX_AGE_MS;
}

/**
 * The inbox always goes first. Threads follow newest-viewed first, at most
 * `maxThreads`, and the first thread that would cross the size budget ends
 * the list, so the oldest threads are the ones dropped. A thread whose
 * conversation left the inbox (deleted, left, blocked) is dropped with it.
 * So is any entry whose data was last fetched more than seven days ago:
 * carried-forward entries keep their original fetch time, so a record that
 * is rewritten every day still lets an old thread age out.
 */
export function decideMessagingCacheWrite(
  input: MessagingCacheSnapshotInput,
): MessagingCacheWriteDecision {
  const maxThreads = input.maxThreads ?? MESSAGING_CACHE_MAX_THREADS;
  const maxCharacters = input.maxCharacters ?? MESSAGING_CACHE_MAX_CHARACTERS;
  const previous =
    input.previous?.member.id === input.member.id ? input.previous : null;
  const carriedConversations =
    previous?.conversations &&
    !isOlderThanMaxAge(previous.conversations, input.now)
      ? previous.conversations
      : null;
  const conversations =
    input.dehydratedQueries.find((query) =>
      isPersistableConversationsKey(query.queryKey),
    ) ?? carriedConversations;
  const knownConversationIds = conversationIdsOf(conversations);
  const ranked = [...collectThreadCandidates(input, previous).values()]
    .filter(
      (thread) =>
        !isOlderThanMaxAge(thread.query, input.now) &&
        (!knownConversationIds ||
          knownConversationIds.has(thread.conversationId)),
    )
    .sort((left, right) => right.viewedAt - left.viewedAt)
    .slice(0, maxThreads);
  if (!conversations && ranked.length === 0) return { kind: "skip" };

  let usedCharacters = conversations
    ? input.measureCharacters(measuredValueOf(conversations))
    : 0;
  if (usedCharacters > maxCharacters) return { kind: "delete" };
  const threads: PersistedThread[] = [];
  for (const thread of ranked) {
    const threadCharacters = input.measureCharacters(
      measuredValueOf(thread.query),
    );
    if (usedCharacters + threadCharacters > maxCharacters) break;
    usedCharacters += threadCharacters;
    threads.push(thread);
  }
  return {
    kind: "write",
    record: {
      buster: input.buster,
      savedAt: input.now,
      member: input.member,
      conversations,
      threads,
    },
  };
}

/** The record `decideMessagingCacheWrite` would write, or null. */
export function buildPersistedMessagingCache(
  input: MessagingCacheSnapshotInput,
): PersistedMessagingCache | null {
  const decision = decideMessagingCacheWrite(input);
  return decision.kind === "write" ? decision.record : null;
}

/** Whether a stored value is a record this build may restore. */
export function isPersistedMessagingCacheUsable(
  record: unknown,
  { buster, now }: { buster: string; now: number },
): record is PersistedMessagingCache {
  if (typeof record !== "object" || record === null) return false;
  const candidate = record as Partial<PersistedMessagingCache>;
  if (candidate.buster !== buster) return false;
  if (typeof candidate.savedAt !== "number") return false;
  if (now - candidate.savedAt > MESSAGING_CACHE_MAX_AGE_MS) return false;
  if (!isPersistedMemberSession(candidate.member)) return false;
  return Array.isArray(candidate.threads);
}

function isNullableString(value: unknown): boolean {
  return value === null || typeof value === "string";
}

/** Every field `toProvisionalAuthUser` reads from a stored member. */
function isPersistedMemberSession(
  value: unknown,
): value is PersistedMemberSession {
  if (typeof value !== "object" || value === null) return false;
  const member = value as Record<string, unknown>;
  if (typeof member.id !== "string" || member.id === "") return false;
  if (
    member.status !== "active" &&
    member.status !== "suspended" &&
    member.status !== "deactivated"
  ) {
    return false;
  }
  if (
    !isNullableString(member.ageAttestedAt) ||
    !isNullableString(member.onboardedAt)
  ) {
    return false;
  }
  const profile = member.profile;
  if (typeof profile !== "object" || profile === null) return false;
  const { slug, firstName, lastName } = profile as Record<string, unknown>;
  return (
    typeof slug === "string" &&
    typeof firstName === "string" &&
    typeof lastName === "string"
  );
}

function isFreshEntry(query: DehydratedQuery | null, now: number): boolean {
  const dataUpdatedAt = (query as { state?: { dataUpdatedAt?: unknown } })
    ?.state?.dataUpdatedAt;
  return (
    typeof dataUpdatedAt === "number" &&
    now - dataUpdatedAt <= MESSAGING_CACHE_MAX_AGE_MS
  );
}

/**
 * A usable record trimmed to the entries fetched within the last seven days,
 * or null when none are. The record's own `savedAt` is not enough on its own:
 * a record rewritten yesterday can still carry a thread last fetched thirteen
 * days ago. Applied on read, so the restore and OfflinePage's link only ever
 * see fresh entries.
 */
export function withoutExpiredEntries(
  record: PersistedMessagingCache,
  now: number,
): PersistedMessagingCache | null {
  const conversations = isFreshEntry(record.conversations, now)
    ? record.conversations
    : null;
  const threads = record.threads.filter((thread) =>
    isFreshEntry(thread?.query ?? null, now),
  );
  if (!conversations && threads.length === 0) return null;
  if (
    conversations === record.conversations &&
    threads.length === record.threads.length
  ) {
    return record;
  }
  return { ...record, conversations, threads };
}

export function toPersistedMemberSession(
  user: AuthUser,
): PersistedMemberSession {
  return {
    id: user.id,
    status: user.status,
    ageAttestedAt: user.ageAttestedAt,
    onboardedAt: user.onboardedAt,
    profile: { ...user.profile },
  };
}

/** The read-only stand-in for `/auth/me` while a cold offline launch renders
 *  the saved inbox. Least privilege: plain member, no staff grants. */
export function toProvisionalAuthUser(
  member: PersistedMemberSession,
): AuthUser {
  return {
    id: member.id,
    email: "",
    status: member.status,
    role: "member",
    staffRoles: [],
    ageAttestedAt: member.ageAttestedAt,
    onboardedAt: member.onboardedAt,
    suspendedUntil: null,
    suspension: null,
    profile: member.profile,
  };
}
