import type { QueryClient } from "@tanstack/react-query";
import type { AuthorSummary, IdentityKind } from "../contracts/contracts";

/** One mailbox the member may read and answer (`GET /identities/mailboxes`,
 *  backend `MailboxSummaryDto`). Hand-mirrored: the two repos share no types. */
export interface MailboxSummary {
  identityId: string;
  kind: IdentityKind;
  /** Null when the owning row vanished mid-request; render
   *  `messages:mailbox.untitled`. */
  displayName: string | null;
  handle: string | null;
  avatarUrl: string | null;
  /** Unread THREADS in this mailbox, by the nav badge's rules. */
  unreadCount: number;
  isOwner: boolean;
  /** A persona moderation removed: readable, and nothing can be sent as it. */
  isReadOnly: boolean;
  /** The owner's staff-naming switch. Null on the profile mailbox. */
  shouldShowStaffNames: boolean | null;
  /** The member's own naming preference here, true until they change it.
   *  Null on the profile mailbox. */
  shouldAllowMyName: boolean | null;
  /** ENG-456: set when customers never see a staff name from this mailbox,
   *  whatever both switches say. `unlinkedPersona` is a persona that keeps
   *  who runs it private. Null, or absent from an older server, otherwise. */
  staffNamesLockedReason?: StaffNamesLockedReason | null;
}

/** Why a mailbox never names its staff to customers (backend
 *  `StaffNamesLockedReason`). */
export type StaffNamesLockedReason = "unlinkedPersona";

/**
 * Deliberately under the nav badge's `["conversations-unread-count"]` prefix:
 * every place that already invalidates the badge after a read, a send, a
 * socket frame or a block also refreshes the per-mailbox counts, with no new
 * call site. Safe because nothing writes that prefix with `setQueryData`;
 * the badge itself sits at `["conversations-unread-count", demoMode, token]`,
 * whose second element is a boolean, so this prefix never matches it.
 */
export const MAILBOXES_QUERY_KEY_PREFIX = [
  "conversations-unread-count",
  "mailboxes",
] as const;

export function mailboxesQueryKey(demoMode: boolean) {
  return [...MAILBOXES_QUERY_KEY_PREFIX, demoMode] as const;
}

/** Who is reading: the member's own handle plus every listing, persona and
 *  company identity they currently answer for. */
export interface MessageViewer {
  myHandle: string | null;
  staffedIdentityIds: ReadonlySet<string>;
  /** PRD-423: the member's own per-chat keys, one per matched Go together
   *  chat they hold a seat in (`Conversation.viewerMemberKey`). Inside a
   *  matched chat every member reference is such a key, so a sender or
   *  frame carrying one of these is the member themself. Absent reads as
   *  none. */
  ownMemberKeys?: ReadonlySet<string>;
  /** The conversation ids of the viewer's OWN official threads: their
   *  QueerPulse Team thread as its member, read from the personal inbox. A
   *  staff member (admin, moderator) staffs the `official` identity, yet in
   *  their own thread the team is the other side. Absent reads as none. */
  ownOfficialConversationIds?: ReadonlySet<string>;
}

export function staffedIdentityIdsOf(
  mailboxes: readonly MailboxSummary[] | undefined,
): ReadonlySet<string> {
  return new Set(
    (mailboxes ?? [])
      .filter((mailbox) => mailbox.kind !== "profile")
      .map((mailbox) => mailbox.identityId),
  );
}

/**
 * The one "is this ours" test for a message sender (spec 6.3). A message sent
 * as an identity the viewer staffs sits on the viewer's side whoever typed it,
 * so a colleague's reply is never unread and never answered twice. Otherwise
 * the old handle comparison holds, since a personal sender carries no
 * identity id and handles share one namespace with identities.
 *
 * One exception to the staffed-identity rule: the viewer's own official
 * thread. Admins and moderators staff the QueerPulse Team identity AND are
 * the member of their own official thread, so there a team message is the
 * other side. The thread is named by `viewer.ownOfficialConversationIds`
 * (an official row without `mailboxIdentityId`, the member's own view), and
 * the handle comparison still applies, so the member's own replies stay on
 * their side.
 *
 * The spec phrases this as a comparison with the ACTIVE identity. A thread
 * belongs to exactly one mailbox and a member cannot be the customer of a
 * mailbox they answer for (`IDENTITY_IS_YOUR_OWN`), so "an identity I staff"
 * and "this thread's seat identity" agree on every thread the viewer can read;
 * the set form also works where no thread is open (realtime frames, search).
 *
 * A missing sender reads as the other side. The socket frame contract is
 * hand-written, and a malformed live frame must never throw inside a socket
 * handler.
 */
export function isFromViewerSide(
  sender: Pick<AuthorSummary, "handle" | "identityId"> | null | undefined,
  viewer: MessageViewer,
  conversationId?: string | null,
): boolean {
  const identityId = sender?.identityId;
  const isInOwnOfficialThread =
    !!conversationId &&
    (viewer.ownOfficialConversationIds?.has(conversationId) ?? false);
  if (
    identityId &&
    !isInOwnOfficialThread &&
    viewer.staffedIdentityIds.has(identityId)
  ) {
    return true;
  }
  return isViewerHandle(sender?.handle, viewer);
}

/** Whether a member reference names the viewer: their own handle, or one of
 *  their per-chat keys in a matched Go together chat (PRD-423). */
export function isViewerHandle(
  handle: string | null | undefined,
  viewer: MessageViewer,
): boolean {
  if (!handle) return false;
  if (viewer.myHandle && handle === viewer.myHandle) return true;
  return viewer.ownMemberKeys?.has(handle) ?? false;
}

/** The cached conversation rows (inbox lists and single-conversation
 *  reads) that may carry a `viewerMemberKey`, keyed by these prefixes. */
const MEMBER_KEY_CONVERSATION_QUERY_PREFIXES = [
  ["conversations"],
  ["conversation-detail"],
] as const;

/** PRD-423: the member's own per-chat keys, read from whatever conversation
 *  rows are cached, for code that runs outside React (the realtime client).
 *  Empty before the first load, which only means the member's own frame in
 *  a matched chat may briefly read as another member's until the inbox
 *  arrives. Sorted, so equal sets compare equal as strings. */
export function readOwnMemberKeys(queryClient: QueryClient): string[] {
  const memberKeys = new Set<string>();
  const collect = (row: unknown) => {
    if (row && typeof row === "object" && "viewerMemberKey" in row) {
      const memberKey = (row as { viewerMemberKey?: unknown }).viewerMemberKey;
      if (typeof memberKey === "string" && memberKey) {
        memberKeys.add(memberKey);
      }
    }
  };
  for (const queryKey of MEMBER_KEY_CONVERSATION_QUERY_PREFIXES) {
    for (const [, data] of queryClient.getQueriesData<unknown>({ queryKey })) {
      if (Array.isArray(data)) data.forEach(collect);
      else collect(data);
    }
  }
  return [...memberKeys].sort();
}

/** The viewer's own official thread ids, read from whatever conversation rows
 *  are cached: an official row without `mailboxIdentityId` is the member's own
 *  view of their QueerPulse Team thread (the staff view carries it). Sorted,
 *  so equal sets compare equal as strings. */
export function readOwnOfficialConversationIds(
  queryClient: QueryClient,
): string[] {
  const conversationIds = new Set<string>();
  const collect = (row: unknown) => {
    if (!row || typeof row !== "object") return;
    // The cache holds adapted rows (`official`) and may hold raw DTOs
    // (`isOfficial`); either names the QueerPulse Team thread.
    const { id, official, isOfficial, mailboxIdentityId } = row as {
      id?: unknown;
      official?: unknown;
      isOfficial?: unknown;
      mailboxIdentityId?: unknown;
    };
    if (
      (official === true || isOfficial === true) &&
      !mailboxIdentityId &&
      typeof id === "string" &&
      id
    ) {
      conversationIds.add(id);
    }
  };
  for (const queryKey of MEMBER_KEY_CONVERSATION_QUERY_PREFIXES) {
    for (const [, data] of queryClient.getQueriesData<unknown>({ queryKey })) {
      if (Array.isArray(data)) data.forEach(collect);
      else collect(data);
    }
  }
  return [...conversationIds].sort();
}

/** Staffed identity ids from whatever mailbox lists are cached, for code that
 *  runs outside React (the realtime client). Empty before the first load,
 *  which only means a colleague's reply may briefly count as unread locally
 *  until the server's own counts arrive. */
export function readStaffedIdentityIds(
  queryClient: QueryClient,
): ReadonlySet<string> {
  const identityIds = new Set<string>();
  for (const [, mailboxes] of queryClient.getQueriesData<MailboxSummary[]>({
    queryKey: MAILBOXES_QUERY_KEY_PREFIX,
  })) {
    for (const identityId of staffedIdentityIdsOf(mailboxes)) {
      identityIds.add(identityId);
    }
  }
  return identityIds;
}

/** One QueryClient's live sets of the member's own matched-chat keys and own
 *  official thread ids, both read in one scan of the cached conversation rows. */
interface OwnMemberKeysMemo {
  snapshot: string;
  keys: ReadonlySet<string>;
  officialConversationIds: ReadonlySet<string>;
  listeners: Set<() => void>;
}

const ownMemberKeysMemoByClient = new WeakMap<QueryClient, OwnMemberKeysMemo>();

const MEMBER_KEY_SNAPSHOT_SEPARATOR = ",";
const OFFICIAL_SNAPSHOT_SEPARATOR = "|";

function snapshotOf(keys: string[], officialConversationIds: string[]): string {
  return `${keys.join(MEMBER_KEY_SNAPSHOT_SEPARATOR)}${OFFICIAL_SNAPSHOT_SEPARATOR}${officialConversationIds.join(MEMBER_KEY_SNAPSHOT_SEPARATOR)}`;
}

/** Whether a cache event can change the member's own keys: a conversation
 *  list or detail entry added, removed or updated. */
function isConversationQueryKey(queryKey: readonly unknown[]): boolean {
  const head = queryKey[0];
  return MEMBER_KEY_CONVERSATION_QUERY_PREFIXES.some(
    ([prefix]) => head === prefix,
  );
}

/**
 * PRD-423: the memo behind {@link ownMemberKeysOf}, one per QueryClient,
 * kept current by a single query-cache subscription that recomputes only
 * when a conversation list or detail entry changes, so a busy cache (typing,
 * presence, message pages) costs one key comparison per event and every
 * reader shares one scan.
 */
function ownMemberKeysMemoFor(queryClient: QueryClient): OwnMemberKeysMemo {
  const existing = ownMemberKeysMemoByClient.get(queryClient);
  if (existing) return existing;
  const keys = readOwnMemberKeys(queryClient);
  const officialIds = readOwnOfficialConversationIds(queryClient);
  const memo: OwnMemberKeysMemo = {
    snapshot: snapshotOf(keys, officialIds),
    keys: new Set(keys),
    officialConversationIds: new Set(officialIds),
    listeners: new Set(),
  };
  ownMemberKeysMemoByClient.set(queryClient, memo);
  queryClient.getQueryCache().subscribe((event) => {
    if (
      event.type !== "added" &&
      event.type !== "removed" &&
      event.type !== "updated"
    ) {
      return;
    }
    const { queryKey } = event.query as { queryKey: readonly unknown[] };
    if (!isConversationQueryKey(queryKey)) return;
    const nextKeys = readOwnMemberKeys(queryClient);
    const nextOfficialIds = readOwnOfficialConversationIds(queryClient);
    const nextSnapshot = snapshotOf(nextKeys, nextOfficialIds);
    if (nextSnapshot === memo.snapshot) return;
    memo.snapshot = nextSnapshot;
    memo.keys = new Set(nextKeys);
    memo.officialConversationIds = new Set(nextOfficialIds);
    for (const listener of memo.listeners) listener();
  });
  return memo;
}

/** PRD-423: the member's own matched-chat keys, from the shared memo. */
export function ownMemberKeysOf(queryClient: QueryClient): ReadonlySet<string> {
  return ownMemberKeysMemoFor(queryClient).keys;
}

/** The viewer's own official thread ids, from the same shared memo. */
export function ownOfficialConversationIdsOf(
  queryClient: QueryClient,
): ReadonlySet<string> {
  return ownMemberKeysMemoFor(queryClient).officialConversationIds;
}

/** The memo's sorted, joined snapshot (keys and official thread ids), stable until the set changes, for
 *  `useSyncExternalStore`. */
export function ownMemberKeysSnapshotOf(queryClient: QueryClient): string {
  return ownMemberKeysMemoFor(queryClient).snapshot;
}

/** Calls `listener` whenever the member's own matched-chat keys change. */
export function subscribeOwnMemberKeys(
  queryClient: QueryClient,
  listener: () => void,
): () => void {
  const memo = ownMemberKeysMemoFor(queryClient);
  memo.listeners.add(listener);
  return () => {
    memo.listeners.delete(listener);
  };
}
