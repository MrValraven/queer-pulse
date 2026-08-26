import { FiAlertTriangle, FiCheck, FiClock, FiUsers } from "react-icons/fi";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { useFormat } from "../../shared/i18n/format";
import { AdminChip, AdminCat } from "./ui";
import { SEVERITY, chipKey, chipLabel } from "./adminModeration.data";
import {
  ageLabelOf,
  closedLabelOf,
  type AppealView,
  type ResolvedItemView,
} from "./moderationAge";
import styles from "./AdminModerationPage.module.css";

/**
 * The two rows for a decision that has already been taken: an appeal against
 * one, and a report that is closed. Split out of `AdminModerationCards.tsx`,
 * where the open queue's own rows now live alone.
 */
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
