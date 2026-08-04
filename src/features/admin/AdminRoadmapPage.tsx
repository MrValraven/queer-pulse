import { useState } from "react";
import { Button, FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { useAdminRoadmap, type AdminRoadmapView } from "./api/useAdminRoadmap";
import {
  buildTabCounts,
  ROADMAP_TABS,
  type RoadmapTabId,
} from "./roadmap/roadmapChrome.data";
import { RoadmapToolbar } from "./roadmap/RoadmapToolbar";
import { SavedViewChips } from "./roadmap/SavedViewChips";
import { BulkBar } from "./roadmap/BulkBar";
import { ItemDrawerProvider, useItemDrawer } from "./roadmap/state/useItemDrawer";
import {
  RoadmapModalsProvider,
  useRoadmapModals,
} from "./roadmap/state/useRoadmapModals";
import { SelectionProvider } from "./roadmap/state/useRoadmapSelection";
import { RoadmapFiltersProvider } from "./roadmap/state/useRoadmapFilters";
import { useRoadmapShortcuts } from "./roadmap/state/useRoadmapShortcuts";
import { ItemDrawer } from "./roadmap/drawer/ItemDrawer";
import { RoadmapModalsHost } from "./roadmap/modals/RoadmapModalsHost";
import { BoardView } from "./roadmap/views/BoardView";
import { TimelineView } from "./roadmap/views/TimelineView";
import { GuidesView } from "./roadmap/views/GuidesView";
import { CapacityView } from "./roadmap/views/CapacityView";
import { IdeasView } from "./roadmap/views/IdeasView";
import { NotBuildingView } from "./roadmap/views/NotBuildingView";
import { HeroStatsView } from "./roadmap/views/HeroStatsView";
import { PublicPreviewView } from "./roadmap/views/PublicPreviewView";
import { ArchiveView } from "./roadmap/views/ArchiveView";
import styles from "./AdminRoadmapPage.module.css";

/** One case per `RoadmapTabId` — exhaustive, so a 10th tab added to
 *  `ROADMAP_TABS` without a matching case here is a compile error. */
function renderView(tab: RoadmapTabId, data: AdminRoadmapView) {
  switch (tab) {
    case "board":
      return <BoardView items={data.items} />;
    case "timeline":
      return <TimelineView items={data.items} />;
    case "guides":
      return <GuidesView items={data.items} />;
    case "capacity":
      return <CapacityView items={data.items} team={data.team} />;
    case "ideas":
      return <IdeasView ideas={data.ideas} />;
    case "notBuilding":
      return <NotBuildingView ideas={data.ideas} />;
    case "heroStats":
      return <HeroStatsView heroStats={data.heroStats} />;
    case "publicPreview":
      return <PublicPreviewView items={data.items} ideas={data.ideas} />;
    case "archive":
      return <ArchiveView items={data.items} />;
  }
}

/**
 * Admin roadmap tools (`/admin/roadmap`) — the 9-view redesign (Task C1's
 * page shell; `roadmap/views/*` are placeholders C2–C8 replace one by one).
 * Providers wrap `AdminRoadmapPageContent` rather than the hooks being
 * called bare, so the item drawer / modal stack / multi-select / toolbar
 * filters stay shared context each view, `RoadmapToolbar` and this page's
 * own header can reach into — none of them owns its own private instance.
 */
export function AdminRoadmapPage() {
  return (
    <ItemDrawerProvider>
      <RoadmapModalsProvider>
        <SelectionProvider>
          <RoadmapFiltersProvider>
            <AdminRoadmapPageContent />
          </RoadmapFiltersProvider>
        </SelectionProvider>
      </RoadmapModalsProvider>
    </ItemDrawerProvider>
  );
}

function AdminRoadmapPageContent() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RoadmapTabId>("board");
  const { items, ideas, team, audit, heroStats, loading } = useAdminRoadmap();
  const itemDrawer = useItemDrawer();
  const modals = useRoadmapModals();

  useRoadmapShortcuts({
    onNew: () => itemDrawer.open("new"),
    onHelp: () => modals.open("shortcuts"),
    onCloseTop: () => {
      if (itemDrawer.openId !== null) itemDrawer.close();
      else if (modals.modal !== null) modals.close();
    },
  });

  const tabCounts = buildTabCounts(items, ideas);
  const tabs: AdminTab[] = ROADMAP_TABS.map((tab) => ({
    id: tab.id,
    label: t(tab.labelKey),
    count: tabCounts[tab.id],
  }));
  const activeTabDef = ROADMAP_TABS.find((tab) => tab.id === activeTab);

  return (
    <AdminShell
      title={
        <Translation i18nKey="admin:roadmap.title" components={{ em: <em /> }} />
      }
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("admin:roadmap.page.eyebrow")}
          title={
            <Translation
              i18nKey="admin:roadmap.page.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:roadmap.page.sub")}
          actions={
            <>
              <Button variant="primary" onClick={() => itemDrawer.open("new")}>
                {t("admin:roadmap.page.newItemCta")}
              </Button>
              <Button variant="ghost" onClick={() => modals.open("digest")}>
                {t("admin:roadmap.page.draftDigestCta")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab("publicPreview")}
              >
                {t("admin:roadmap.page.previewPublicCta")}
              </Button>
              <Button variant="ghost" onClick={() => modals.open("audit")}>
                {t("admin:roadmap.page.auditLogCta")}
              </Button>
            </>
          }
        />
      </FadeIn>

      {loading ? (
        <p className={styles.loading}>{t("admin:roadmap.loading")}</p>
      ) : (
        <>
          <FadeIn delay={60}>
            <AdminTabs
              tabs={tabs}
              active={activeTab}
              onChange={(id) => setActiveTab(id as RoadmapTabId)}
            />
          </FadeIn>

          {activeTabDef?.showsToolbar && (
            <>
              <RoadmapToolbar items={items} team={team} />
              <SavedViewChips items={items} />
              <BulkBar />
            </>
          )}

          <div className={styles.viewContainer}>
            {renderView(activeTab, { items, ideas, team, audit, heroStats, loading })}
          </div>
        </>
      )}

      <ItemDrawer />
      <RoadmapModalsHost />
    </AdminShell>
  );
}
