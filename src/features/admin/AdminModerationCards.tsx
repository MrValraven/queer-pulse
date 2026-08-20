import { useState, type ReactNode } from "react";
import {
  FiAlertTriangle,
  FiFlag,
  FiCheck,
  FiClock,
  FiUsers,
  FiUserPlus,
} from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import { AdminChip, AdminCat, AdminModal, AdminSeg, type AdminSegOption } from "./ui";
import {
  SEVERITY,
  chipKey,
  chipLabel,
  priorReportsText,
  type ModReport,
  type Appeal,
  type ResolvedItem,
} from "./adminModeration.data";
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
  report: ModReport;
  leaving?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  onOpen: (r: ModReport) => void;
  /** Opens a filtered view of this report's subject's other reports (COM-6).
   *  Omitted entirely when `report.priorReports` is unset — nothing to view. */
  onViewHistory?: (r: ModReport) => void;
}) {
  const { t } = useTranslation();
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
            <strong>{report.reporterName}</strong>
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
                <FiFlag aria-hidden /> {priorReportsText(report.priorReports, t)}
              </span>
            ) : (
              <span className={styles.priorFlag}>
                <FiFlag aria-hidden /> {priorReportsText(report.priorReports, t)}
              </span>
            ))}
          {report.assignedModeratorName && (
            <span className={styles.assignedFlag}>
              <FiUserPlus aria-hidden />{" "}
              {t("admin:moderation.assignedToFlag", {
                name: report.assignedModeratorName,
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
          <FiClock aria-hidden /> {report.age}
        </span>
        <AdminChip tone={report.risk.tone}>{t(report.risk.key)}</AdminChip>
      </div>
    </article>
  );
}

/* ── Bulk-action bar (sticky, shown when ≥1 selected) ───────────────────── */

export function BulkBar({
  count,
  onDismiss,
  onSpam,
  onReassign,
  onWarn,
  onSuspendClick,
  onBan,
  onCancel,
}: {
  count: number;
  onDismiss: () => void;
  onSpam: () => void;
  onReassign: () => void;
  /** Bulk-warn every selected report (COM-9) — a light-touch outcome, no
   *  duration, applied straight away like dismiss/spam/reassign. */
  onWarn: () => void;
  /** Opens the duration picker (`BulkSuspendModal`) — a bulk suspend always
   *  needs a duration, so it can't fire on a single click like the others. */
  onSuspendClick: () => void;
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
        <Button variant="ghost" onClick={onReassign}>
          {t("admin:moderation.bulk.reassignCta")}
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

/* ── Bulk-suspend duration picker (COM-9) ───────────────────────────────── */

const BULK_SUSPEND_DURATIONS = ["24h", "7d", "30d"] as const;

/** Confirms a bulk suspend with a required duration — mirrors the drawer's
 *  single-report restrict-duration picker (`AdminReportDrawer.tsx`), since a
 *  bulk `suspend` is rejected by the backend without one, same as `restrict`. */
export function BulkSuspendModal({
  count,
  onClose,
  onConfirm,
}: {
  count: number;
  onClose: () => void;
  onConfirm: (duration: string) => void;
}) {
  const { t } = useTranslation();
  const [duration, setDuration] = useState<string>("7d");
  const options = BULK_SUSPEND_DURATIONS.map((id) => ({
    value: id,
    label: t(`admin:moderation.reportDrawer.restrictDuration.${id}`),
  })) satisfies AdminSegOption[];

  return (
    <AdminModal
      title={t("admin:moderation.bulk.suspendModal.title", { count })}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t("admin:common.cancel")}
          </Button>
          <Button variant="primary" onClick={() => onConfirm(duration)}>
            {t("admin:moderation.bulk.suspendModal.confirmCta")}
          </Button>
        </>
      }
    >
      <p className={styles.dTransparency}>
        {t("admin:moderation.bulk.suspendModal.body", { count })}
      </p>
      <AdminSeg options={options} value={duration} onChange={setDuration} />
    </AdminModal>
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
  appeal: Appeal;
  leaving?: boolean;
  onOpen: (a: Appeal) => void;
}) {
  const { t } = useTranslation();
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
          <FiClock aria-hidden /> {appeal.age}
        </span>
        <AdminChip tone={appeal.status.tone}>{t(appeal.status.key)}</AdminChip>
      </div>
    </div>
  );
}

/* ── Resolved list ──────────────────────────────────────────────────────── */

export function ResolvedRow({ item }: { item: ResolvedItem }) {
  const { t } = useTranslation();
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
          <span>{item.closed}</span>
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
