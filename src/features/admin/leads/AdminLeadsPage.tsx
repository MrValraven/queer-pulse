import { useRef, useState } from "react";
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
import { LeadPipeline } from "./LeadPipeline";
import { LeadQuickActionsContext } from "./leadQuickActions";
import { leadMatchCount } from "./leadListSummary";
import { LEAD_LIST_SHORTCUT } from "./leadsList.data";
import { useLeadListFilters } from "./useLeadListFilters";
import { useLeadListShortcuts } from "./useLeadListShortcuts";
import { useLeadQuickActions } from "./useLeadQuickActions";
import styles from "./AdminLeads.module.css";

/**
 * The leads directory: everyone the team reaches out to, due follow-ups
 * first. The pipeline strip counts each stage and filters by it; the
 * toolbar searches and narrows by type. Each row moves its lead to another
 * stage or a new follow-up in place, with Undo. The filters live in the
 * URL so a link lands on the same view. `/` finds, `n` adds.
 */
export function AdminLeadsPage() {
  const { t } = useTranslation();
  const controls = useLeadListFilters();
  const list = useLeadList(controls.filters);
  const quickActions = useLeadQuickActions();
  const searchRef = useRef<HTMLInputElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const openAddDialog = () => setIsAdding(true);
  useLeadListShortcuts({
    searchRef,
    onAdd: openAddDialog,
    isEnabled: !isAdding,
  });

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
              <kbd className={styles.buttonKey} aria-hidden>
                {LEAD_LIST_SHORTCUT.add.toUpperCase()}
              </kbd>
            </Button>
          }
        />
      </FadeIn>

      <FadeIn delay={40}>
        <LeadPipeline
          controls={controls}
          stageCounts={list.stageCounts}
          totalCount={list.totalCount}
        />
      </FadeIn>

      <FadeIn delay={60}>
        <AdminLeadsToolbar
          controls={controls}
          searchRef={searchRef}
          shownCount={list.rows.length}
          matchCount={leadMatchCount(list, controls.filters)}
          hasRows={!list.isLoading && list.rows.length > 0}
        />
      </FadeIn>

      <FadeIn delay={80}>
        <div className={styles.panel}>
          <LeadQuickActionsContext.Provider value={quickActions}>
            <AdminLeadsList
              list={list}
              controls={controls}
              onAdd={openAddDialog}
            />
          </LeadQuickActionsContext.Provider>
        </div>
      </FadeIn>

      <AnimatePresence>
        {isAdding && <AddLeadDialog onClose={() => setIsAdding(false)} />}
      </AnimatePresence>
    </AdminShell>
  );
}
