import { useState } from "react";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { routes } from "../../app/routeMap";
import { FadeIn } from "../../shared/components/ui";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { AdminPressCoverageList } from "./AdminPressCoverageList";
import { AdminPressContactList } from "./AdminPressContactList";
import { AdminPressFactsPanel } from "./AdminPressFactsPanel";
import type { PressKitKind } from "./AdminPressKitFields";
import styles from "./AdminPressKitPage.module.css";

const TAB_IDS: PressKitKind[] = ["coverage", "team"];

/**
 * Admin-managed press kit (`/admin/press-kit`) — mirrors `/admin/landing`.
 * Two tabs: "Coverage" (external press pieces) and "Team" (press-desk
 * contacts), each an add-form + reorderable, toggleable, editable list. A
 * read-only "Facts (auto)" panel alongside shows the derived headline numbers
 * the public page renders, so the whole kit reads from one screen.
 */
export function AdminPressKitPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<PressKitKind>("coverage");

  const TABS: AdminTab[] = TAB_IDS.map((id) => ({
    id,
    label: t(`admin:pressKit.tabs.${id}`),
  }));

  return (
    <AdminShell
      title={t("shared:adminNav.items.pressKit")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:pressKit.header.eyebrow")}
          title={t("shared:adminNav.items.pressKit")}
          sub={t("admin:pressKit.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <AdminTabs
          tabs={TABS}
          active={tab}
          onChange={(id) => setTab(id as PressKitKind)}
          className={styles.tabs}
        />
      </FadeIn>

      <FadeIn delay={140}>
        <div className={styles.layout}>
          <div className={styles.editorColumn}>
            {tab === "coverage" ? (
              <AdminPressCoverageList />
            ) : (
              <AdminPressContactList />
            )}
          </div>
          <AdminPressFactsPanel />
        </div>
      </FadeIn>
    </AdminShell>
  );
}
