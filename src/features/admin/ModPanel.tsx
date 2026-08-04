import { useState } from "react";
import { EmptyState, Spinner } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useCommunity } from "../communities/api/useCommunity";
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
  // The real community — demo assembles it from the mock registries, live calls
  // GET /communities/:slug. This replaces a direct `LIVING[slug]` read, which
  // only ever resolved for the handful of mock flagships (so a real moderator's
  // community always 404'd to "not found"). The join-request / roster tabs now
  // source their rows — and their real ids — from the dual-mode api hooks, so a
  // live PATCH targets a real request instead of a mock id behind a fake toast.
  const { living, editable, myRole, notFound, isLoading } = useCommunity(slug);
  const [tab, setTab] = useState<(typeof TAB_KEYS)[number][0]>("requests");

  if (isLoading) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <Spinner />
      </div>
    );
  }

  if (notFound || !living || !editable) {
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
      {tab === "requests" && <RequestsTab slug={slug} />}
      {tab === "reports" && <ReportsTab living={living} />}
      {tab === "members" && <MembersTab slug={slug} />}
      {tab === "settings" && (
        <SettingsTab
          slug={slug}
          editable={editable}
          isOwner={myRole === "owner"}
        />
      )}
    </div>
  );
}
