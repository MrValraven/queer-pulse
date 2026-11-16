import { SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useAdminGovernanceFinances } from "./api/useAdminGovernanceFinances";
import { AdminGovernanceChart } from "./AdminGovernanceChart";
import { AdminPanel } from "./ui";
import styles from "./AdminReportsPage.module.css";
import { formatEuro } from "./adminEuro";

/**
 * The real quarterly finance history, reusing `useAdminGovernanceFinances`
 * and `AdminGovernanceChart` verbatim: the same read model the governance
 * Finances tab (`/admin/governance`) already renders, so this page can never
 * disagree with it. No new endpoint or hook: `GET /admin/reports/finance`
 * exists on the backend for API-surface completeness, but the frontend has
 * no reason to round-trip through a second identical fetch when the existing
 * hook already serves (and demo-mocks) the exact same `AdminFinanceResponseDTO`.
 * The chart panel is the whole section: it takes this section's title and the
 * latest quarter's totals as its lead line.
 */
export function AdminReportsFinanceSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { latest, history, loading } = useAdminGovernanceFinances();
  // A figure nobody has entered yet (a freshly opened quarter) reads as "not
  // entered", so staff never mistake it for a real €0 (PRD-447).
  const formatFigure = (value: number | null | undefined): string =>
    value == null
      ? t("admin:reports.finance.notEntered")
      : formatEuro(fmt, value);
  const isSurplusEntered =
    latest != null &&
    latest.incomeTotal !== null &&
    latest.expenseTotal !== null;

  const title = t("admin:reports.finance.title");
  const description = t("admin:reports.finance.sub");

  if (loading) {
    return (
      <AdminPanel title={title} description={description}>
        <SkeletonLine height={220} style={{ borderRadius: 14 }} />
      </AdminPanel>
    );
  }

  return (
    <AdminGovernanceChart
      history={history}
      title={title}
      description={description}
      lead={
        latest && (
          <p className={styles.financeSummary}>
            <span>
              {t("admin:reports.finance.latestQuarter", {
                quarter: latest.quarter,
              })}
            </span>
            <span>
              {t("admin:reports.finance.income", {
                amount: formatFigure(latest.incomeTotal),
              })}
            </span>
            <span>
              {t("admin:reports.finance.expense", {
                amount: formatFigure(latest.expenseTotal),
              })}
            </span>
            <span>
              {t("admin:reports.finance.surplus", {
                amount: formatFigure(isSurplusEntered ? latest.surplus : null),
              })}
            </span>
          </p>
        )
      }
    />
  );
}
