import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { FiPlus } from "react-icons/fi";
import { routes } from "../../../app/routeMap";
import { AdminShell } from "../../../shared/components/layout/AdminShell";
import { Button, FadeIn } from "../../../shared/components/ui";
import { useTranslation } from "../../../shared/i18n/useTranslation";
import { AdminPageHeader } from "../ui";
import { useLeadList } from "./api/useLeadList";
import { AddLeadDialog } from "./AddLeadDialog";
import { AdminLeadsList } from "./AdminLeadsList";
import { AdminLeadsToolbar } from "./AdminLeadsToolbar";
import { useLeadListFilters } from "./useLeadListFilters";
import styles from "./AdminLeads.module.css";

/**
 * The leads directory: everyone the team reaches out to, due follow-ups
 * first. The eyebrow names the admin rail section Leads sits in. The
 * filters live in the URL so a link lands on the same view; Add lead opens
 * a dialog over the list.
 */
export function AdminLeadsPage() {
  const { t } = useTranslation();
  const controls = useLeadListFilters();
  const list = useLeadList(controls.filters);
  const [isAdding, setIsAdding] = useState(false);
  const openAddDialog = () => setIsAdding(true);

  return (
    <AdminShell
      title={t("admin:leads.title")}
      breadcrumb={[
        { label: t("admin:common.adminBreadcrumb"), to: routes.admin },
      ]}
    >
      <FadeIn>
        <AdminPageHeader
          eyebrow={t("shared:adminNav.sections.communities")}
          title={t("admin:leads.title")}
          sub={t("admin:leads.intro")}
          actions={
            <Button onClick={openAddDialog}>
              <FiPlus aria-hidden />
              {t("admin:leads.addCta")}
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminLeadsToolbar
          controls={controls}
          stageCounts={list.stageCounts}
          totalCount={list.totalCount}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <div className={styles.panel}>
          <AdminLeadsList
            list={list}
            controls={controls}
            onAdd={openAddDialog}
          />
        </div>
      </FadeIn>

      <AnimatePresence>
        {isAdding && <AddLeadDialog onClose={() => setIsAdding(false)} />}
      </AnimatePresence>
    </AdminShell>
  );
}
