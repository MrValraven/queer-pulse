import { type ReactNode } from "react";
import {
  FiAlertTriangle,
  FiChevronDown,
  FiChevronRight,
  FiFlag,
  FiCheck,
  FiClock,
  FiInfo,
  FiTrendingUp,
  FiUsers,
  FiUserCheck,
  FiUserPlus,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { Translation } from "../../shared/i18n/Translation";
import { AdminChip, AdminCat } from "./ui";
import {
  SEVERITY,
  chipKey,
  chipLabel,
  priorReportsText,
  reporterCredibilityText,
  type Ratification,
} from "./adminModeration.data";
import {
  ageLabelOf,
  closedLabelOf,
  type AppealView,
  type ModReportView,
  type ResolvedItemView,
} from "./moderationAge";
import { reporterDisplayName } from "./moderationReporter";
import type { ModReportCluster } from "./moderationQueue.types";

/** Which way a second moderator went on a pending ban (TS-12). */
export type RatifyDecision = "ratify" | "decline";
import styles from "./AdminModerationPage.module.css";

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
          {report.priorReports &&
            (onViewHistory ? (
              <span
                role="button"
                tabIndex={0}
                className={[styles.priorFlag, styles.priorFlagLink].join(" ")}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewHistory(report);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewHistory(report);
                  }
                }}
              >
                <FiFlag aria-hidden />{" "}
                {priorReportsText(report.priorReports, t)}
              </span>
            ) : (
              <span className={styles.priorFlag}>
                <FiFlag aria-hidden />{" "}
                {priorReportsText(report.priorReports, t)}
              </span>
            ))}
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

/* ── Bulk-action bar (sticky, shown when ≥1 selected) ───────────────────── */

export function BulkBar({
  count,
  onDismiss,
  onSpam,
  onEscalate,
  onWarn,
  onSuspendClick,
  onBan,
  onCancel,
}: {
  count: number;
  onDismiss: () => void;
  /** Opens the confirm modal: removing content is a sanction, so it collects a
   *  reason code and the member-facing note first. */
  onSpam: () => void;
  /** Hands every selected report up to the escalation queue. No sanction and no
   *  member notification, so it applies straight away. */
  onEscalate: () => void;
  /** Opens the confirm modal (reason + member-facing note). */
  onWarn: () => void;
  /** Opens the confirm modal, which for a suspend also collects the duration
   *  the backend requires. */
  onSuspendClick: () => void;
  /** Opens the confirm modal. The most severe bulk outcome there is. */
  onBan: () => void;
  onCancel: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div
      className={styles.bulkBar}
      role="region"
      aria-label={t("admin:moderation.bulk.ariaLabel")}
    >
      <span className={styles.bulkCount}>
        {t("admin:moderation.bulk.selectedCount", { count })}
      </span>
      <div className={styles.bulkActions}>
        <Button variant="ghost" onClick={onDismiss}>
          {t("admin:moderation.bulk.dismissCta")}
        </Button>
        <Button variant="ghost" onClick={onSpam}>
          {t("admin:moderation.bulk.spamCta")}
        </Button>
        <Button variant="ghost" onClick={onEscalate}>
          {t("admin:moderation.bulk.escalateCta")}
        </Button>
        <Button variant="ghost" onClick={onWarn}>
          {t("admin:moderation.bulk.warnCta")}
        </Button>
        <Button variant="ghost" onClick={onSuspendClick}>
          {t("admin:moderation.bulk.suspendCta")}
        </Button>
        <Button variant="ghost" onClick={onBan}>
          {t("admin:moderation.bulk.banCta")}
        </Button>
        <Button variant="ghost-dark" onClick={onCancel}>
          {t("admin:moderation.bulk.cancelCta")}
        </Button>
      </div>
    </div>
  );
}

/* ── Emergency band wrapper ─────────────────────────────────────────────── */

export function EmergencyBand({
  children,
  count,
  sub,
}: {
  children: ReactNode;
  count: number;
  sub: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <section
      className={styles.emergBand}
      aria-label={t("admin:moderation.emergency.ariaLabel")}
    >
      <div className={styles.emergHead}>
        <span className={styles.emergIco} aria-hidden>
          <FiAlertTriangle />
        </span>
        <h2 className={styles.emergTitle}>
          {t("admin:moderation.emergency.count", { count })}
          <span className={styles.emergTitleSub}> {sub}</span>
        </h2>
      </div>
      <div className={styles.emergList}>{children}</div>
    </section>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className={styles.sectionLabel}>{children}</p>;
}

/* ── Caught-up plum success panel ───────────────────────────────────────── */

export function CaughtUpPanel({
  onBack,
  onReplay,
}: {
  onBack: () => void;
  onReplay: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.caughtUp}>
      <span className={styles.caughtIco} aria-hidden>
        <FiCheck />
      </span>
      <h2 className={styles.caughtTitle}>
        <Translation
          i18nKey="admin:moderation.caughtUp.titleLine1"
          components={{ em: <em /> }}
        />
        <br />
        {t("admin:moderation.caughtUp.titleLine2")}
      </h2>
      <p className={styles.caughtSub}>{t("admin:moderation.caughtUp.sub")}</p>
      <div className={styles.caughtActions}>
        <Button variant="ghost-dark" onClick={onBack}>
          {t("admin:moderation.caughtUp.backCta")}
        </Button>
        <Button variant="jade" onClick={onReplay}>
          {t("admin:moderation.caughtUp.replayCta")}
        </Button>
      </div>
    </div>
  );
}

/* ── Appeals list (each card opens the appeal drawer) ───────────────────── */

export function AppealCard({
  appeal,
  leaving,
  onOpen,
}: {
  appeal: AppealView;
  leaving?: boolean;
  onOpen: (a: AppealView) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const sev = SEVERITY[appeal.severity];
  return (
    <div
      className={[styles.report, leaving && styles.reportLeaving]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--stripe" as string]: sev.stripe }}
      onClick={() => onOpen(appeal)}
      role="button"
      aria-label={appeal.title}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(appeal);
        }
      }}
    >
      <div className={styles.reportMain}>
        <div className={styles.reportTop}>
          {appeal.chips.map((chip) => (
            <AdminChip key={chipKey(chip)} tone={chip.tone}>
              {chipLabel(chip, t)}
            </AdminChip>
          ))}
        </div>

        <h3 className={styles.reportTitle}>{appeal.title}</h3>
        <p className={styles.reportPreview}>{appeal.preview}</p>

        <div className={styles.reportMeta}>
          <span>
            {t("admin:moderation.appeal.by")} <strong>{appeal.appealBy}</strong>
          </span>
          <span aria-hidden className={styles.metaDot}>
            ·
          </span>
          <span>
            {t("admin:moderation.appeal.decidedBy")}{" "}
            <strong>{appeal.original.by}</strong>
          </span>
          {appeal.community && (
            <>
              <span aria-hidden className={styles.metaDot}>
                ·
              </span>
              <span>{appeal.community}</span>
            </>
          )}
          {appeal.supporters.length > 0 && (
            <span className={styles.supportFlag}>
              <FiUsers aria-hidden />{" "}
              {t("admin:moderation.appeal.supportersFlag", {
                count: appeal.supporters.length,
              })}
            </span>
          )}
        </div>
      </div>

      <div className={styles.reportSide}>
        <span className={styles.reportAge}>
          <FiClock aria-hidden /> {ageLabelOf(appeal, fmt)}
        </span>
        <AdminChip tone={appeal.status.tone}>{t(appeal.status.key)}</AdminChip>
        {/* TS-11. The published 7-day decision window, on the row, because a
            deadline nobody can see on the queue is a deadline nobody keeps. */}
        {appeal.slaDueAt && (
          <span
            className={[
              styles.appealDue,
              appeal.isOverdue && styles.appealDueLate,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {appeal.isOverdue ? (
              <>
                <FiAlertTriangle aria-hidden />{" "}
                {t("admin:moderation.appeals.overdueFlag")}
              </>
            ) : (
              t("admin:moderation.appeals.dueFlag", {
                date: fmt.date(new Date(appeal.slaDueAt), {
                  day: "numeric",
                  month: "short",
                }),
              })
            )}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Pending ratifications (TS-12) ──────────────────────────────────────── */

/**
 * One permanent ban waiting on a second moderator.
 *
 * Built around the first moderator's own words. The card leads with who is
 * being removed and who asked, then quotes the reason in full rather than
 * truncating it: this is the one surface where a moderator decides whether to
 * put their name to ending somebody's account, and a 140-character preview of
 * the case is not enough to do that on.
 *
 * The two buttons are deliberately unequal. Confirming is the destructive one
 * and is styled as such; refusing is the ordinary path and needs no ceremony,
 * because refusing to remove someone must never be the harder click.
 */
export function RatificationCard({
  ratification,
  isOwnRequest,
  onDecide,
}: {
  ratification: Ratification;
  /** True when the signed-in moderator is the one who ASKED for this ban. The
   *  server refuses their confirmation outright; showing them the buttons
   *  anyway would be an affordance that only ever errors. */
  isOwnRequest: boolean;
  onDecide: (ratification: Ratification, decision: RatifyDecision) => void;
}) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const lapsesAt = new Date(ratification.expiresAt);

  return (
    <article className={styles.ratifyCard}>
      <div className={styles.ratifyHead}>
        <AdminCat tone="danger">
          {t("admin:moderation.ratification.badge")}
        </AdminCat>
        <span
          className={[
            styles.ratifyLapse,
            ratification.isExpired && styles.ratifyLapsed,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <FiClock aria-hidden />{" "}
          {ratification.isExpired
            ? t("admin:moderation.ratification.lapsed")
            : t("admin:moderation.ratification.lapsesAt", {
                date: `${fmt.date(lapsesAt, { day: "numeric", month: "short" })} ${fmt.time(lapsesAt)}`,
              })}
        </span>
      </div>

      <h3 className={styles.ratifyTitle}>
        {t("admin:moderation.ratification.title", {
          name: ratification.targetName,
        })}
      </h3>

      <p className={styles.ratifyMeta}>
        {t("admin:moderation.ratification.askedBy", {
          name: ratification.requestedByName,
          date: fmt.date(new Date(ratification.requestedAt), {
            day: "numeric",
            month: "short",
          }),
        })}
      </p>

      <blockquote className={styles.ratifyReason}>
        {ratification.note ?? t("admin:moderation.ratification.noReason")}
      </blockquote>

      <p className={styles.ratifyInterim}>
        <FiInfo aria-hidden /> {t("admin:moderation.ratification.interim")}
      </p>

      {isOwnRequest ? (
        <p className={styles.ratifyOwn}>
          <FiInfo aria-hidden /> {t("admin:moderation.ratification.ownRequest")}
        </p>
      ) : (
        !ratification.isExpired && (
          <div className={styles.ratifyActions}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDecide(ratification, "decline")}
            >
              {t("admin:moderation.ratification.declineCta")}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDecide(ratification, "ratify")}
            >
              {t("admin:moderation.ratification.confirmCta")}
            </Button>
          </div>
        )
      )}
    </article>
  );
}

/* ── Resolved list ──────────────────────────────────────────────────────── */

export function ResolvedRow({ item }: { item: ResolvedItemView }) {
  const { t } = useTranslation();
  const fmt = useFormat();
  const sev = SEVERITY[item.severity];
  return (
    <article
      className={[styles.report, styles.reportStatic].join(" ")}
      style={{ ["--stripe" as string]: sev.stripe }}
    >
      <div className={styles.reportMain}>
        <div className={styles.reportTop}>
          {item.chips.map((chip) => (
            <AdminChip key={chipKey(chip)} tone={chip.tone}>
              {chipLabel(chip, t)}
            </AdminChip>
          ))}
          <AdminCat tone={item.outcomeTone}>{item.outcome}</AdminCat>
        </div>

        <h3 className={styles.reportTitle}>{item.title}</h3>
        <p className={styles.reportPreview}>{item.preview}</p>

        <div className={styles.reportMeta}>
          <span>{closedLabelOf(item, t, fmt)}</span>
          {item.notified.map((line) => (
            <span key={line} className={styles.resolvedNotified}>
              <FiCheck aria-hidden />
              {line}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.reportSide}>
        <AdminChip tone={item.status.tone}>{t(item.status.key)}</AdminChip>
      </div>
    </article>
  );
}
