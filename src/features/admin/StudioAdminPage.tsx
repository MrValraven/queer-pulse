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
import { StudioAdminSpotlight } from "./StudioAdminSpotlight";
import { StudioAdminWaiting } from "./StudioAdminWaiting";
import {
  isStudioAdminTab,
  STUDIO_ADMIN_TAB_LABEL_KEY,
  studioAdminTabsFor,
  type StudioAdminTabId,
} from "./studioAdmin.model";
import { useStudioAdminViewer } from "./useStudioAdminViewer";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import css from "./StudioAdminPage.module.css";

const PANEL_OF_TAB: Record<StudioAdminTabId, () => ReactElement> = {
  shelves: () => <StudioAdminShelves />,
  scenes: () => <StudioAdminScenes />,
  spotlight: () => <StudioAdminSpotlight />,
  landing: () => <StudioAdminLanding />,
  founding: () => <StudioAdminFounding />,
  waiting: () => <StudioAdminWaiting />,
};

/**
 * Studio discovery (`/admin/studio`). Moderator and Admin see all six tabs:
 * the featured release and the two shelves on Studio home, the scenes, the
 * artists (Artist of the month and New stars), the Studio page content, the
 * founding artists and the members waiting for Studio. A
 * `music_manager_producer` holder without the tier sees Shelves, Scenes and
 * Artists, and the Waiting count never loads for them. None of it is ranked by
 * what members play.
 */
export function StudioAdminPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<StudioAdminTabId>("shelves");
  const { hasStaffTier } = useStudioAdminViewer();
  const visibleTabIds = studioAdminTabsFor(hasStaffTier);
  const isWaitingVisible = visibleTabIds.includes("waiting");
  const activeTab = visibleTabIds.includes(tab) ? tab : "shelves";
  const idPrefix = useId();
  const tabIdOf = (tabId: string) => `${idPrefix}-tab-${tabId}`;
  const panelId = `${idPrefix}-panel-${activeTab}`;
  // The same query the Waiting tab reads, so its total shows on the tab
  // strip and rolls as requests are granted or dismissed. It stays off for a
  // viewer without the Waiting tab, so no request fires for them.
  const waiting = useAdminStudioAccessRequests({
    isEnabled: isWaitingVisible,
  });
  const waitingTotal = waiting.data?.pages.at(-1)?.totalCount;
  const tabs: AdminTab[] = visibleTabIds.map((id) =>
    id === "waiting"
      ? {
          id,
          label: t(STUDIO_ADMIN_TAB_LABEL_KEY[id]),
          count: waitingTotal,
          isCountRolling: true,
          isCountUnavailable:
            waitingTotal === undefined && waiting.errorUpdateCount > 0,
        }
      : { id, label: t(STUDIO_ADMIN_TAB_LABEL_KEY[id]) },
  );
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
          sub={t(
            hasStaffTier
              ? "admin:studioAdmin.sub"
              : "admin:studioAdmin.subCurator",
          )}
        />
      </FadeIn>
      <AdminTabs
        idPrefix={idPrefix}
        tabs={tabs}
        active={activeTab}
        onChange={(nextTab) => {
          if (isStudioAdminTab(nextTab) && visibleTabIds.includes(nextTab))
            setTab(nextTab);
        }}
      />
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabIdOf(activeTab)}
        className={css.panel}
      >
        <FadeIn key={activeTab}>{PANEL_OF_TAB[activeTab]()}</FadeIn>
      </div>
    </AdminShell>
  );
}
