import { SkeletonLine } from "../../../../shared/components/ui";
import { useTranslation } from "../../../../shared/i18n/useTranslation";
import { useIssueCosts } from "../../api/useIssueCosts";
import type { IssueCostCurrencyTotalDto } from "../../api/issueCosts.api";
import { formatMoney } from "../money";
import styles from "../../IssueProductionPage.module.css";
import tabStyles from "../pieceTabs.module.css";

export interface IssueCostsCardProps {
  /** The issue's public display number, e.g. "14". */
  number: string;
}

interface CostRowProps {
  label: string;
  value: string;
}

function CostRow({ label, value }: CostRowProps) {
  return (
    <div className={styles.pagesRow}>
      <span>{label}</span>
      <b>{value}</b>
    </div>
  );
}

interface CurrencyTotalProps {
  total: IssueCostCurrencyTotalDto;
  /** True when the issue was paid for in more than one currency. */
  isMultiCurrency: boolean;
}

/**
 * One currency's figures. Each amount is formatted from the decimal string
 * the server summed — nothing is added up here.
 */
function CurrencyTotal({ total, isMultiCurrency }: CurrencyTotalProps) {
  const { t } = useTranslation();
  const money = (amount: string) => formatMoney(total.currency, amount) ?? "";

  return (
    <>
      {isMultiCurrency ? (
        <p className={tabStyles.tiny}>{total.currency}</p>
      ) : null}
      <CostRow
        label={t("magazine:issue.costs.fees")}
        value={money(total.fees)}
      />
      <CostRow
        label={t("magazine:issue.costs.expenses")}
        value={money(total.expenses)}
      />
      <CostRow
        label={t("magazine:issue.costs.total")}
        value={money(total.total)}
      />
      <CostRow
        label={t("magazine:issue.costs.paid")}
        value={money(total.paid)}
      />
      <CostRow
        label={t("magazine:issue.costs.outstanding")}
        value={money(total.outstanding)}
      />
    </>
  );
}

/**
 * "What did this issue cost" in the issue-production rail (CON-18) — fees,
 * expenses, what has been paid and what the desk still owes, per currency.
 *
 * Every figure comes from the server already summed over `numeric`, so no
 * arithmetic happens in the browser. Currencies are listed separately rather
 * than merged: there are no exchange rates behind this, and one combined
 * number would be invented.
 */
export function IssueCostsCard({ number }: IssueCostsCardProps) {
  const { t } = useTranslation();
  const { costs, isLoading, isError } = useIssueCosts(number);

  if (isLoading) {
    return (
      <div className={tabStyles.card}>
        <h3>{t("magazine:issue.costs.heading")}</h3>
        <SkeletonLine width="70%" height={14} />
        <SkeletonLine width="55%" height={14} />
      </div>
    );
  }

  if (isError || !costs) {
    return (
      <div className={tabStyles.card}>
        <h3>{t("magazine:issue.costs.heading")}</h3>
        <p className={tabStyles.tiny}>{t("magazine:issue.costs.loadFailed")}</p>
      </div>
    );
  }

  return (
    <div className={tabStyles.card}>
      <h3>{t("magazine:issue.costs.heading")}</h3>
      {costs.totals.length === 0 ? (
        <p className={tabStyles.tiny}>
          {t("magazine:issue.costs.nothingPriced")}
        </p>
      ) : (
        costs.totals.map((total) => (
          <CurrencyTotal
            key={total.currency}
            total={total}
            isMultiCurrency={costs.totals.length > 1}
          />
        ))
      )}
      {costs.unpricedCount > 0 ? (
        <div className={`${tabStyles.note} ${tabStyles.warn}`}>
          {t("magazine:issue.costs.unpriced", { count: costs.unpricedCount })}
        </div>
      ) : null}
      <p className={tabStyles.tiny}>
        {t("magazine:issue.costs.coverage", {
          payments: String(costs.paymentCount),
          count: costs.pieceCount,
        })}
      </p>
    </div>
  );
}
