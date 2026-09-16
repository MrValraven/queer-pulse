// src/features/messages/useHideBottomTabBarInThread.ts
import { useEffect } from "react";

/** Inside a conversation on a phone, hides the global bottom tab bar (like
 *  WhatsApp/Telegram) so two bottom bars don't stack. The html signal also
 *  collapses `--bottom-inset` to just the home-indicator inset
 *  (standalone.css) so the composer doesn't reserve space for a bar that's no
 *  longer there. Split out of `MessagesPage` purely to keep that route
 *  component under the line cap. */
export function useHideBottomTabBarInThread(
  isMobile: boolean,
  view: "list" | "thread",
) {
  useEffect(() => {
    const inMobileThread = isMobile && view === "thread";
    const root = document.documentElement;
    if (inMobileThread) root.setAttribute("data-messages-thread", "true");
    else root.removeAttribute("data-messages-thread");
    return () => root.removeAttribute("data-messages-thread");
  }, [isMobile, view]);
}
