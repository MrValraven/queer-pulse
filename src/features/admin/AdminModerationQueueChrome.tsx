import { type ReactNode } from "react";
import { FiAlertTriangle, FiCheck } from "react-icons/fi";
import { Button } from "../../shared/components/ui";
import { useTranslation } from "../../shared/i18n/useTranslation";
import { Translation } from "../../shared/i18n/Translation";
import styles from "./AdminModerationPage.module.css";

/**
 * The frame around the moderation queue rather than a row inside it: the
 * sticky bulk-action bar, the emergency band that lifts the worst reports
 * above everything else, the small section label between piles, and the
 * caught-up panel that replaces the list when there is nothing left to read.
 *
 * Split out of `AdminModerationCards.tsx`, unchanged. None of these decide
 * anything on their own: every button here calls back up to the page, which
 * owns the confirm modals and the permission the action needs.
 */
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
