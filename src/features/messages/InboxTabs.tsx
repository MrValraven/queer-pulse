import { Tabs, type Tab } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import type { InboxTab } from "./threadFilters";
import styles from "./MessagesPage.module.css";

/** Inbox filter tabs (All · Unread · Favorites · Groups · Archived ·
 *  Requests), sitting under the search box. Purely local UI state upstream
 *  (`MessagesThreadList`) — it doesn't need to persist across visits. Hidden
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
    { id: "archived", label: t("messages:thread.tabArchived") },
    {
      id: "requests",
      label: t("messages:requests.tabLabel"),
      count: requestsCount,
    },
  ];
  return (
    <div className={styles.tpTabs}>
      <Tabs
        tabs={tabs}
        active={active}
        onChange={(id) => onChange(id as InboxTab)}
      />
    </div>
  );
}
