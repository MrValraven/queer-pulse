import { useMemo, type Dispatch, type SetStateAction } from "react";
import { useSearchParams } from "react-router-dom";
import type { Conversation } from "./data";
import { useConversationDetail } from "./api/useConversations";
import { withMailboxSeat } from "./mailboxes/mailboxScope";
import type { ConversationListScope } from "./mailboxes/mailboxScope";
import {
  describeRequestedRead,
  requestedDetailConversationId,
  resolveActiveThread,
  shouldDefaultSelectFirstThread,
} from "./activeThreadResolution";

interface RequestedActiveThreadInput {
  activeId: string;
  setActiveId: Dispatch<SetStateAction<string>>;
  allThreads: Conversation[];
  /** The inbox's own first load is still in flight. */
  isInboxLoading: boolean;
  mailboxScope: ConversationListScope | null;
  demoMode: boolean;
}

/**
 * The open thread for the requested `activeId` (ENG-403), extracted from
 * `useMessagesController`: the default select of the first thread, held while
 * a `?c=` deep link resolves; the by-id detail read; the resolution to the
 * requested thread alone; and the detail merge (`members`/`draft`, the
 * mailbox seat). Returns `rawActive` (the resolved thread before the merge),
 * `activeWithDetail` (after it), the pane status and a retry for a failed
 * by-id read.
 */
export function useRequestedActiveThread({
  activeId,
  setActiveId,
  allThreads,
  isInboxLoading,
  mailboxScope,
  demoMode,
}: RequestedActiveThreadInput) {
  const [searchParams] = useSearchParams();

  // Default the open thread to the first available once threads load. Adjusting
  // state during render (not in an effect) avoids a cascading re-render frame.
  // The composer (keyed on the thread id) seeds its own persisted draft on
  // mount, so there's nothing to hydrate here. ENG-403: held while a `?c=`
  // deep link is still resolving (`useMessageDeepLinks` opens it, or clears
  // `c` when the thread cannot be read), so row 1 never renders its composer
  // or gets marked read in that window.
  const pendingDeepLinkConversationId = searchParams.get("c");
  if (
    shouldDefaultSelectFirstThread(
      activeId,
      pendingDeepLinkConversationId,
      allThreads.length,
    )
  ) {
    const firstThreadId = allThreads[0]!.id;
    setActiveId(firstThreadId);
  }

  const listedActiveThread = useMemo(
    () => allThreads.find((thread) => thread.id === activeId),
    [allThreads, activeId],
  );

  // ENG-253: `GET /conversations` (what `allThreads` is built from) no longer
  // carries a group's real member roster or a stored draft; see
  // `ConversationResponse.members`/`.draft`'s own docs. Fetch the FULL detail
  // (`GET /conversations/:id`) for the OPEN thread alone, one row per read,
  // and merge its `members`/`draft` onto `rawActive` below. ENG-403:
  // the same read resolves a requested thread past the loaded inbox pages (a
  // search hit, a starred message, a `?c=` deep link into an older chat).
  // Disabled in demo mode (`useConversationDetail`'s own gate): the seeded
  // mock conversation already carries both fields in full, so
  // `activeDetailQuery.data` stays `undefined` there forever and the merge
  // beneath is a pure no-op. Demo mode renders byte-identical to before.
  const activeDetailQuery = useConversationDetail(
    requestedDetailConversationId(activeId, listedActiveThread, demoMode),
  );

  // ENG-403: the requested thread only ever resolves to itself. A thread
  // outside the loaded pages shows the pane's loading state while its by-id
  // read runs, the unavailable state when the server refuses it, and a
  // retryable failed state for a transient failure, so the composer never
  // opens addressed to another conversation.
  const requestedReadState = describeRequestedRead(activeDetailQuery);
  const { thread: rawActive, status: activeThreadStatus } = useMemo(
    () =>
      resolveActiveThread({
        activeId,
        allThreads,
        requestedThread: activeDetailQuery.data,
        requestedReadState,
        isInboxLoading,
        isDeepLinkPending: pendingDeepLinkConversationId !== null,
        demoMode,
      }),
    [
      activeId,
      allThreads,
      activeDetailQuery.data,
      requestedReadState,
      isInboxLoading,
      pendingDeepLinkConversationId,
      demoMode,
    ],
  );
  const { refetch: refetchActiveDetail } = activeDetailQuery;
  const retryActiveThread = () => {
    void refetchActiveDetail();
  };

  // `rawActive` merged with the resolved detail fetch. Until the detail
  // resolves, `members`/`draft` stay exactly what the list row carried
  // (`[]`/`undefined` live post-ENG-253). Every consumer already reads an
  // absent/empty roster as "still loading" (a live group always has at
  // least its owner, so an empty roster can only ever mean that), so this
  // loading window renders nothing false, only briefly less than the whole
  // picture.
  const activeWithDetail = useMemo(() => {
    if (!rawActive) return null;
    const detail = activeDetailQuery.data;
    // Require the id match explicitly, on top of just checking `detail` is
    // present: react-query already keys `activeDetailQuery` by the requested
    // id, so `detail` can only ever be a response FOR that id today, but this
    // check is what actually stops thread A's roster from ever rendering
    // under thread B if that invariant is ever weakened (e.g. a future
    // `placeholderData` option), and it makes the guarantee visible and
    // testable here, resting on nothing the reader has to trust from
    // elsewhere.
    if (!detail || detail.id !== rawActive.id) {
      return mailboxScope
        ? withMailboxSeat(rawActive, mailboxScope)
        : rawActive;
    }
    const merged = {
      ...rawActive,
      // A thread opened by deep link before the list holds it may be a bare
      // placeholder; the detail read names its mailbox, so the seat below
      // still lands.
      mailboxIdentityId:
        rawActive.mailboxIdentityId ?? detail.mailboxIdentityId,
      // The detail roster is the freshest one there is. A group mutation's
      // response is patched into the detail entry and the list together
      // (`patchConversationInList`), and every remote roster change
      // (`conversation:new`, a system pill) refetches the detail alone:
      // list rows carry no roster (ENG-253), so a roster on `rawActive` is
      // only ever the copy a past local mutation left there, which a later
      // remote add or removal never reaches. So the detail's roster wins
      // whenever it has one, and `rawActive`'s stands in while the detail is
      // still loading, absent (demo mode) or carries none.
      members:
        detail.members && detail.members.length > 0
          ? detail.members
          : rawActive.members,
      draft: rawActive.draft ?? detail.draft,
    };
    return mailboxScope ? withMailboxSeat(merged, mailboxScope) : merged;
  }, [rawActive, activeDetailQuery.data, mailboxScope]);

  return { rawActive, activeWithDetail, activeThreadStatus, retryActiveThread };
}
