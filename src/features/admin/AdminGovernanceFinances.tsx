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
import { useDemoMode } from "../../app/providers/DemoModeProvider";
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
  FinanceMetricSource,
} from "./api/adminGovernanceFinances.api";
import { financeAmountOrZero } from "./adminFinanceAmount";
import styles from "./AdminGovernancePage.module.css";

/** Fixed colour cycle for ledger meter bars — `FinLine` carries no colour, so
 *  rows are tinted by position instead. */
const LEDGER_COLOR_CYCLE = ["coral", "plum", "jade", "violet", "amber"];

function ledgerColorAt(index: number) {
  return LEDGER_COLOR_CYCLE[index % LEDGER_COLOR_CYCLE.length]!;
}

/**
 * One headline figure on the Finances tab. `value` is the count-up target and
 * `kind` decides how it is written, so no call site hand-rolls a `€` prefix:
 * pt-PT suffixes the symbol with a space ("2 200 €") and `Intl` knows that.
 */
interface FinanceStatTile {
  labelKey: string;
  /** Numeric count-up target. */
  value: number;
  kind: "currency" | "percent";
  /** Highlight the number in jade (e.g. the surplus). */
  isJadeHighlighted?: boolean;
  footKey: string;
  /** `{token}` interpolation values for `footKey`, if any. */
  footValues?: Record<string, string | number>;
  /** Provenance of `value`, shown as a badge next to the label. */
  source?: FinanceMetricSource;
}

/** Headline tiles round to whole euros: `useCountUp` steps through integers,
 *  so animating cents would flicker a meaningless ",00" through the whole
 *  count. The exact figures, cents included, are in the ledger below. */
const STAT_CURRENCY: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

function buildFinanceStats(latest: AdminFinanceLatest): FinanceStatTile[] {
  return [
    {
      labelKey: "governance.finances.stat.sustainerMrr",
      value: latest.mrr,
      kind: "currency",
      footKey: "governance.finances.foot.sustainersCount",
      footValues: { count: latest.sustainerCount },
      source: latest.sources.mrr,
    },
    {
      labelKey: "governance.finances.stat.totalIncome",
      value: latest.incomeTotal,
      kind: "currency",
      footKey: "governance.finances.foot.sources",
      source: latest.sources.incomeTotal,
    },
    {
      labelKey: "governance.finances.stat.surplus",
      value: latest.surplus,
      kind: "currency",
      isJadeHighlighted: true,
      footKey: "governance.finances.foot.reserve",
      source: latest.sources.surplus,
    },
    {
      labelKey: "governance.finances.stat.solidarity",
      value: latest.solidarityRate,
      kind: "percent",
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
            <FinanceStatCard stat={stat} onEdit={() => setEditing(true)} />
          </FadeIn>
        ))}
      </StatGrid>

      <FadeIn delay={120}>
        <AdminGovernanceChart history={history} />
      </FadeIn>

      <FadeIn delay={160}>
        <div className={styles.ledgerGrid}>
          <IncomeLedgerCard latest={latest} onEdit={() => setEditing(true)} />
          <SpendLedgerCard latest={latest} onEdit={() => setEditing(true)} />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <LiveMrrPanel latest={latest} onEdit={() => setEditing(true)} />
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

/** True once a figure has been human-verified (edited or derived) rather than
 *  left as an unreviewed seed placeholder. */
function isVerified(source: string | undefined): boolean {
  return source !== undefined && source !== "seeded";
}

/** In live mode, a still-seeded figure never renders as if it were real data —
 *  it shows this empty state with a direct path to correct it instead. Demo
 *  mode is exempt: every demo figure starts `seeded` on purpose, to
 *  demonstrate the provenance badge, so it keeps showing its number. */
function NotVerifiedPlaceholder({ onEdit }: { onEdit: () => void }) {
  const { t } = useTranslation();
  return (
    <span className={styles.notVerified}>
      <span className={styles.notVerifiedDash} aria-hidden>
        –
      </span>
      <button type="button" className={styles.notVerifiedCta} onClick={onEdit}>
        {t("admin:governance.finances.provenance.notVerifiedCta")}
      </button>
    </span>
  );
}

function FinanceStatCard({
  stat,
  onEdit,
}: {
  stat: FinanceStatTile;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const { labelKey, value, kind, isJadeHighlighted, footKey, footValues } =
    stat;
  const countValue = useCountUp(value, { durationMs: 1200 });
  const showPlaceholder = !demoMode && !isVerified(stat.source);

  return (
    <StatTile
      label={
        <span className={styles.statLabel}>
          {t(`admin:${labelKey}`)}
          {stat.source && <FinanceSourceBadge source={stat.source} />}
        </span>
      }
      value={
        showPlaceholder ? (
          <NotVerifiedPlaceholder onEdit={onEdit} />
        ) : (
          <span
            className={[styles.statNum, isJadeHighlighted && styles.statNumJade]
              .filter(Boolean)
              .join(" ")}
          >
            {kind === "currency" ? (
              fmt.currency(countValue, "EUR", STAT_CURRENCY)
            ) : (
              <>
                {fmt.number(countValue)}
                <small>%</small>
              </>
            )}
          </span>
        )
      }
      hint={
        <span className={styles.statFoot}>
          {t(`admin:${footKey}`, footValues)}
        </span>
      }
    />
  );
}

/** Rows an admin has turned off don't clutter the dashboard — they stay
 *  editable (and re-enableable) from the Edit dialog only. */
function enabledLines(lines: AdminFinLine[]): AdminFinLine[] {
  return lines.filter((line) => line.enabled !== false);
}

function IncomeLedgerCard({
  latest,
  onEdit,
}: {
  latest: AdminFinanceLatest;
  onEdit: () => void;
}) {
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
            amount: fmt.currency(latest.incomeTotal, "EUR"),
          })}
        </p>
      </div>
      <div className={styles.meters}>
        {enabledLines(latest.income).map((line, i) => (
          <Meter key={line.label} line={line} colorIndex={i} onEdit={onEdit} />
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

function SpendLedgerCard({
  latest,
  onEdit,
}: {
  latest: AdminFinanceLatest;
  onEdit: () => void;
}) {
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
            amount: fmt.currency(latest.expenseTotal, "EUR"),
          })}
        </p>
      </div>
      <div className={styles.meters}>
        {enabledLines(latest.expense).map((line, i) => (
          <Meter key={line.label} line={line} colorIndex={i} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
}

function Meter({
  line,
  colorIndex,
  onEdit,
}: {
  line: AdminFinLine;
  colorIndex: number;
  onEdit: () => void;
}) {
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const color = ledgerColorAt(colorIndex);
  const showPlaceholder = !demoMode && !isVerified(line.source);
  return (
    <div className={styles.meter}>
      <div className={styles.meterTop}>
        <span className={styles.meterLabel}>
          {line.label}
          {line.source === "manual" && <FinanceSourceBadge source="manual" />}
        </span>
        {showPlaceholder ? (
          <NotVerifiedPlaceholder onEdit={onEdit} />
        ) : (
          <span className={styles.meterAmount}>
            {fmt.currency(financeAmountOrZero(line.amount), "EUR")}
          </span>
        )}
      </div>
      <div className={styles.meterTrack}>
        <div
          className={[styles.meterFill, styles[`meter_${color}`]].join(" ")}
          style={{ width: `${showPlaceholder ? 0 : line.width}%` }}
        />
      </div>
    </div>
  );
}

function LiveMrrPanel({
  latest,
  onEdit,
}: {
  latest: AdminFinanceLatest;
  onEdit: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const { demoMode } = useDemoMode();
  const mrr = useCountUp(latest.mrr, { durationMs: 1400 });
  // Only verified, enabled expense lines appear here — this panel reads as
  // authoritative ("live"), so it never surfaces an unreviewed placeholder.
  const breakdown = enabledLines(latest.expense)
    .filter((line) => demoMode || isVerified(line.source))
    .slice(0, 5);
  const mrrUnverified = !demoMode && !isVerified(latest.sources.mrr);

  return (
    <aside className={styles.panel}>
      <span className={styles.panelLive}>
        <span className={styles.panelLiveDot} aria-hidden />
        {t("admin:governance.mrrPanel.live")}
      </span>
      {mrrUnverified ? (
        <button
          type="button"
          className={styles.panelNumPlaceholder}
          onClick={onEdit}
        >
          {t("admin:governance.finances.provenance.notVerifiedCta")}
        </button>
      ) : (
        <div className={styles.panelNum}>
          {fmt.currency(mrr, "EUR", STAT_CURRENCY)}
        </div>
      )}
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
              {fmt.currency(financeAmountOrZero(line.amount), "EUR")}
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
