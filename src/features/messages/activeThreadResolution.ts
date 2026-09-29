import { ApiError } from "../../shared/api/client";
import type { Conversation } from "./data";
import {
  isServerConversationId,
  realConversationId,
} from "./useMessagesController.helpers";

/**
 * What the thread pane can show for the requested conversation id.
 *
 * - `"none"`: nothing is requested (an empty inbox), so the idle panel shows.
 * - `"ready"`: the thread is known, from the loaded inbox pages or a by-id read.
 * - `"loading"`: the thread sits outside the loaded inbox pages and its by-id
 *   read (or the inbox's own first load) is still in flight, or a `?c=` deep
 *   link is still resolving and holds the default select.
 * - `"unavailable"`: the thread cannot be shown: the by-id read was refused (a
 *   404 or 403 from `GET /conversations/:id`), the id is no server id, or
 *   demo mode holds no such thread in the active mailbox.
 * - `"failed"`: the by-id read failed for a transient reason (a 5xx, a
 *   timeout, no connection), so a retry may well succeed.
 */
export type ActiveThreadStatus =
  "none" | "ready" | "loading" | "unavailable" | "failed";

/** Where the by-id read for a thread outside the loaded pages stands. */
export type RequestedReadState = "pending" | "refused" | "failed" | "settled";

export interface ActiveThreadResolution<Thread extends Conversation> {
  thread: Thread | null;
  status: ActiveThreadStatus;
}

interface ResolveActiveThreadInput<Thread extends Conversation> {
  /** The requested conversation id; `""` when nothing is requested. */
  activeId: string;
  /** Every thread the loaded inbox pages (and this session) hold. */
  allThreads: Thread[];
  /** The by-id read (`useConversationDetail`) for `activeId`, when resolved. */
  requestedThread: Thread | undefined;
  /** Where that by-id read stands (`describeRequestedRead`). */
  requestedReadState: RequestedReadState;
  /** The inbox's own first load is still in flight. */
  isInboxLoading: boolean;
  /** A `?c=` deep link is still resolving (the controller holds its default
   *  select meanwhile, so `activeId` stays `""`). */
  isDeepLinkPending: boolean;
  demoMode: boolean;
}

/**
 * Resolves the open thread for a requested id (ENG-403). A thread in the
 * loaded inbox pages wins. A thread past them (a search hit, a starred
 * message, a `?c=` deep link into an older chat) resolves from its by-id
 * read. A requested id only ever resolves to its own thread: while that
 * read is pending the pane shows its loading state, a refused read shows the
 * unavailable state and a transient failure shows the retryable failed
 * state, so the composer can only ever address the thread the member asked
 * for.
 */
export function resolveActiveThread<Thread extends Conversation>({
  activeId,
  allThreads,
  requestedThread,
  requestedReadState,
  isInboxLoading,
  isDeepLinkPending,
  demoMode,
}: ResolveActiveThreadInput<Thread>): ActiveThreadResolution<Thread> {
  if (!activeId) {
    return { thread: null, status: isDeepLinkPending ? "loading" : "none" };
  }
  const listedThread = allThreads.find((thread) => thread.id === activeId);
  if (listedThread) return { thread: listedThread, status: "ready" };
  if (!demoMode && requestedThread?.id === activeId) {
    return { thread: requestedThread, status: "ready" };
  }
  // The inbox may simply not have landed yet; its rows may hold the thread.
  if (isInboxLoading) return { thread: null, status: "loading" };
  // Demo mode loads every thread of the active mailbox in one page, so a
  // thread missing from it has no by-id read to wait for.
  if (demoMode || !isServerConversationId(activeId)) {
    return { thread: null, status: "unavailable" };
  }
  if (requestedReadState === "pending") {
    return { thread: null, status: "loading" };
  }
  if (requestedReadState === "failed") {
    return { thread: null, status: "failed" };
  }
  return { thread: null, status: "unavailable" };
}

/** A by-id read the server answered with 404 (not a participant, or the
 *  thread is gone) or 403 (no access): retrying cannot change the answer. */
function isRefusedRead(error: unknown): boolean {
  return (
    error instanceof ApiError && (error.status === 404 || error.status === 403)
  );
}

interface RequestedReadQuery {
  isPending: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
}

/**
 * Where the by-id read stands, from its react-query flags. A read that
 * failed transiently and is fetching again (a retry, a focus refetch) counts
 * as pending, so the pane shows its loading state for the retry. A refused
 * read stays refused while it refetches.
 */
export function describeRequestedRead({
  isPending,
  isFetching,
  isError,
  error,
}: RequestedReadQuery): RequestedReadState {
  if (isError) {
    if (isRefusedRead(error)) return "refused";
    return isFetching ? "pending" : "failed";
  }
  return isPending ? "pending" : "settled";
}

/**
 * Whether the controller may default-select the first inbox row: only when
 * nothing is open yet, the inbox has a row, and no `?c=` deep link is still
 * resolving. Picking row 1 during that window would render its composer and,
 * on desktop, mark it read (a "Seen" for a thread the member never opened)
 * before the link lands on the thread it names.
 */
export function shouldDefaultSelectFirstThread(
  activeId: string,
  pendingDeepLinkConversationId: string | null,
  threadCount: number,
): boolean {
  return !activeId && !pendingDeepLinkConversationId && threadCount > 0;
}

/**
 * The conversation id to read by id for the open thread: the listed thread's
 * real server id, or, for a thread outside the loaded inbox pages, the
 * requested id itself when it is a server id. Null in demo mode and for a
 * just-picked placeholder (its id is the recipient's slug).
 */
export function requestedDetailConversationId(
  activeId: string,
  listedThread: Conversation | undefined,
  demoMode: boolean,
): string | null {
  if (demoMode || !activeId) return null;
  if (listedThread) return realConversationId(listedThread);
  return isServerConversationId(activeId) ? activeId : null;
}
