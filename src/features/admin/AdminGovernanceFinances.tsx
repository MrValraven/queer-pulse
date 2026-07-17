import { FadeIn, Button } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { AdminGovernanceChart } from "./AdminGovernanceChart";
import {
  FINANCE_STATS,
  LEDGER,
  INCOME_LEDGER,
  PANEL_BREAKDOWN,
  type FinanceStat,
  type LedgerRow,
} from "./adminGovernance.data";
import styles from "./AdminGovernancePage.module.css";

export function AdminGovernanceFinances() {
  return (
    <>
      <div className={styles.statGrid}>
        {FINANCE_STATS.map((s, i) => (
          <FadeIn key={s.labelKey} delay={i * 70}>
            <FinanceStatCard stat={s} />
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={120}>
        <AdminGovernanceChart />
      </FadeIn>

      <FadeIn delay={160}>
        <div className={styles.ledgerGrid}>
          <IncomeLedgerCard />
          <SpendLedgerCard />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <LiveMrrPanel />
      </FadeIn>
    </>
  );
}

function FinanceStatCard({ stat }: { stat: FinanceStat }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { labelKey, value, prefix, suffix, comma, jade, footKey, footValues } =
    stat;
  const n = useCountUp(value, { durationMs: 1200 });
  const display = comma ? fmt.number(n) : String(n);

  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{t(`admin:${labelKey}`)}</span>
      <span
        className={[styles.statNum, jade && styles.statNumJade]
          .filter(Boolean)
          .join(" ")}
      >
        {prefix}
        {display}
        {suffix && <small>{suffix}</small>}
      </span>
      <span className={styles.statFoot}>
        {t(`admin:${footKey}`, footValues)}
      </span>
    </div>
  );
}

function IncomeLedgerCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey="admin:governance.income.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.cardSub}>
          {t("admin:governance.income.sub", {
            amount: fmt.currency(34370),
          })}
        </p>
      </div>
      <div className={styles.meters}>
        {INCOME_LEDGER.map((row) => (
          <Meter key={row.labelKey} row={row} />
        ))}
      </div>
      <p className={styles.ledgerNote}>
        <Translation
          i18nKey="admin:governance.income.note"
          components={{ strong: <strong /> }}
        />
      </p>
    </div>
  );
}

function SpendLedgerCard() {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          <Translation
            i18nKey="admin:governance.spend.title"
            components={{ em: <em /> }}
          />
        </h2>
        <p className={styles.cardSub}>
          {t("admin:governance.spend.sub", { amount: fmt.currency(29500) })}
        </p>
      </div>
      <div className={styles.meters}>
        {LEDGER.map((row) => (
          <Meter key={row.labelKey} row={row} />
        ))}
      </div>
    </div>
  );
}

function Meter({ row }: { row: LedgerRow }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  return (
    <div className={styles.meter}>
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>{t(`admin:${row.labelKey}`)}</span>
        <span className={styles.meterAmount}>{fmt.currency(row.amount)}</span>
      </div>
      <div className={styles.meterTrack}>
        <div
          className={[styles.meterFill, styles[`meter_${row.color}`]].join(" ")}
          style={{ width: `${row.width}%` }}
        />
      </div>
    </div>
  );
}

function LiveMrrPanel() {
  const { t } = useTranslation();
  const fmt = useFormat();
  const mrr = useCountUp(23150, { durationMs: 1400 });

  return (
    <aside className={styles.panel}>
      <span className={styles.panelLive}>
        <span className={styles.panelLiveDot} aria-hidden />
        {t("admin:governance.mrrPanel.live")}
      </span>
      <div className={styles.panelNum}>€{fmt.number(mrr)}</div>
      <p className={styles.panelLead}>
        <Translation
          i18nKey="admin:governance.mrrPanel.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.panelBreakdown}>
        {PANEL_BREAKDOWN.map(({ labelKey, value, icon: Icon }) => (
          <div key={labelKey} className={styles.panelStat}>
            <Icon className={styles.panelStatIco} aria-hidden />
            <span className={styles.panelStatVal}>{value}</span>
            <span className={styles.panelStatLbl}>
              {t(`admin:${labelKey}`)}
            </span>
          </div>
        ))}
      </div>
      <Button variant="ghost-dark" to={routes.governance}>
        {t("admin:governance.mrrPanel.readCta")}
      </Button>
    </aside>
  );
}
