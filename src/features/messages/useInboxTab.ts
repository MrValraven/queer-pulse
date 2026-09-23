// src/features/messages/useInboxTab.ts
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { MailboxSummary } from "../../shared/api/mailboxViewer";
import type { InboxTab } from "./threadFilters";

/**
 * The thread list's active tab (All/Unread/Favorites/Groups/Requests, or a
 * business mailbox's own tabs). Local UI state that doesn't need to persist:
 * the list resets it to "All" whenever a search starts, so leaving the search
 * view never strands the list on a stale filter the user can't see the
 * control for.
 */
export function useInboxTab(activeMailbox: MailboxSummary | null) {
  const [activeTab, setActiveTab] = useState<InboxTab>("all");
  // A mailbox switch starts on "All": the tabs differ between the personal
  // mailbox and a business one, so the previous tab may not exist here.
  const activeMailboxIdentityId = activeMailbox?.identityId ?? null;
  const [tabMailboxIdentityId, setTabMailboxIdentityId] = useState(
    activeMailboxIdentityId,
  );
  if (tabMailboxIdentityId !== activeMailboxIdentityId) {
    setTabMailboxIdentityId(activeMailboxIdentityId);
    setActiveTab("all");
  }
  // PRD-353: the `group_invite` bell row and its push counterpart deep-link to
  // `/messages?tab=requests` (mirrors the `?tab=` deep links other consoles
  // already use, e.g. `/admin/moderation?tab=health`). One-shot, cleared right
  // after so a later manual tab switch or a refresh never re-fires it.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get("tab") !== "requests") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot deep-link intent from the URL (an external signal), consumed and cleared immediately below; mirrors useMessageDeepLinks' own notification-tap effect.
    setActiveTab("requests");
    // Delete `tab` alone: a `?c=<id>` deep-link
    // arriving alongside it (or any other param) must survive this clear.
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        next.delete("tab");
        return next;
      },
      { replace: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  return { activeTab, setActiveTab };
}
