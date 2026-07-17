import { useState } from "react";
import { EmptyState } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { LIVING } from "../communities/livingCommunities.data";
import {
  RequestsTab,
  ReportsTab,
  MembersTab,
  SettingsTab,
} from "./ModPanelTabs";
import styles from "./ModPanel.module.css";

const TAB_KEYS = [
  ["requests", "modPanel.tabs.requests"],
  ["reports", "modPanel.tabs.reports"],
  ["members", "modPanel.tabs.members"],
  ["settings", "modPanel.tabs.settings"],
] as const;

export function ModPanel({ slug }: { slug: string }) {
  const { t } = useTranslation();
  const living = LIVING[slug];
  const [tab, setTab] = useState<(typeof TAB_KEYS)[number][0]>("requests");

  if (!living) {
    return (
      <EmptyState
        title={t("admin:modPanel.notFound.title")}
        description={t("admin:modPanel.notFound.description")}
      />
    );
  }

  return (
    <div>
      <div className={styles.tabs}>
        {TAB_KEYS.map(([id, labelKey]) => (
          <button
            key={id}
            type="button"
            className={[styles.tab, tab === id && styles.tabActive]
              .filter(Boolean)
              .join(" ")}
            onClick={() => setTab(id)}
          >
            {t(`admin:${labelKey}`)}
          </button>
        ))}
      </div>
      {tab === "requests" && <RequestsTab living={living} />}
      {tab === "reports" && <ReportsTab living={living} />}
      {tab === "members" && <MembersTab living={living} />}
      {tab === "settings" && <SettingsTab living={living} />}
    </div>
  );
}
