import { FilterChips } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { AdminToolbar, adminToolbarClasses } from "./ui";
import type { useModerationQueue } from "./useModerationQueue";
import styles from "./AdminModerationPage.module.css";

type Queue = ReturnType<typeof useModerationQueue>;

const OVERDUE_ONLY = "overdue";

/**
 * The appeals queue's filters (TS-11): which list to show, awaiting or
 * decided, and on the awaiting list a toggle that narrows it to the appeals
 * already past their window. The toggle is a server-side filter, so it narrows
 * the whole queue and every page of it.
 */
export function AppealFilters({ q }: { q: Queue }) {
  const { t } = useTranslation();
  const { appealTab, appealCounts } = q;

  return (
    <AdminToolbar
      label={t("admin:moderation.appeals.tabsAriaLabel")}
      className={styles.appealFilters}
    >
      <FilterChips
        className={adminToolbarClasses.chips}
        options={[
          {
            value: "awaiting",
            label: t("admin:moderation.appeals.awaitingTab", {
              count: appealCounts.awaiting,
            }),
          },
          {
            value: "decided",
            label: t("admin:moderation.appeals.decidedTab", {
              count: appealCounts.decided,
            }),
          },
        ]}
        value={appealTab}
        onChange={(value) => q.setAppealTab(value as typeof appealTab)}
      />
      {appealTab === "awaiting" && (
        <FilterChips
          className={adminToolbarClasses.chips}
          options={[
            {
              value: OVERDUE_ONLY,
              label: t("admin:moderation.appeals.overdueFilter", {
                count: appealCounts.overdue,
              }),
            },
          ]}
          value={q.isAppealOverdueOnly ? OVERDUE_ONLY : ""}
          onChange={() => q.setIsAppealOverdueOnly(!q.isAppealOverdueOnly)}
        />
      )}
    </AdminToolbar>
  );
}
