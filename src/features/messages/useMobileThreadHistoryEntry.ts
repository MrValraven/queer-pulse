// src/features/messages/useMobileThreadHistoryEntry.ts
import { useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ThreadEntryState {
  messagesThread?: boolean;
}

/** On a phone the list and the open conversation share one URL: `view` is
 *  page state, so the system back (Android button, iOS edge swipe, the app's
 *  own swipe) used to skip the list and leave Messages altogether. Opening a
 *  thread now pushes a same-URL history entry marked `messagesThread`, the
 *  way WhatsApp/Telegram layer a chat over the chat list:
 *  - back pops that entry, and losing the marker drops the view to the list;
 *  - any in-app close (header chevron, deleting or leaving the thread) pops
 *    the entry too, so history never holds a stale thread step;
 *  - forward onto the entry reopens the thread;
 *  - a reload that lands on a marked entry (the page restarts on the list)
 *    pops it, so history keeps no dead step.
 *  Desktop shows both panes at once and never touches history here. */
export function useMobileThreadHistoryEntry(
  isMobile: boolean,
  view: "list" | "thread",
  setView: Dispatch<SetStateAction<"list" | "thread">>,
) {
  const location = useLocation();
  const navigate = useNavigate();
  const isThreadEntry =
    (location.state as ThreadEntryState | null)?.messagesThread === true;
  const wasThreadEntryRef = useRef(isThreadEntry);

  useEffect(() => {
    const wasThreadEntry = wasThreadEntryRef.current;
    wasThreadEntryRef.current = isThreadEntry;
    if (!isMobile) return;

    const hasLeftThreadEntry = wasThreadEntry && !isThreadEntry;
    const hasEnteredThreadEntry = !wasThreadEntry && isThreadEntry;
    if (hasLeftThreadEntry && view === "thread") {
      setView("list");
    } else if (hasEnteredThreadEntry && view === "list") {
      setView("thread");
    } else if (view === "thread" && !isThreadEntry) {
      const threadEntryState: ThreadEntryState = { messagesThread: true };
      void navigate(
        { pathname: location.pathname, search: location.search },
        { state: threadEntryState },
      );
    } else if (view === "list" && isThreadEntry) {
      void navigate(-1);
    }
    // Deliberate: runs on the view/entry pair only; the path it pushes is read
    // fresh at that moment and must not re-trigger the effect on its own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, view, isThreadEntry]);
}
