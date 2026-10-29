import { useId, useState, type ReactElement } from "react";
import { routes } from "../../app/routeMap";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { FadeIn } from "../../shared/components/ui";
import { Translation } from "../../shared/i18n/Translation";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useAdminStudioAccessRequests } from "./api/useStudioAdminAccessRequests";
import { StudioAdminFounding } from "./StudioAdminFounding";
import { StudioAdminLanding } from "./StudioAdminLanding";
import { StudioAdminScenes } from "./StudioAdminScenes";
import { StudioAdminShelves } from "./StudioAdminShelves";
import { StudioAdminWaiting } from "./StudioAdminWaiting";
import { isStudioAdminTab, type StudioAdminTabId } from "./studioAdmin.model";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import css from "./StudioAdminPage.module.css";

const PANEL_OF_TAB: Record<StudioAdminTabId, () => ReactElement> = {
  shelves: () => <StudioAdminShelves />,
  scenes: () => <StudioAdminScenes />,
  landing: () => <StudioAdminLanding />,
  founding: () => <StudioAdminFounding />,
  waiting: () => <StudioAdminWaiting />,
};

/**
 * Studio discovery (`/admin/studio`), Moderator and Admin: the featured
 * release and the two shelves on Studio home, the scenes, the Studio page
 * content, the founding artists and the members waiting for Studio. All of it
 * is staff data and never ranked by what members play.
 */
export function StudioAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<StudioAdminTabId>("shelves");
  const idPrefix = useId();
  const tabIdOf = (tabId: string) => `${idPrefix}-tab-${tabId}`;
  const panelId = `${idPrefix}-panel-${tab}`;
  // The same query the Waiting tab reads, so its total shows on the tab
  // strip and rolls as requests are granted or dismissed.
  const waiting = useAdminStudioAccessRequests();
  const waitingTotal = waiting.data?.pages.at(-1)?.totalCount;
  const tabs: AdminTab[] = [
    { id: "shelves", label: t("admin:studioAdmin.tabs.shelves") },
    { id: "scenes", label: t("admin:studioAdmin.tabs.scenes") },
    { id: "landing", label: t("admin:studioAdmin.tabs.landing") },
    { id: "founding", label: t("admin:studioAdmin.tabs.founding") },
    {
      id: "waiting",
      label: t("admin:studioAdmin.tabs.waiting"),
      count: waitingTotal,
      isCountRolling: true,
      isCountUnavailable:
        waitingTotal === undefined && waiting.errorUpdateCount > 0,
    },
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
        <FadeIn key={tab}>{PANEL_OF_TAB[tab]()}</FadeIn>
      </div>
    </AdminShell>
  );
}
