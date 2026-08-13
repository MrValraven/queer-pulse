import { useState } from "react";
import { FiActivity, FiEdit3 } from "react-icons/fi";
import {
  FadeIn,
  Button,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { useCountUp } from "../../shared/hooks/useCountUp";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { AdminGovernanceChart } from "./AdminGovernanceChart";
import { AdminGovernanceFinancesEdit } from "./AdminGovernanceFinancesEdit";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { useAdminGovernanceFinances } from "./api/useAdminGovernanceFinances";
import type {
  AdminFinanceLatest,
  AdminFinLine,
} from "./api/adminGovernanceFinances.api";
import { type FinanceStat } from "./adminGovernance.data";
import styles from "./AdminGovernancePage.module.css";

/** Fixed colour cycle for ledger meter bars — `FinLine` carries no colour, so
 *  rows are tinted by position instead. */
const LEDGER_COLOR_CYCLE = ["coral", "plum", "jade", "violet", "amber"];

function ledgerColorAt(index: number) {
  return LEDGER_COLOR_CYCLE[index % LEDGER_COLOR_CYCLE.length]!;
}

/** `FinLine.amount` is a formatted string in live mode ("€1,840") and a plain
 *  number string in demo mode ("23150") — strip everything but digits/sign
 *  and re-format through `fmt.currency` so both render consistently. */
function financeAmount(amount: string): number {
  return Number(amount.replace(/[^0-9.-]/g, "")) || 0;
}

function buildFinanceStats(latest: AdminFinanceLatest): FinanceStat[] {
  return [
    {
      labelKey: "governance.finances.stat.sustainerMrr",
      value: latest.mrr,
      prefix: "€",
      comma: true,
      footKey: "governance.finances.foot.sustainersCount",
      footValues: { count: latest.sustainerCount },
      source: latest.sources.mrr,
    },
    {
      labelKey: "governance.finances.stat.totalIncome",
      value: latest.incomeTotal,
      prefix: "€",
      comma: true,
      footKey: "governance.finances.foot.sources",
      source: latest.sources.incomeTotal,
    },
    {
      labelKey: "governance.finances.stat.surplus",
      value: latest.surplus,
      prefix: "€",
      comma: true,
      jade: true,
      footKey: "governance.finances.foot.reserve",
      source: latest.sources.surplus,
    },
    {
      labelKey: "governance.finances.stat.solidarity",
      value: latest.solidarityRate,
      suffix: "%",
      footKey: "governance.finances.foot.solidarityRate",
      source: latest.sources.solidarityRate,
    },
  ];
}

export function AdminGovernanceFinances() {
  const { latest, history, loading } = useAdminGovernanceFinances();
  const [editing, setEditing] = useState(false);

  if (loading) {
    return <FinancesSkeleton />;
  }

  if (!latest) {
    return <FinancesEmpty />;
  }

  const stats = buildFinanceStats(latest);

  return (
    <>
      <FinancesToolbar latest={latest} onEdit={() => setEditing(true)} />

      <StatGrid columns={4} className={styles.statGrid}>
        {stats.map((stat, index) => (
          <FadeIn key={stat.labelKey} delay={index * 70}>
            <FinanceStatCard stat={stat} />
          </FadeIn>
        ))}
      </StatGrid>

      <FadeIn delay={120}>
        <AdminGovernanceChart history={history} />
      </FadeIn>

      <FadeIn delay={160}>
        <div className={styles.ledgerGrid}>
          <IncomeLedgerCard latest={latest} />
          <SpendLedgerCard latest={latest} />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <LiveMrrPanel latest={latest} />
      </FadeIn>

      {editing && (
        <AdminGovernanceFinancesEdit
          latest={latest}
          onClose={() => setEditing(false)}
        />
      )}
    </>
  );
}

/** Header row above the figures: who last corrected them, and the entry point
 *  to the edit dialog. */
function FinancesToolbar({
  latest,
  onEdit,
}: {
  latest: AdminFinanceLatest;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const editorName = latest.editor
    ? `${latest.editor.firstName} ${latest.editor.lastName}`.trim()
    : null;

  return (
    <div className={styles.finToolbar}>
      <span className={styles.finToolbarMeta}>
        {editorName && latest.editedAt
          ? t("admin:governance.finances.edit.lastEdited", {
              name: editorName,
              date: fmt.date(new Date(latest.editedAt)),
            })
          : t("admin:governance.finances.edit.neverEdited")}
      </span>
      <Button variant="ghost" onClick={onEdit}>
        <FiEdit3 aria-hidden />
        {t("admin:governance.finances.edit.cta")}
      </Button>
    </div>
  );
}

function FinancesSkeleton() {
  return (
    <div className={styles.statGrid}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className={styles.statCard}>
          <SkeletonLine width="60%" />
          <SkeletonLine width="80%" height={28} style={{ marginTop: 8 }} />
          <SkeletonLine width="70%" style={{ marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

function FinancesEmpty() {
  const { t } = useTranslation();
  return (
    <div className={styles.statCard}>
      <span className={styles.statFoot}>
        {t("admin:governance.finances.empty")}
      </span>
    </div>
  );
}

function FinanceStatCard({ stat }: { stat: FinanceStat }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { labelKey, value, prefix, suffix, comma, jade, footKey, footValues } =
    stat;
  const countValue = useCountUp(value, { durationMs: 1200 });
  const display = comma ? fmt.number(countValue) : String(countValue);

  return (
    <StatTile
      label={
        <span className={styles.statLabel}>
          {t(`admin:${labelKey}`)}
          {stat.source && <FinanceSourceBadge source={stat.source} />}
        </span>
      }
      value={
        <span
          className={[styles.statNum, jade && styles.statNumJade]
            .filter(Boolean)
            .join(" ")}
        >
          {prefix}
          {display}
          {suffix && <small>{suffix}</small>}
        </span>
      }
      hint={
        <span className={styles.statFoot}>
          {t(`admin:${footKey}`, footValues)}
        </span>
      }
    />
  );
}

function IncomeLedgerCard({ latest }: { latest: AdminFinanceLatest }) {
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
            amount: fmt.currency(latest.incomeTotal),
          })}
        </p>
      </div>
      <div className={styles.meters}>
        {latest.income.map((line, i) => (
          <Meter key={line.label} line={line} colorIndex={i} />
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

function SpendLedgerCard({ latest }: { latest: AdminFinanceLatest }) {
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
          {t("admin:governance.spend.sub", {
            amount: fmt.currency(latest.expenseTotal),
          })}
        </p>
      </div>
      <div className={styles.meters}>
        {latest.expense.map((line, i) => (
          <Meter key={line.label} line={line} colorIndex={i} />
        ))}
      </div>
    </div>
  );
}

function Meter({ line, colorIndex }: { line: AdminFinLine; colorIndex: number }) {
  const fmt = useFormat();
  const color = ledgerColorAt(colorIndex);
  return (
    <div className={styles.meter}>
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>
          {line.label}
          {line.source === "manual" && <FinanceSourceBadge source="manual" />}
        </span>
        <span className={styles.meterAmount}>
          {fmt.currency(financeAmount(line.amount))}
        </span>
      </div>
      <div className={styles.meterTrack}>
        <div
          className={[styles.meterFill, styles[`meter_${color}`]].join(" ")}
          style={{ width: `${line.width}%` }}
        />
      </div>
    </div>
  );
}

function LiveMrrPanel({ latest }: { latest: AdminFinanceLatest }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const mrr = useCountUp(latest.mrr, { durationMs: 1400 });
  const breakdown = latest.expense.slice(0, 5);

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
        {breakdown.map((line) => (
          <div key={line.label} className={styles.panelStat}>
            <FiActivity className={styles.panelStatIco} aria-hidden />
            <span className={styles.panelStatVal}>
              {fmt.currency(financeAmount(line.amount))}
            </span>
            <span className={styles.panelStatLbl}>{line.label}</span>
          </div>
        ))}
      </div>
      <Button variant="ghost-dark" to={routes.governance}>
        {t("admin:governance.mrrPanel.readCta")}
      </Button>
    </aside>
  );
}
