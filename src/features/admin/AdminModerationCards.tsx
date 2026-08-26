import { type ReactNode } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiFlag,
  FiCheck,
  FiClock,
  FiTrendingUp,
  FiUsers,
  FiUserCheck,
  FiUserPlus,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, AdminCat } from "./ui";
import {
  SEVERITY,
  chipKey,
  chipLabel,
  priorReportsText,
  reporterCredibilityText,
} from "./adminModeration.data";
import { ageLabelOf, type ModReportView } from "./moderationAge";
import { reporterDisplayName } from "./moderationReporter";
import type { ModReportCluster } from "./moderationQueue.types";
import styles from "./AdminModerationPage.module.css";

/**
 * The two rows of the OPEN moderation queue: one report, and the pile of
 * reports about one subject.
 *
 * The queue's chrome (bulk bar, emergency band, caught-up panel) is in
 * `AdminModerationQueueChrome.tsx`; the appeal and resolved rows are in
 * `AdminModerationOutcomeCards.tsx`; the pending-ban card is in
 * `AdminRatificationCard.tsx`.
 */

/** Server-computed SLA deadline check (COM-8) — past-due only matters while the
 *  report is still open, so callers only ask for this on open-queue rows. */
function isOverdue(slaDueAt: string | undefined): boolean {
  return slaDueAt != null && new Date(slaDueAt).getTime() < Date.now();
}

/* ── Severity-striped report card ───────────────────────────────────────── */

export function ReportCard({
  report,
  leaving,
  selected,
  onToggle,
  onOpen,
  onViewHistory,
}: {
  report: ModReportView;
  leaving?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  onOpen: (r: ModReportView) => void;
  /** Opens a filtered view of this report's subject's other reports (COM-6).
   *  Omitted entirely when `report.priorReports` is unset — nothing to view. */
  onViewHistory?: (r: ModReportView) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const sev = SEVERITY[report.severity];
  const overdue = isOverdue(report.slaDueAt);
  return (
    <article
      className={[
        styles.report,
        selected && styles.reportSelected,
        leaving && styles.reportLeaving,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--stripe" as string]: sev.stripe }}
    >
      {onToggle && (
        <span
          role="checkbox"
          aria-checked={!!selected}
          aria-label={t("admin:moderation.selectReportAriaLabel", {
            title: report.title,
          })}
          tabIndex={0}
          className={[styles.selectBox, selected && styles.selectBoxOn]
            .filter(Boolean)
            .join(" ")}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(report.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle(report.id);
            }
          }}
        >
          {selected && <FiCheck aria-hidden />}
        </span>
      )}

      <button
        type="button"
        className={[styles.reportMain, onToggle && styles.reportMainNudge]
          .filter(Boolean)
          .join(" ")}
        onClick={() => onOpen(report)}
      >
        <span className={styles.reportTop}>
          <AdminCat tone={sev.category}>{t(sev.labelKey)}</AdminCat>
          {report.chips.map((chip) => (
            <AdminChip key={chipKey(chip)} tone={chip.tone} dot={chip.dot}>
              {chipLabel(chip, t)}
            </AdminChip>
          ))}
        </span>

        <span className={styles.reportTitle}>
          {report.title} {report.titleEm && <em>{report.titleEm}</em>}{" "}
          {report.titleAfter}
        </span>
        <span className={styles.reportPreview}>{report.preview}</span>

        <span className={styles.reportMeta}>
          <span>
            {t("admin:moderation.reportedByLabel")}{" "}
            <strong>{reporterDisplayName(report.reporterName, t)}</strong>
          </span>
          <span aria-hidden className={styles.metaDot}>
            ·
          </span>
          <span>
            {t("admin:moderation.aboutLabel")}{" "}
            <strong>{report.reportedName}</strong>
          </span>
          {report.reporterCredibility && (
            <span className={styles.reporterFlag}>
              <FiUserCheck aria-hidden />{" "}
              {reporterCredibilityText(report.reporterCredibility, t)}
            </span>
          )}
          {report.assignedModeratorName && (
            <span className={styles.assignedFlag}>
              <FiUserPlus aria-hidden />{" "}
              {t("admin:moderation.assignedToFlag", {
                name: report.assignedModeratorName,
              })}
            </span>
          )}
          {/* TS-14: which room this came from. It decides whether to act on a
              person or on a space, and whether this is the fourth report from
              that community this week. Absent for a member or message report,
              which belong to no single community. */}
          {report.community && (
            <span className={styles.communityFlag}>
              <FiUsers aria-hidden />{" "}
              {t("admin:moderation.community.rowFlag", {
                community: report.community,
              })}
            </span>
          )}
        </span>
      </button>

      <div className={styles.reportSide}>
        {overdue && (
          <AdminChip tone="danger">
            {t("admin:moderation.slaOverdue")}
          </AdminChip>
        )}
        <span className={styles.reportAge}>
          <FiClock aria-hidden /> {ageLabelOf(report, fmt)}
        </span>
        <AdminChip tone={report.risk.tone}>{t(report.risk.key)}</AdminChip>
        {/* The subject's other reports (COM-6). It sits in the rail with the
            other triage signals rather than inside the card button, because a
            focusable control nested in a `<button>` has no defined activation
            behaviour and its text was being read as part of the card button's
            own accessible name. As a sibling it needs no `stopPropagation`:
            there is no ancestor click handler left to stop. */}
        {report.priorReports &&
          (onViewHistory ? (
            <button
              type="button"
              className={[
                styles.priorFlag,
                styles.priorFlagLink,
                styles.priorFlagRail,
              ].join(" ")}
              /* Named so it makes sense read on its own, out of the row: the
                 visible count alone says nothing about whose history it is.
                 The visible text leads the name, so speech input can still
                 activate it by what it says. */
              aria-label={t("admin:moderation.priorReports.viewAriaLabel", {
                flag: priorReportsText(report.priorReports, t),
                name: report.reportedName,
              })}
              onClick={() => onViewHistory(report)}
            >
              <FiFlag aria-hidden /> {priorReportsText(report.priorReports, t)}
            </button>
          ) : (
            <span
              className={[styles.priorFlag, styles.priorFlagRail].join(" ")}
            >
              <FiFlag aria-hidden /> {priorReportsText(report.priorReports, t)}
            </span>
          ))}
      </div>
    </article>
  );
}

/* ── Clustered subject row (TS-06) ──────────────────────────────────────── */

/**
 * One `(subjectType, subjectId)` pile, headed by the two counts that decide
 * what to do about it.
 *
 * The queue used to render thirty people reporting one member as thirty
 * independent rows, each with its own SLA clock, which read as thirty times
 * the urgency and hid the fact that mattered: whether thirty PEOPLE were
 * behind it or one person filing thirty times. `distinctReporterCount` is that
 * fact, and it is stated in words beside the total rather than implied.
 *
 * The header carries the whole pile's actions. "Select all" reaches every open
 * report about the subject, including the ones no page has loaded, because the
 * ids come from the server's own count. Expanding shows the reports this page
 * actually holds, which is usually fewer.
 */
export function ClusterRow({
  cluster,
  isExpanded,
  onToggleExpanded,
  onSelectAll,
  isFullySelected,
  loadedCount,
  children,
}: {
  cluster: ModReportCluster;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  /** Selects (or clears) every open report in the pile for the bulk bar. */
  onSelectAll: () => void;
  isFullySelected: boolean;
  /** How many of the pile's reports this page actually loaded. */
  loadedCount: number;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const sev = SEVERITY[cluster.highestSeverity];
  const panelId = `cluster-${cluster.subjectType}-${cluster.subjectId}`;
  const notOnPage = Math.max(0, cluster.openCount - loadedCount);

  return (
    <section
      className={styles.cluster}
      style={{ ["--stripe" as string]: sev.stripe }}
    >
      <div className={styles.clusterHead}>
        <button
          type="button"
          className={styles.clusterToggle}
          aria-expanded={isExpanded}
          aria-controls={panelId}
          onClick={onToggleExpanded}
        >
          {isExpanded ? (
            <FiChevronDown aria-hidden />
          ) : (
            <FiChevronRight aria-hidden />
          )}
          <span className={styles.clusterTitle}>
            {t("admin:moderation.cluster.heading", {
              count: cluster.openCount,
              subject: cluster.subjectId,
            })}
          </span>
        </button>

        <div className={styles.clusterFacts}>
          <AdminCat tone={sev.category}>{t(sev.labelKey)}</AdminCat>
          <span className={styles.clusterReporters}>
            <FiUsers aria-hidden />{" "}
            {t("admin:moderation.cluster.reporters", {
              count: cluster.distinctReporterCount,
            })}
          </span>
          {cluster.overdueCount > 0 && (
            <AdminChip tone="danger">
              {t("admin:moderation.cluster.overdue", {
                count: cluster.overdueCount,
              })}
            </AdminChip>
          )}
          {cluster.isSurge && (
            <span className={styles.clusterSurge}>
              <FiTrendingUp aria-hidden /> {t("admin:moderation.cluster.surge")}
            </span>
          )}
        </div>

        <Button variant="ghost" onClick={onSelectAll}>
          {t(
            isFullySelected
              ? "admin:moderation.cluster.clearAllCta"
              : "admin:moderation.cluster.selectAllCta",
            { count: cluster.openCount },
          )}
        </Button>
      </div>

      {cluster.isSurge && (
        <p className={styles.clusterHint}>
          {t("admin:moderation.cluster.surgeHint")}
        </p>
      )}

      <div id={panelId} hidden={!isExpanded} className={styles.clusterBody}>
        {children}
        {notOnPage > 0 && (
          <p className={styles.clusterNote}>
            {t("admin:moderation.cluster.notOnPage", { count: notOnPage })}
          </p>
        )}
      </div>
    </section>
  );
}
