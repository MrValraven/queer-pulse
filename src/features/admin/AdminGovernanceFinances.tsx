import { useState } from "react";
import { FiActivity, FiEdit3, FiFileText, FiPlus } from "react-icons/fi";
import {
  FadeIn,
  Button,
  SkeletonLine,
  StatGrid,
  StatTile,
} from "../../shared/components/ui";
import { RollingNumber } from "../../shared/components/ui/RollingNumber";
import { useDemoMode } from "../../app/providers/DemoModeProvider";
import { routes } from "../../app/routeMap";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { useFormat } from "../../shared/i18n/format";
import { AdminGovernanceChart } from "./AdminGovernanceChart";
import { AdminGovernanceFinancesEdit } from "./AdminGovernanceFinancesEdit";
import { AdminGovernanceFinancesOpenQuarter } from "./AdminGovernanceFinancesOpenQuarter";
import { AdminGovernanceFinancesReportEdit } from "./AdminGovernanceFinancesReportEdit";
import { FinanceSourceBadge } from "./FinanceSourceBadge";
import { LedgerCard } from "./AdminGovernanceLedgerCard";
import { NotVerifiedPlaceholder } from "./AdminGovernanceLedgerParts";
import { enabledLines, isVerified } from "./adminGovernanceLedger";
import { useAdminGovernanceFinances } from "./api/useAdminGovernanceFinances";
import type {
  AdminFinanceLatest,
  FinanceMetricSource,
} from "./api/adminGovernanceFinances.api";
import { financeAmountOrZero } from "./adminFinanceAmount";
import { parseQuarter } from "../governance/governanceQuarter";
import styles from "./AdminGovernancePage.module.css";

/**
 * One headline figure on the Finances tab. `value` is the figure the tile rolls
 * to and `kind` decides how it is written, so no call site hand-rolls a `€` prefix:
 * pt-PT suffixes the symbol with a space ("2 200 €") and `Intl` knows that.
 */
interface FinanceStatTile {
  labelKey: string;
  /** The figure the tile rolls up to. */
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

/** Headline tiles round to whole euros, so the roll moves only the euro
 *  digits. The exact figures, cents included, are in the ledger below. */
const STAT_CURRENCY: Intl.NumberFormatOptions = { maximumFractionDigits: 0 };

function buildFinanceStats(latest: AdminFinanceLatest): FinanceStatTile[] {
  return [
    {
      labelKey: "governance.finances.stat.sustainerMrr",
      value: latest.mrr ?? 0,
      kind: "currency",
      footKey: "governance.finances.foot.sustainersCount",
      footValues: { count: latest.sustainerCount ?? 0 },
      source: latest.sources.mrr,
    },
    {
      labelKey: "governance.finances.stat.totalIncome",
      value: latest.incomeTotal ?? 0,
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
      value: latest.solidarityRate ?? 0,
      kind: "percent",
      footKey: "governance.finances.foot.solidarityRate",
      source: latest.sources.solidarityRate,
    },
  ];
}

/** Which Finances dialog is open, if any. */
type FinancesDialog = "figures" | "report" | "quarter" | null;

export function AdminGovernanceFinances() {
  const { latest, history, loading } = useAdminGovernanceFinances();
  const [dialog, setDialog] = useState<FinancesDialog>(null);
  const openFigures = () => setDialog("figures");
  const closeDialog = () => setDialog(null);

  if (loading) {
    return <FinancesSkeleton />;
  }

  if (!latest) {
    return (
      <>
        <FinancesEmpty onOpenQuarter={() => setDialog("quarter")} />
        {dialog === "quarter" && (
          <AdminGovernanceFinancesOpenQuarter
            latestQuarter={null}
            onClose={closeDialog}
          />
        )}
      </>
    );
  }

  const stats = buildFinanceStats(latest);

  return (
    <>
      <FinancesToolbar
        latest={latest}
        onEdit={openFigures}
        onEditReport={() => setDialog("report")}
        onOpenQuarter={() => setDialog("quarter")}
      />

      <StatGrid columns={4} className={styles.statGrid}>
        {stats.map((stat, index) => (
          <FadeIn key={stat.labelKey} delay={index * 70}>
            <FinanceStatCard stat={stat} onEdit={openFigures} />
          </FadeIn>
        ))}
      </StatGrid>

      <FadeIn delay={120}>
        <AdminGovernanceChart history={history} />
      </FadeIn>

      <FadeIn delay={160}>
        <div className={styles.ledgerGrid}>
          <LedgerCard
            titleKey="governance.income.title"
            subKey="governance.income.sub"
            total={latest.incomeTotal}
            lines={latest.income}
            kind="income"
            onEdit={openFigures}
            note={
              <Translation
                i18nKey="admin:governance.income.note"
                components={{ strong: <strong /> }}
              />
            }
          />
          <LedgerCard
            titleKey="governance.spend.title"
            subKey="governance.spend.sub"
            total={latest.expenseTotal}
            lines={latest.expense}
            kind="expense"
            onEdit={openFigures}
          />
        </div>
      </FadeIn>

      <FadeIn delay={200}>
        <LiveMrrPanel latest={latest} onEdit={openFigures} />
      </FadeIn>

      {dialog === "figures" && (
        <AdminGovernanceFinancesEdit latest={latest} onClose={closeDialog} />
      )}
      {dialog === "report" && (
        <AdminGovernanceFinancesReportEdit
          latest={latest}
          onClose={closeDialog}
        />
      )}
      {dialog === "quarter" && (
        <AdminGovernanceFinancesOpenQuarter
          latestQuarter={latest.quarter}
          onClose={closeDialog}
        />
      )}
    </>
  );
}

/** Header row above the figures: who last corrected them, whether the public
 *  page shows this quarter (PRD-447), and the entry points to the dialogs. */
function FinancesToolbar({
  latest,
  onEdit,
  onEditReport,
  onOpenQuarter,
}: {
  latest: AdminFinanceLatest;
  onEdit: () => void;
  onEditReport: () => void;
  onOpenQuarter: () => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const editorName = latest.editor
    ? `${latest.editor.firstName} ${latest.editor.lastName}`.trim()
    : null;
  const period = parseQuarter(latest.quarter);
  const quarterLabel = period
    ? t("admin:governance.finances.quarter.label", period)
    : latest.quarter;

  return (
    <div className={styles.finToolbar}>
      <div className={styles.finToolbarStatus}>
        <span className={styles.finToolbarMeta}>
          {editorName && latest.editedAt
            ? t("admin:governance.finances.edit.lastEdited", {
                name: editorName,
                date: fmt.date(new Date(latest.editedAt)),
              })
            : t("admin:governance.finances.edit.neverEdited")}
        </span>
        <span className={styles.finToolbarMeta}>
          {t(
            latest.isPublic
              ? "admin:governance.finances.status.public"
              : "admin:governance.finances.status.hidden",
            { quarter: quarterLabel },
          )}
        </span>
      </div>
      <div className={styles.finToolbarActions}>
        <Button variant="ghost" onClick={onEdit}>
          <FiEdit3 aria-hidden />
          {t("admin:governance.finances.edit.cta")}
        </Button>
        <Button variant="ghost" onClick={onEditReport}>
          <FiFileText aria-hidden />
          {t("admin:governance.finances.report.cta")}
        </Button>
        <Button variant="ghost" onClick={onOpenQuarter}>
          <FiPlus aria-hidden />
          {t("admin:governance.finances.quarter.cta")}
        </Button>
      </div>
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

function FinancesEmpty({ onOpenQuarter }: { onOpenQuarter: () => void }) {
  const { t } = useTranslation();
  return (
    <div className={styles.statCard}>
      <span className={styles.statFoot}>
        {t("admin:governance.finances.empty")}
      </span>
      <div>
        <Button variant="ghost" onClick={onOpenQuarter}>
          <FiPlus aria-hidden />
          {t("admin:governance.finances.quarter.cta")}
        </Button>
      </div>
    </div>
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
  // Headline tiles show whole units (see STAT_CURRENCY).
  const wholeValue = Math.round(value);
  const formatFigure = (figure: number) =>
    kind === "currency"
      ? fmt.currency(figure, "EUR", STAT_CURRENCY)
      : fmt.number(figure);
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
            <RollingNumber
              value={formatFigure(wholeValue)}
              numericValue={wholeValue}
              revealFrom={{ value: formatFigure(0), numericValue: 0 }}
            />
            {kind === "percent" && <small>%</small>}
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
  const mrr = Math.round(latest.mrr ?? 0);
  // Only verified, enabled expense lines appear here. This panel reads as
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
          <RollingNumber
            value={fmt.currency(mrr, "EUR", STAT_CURRENCY)}
            numericValue={mrr}
            revealFrom={{
              value: fmt.currency(0, "EUR", STAT_CURRENCY),
              numericValue: 0,
            }}
          />
        </div>
      )}
      <p className={styles.panelLead}>
        <Translation
          i18nKey="admin:governance.mrrPanel.lead"
          components={{ em: <em /> }}
        />
      </p>
      <div className={styles.panelBreakdown}>
        {breakdown.map((line, index) => (
          <div key={`${index}-${line.label}`} className={styles.panelStat}>
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
