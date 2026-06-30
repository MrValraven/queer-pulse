import { FadeIn, Button } from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { routes } from "../../app/routeMap";
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
          <FadeIn key={s.label} delay={i * 70}>
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
  const { label, value, prefix, suffix, comma, jade, foot } = stat;
  const n = useCountUp(value, { durationMs: 1200 });
  const display = comma ? n.toLocaleString("en-US") : String(n);

  return (
    <div className={styles.statCard}>
      <span className={styles.statLabel}>{label}</span>
      <span
        className={[styles.statNum, jade && styles.statNumJade]
          .filter(Boolean)
          .join(" ")}
      >
        {prefix}
        {display}
        {suffix && <small>{suffix}</small>}
      </span>
      <span className={styles.statFoot}>{foot}</span>
    </div>
  );
}

function IncomeLedgerCard() {
  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          Where it <em>comes from</em>
        </h2>
        <p className={styles.cardSub}>
          €34,370 / month, in from three honest places.
        </p>
      </div>
      <div className={styles.meters}>
        {INCOME_LEDGER.map((row) => (
          <Meter key={row.label} row={row} />
        ))}
      </div>
      <p className={styles.ledgerNote}>
        No advertising. No data sales. No venture money.{" "}
        <strong>Two-thirds comes straight from members.</strong>
      </p>
    </div>
  );
}

function SpendLedgerCard() {
  return (
    <div className={styles.ledgerCard}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>
          Where it <em>goes</em>
        </h2>
        <p className={styles.cardSub}>
          €29,500 / month &mdash; every euro accounted for, line by line.
        </p>
      </div>
      <div className={styles.meters}>
        {LEDGER.map((row) => (
          <Meter key={row.label} row={row} />
        ))}
      </div>
    </div>
  );
}

function Meter({ row }: { row: LedgerRow }) {
  return (
    <div className={styles.meter}>
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>{row.label}</span>
        <span className={styles.meterAmount}>{row.amount}</span>
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
  const mrr = useCountUp(23150, { durationMs: 1400 });

  return (
    <aside className={styles.panel}>
      <span className={styles.panelLive}>
        <span className={styles.panelLiveDot} aria-hidden />
        Sustainer MRR · live
      </span>
      <div className={styles.panelNum}>€{mrr.toLocaleString("en-US")}</div>
      <p className={styles.panelLead}>
        Every euro comes from members, not advertisers or data sales.{" "}
        <em>We will never sell member data</em> &mdash; it&rsquo;s written into
        our constitution, not just our promises.
      </p>
      <div className={styles.panelBreakdown}>
        {PANEL_BREAKDOWN.map(({ label, value, icon: Icon }) => (
          <div key={label} className={styles.panelStat}>
            <Icon className={styles.panelStatIco} aria-hidden />
            <span className={styles.panelStatVal}>{value}</span>
            <span className={styles.panelStatLbl}>{label}</span>
          </div>
        ))}
      </div>
      <Button variant="ghost-dark" to={routes.governance}>
        Read the constitution
      </Button>
    </aside>
  );
}
