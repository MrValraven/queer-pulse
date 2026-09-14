import { FiArchive } from "react-icons/fi";
import { LuMessageCircleQuestion } from "react-icons/lu";
import { Tabs, type Tab } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { InboxTab } from "./threadFilters";
import styles from "./MessagesPage.module.css";

/** Inbox filter tabs (All · Unread · Favorites · Groups · Archived ·
 *  Requests), sitting under the search box. The last two are icon-only
 *  (tooltip + aria-label carry their names) so all six fit the panel's width
 *  on one line — they are also the two you reach for least. Those two sit
 *  pushed to the row's trailing edge (`shouldAlignIconTabsEnd`), so the row
 *  reads as filters on the left, utilities on the right.
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
}: {
  active: InboxTab;
  onChange: (tab: InboxTab) => void;
  /** Incoming message-request count for the Requests tab badge (MSG-1).
   *  `undefined`/0 renders no badge — the shared `Tabs` primitive already
   *  treats a falsy `count` as "no badge". */
  requestsCount?: number;
}) {
  const { t } = useTranslation();
  const tabs: Tab[] = [
    { id: "all", label: t("messages:thread.tabAll") },
    { id: "unread", label: t("messages:thread.tabUnread") },
    { id: "favorites", label: t("messages:thread.tabFavorites") },
    { id: "groups", label: t("messages:thread.tabGroups") },
    {
      id: "archived",
      label: t("messages:thread.tabArchived"),
      icon: <FiArchive aria-hidden />,
      hideLabel: true,
    },
    {
      id: "requests",
      label: t("messages:requests.tabLabel"),
      icon: <LuMessageCircleQuestion aria-hidden />,
      hideLabel: true,
      count: requestsCount,
    },
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
