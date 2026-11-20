import { AnimatePresence } from "motion/react";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { FadeIn } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { CulturalProductionTabs } from "./CulturalProductionTabs";
import { IdeaDrawer } from "./IdeaDrawer";
import { TaskDrawer } from "./TaskDrawer";
import { useCulturalProductionUrl } from "./useCulturalProductionUrl";
import styles from "./AdminCulturalProduction.module.css";

/**
 * Cultural Production: the team plans QueerPulse events here. Ideas collect
 * backing and comments, tasks split the work between staff, and guides keep
 * the steps for each kind of event. The tab and any open idea or task
 * drawer live in the URL (`useCulturalProductionUrl`), so a link, the nav
 * badge or a bell notification lands on the same view, and closing a drawer
 * keeps the tab.
 */
export function AdminCulturalProductionPage() {
  const { t } = useTranslation();
  const url = useCulturalProductionUrl();

  return (
    <AdminShell
      title={t("admin:culturalProduction.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.communities")}
          title={t("admin:culturalProduction.title")}
          sub={t("admin:culturalProduction.intro")}
        />
      </FadeIn>

      <FadeIn delay={60} className={styles.block}>
        <CulturalProductionTabs url={url} />
      </FadeIn>

      <AnimatePresence initial={false}>
        {url.openIdeaId !== null && (
          <IdeaDrawer
            key={url.openIdeaId}
            ideaId={url.openIdeaId}
            onClose={() => url.closeIdea()}
            onOpenTask={(taskId: string) => url.openTask(taskId)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {url.openTaskId !== null && (
          <TaskDrawer
            key={url.openTaskId}
            taskId={url.openTaskId}
            onClose={() => url.closeTask()}
          />
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
