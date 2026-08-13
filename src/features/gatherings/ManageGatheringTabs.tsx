import { useState } from "react";
import { Tabs } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { OverviewTab } from "./ManageOverviewTab";
import type { GatheringDetail, OverviewCounts } from "./ManageOverviewTab";
import { AttendeesTab } from "./ManageAttendeesTab";
import { MessagesTab } from "./ManageMessagesTab";
import { SettingsTab } from "./ManageSettingsTab";
import styles from "./ManageGatheringPage.module.css";

export { ManageGatheringSidebar } from "./ManageGatheringSidebar";

type Tab = "overview" | "attendees" | "messages" | "settings";

interface ManageGatheringTabsProps {
  initialTab?: Tab;
  /** Event slug the attendee list is fetched for. */
  slug: string;
  onCancel: () => void;
  details: GatheringDetail[];
  description: string;
  /** Live going/waitlist/spots-left for the overview chips; demo omits it and
   *  the tab falls back to its static trio. */
  overviewCounts?: OverviewCounts;
  onUpdateDetail: (id: string, value: string) => void;
  onUpdateDescription: (value: string) => void;
}

const TAB_ORDER: Tab[] = ["overview", "attendees", "messages", "settings"];

const TAB_LABEL_KEYS: Record<Tab, string> = {
  overview: "gatherings:manage.tabs.overview",
  attendees: "gatherings:manage.tabs.attendees",
  messages: "gatherings:manage.tabs.messages",
  settings: "gatherings:manage.tabs.settings",
};

export function ManageGatheringTabs({
  initialTab = "overview",
  slug,
  onCancel,
  details,
  description,
  overviewCounts,
  onUpdateDetail,
  onUpdateDescription,
}: ManageGatheringTabsProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>(initialTab);
  return (
    <div>
      <Tabs
        variant="underline"
        className={styles.tabBar}
        tabs={TAB_ORDER.map((tabId) => ({
          id: tabId,
          label: t(TAB_LABEL_KEYS[tabId]),
        }))}
        active={tab}
        onChange={(id) => setTab(id as Tab)}
      />
      {tab === "overview" && (
        <OverviewTab
          details={details}
          description={description}
          counts={overviewCounts}
          onUpdateDetail={onUpdateDetail}
          onUpdateDescription={onUpdateDescription}
        />
      )}
      {tab === "attendees" && <AttendeesTab slug={slug} />}
      {tab === "messages" && <MessagesTab />}
      {tab === "settings" && <SettingsTab slug={slug} onCancel={onCancel} />}
    </div>
  );
}
