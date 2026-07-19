import { useState } from "react";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader, AdminTabs } from "./ui";
import { usePlatformSettings } from "./api/usePlatformSettings";
import { AdminSettingsAccess } from "./AdminSettingsAccess";
import { AdminSettingsHistory } from "./AdminSettingsHistory";
import { LockdownBanner } from "./LockdownBanner";
import styles from "./AdminSettingsPage.module.css";

/**
 * Platform kill switches: registration, invite requests, and full lockdown.
 * Admin-only — the backend 403s a moderator here, unlike the /mod surface.
 *
 * The lockdown banner renders above the tabs whenever lockdown is active, so
 * an admin who lands on any admin page during a lockdown always has a one-click
 * way out. A lockdown that hides its own off switch is a one-way door.
 */
export function AdminSettingsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"access" | "history">("access");
  const { data, isLoading, isError } = usePlatformSettings();

  return (
    <AdminShell
      title={t("admin:settings.breadcrumb")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <AdminPageHeader
        eyebrow={t("admin:settings.eyebrow")}
        title={t("admin:settings.title")}
        sub={t("admin:settings.sub")}
      />
      {data?.lockdownEnabled && <LockdownBanner />}
      <AdminTabs
        tabs={[
          { id: "access", label: t("admin:settings.tab.access") },
          { id: "history", label: t("admin:settings.tab.history") },
        ]}
        active={tab}
        onChange={(id) => setTab(id as "access" | "history")}
      />
      <div className={styles.body}>
        {tab === "access" ? (
          <AdminSettingsAccess
            settings={data}
            isLoading={isLoading}
            isError={isError}
          />
        ) : (
          <AdminSettingsHistory />
        )}
      </div>
    </AdminShell>
  );
}
