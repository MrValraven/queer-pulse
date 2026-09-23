import { FiArchive } from "react-icons/fi";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { Tabs, type Tab } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { TFunction } from "../../shared/i18n/types";
import type { InboxTab } from "./threadFilters";
import styles from "./MessagesPage.module.css";

/** The Requests tab entry, personal mailboxes only (see the component doc). */
function requestsTab(t: TFunction, requestsCount: number | undefined): Tab {
  return {
    id: "requests",
    label: t("messages:requests.tabLabel"),
    icon: <LuMessageCircleQuestion aria-hidden />,
    hideLabel: true,
    count: requestsCount,
  };
}

/** Inbox filter tabs (All · Unread · Favorites · Groups · Archived ·
 *  Requests), sitting under the search box. Inside a business, persona or
 *  company mailbox the middle two are Unclaimed and Mine, and Requests drops
 *  out entirely (it lists the member's OWN incoming first-contact requests,
 *  a personal-mailbox concept), leaving five.
 *  Archived, the remaining icon-only tab (tooltip + aria-label carry its
 *  name), still sits pushed to the row's trailing edge
 *  (`shouldAlignIconTabsEnd`), so the row reads as filters on the left,
 *  utilities on the right, whether five or six tabs wide.
 *
 *  Requests is a bubble carrying a question mark — people asking to reach you,
 *  awaiting your yes. Deliberately not a person-plus (the head row's compose
 *  buttons own "start something new", and a plus beside them read as one), not
 *  an inbox tray (a second box beside Archived at 17px), and not an envelope
 *  (QueerPulse sends no email, so nothing here should imply one).
 *
 *  Purely local UI state upstream (`MessagesThreadList`) — it doesn't need to
 *  persist across visits. Hidden
 *  entirely while a search is active or the inbox is empty (see the
 *  caller). */
export function InboxTabs({
  active,
  onChange,
  requestsCount,
  isBusinessMailbox,
}: {
  active: InboxTab;
  onChange: (tab: InboxTab) => void;
  /** Incoming message-request count for the Requests tab badge (MSG-1).
   *  `undefined`/0 renders no badge — the shared `Tabs` primitive already
   *  treats a falsy `count` as "no badge". */
  requestsCount?: number;
  /** A business, persona or company mailbox: Unclaimed and Mine take the
   *  places of Favorites and Groups. */
  isBusinessMailbox: boolean;
}) {
  const { t } = useTranslation();
  const middleTabs: Tab[] = isBusinessMailbox
    ? [
        { id: "unclaimed", label: t("messages:mailbox.tab.unclaimed") },
        { id: "mine", label: t("messages:mailbox.tab.mine") },
      ]
    : [
        { id: "favorites", label: t("messages:thread.tabFavorites") },
        { id: "groups", label: t("messages:thread.tabGroups") },
      ];
  const tabs: Tab[] = [
    { id: "all", label: t("messages:thread.tabAll") },
    { id: "unread", label: t("messages:thread.tabUnread") },
    ...middleTabs,
    {
      id: "archived",
      label: t("messages:thread.tabArchived"),
      icon: <FiArchive aria-hidden />,
      hideLabel: true,
    },
    // Requests lists the member's OWN incoming first-contact requests: a
    // personal-mailbox concept with nothing to show inside a business,
    // persona or company mailbox, so it drops out there entirely rather
    // than rendering empty.
    ...(isBusinessMailbox ? [] : [requestsTab(t, requestsCount)]),
  ];
  return (
    <div className={styles.tpTabs}>
      <Tabs
        tabs={tabs}
        density="compact"
        shouldAlignIconTabsEnd
        active={active}
        onChange={(id) => onChange(id as InboxTab)}
      />
    </div>
  );
}
