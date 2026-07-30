import { useState } from "react";
import { FadeIn } from "../../shared/components/ui";
import { AdminShell } from "../../shared/components/layout/AdminShell";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { routes } from "../../app/routeMap";
import { AdminPageHeader, AdminTabs, type AdminTab } from "./ui";
import { useAdminRoadmap } from "./api/useAdminRoadmap";
import { AdminRoadmapBoard } from "./AdminRoadmapBoard";
import { AdminRoadmapIdeasQueue } from "./AdminRoadmapIdeasQueue";
import { AdminRoadmapHeroStats } from "./AdminRoadmapHeroStats";
import styles from "./AdminRoadmapPage.module.css";

/**
 * Admin roadmap tools (`/admin/roadmap`) — the shipped/building/planned
 * board, the member idea queue, and the public page's hero-stat chips, all
 * sourced from `useAdminRoadmap()` (dual-mode: demo store / `GET
 * /roadmap/admin`). Task 6 scaffolded the route, shell, and data layer;
 * Task 7 built `<AdminRoadmapBoard/>` (create/edit/delete/reorder/
 * column-move); Task 8 built `<AdminRoadmapIdeasQueue/>` (triage/promote/
 * dismiss + published edit/reorder/add) and `<AdminRoadmapHeroStats/>`
 * (editable chip list + auto-fill from item counts).
 */
export function AdminRoadmapPage() {
  const { t } = useTranslation();
  const [active, setActive] = useState("board");
  const { items, ideas, loading } = useAdminRoadmap();

  const TABS: AdminTab[] = [
    { id: "board", label: t("admin:roadmap.tabs.board"), count: items.length },
    { id: "ideas", label: t("admin:roadmap.tabs.ideas"), count: ideas.length },
    { id: "heroStats", label: t("admin:roadmap.tabs.heroStats") },
  ];

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
          eyebrow={t("admin:roadmap.header.eyebrow")}
          title={
            <Translation
              i18nKey="admin:roadmap.header.title"
              components={{ em: <em /> }}
            />
          }
          sub={t("admin:roadmap.header.sub")}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminTabs tabs={TABS} active={active} onChange={setActive} />
      </FadeIn>

      {loading ? (
        <p className={styles.loading}>{t("admin:roadmap.loading")}</p>
      ) : (
        <>
          {active === "board" && <AdminRoadmapBoard />}
          {active === "ideas" && <AdminRoadmapIdeasQueue />}
          {active === "heroStats" && <AdminRoadmapHeroStats />}
        </>
      )}
    </AdminShell>
  );
}
