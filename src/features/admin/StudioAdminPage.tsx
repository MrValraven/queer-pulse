import { useId, useState } from "react";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { StudioAdminScenes } from "./StudioAdminScenes";
import { StudioAdminShelves } from "./StudioAdminShelves";
import { isStudioAdminTab, type StudioAdminTabId } from "./studioAdmin.model";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import css from "./StudioAdminPage.module.css";

/**
 * Studio discovery (`/admin/studio`), Moderator and Admin: the featured
 * release and the two shelves on Studio home, and the scenes. Picks and
 * scenes are staff data and never ranked by what members play.
 */
export function StudioAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<StudioAdminTabId>("shelves");
  const idPrefix = useId();
  const tabIdOf = (tabId: string) => `${idPrefix}-tab-${tabId}`;
  const panelId = `${idPrefix}-panel-${tab}`;
  const tabs: AdminTab[] = [
    { id: "shelves", label: t("admin:studioAdmin.tabs.shelves") },
    { id: "scenes", label: t("admin:studioAdmin.tabs.scenes") },
  ];
  const title = (
    <Translation
      i18nKey="admin:studioAdmin.title"
      components={{ em: <em /> }}
    />
  );
  return (
    <AdminShell
      title={title}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:studioAdmin.eyebrow")}
          title={title}
          sub={t("admin:studioAdmin.sub")}
        />
      </FadeIn>
      <AdminTabs
        idPrefix={idPrefix}
        tabs={tabs}
        active={tab}
        onChange={(nextTab) => {
          if (isStudioAdminTab(nextTab)) setTab(nextTab);
        }}
      />
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabIdOf(tab)}
        className={css.panel}
      >
        {tab === "shelves" ? <StudioAdminShelves /> : <StudioAdminScenes />}
      </div>
    </AdminShell>
  );
}
