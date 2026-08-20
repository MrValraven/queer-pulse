import { Card, SkeletonLine } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { useAdminGovernanceFinances } from "./api/useAdminGovernanceFinances";
import { AdminGovernanceChart } from "./AdminGovernanceChart";
import styles from "./AdminReportsPage.module.css";

/**
 * The real quarterly finance history, reusing `useAdminGovernanceFinances`
 * and `AdminGovernanceChart` verbatim — the same read model the governance
 * Finances tab (`/admin/governance`) already renders, so this page can never
 * disagree with it. No new endpoint or hook: `GET /admin/reports/finance`
 * exists on the backend for API-surface completeness, but the frontend has
 * no reason to round-trip through a second identical fetch when the existing
 * hook already serves (and demo-mocks) the exact same `AdminFinanceResponseDTO`.
 */
export function AdminReportsFinanceSection() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { latest, history, loading } = useAdminGovernanceFinances();

  return (
    <Card className={styles.card}>
      <div className={styles.cardHead}>
        <div>
          <h2 className={styles.cardTitle}>
            {t("admin:reports.finance.title")}
          </h2>
          <p className={styles.cardSub}>{t("admin:reports.finance.sub")}</p>
        </div>
      </div>

      {loading ? (
        <SkeletonLine height={220} style={{ borderRadius: 14 }} />
      ) : (
        <>
          {latest && (
            <div className={styles.financeSummary}>
              <span>
                {t("admin:reports.finance.latestQuarter", {
                  quarter: latest.quarter,
                })}
              </span>
              <span>
                {t("admin:reports.finance.income", {
                  amount: fmt.currency(latest.incomeTotal),
                })}
              </span>
              <span>
                {t("admin:reports.finance.expense", {
                  amount: fmt.currency(latest.expenseTotal),
                })}
              </span>
              <span>
                {t("admin:reports.finance.surplus", {
                  amount: fmt.currency(latest.surplus),
                })}
              </span>
            </div>
          )}
          <AdminGovernanceChart history={history} />
        </>
      )}
    </Card>
  );
}
